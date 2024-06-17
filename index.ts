import { Sentry } from "./sentry.ts";
import {
  Client,
  GatewayIntentBits,
  Partials,
  ChannelType,
  TextChannel,
  Message,
  Events,
  BaseGuildTextChannel,
} from "discord.js";

import "dotenv/config";
import { copilot } from "./copilot.ts";
import { throttle } from "throttle-debounce";

import { checkMatchingWords, keyTriggerAIWords } from "./stemmer.ts";
import { db } from "./ProfileDB.ts";
import { initTg } from "./telegram.ts";

// Stateful data for each user and interfaces
type ChannelIdKey = string;
type UserIdKey = string;

export interface UserChannelData {
  userId: UserIdKey;
  messageId: string;
  // username: string;
  userText: string;
  channel: ChannelIdKey; //BaseGuildTextChannel;
  react: (emoji: string) => void;
  reply: (msg: string) => void;
  isAdmin: boolean;
  isTelegram: boolean;
}

const history = new Map<ChannelIdKey, UserChannelData>();
export function addHistory(msg: UserChannelData) {
  const { userText, userId, isAdmin, messageId, reply } = msg;
  // If group chat, check if the bot was mentioned
  if (userText.length > 600) {
    reply("600 characters limit please for my brain. Thanks friend!");
    return true;
  }

  // ignore idle or met chat
  if (
    /^(\/\/|#|\^|@|meta|note|hm|hrm|!|\?)/.test(userText) ||
    /\b(btw|lol|rofl)\b/.test(userText)
  ) {
    return true;
  }

  let c = userText.trim();

  if (c.startsWith("/help")) {
    reply(
      "Commands: \n /requests shows all open user requests\n /profile shows user profile\n /reset_all - to reset all your data \n /recent - show recent rows \n /help - to view this message"
    );
    return true;
  }

  if (c.startsWith("/profile")) {
    c = msg.userText = "show me my user profile in full detail";
    // return false;
  }

  if (
    c.startsWith("/bugs") ||
    c.startsWith("/issues") ||
    c.startsWith("/requests")
  ) {
    c = msg.userText = "show me all issues or bugs or feature requests";
    // return false;
  }

  if (c.startsWith("/todo") || c.startsWith("/task")) {
    c = msg.userText = "show me all todo tasks";
    // return false;
  }

  if (c.startsWith("/reset_all")) {
    db.from("documents")
      .delete()
      .eq("userid", userId)
      .eq("channelid", msg.channel);
    reply("Resetting your profile");
    // reset profile
    return true;
  }

  if (c.startsWith("/recent")) {
    db.from("documents")
      .select("*")
      .eq("updated_by", userId)
      .eq("channelid", msg.channel)
      .limit(3)
      .order("updated_at", { ascending: false })
      .then((r) => {
        reply(
          "Recent updates: \n" +
            r.data
              ?.map((x, i) => i + ": " + x.content)
              .join("\n")
              .slice(0, 1800)
        );
      });
    return true;
  }

  if (c.startsWith("/")) {
    reply("Invalid command. Type /help to see available commands.");
    return true;
  }

  const key = `${msg.channel}-${msg.userId}-${msg.isTelegram ? "tg" : ""}`;

  if (history.has(key)) {
    msg.userText = `${history.get(key)?.userText}\n<MESSAGE>\n${msg.userText}`;
    if (msg.userText.length > 2000) {
      reply("message thread too long");
      return true;
    }
  }

  const everyWordNotMatching = checkMatchingWords(msg.userText);
  if (!everyWordNotMatching) {
    console.log("No AI trigger words found in message");
    return;
  }

  console.log("msg", msg);
  msg.react("🤔");
  history.set(key, msg);
  throttleResponse(0);
}

// Core function to process incoming messages
const throttleResponse = throttle(3000, async (n) => {
  try {
    await gptcompletionOnHistory();
  } catch (e) {
    console.error("Error throttling:", e);
    Sentry.captureException(e);
  }
});

// Telegram init for message handling
initTg();

// Discord client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.User,
  ],
});

client.on("error", (e) => {
  console.error("Discord error:", e);
  Sentry.captureException(e);
});

client.on("ready", async () => {
  console.log("Bot is ready!");

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) {
      console.log("Not a command");
      return;
    }
    // if (!interaction.inGuild()) return; // only guilds
    // if (!interaction.member) return; // only members
    // if (!interaction.channel) return; // only channels
    // if (!interaction.user) return; // only users
    interaction.reply({ content: "can you see this?", ephemeral: true });
  });

  client.on("messageCreate", async (message) => {
    // if (message.channel.type === ChannelType.DM && !message.author.bot) {

    // ignore bot messages
    if (
      !message?.content ||
      message.author.bot ||
      message.author.username === "ThriveTogether" ||
      message.author.username.toLowerCase().startsWith("thrive")
    ) {
      return;
    }

    // must be added to a channel first
    if (message.channel.type === ChannelType.DM) {
      message.channel.send(
        "Please add me to a channel first. Install link: https://discord.com/oauth2/authorize?client_id=1220895933563277332"
      );
      return;
    }

    // include mentions
    if (message.reference?.messageId) {
      try {
        const repliedMessage = await message.channel.messages.fetch(
          message.reference.messageId
        );
        // console.log(`Original message content: ${repliedMessage.content}`);
        message.content = `${message.content}`;
        message.content += `\n\n<POSSIBLY_RELATED_SEARCH>${repliedMessage.content.slice(
          0,
          320
        )}`;
        // Do something with the replied message content
      } catch (error) {
        console.error("Error fetching the replied message:", error);
      }
    } else {
    }

    Sentry.setUser({
      id: message.author.id,
      username: message.author.username,
    });

    try {
      handleDiscordIncomingMessage(message);
      throttleResponse(0);
    } catch (e) {
      console.error("Error handling incoming message:", e);
      Sentry.captureException(e);
    }
  });
});

