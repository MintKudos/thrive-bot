import type { ChatCompletionTool } from "openai/resources/index.mjs";
import type {
  BaseFunctionsArgs,
  RunnableFunctionWithParse,
  RunnableToolFunction,
  RunnableTools,
} from "openai/lib/RunnableFunction.mjs";

import {
  getProfileById,
  db,
  saveDoc,
  getDoc,
  updateDoc,
  delDoc,
} from "./ProfileDB.ts";

import openai from "openai";
import type { ChatCompletionToolRunnerParams } from "openai/lib/ChatCompletionRunner.mjs";
import { get_event_fact } from "./get_event_fact.ts";

// export const groqClient = new Groq({
//   apiKey: process.env["GROQ_API_KEY"],
// });

const CATEGORIES = [
  "event_general_about",
  // "event_schedule",
  "project_pricing",
  "rules",
  // "issues",
  "version_updates",
  "usage_doc_instructions",
  "example_tutorial",
  "project_about_team",
  "project_about_description",
  "project_vision_roadmap",
  "warnings",
  "project_development_notes",
  "user_profile",
  "user_profile_requirements",
  "work_task_todo",
  "selling_item_offer",
  "customer_order_request",
  "feature_request_or_issue",
];

export const OPEN_PUBLIC_SAVE_CATEGORIES = [
  "user_profile",
  "selling_item_offer",
  "buying_item_request",
  "example_tutorial",
  "feature_request_or_issue",
];

const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY, // process.env["GROQ_API_KEY"], // process.env.OPENAI_API_KEY,
};

export const openaiClient = new openai.OpenAI(openaiConfig);

function adminGuard<T>(isAdmin: boolean, fn: T) {
  return isAdmin
    ? fn
    : (arg: any) => "You are not authorized to use this function";
}

