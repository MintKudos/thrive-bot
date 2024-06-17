import { createClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert } from "./supabase";
import { openaiClient } from "./copilot";

const supabaseUrl = process.env.SUPABASE_HOST || "";
const supabaseKey: string = process.env.SUPABASE_SERVICE_ROLL || ""; // || process.env.SUPABASE_KEY || "";

if (!supabaseUrl) throw new Error("no Superbase SUPABASE_HOST env key");
if (!supabaseKey) throw new Error("no Superbase SUPABASE_SERVICE_ROLL env key");
export const db = createClient<Database>(supabaseUrl, supabaseKey);

// Profile APIs
export async function getProfileById(id: string) {
  return await db.from("profiles").select("*").eq("userid", id);
}

// export function saveProfile(profile: Tables.Pro ) {
//   return db.from("profiles").insert([profile]);
// }

export async function makeEmbedding(fact: any) {
  if (!fact) throw new Error("No fact found for embedding");

  const embedding = await openaiClient.embeddings.create({
    model: "text-embedding-3-large", //"text-embedding-3-large", //"text-davinci-003",
    dimensions: 1536,
    input: fact?.toString(),
  });

  const embeddingString = embedding.data[0].embedding.toString();
  return "[" + embeddingString + "]"; // ::halfvec(1536)
}

export async function delDoc(args: { rowid: string; channelid: string }) {
  const { rowid, channelid } = args;

  console.log(":delDoc", { rowid, channelid });

  const r = await db
    .from("documents")
    .delete()
    .eq("id", rowid)
    .eq("channelid", channelid);

  if (r.error) {
    console.warn(r.error);
    if (r.error) throw r.error;
  }

  return "success";
}

export async function updateDoc(args: {
  rowid: string;
  updated_by: string;
  verified: boolean;
  newContent: string;
  channelid: string;
  // category: string; // does not update category
}) {
  const { rowid, verified, newContent, channelid, updated_by } = args;

  console.log(":updateDoc", args);
  const embedding = null; // await makeEmbedding(fact_fx);
  // if (!embedding) {
  //   throw new Error("No embedding found for fact");
  // }

  const r = await db
    .from("documents")
    .update({
      verified: verified,
      content: newContent,
      embedding: embedding,
      updated_by,
    })
    .eq("id", rowid)
    .eq("channelid", channelid);

  if (r.error) {
    console.warn(r.error);
    if (r.error) throw r.error;
  }

  const status = (await r).status;
  return status === 204
    ? `Update success! Updated content: \n${newContent}`
    : "unknown status code";
}

// saves into document table
export async function saveDoc(args: {
  fact: string;
  category: string;
  userid: string;
  channelid: string;
  verified: boolean;
  platform: number;
}) {
  const { fact, category, userid, channelid, verified } = args;
  console.log(":saveDoc", { fact, category, userid, channelid });

  const embedding = null; // await makeEmbedding(fact_fx);
  // if (!embedding) {
  //   throw new Error("No embedding found for fact");
  // }

  // console.log(":embedding", embedding);

  try {
    var r = await db.from("documents").insert([
      {
        content: fact,
        category: category,
        embedding: embedding,
        userid: userid,
        channelid: channelid,
        verified: verified,
        updated_by: userid,
        platform: args.platform,
      },
    ]);
  } catch (e) {
    console.error("insert error:", e);
    throw e;
  }

  if (r.error) {
    console.warn(r.error);
    if (r.error) throw r.error;
  }

  if (!r) return "Entry saved: " + fact;
  return (await r).status === 201 ? "new entry success saved" : "service fail";
}

// save a new event fact json to the database and generate the embedding using OpenAI client object openaiClient
export async function getDoc(args: { searchTerm: string; channelid: string }) {
  let { searchTerm, channelid } = args;
  searchTerm = searchTerm
    .trim()
    .replace(", ", " ")
    .replace(",", " ")
    .replace("  ", " ");

  console.log("::searchTermIn", searchTerm);
  // exact words and hashtags into two lists
  let words = searchTerm
    .split(" ")
    .filter((w) => w.length > 1 && !w.startsWith("#"));

  const hashtags = searchTerm
    .split(" ")
    .filter((w) => w.startsWith("#"))
    .join(" OR ");

  searchTerm =
    words.length > 0 ? `${words.join(" OR ")} OR ${hashtags}` : hashtags;
  // // mix each word with hashtags
  // if (words.length > 0)
  //   searchTerm = words.map((x) => `${x} ${hashtags}`).join(" OR ");
  // else searchTerm = hashtags;

  //searchTerm = searchTerm.split(" ").join(" OR ");

  console.log(":query", { searchTerm, channelid });
  // get embedding
  // const embedding = await makeEmbedding({
  //   query: searchTerm,
  //   channel: channelid,
  // });
  // if (!embedding) {
  //   throw new Error("No embedding found for fact");
  // }

  // fetch by

  try {
    var c = await db.rpc("hybrid_search3", {
      channel: channelid,
      search_word: searchTerm,
      match_count: 3,
      // semantic_weight: 0,
      // full_text_weight: 1,
    });
  } catch (e: any) {
    console.error("error in hybrid_search3:", e);
    throw e;
  }

  // TODO: delete embeddings row

  const data = c?.data || [];
  // const data = c?.data?.map((d: any) => ({
  //   category: d.category,
  //   fact: d.content,
  //   rowid: d.id,
  //   meta: d.meta,
  //   userid: d.userid,
  //   updated_at: d.updated_at,
  // }));

  // console.log(
  //   "::query raw result \n",
  //   data.map((x: any) => `rid_${x.id}: ${x.content}`).join("\n\n")
  // );

  return data ? data : [];
}