// only one global operation at a time for logging
let _active = false;
async function gptcompletionOnHistory() {
  if (_active) return;
  if (history.size === 0) return;

  // clone histrory
  const historyClone = new Map(history);
  history.clear();

  for (const [__channelid, val] of historyClone.entries()) {
    const channelid = val.channel;
    const { userText, userId, isAdmin, messageId, reply, isTelegram } = val;
    if (!userText) {
      console.log("No userText found in history", val);
      return;
    }
    // const channel = (await client.channels.fetch(channelid)) as TextChannel;

    try {
      _active = true;
      console.log("userText::", userText);
      // return;

      let { r, saved, fetched } = await copilot(
        userText,
        channelid,
        userId,
        isAdmin,
        isTelegram ? 1 : 0
      );

      val.react("");
      // console.log("userText::r", r, saved, fetched);

      // bot reactions
      if (r.includes("INVALID") || r.includes("ERROR")) {
        val.react("❌");
        reply("Error: " + r);
        return;
      }
      // else if (isAdmin && saved) val.react("👍");
      else if (r.includes("NOT_FOUND")) {
        val.react("🤷");
        reply("No results found");
        return;
      } else if (r.includes("Please")) {
        // question mark emoji
        val.react("❓");
      }
      if (r.includes("SILENCE") || r.includes("STOP")) {
        console.log('x Silence or stop command detected: "', r);
        return;
      } else {
      }

      // if (saved) return; // don't log saved messages]

      if (!userText.includes("?") && saved) {
        val.react("👍");
        //console.log("fetched or saved");

        // if(isAdmin) return; // don't bother replying if admin
      }
      // channel.send(r);
      // Message post reply to the user messageId
      // const message = await channel.messages.fetch(messageId);
      reply(r);
    } catch (err: any) {
      // Error
      val.react("❌");
      console.error("Error processing completion:", err);
      console.error(JSON.stringify(err));
      reply("Error: " + JSON.stringify(err));
      // throw err;
    } finally {
      _active = false;
    }
  }
}

async function replaceUserMentions(r: string) {
  const mentionRegex = /#userid_(\d+)/g;
  const mentions = Array.from(r.matchAll(mentionRegex));
  for (const m of mentions) {
    const userId = m[1];
    const user = await client.users.fetch(userId);
    r = r.replace(m[0], `${user.displayName} [${user.username}]`);
  }
  return r;
}

function handleDiscordIncomingMessage(message: Message<boolean>) {
  // console.log("handleIncomingMessage", message.content);
  // let content = message.content;
  let c = message.content.replace(/$<@.*>\s*/, "");

  // console.log("c", c);

  // const username = message.author.username;
  const channelId = message.channel.id;

  // check if message @mentions a username and add that user's ID to the message

  if (message.attachments?.first()?.url) {
    const allowedExtensions = /\.(png|jpg|jpeg|gif|mp4|webm|webp|txt|md|pdf)/i;
    c = `${c} \n<attachments>\n${message.attachments
      .filter((x) => allowedExtensions.test(x.url))
      .map((a) => a.url)
      .join(" \n")}`;
  }

  // console.log("content after mentions", content);
  // return;
  Sentry.setExtra("msg", c);

  // check for mentions like <@1220895933563277332> and convert into #userid_1220895933563277332
  const mentionRegex = /<@[!]*(\d+)>/g; // <@!1220895933563277332>
  const mentions = Array.from(c.matchAll(mentionRegex)); // use where we remove self mention
  for (const m of mentions) {
    const userId = m[1];
    c = c.replace(m[0], `#userid_${userId}`);
  }

  // check if message is a guild administrator or can kick members
  let isAdmin = false;
  if (
    message.member?.permissions.has("Administrator") ||
    message.member?.permissions.has("ManageChannels") ||
    message.member?.permissions.has("ManageMessages")
  ) {
    isAdmin = true;
  }

  addHistory({
    react: (msg: string) => {
      message.reactions.removeAll();
      if (msg) message.react(msg);
    },
    isAdmin: isAdmin,
    userText: c,
    channel: channelId,
    messageId: message.id,
    reply: async (msg: string) => {
      // convert all #userid_ID into DisplayName
      if (!msg.toLowerCase().includes(" id"))
        msg = await replaceUserMentions(msg);

      message.reply(msg);
    },
    // username: username,
    userId: message.author.id,
    isTelegram: false,
  });

  // console.log(key, "history:", history.get(key)?.userText);
}

if (!process.env.DISCORD_TOKEN)
  throw new Error("No Discord token DISCORD_TOKEN found in .env file");

client.login(process.env.DISCORD_TOKEN);