// returns number of updates
async function update_community_program_fact(args: {
  keywords: string;
  fact: string;
  channelid: string;
  admin: boolean;
  category: string;
  // category_alt: string;
  userid: string;
  targetUserId: string;
}): Promise<number> {
  const { fact, userid, channelid, admin } = args;
  // console.log("::update_community_program_fact", args);

  if (!admin && !OPEN_PUBLIC_SAVE_CATEGORIES.includes(args.category))
    throw new Error("not admin");

  let searchTerm = args.keywords + ` #${args.category}`;

  // if (OPEN_PUBLIC_SAVE_CATEGORIES.includes(args.category)) {
  //   if (!searchTerm.includes(`#userid_`)) searchTerm += ` #userid_${userid}`;
  // }

  // if (args.category_alt && args.category_alt !== args.category)
  //   searchTerm += ` #${args.category_alt}`;

  let doc = await getDoc({
    searchTerm, // todo: target the user referenced and not self
    channelid: args.channelid,
  });

  // console.log("doc", doc);
  // throw new Error("exit");

  doc =
    doc
      ?.filter(
        (x: any) => args.category === x.category
        // || args.category_alt?.includes(x.category)
      )
      // filter rows not matching target user
      .filter((x) => !args.targetUserId || x.userid === args.targetUserId)
      // only update own rows if not admin
      .filter((x) => args.admin || x.userid === args.userid) || [];

  //  <VERIFIED_ADMIN>${args.admin} \n
  const docStr = JSON.stringify(
    doc?.map(
      (x) => `
  <ROWID>${x.id} \n
  <CATEGORY>${x.category} \n
  <CONTENT>${x.content} \n
  <USERID>${x.userid} \n
  `
    ),
    null,
    2
  );

  // console.log("docStr", docStr);

  console.log(
    `:found ${doc?.length || 0} existing docs to check if needed update`,
    doc.map((x) => x.id + ": " + x.content)
  );

  let updates = 0,
    forcenew = false;

  if (!doc || doc.length === 0) {
    console.log("no records found to update");
    return 0;
  }
  // If whole row needs deletion, prefix content with <DELETED> or remove this tag if re-added.

  const r = await openaiClient.beta.chat.completions.runTools({
    tool_choice: "auto", // "auto",
    tools: [
      {
        type: "function",
        name: "update_community_program_fact",
        function: {
          function: async (args: {
            rowid: string;
            updatedContent: string;
            category: string;
          }) => {
            if (!args.rowid) throw new Error('no "rowid" provided for update');

            if (updates > 4) return "too many updates";
            updates++;

            if (!args.updatedContent || args.updatedContent === "DELETE") {
              await delDoc({
                rowid: args.rowid,
                channelid: channelid,
              });

              return "successly deleted entry";
            }

            await updateDoc({
              rowid: args.rowid,
              updated_by: userid,
              verified: admin,
              newContent: args.updatedContent,
              channelid: channelid,
            });
            return "successly updated entry";
          },
          parse: JSON.parse,
          description:
            "Updates or deletes existing RESULTS that need changes based on request. ONLY run functions on rows that are directly connected, incorrect, or duplicate to the new fact for the same version.",
          parameters: {
            type: "object",
            properties: {
              rowid: {
                type: "string",
                description: `The rowid of entry to update`,
              },
              updatedContent: {
                type: "string",
                description: `Highly concise updated content for the requested changes. Say DELETE only if 100% of the result content must be removed.`,
              },
              userid: {
                type: "string",
                enum: [args.userid],
                description: `The author userid is ${args.userid}`,
              },
            },
          },
          required: ["userid", "rowid", "updatedContent"],
        },
      },

      // {
      //   type: "function",
      //   name: "delete_community_program_fact",
      //   function: {
      //     function: async (args: {
      //       rowid: string;
      //       category: string;
      //     }) => {
      //       if (!args.rowid) throw new Error('no "rowid" provided for update');

      //       if (updates > 4) return "too many updates";
      //       updates++;

      //         await delDoc({
      //           rowid: args.rowid,
      //           channelid: channelid,
      //         });

      //         return "successly deleted entry";
      //     },
      //     parse: JSON.parse,
      //     description:
      //       "Deletes entire entire record in search result in the DB to only relevent results based on user request. ONLY run functions on rows that are directly connected to very specific request to delete.",
      //     parameters: {
      //       type: "object",
      //       properties: {
      //         rowid: {
      //           type: "string",
      //           description: `The rowid of entry to update`,
      //         },
      //         userid: {
      //           type: "string",
      //           enum: [args.userid],
      //           description: `The author userid is ${args.userid}`,
      //         },
      //       },
      //     },
      //     required: ["userid", "rowid"],
      //   },
      // },

      {
        type: "function",
        function: {
          function: (): string => {
            console.log(":no_updates_needed", args);
            forcenew = false;
            updates = -1;
            return "success: respond with word STOP";
          },
          parse: JSON.parse,
          name: "no_updates_needed",
          description:
            "Call when existing DB content is already up to date or no changes or deletes needed. No inserts, updates, deletes, or new rows are needed.",
          parameters: {},
          required: [],
        },
      },

      {
        type: "function",
        function: {
          function: (): string => {
            console.log(":no_match_and_create_new_entry", args);
            forcenew = true;
            return "okay";
          },
          parse: JSON.parse,
          name: "no_match_and_create_new_entry",
          description:
            "Called when its better to insert a new record than update search results.",
          parameters: {},
          required: [],
        },
      },
    ],

    //  or respond with the word STOP if no updates needed
    messages: [
      {
        role: "system",
        content: `Mark and suggest very concise updates to existing roles based on new information using functions. 
          Preserve all URLs and key details in updates.
          
          If request was to resolve or report an issue fixed, just remove the issue being mention.
          IGNORE non-relevant search results to request.`,
      },
      {
        role: "user",
        content: `<REQUEST_TO_SAVE>\n${fact} \n<EXISTING_DATABASE_ROWS>${docStr}`,
      },
    ],
    model: "gpt-4o", // "llama3-70b-8192",
    parallel_tool_calls: false,
    temperature: 0.4,
    // temperature: 0.6,
  });

  if (r.errored) {
    console.error(r);
  }

  const fc = await r.finalContent();

  if (forcenew) return -2; // -2 force new entry
  // if (updates === -1) return -1; // -1 no updates needed

  // if (!fc) return false;
  // if (fc?.includes("STOP") || updates === 0) {
  //   console.log("update: no updates needed");
  //   return false;
  // } else
  return updates;
}

const save_or_update_community_fact = async (args: {
  keywords: string;
  fact: string;
  channelid: string;
  admin: boolean;
  userid: string;
  category: string;
  targetUserId: string;
  platform: number;
  // category_alt: string;
}) => {
  // check if dublicate
  // if (!args.admin) return null;

  let { fact, userid } = args;

  console.log(":pre_save_community_program_fact", args);

  // ensuring saving to own data
  if (!args.admin && !args.fact.includes(`#userid_${userid}`)) {
    return "You are not authorized to edit another user's entry";
  }

  // check to update
  const updates = await update_community_program_fact(args);
  if (updates > 0) {
    return "successly updated existing records";
  }
  // TODO: review code for update+and+save-new operation
  else if (updates === -1) {
    console.log("->ai no updates needed");
    return "no updates needed"; //
  } else if (updates === -2) {
    console.log("->ai requesting new entry");
    console.log(`${updates} updates needed - saving new record`);
  }

  console.log(":save_community_program_fact");

  const userTag = args.targetUserId ? ` #userid_${args.targetUserId}` : "";

  const params = {
    category: args.category,
    fact: fact + ` #${args.category}${userTag}`,
    channelid: args.channelid,
    userid: args.userid,
    verified: args.admin,
    platform: args.platform,
  };
  // console.log("save_community_program_fact", params);
  return await saveDoc(params);
};

async function matchmaker(args: { topics: string }, r: any) {
  console.log("matchmaker", args);
  const topics = args.topics;
  return `You have been matched with a group of people who are interested in the following topics: ${topics}
         Joe, Jane, and John are in your group. You can find them at the networking event at 2:00 PM.`;
}

export async function copilot(
  msg: string,
  channelid: string,
  userId: string,
  isAdmin: boolean = false,
  platform: number = 0
) {
  const ctx = { channelid, userId, isAdmin };
  msg = `<CONTEXT>
  channelid: ${channelid}
  userid of user request: ${userId}
  admin: ${isAdmin}
  <MESSAGE>
  ${msg}`;

  // const a = openaiClient.beta.chat.completions.runTools({});

  // const funs: RunnableTools<BaseFunctionsArgs> = [
  //   {
  //     type: "function",
  //     function: {
  //       function: (args: { username: string }) => {
  //         return `Give a reminder to ${args.username} to be nice with soft wit.`;
  //       },
  //       parse: JSON.parse,
  //       name: "unpolite_behavior_detections",
  //       description:
  //         "Get general information about an event like location, date, parking, pricing, registration, etc!",
  //       parameters: {
  //         type: "object",
  //         properties: {
  //           username: {
  //             type: "string",
  //             description: "The username of the unpolite user",
  //           },
  //         },
  //       },
  //     },
  //   },
  // ];

  let saved = false,
    fetched = false;

  // function triggerSave<T extends (...args: any[]) => any>(fn: T) {
  //   return (args: any) => {
  //     saved = true;
  //     return (fn as T)(args);
  //   };
  // }

  function triggerFetched<T extends (...args: any[]) => any>(fn: T) {
    return (args: any) => {
      fetched = true;
      return (fn as T)(args);
    };
  }

  const r = await openaiClient.beta.chat.completions.runTools({
    tool_choice: "auto", // "auto",
    tools: [
      {
        type: "function",
        function: {
          function: (args: any): Promise<any> | string => {
            args.targetUserId = args.targetUserId || args.userid;
            args.platform = platform;

            try {
              // fix userid_ formatting
              args.fact = args.fact.replace(/[^#]?userid_/g, "#userid_");
              args.keywords = args.keywords.replace(/[^#]userid_/g, "#userid_");

              // add userid if not specified for non-admin saving
              if (OPEN_PUBLIC_SAVE_CATEGORIES.includes(args.category)) {
                if (!isAdmin && args.targetUserId !== args.userid) {
                  return `User cannot update another's note. Include <INVALID> in response.`;
                }
                // remove all non hashtags words

                args.keywords = `#userid_${args.targetUserId}`;
              } else {
                // ACCESS CONTROL
                if (!isAdmin) {
                  console.error("not an admin. :497");
                  return `You are not authorized to edit ${args.category}. Include error flag: <INVALID>`;
                }
                // remove targetUserId for general data updates
                delete args.targetUserId;
              }

              args.admin = isAdmin;
              const x = save_or_update_community_fact(args);
              saved = true;
              return x;
            } catch (e: any) {
              console.error(e);

              if (e.message) return e.message;
              return e;
            }
          },
          parse: JSON.parse,
          name: "save_update_report",
          description:
            "Save new reported information or remove. Ensure user provides minimumal coherent information [example: if report is 'its broken', ask 'what is broken?']. Must explicit ask to save, update, or delete info. Ignore for questions, only for information-giving statements.",
          parameters: {
            type: "object",
            properties: {
              fact: {
                type: "string",
                description:
                  "The event fact to save. Fact MUST include any given URLs, images, or files.",
              },
              keywords: {
                type: "string",
                description:
                  "Use up to 2 unique space-seperated alternative keywords to find existing data to update, include key facts, IDs. Do NOT use requested changes in search terms.",
              },
              category: {
                type: "string",
                enum: CATEGORIES,
                description: "The category of the request",
              },
              // category_alt: {
              //   type: "string",
              //   enum: CATEGORIES,
              //   description: "The category of the request",
              // },
              userid: {
                type: "string",
                enum: [userId],
                description: "The author user id making the request",
              },
              targetUserId: {
                type: "string",
                description:
                  "The target user to update upon. Use author's userid if inferred to self. Leave empty if request is inferred project wide",
              },
              channelid: {
                type: "string",
                enum: [channelid],
                description: "The channel of the request",
              },
              admin: {
                type: "boolean",
                enum: [isAdmin],
                description: "The user is an admin",
              },
            },
            required: [
              "fact",
              "keywords",
              "category",
              "userid",
              "channelid",
              "admin",
              "targetUserId",
            ],
          },
        },
      },

      {
        type: "function",
        function: {
          function: (args: { username: string }) => {
            console.log("::not_a_question_or_fact_or_report", args);
            return `MUST RESPOND WITH "<SILENCE> if not a question or statement or follow-up requested info" tag`;
          },
          parse: JSON.parse,
          name: "not_a_question_or_fact_or_report",
          description:
            "Trigger this function if the user is not asking a question, stating a fact, or reporting. Idle chatter or conversation is ignored.",
          parameters: {
            type: "object",
            properties: {
              username: {
                type: "string",
                description: "The username of the unpolite user",
              },
            },
          },
          required: ["username"],
        },
      },

      {
        type: "function",
        function: {
          function: (args: { username: string }) => {
            console.log("::unpolite_behavior_detection", args);
            return `Give a reminder to ${args.username} to be nice with soft wit.`;
          },
          parse: JSON.parse,
          name: "unpolite_behavior_detection",
          description:
            "Get general information about an event like location, date, parking, pricing, registration, etc",
          parameters: {
            type: "object",
            properties: {
              username: {
                type: "string",
                description: "The username of the unpolite user",
              },
            },
          },
          required: ["username"],
        },
      },
      {
        type: "function",
        function: {
          function: (args: { username: string }) => {
            console.log("::spam_or_abuse_detection", args);
            return `Give a reminder to ${args.username} to stop spamming.`;
          },
          parse: JSON.parse,
          name: "spam_or_abuse_detection",
          description:
            "ONLY called if the request is obviously spam or bot input abuse. Respond with a warning or report to admins.",
          parameters: {
            type: "object",
            properties: {
              username: {
                type: "string",
                description: "The username of the unpolite user",
              },
            },
          },
          required: ["username"],
        },
      },

      {
        type: "function",
        function: {
          function: triggerFetched(get_event_fact),
          parse: JSON.parse,
          name: "get_community_program_fact",
          description:
            "Get contextually relevent information only for user request from searches. Professionally ignore non-relevent search results. Do not format URLs. Do not use markdown.",
          parameters: {
            type: "object",
            properties: {
              searchTerm: {
                type: "string",
                description:
                  "Use up to 2 alternative space-seperated words to concisely search for request, include key facts, IDs.",
              },
              category: {
                type: "string",
                enum: CATEGORIES,
                description: "The category of the request",
              },
              category_alt: {
                type: "string",
                enum: CATEGORIES,
                description:
                  "An alternative category suggestion of the request",
              },
              userid: {
                type: "string",
                enum: [userId],
                description: "The request author user ID",
              },
              targetUserId: {
                type: "string",
                description:
                  "The target user to update upon. Use author's userid if inferred to self. Leave empty if request is inferred project wide",
              },
              channelid: {
                type: "string",
                description: "The channel ID",
              },
            },
            required: [
              "searchTerm",
              "category",
              "category_alt",
              "channelid",
              "userid",
              "targetUserId",
            ],
          },
        },
      },

      {
        type: "function",
        function: {
          function: matchmaker,
          parse: JSON.parse,
          name: "matchmaker",
          description:
            "Match the user with a group of people or individuals based on topics of interest",
          parameters: {
            type: "object",
            properties: {
              topics: {
                type: "string",
                description: "a list of comma seperated topics to match on",
              },
            },
            required: ["topics"],
          },
        },
      },
    ],

    messages: [
      {
        role: "system",
        content: `You are a wonderful community organizer called THRIVE that responds concisely without filler words. No emojis or slang.
                  If certain on user's language, translate your response for them.
                  Use functions to answer user data inquires.
                  Always refer to User IDs as formatted as #userid_1234567890
                  Do not respond to casual conversations- only informational or profile hamdling or ordering. 
                  Use plain text formatting for urls and ensure URLS always start with "https://".
                  Thrive is a professional organizer and concierge service community copilot. 
                  Never engage in idle talk.`,
      },
      {
        role: "user",
        content: msg,
      },
    ],
    parallel_tool_calls: true,
    model: "gpt-4o", // "llama3-70b-8192",
    temperature: 0.4,
    // temperature: 0.6,
  });

  if (r.errored) {
    console.error(r);
  }

  const res = "" + (await r?.finalContent()); //.choices[0]?.message?.content;

  // console.log("::copilot", `"${msg}"`, res);
  return { r: res, saved, fetched };
}

// `THRIVE is an elegant and sophisticated matriarch, writes elegantly short responses with wit and without emojis, known for her intelligence, devotion to family, and a unique sense of humor. She embodies a mysterious aura and knows how to flatter elegantly.`,
