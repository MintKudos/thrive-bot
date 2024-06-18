import { getDoc } from "./ProfileDB.ts";
import { OPEN_PUBLIC_SAVE_CATEGORIES } from "./copilot.ts";

export async function get_event_fact(args: {
  searchTerm: string;
  channelid: string;
  userid: string;
  category: string;
  targetUserId: string;
  category_alt: string;
}) {
  // args.targetUserId = args.targetUserId || args.userid;
  // if user is the bot, assume global?
  if (args.targetUserId === "1220895933563277332") args.targetUserId = "";

  let searchTerm = `${args.searchTerm} #${args.category}`;

  // add my own userid if not already included/targeted
  const isUserReported = OPEN_PUBLIC_SAVE_CATEGORIES.includes(args.category);
  if (isUserReported && !searchTerm.includes("#userid_") && args.targetUserId)
    searchTerm += ` #userid_${args.targetUserId}`;

  // add alt category if needed
  // if (args.category_alt && args.category_alt !== args.category)
  //   searchTerm += ` #${args.category_alt}`;
  const query = (
    await getDoc({
      searchTerm: searchTerm,
      channelid: args.channelid,
    })
  )
    // console log each row
    ?.filter(
      (x) =>
        args.category === x.category || args.category_alt?.includes(x.category)
    )
    // filter rows not matching target user
    .filter((x) => !args.targetUserId || x.userid === args.targetUserId)
    ?.map(
      (x, index) =>
        `<MAYBE_SEARCH_RESULT>\n BY: #userid_${x.userid}\n CATEGORY: ${x.category}\n ${x.content}\n`
    );

  let resp = `Context search results:\n${query?.join("\n")}`;
  if (isUserReported) {
    resp =
      "Always refer to creator #userid_ for referring to user data. \n" + resp;
  }
  console.log(`::get_event_fact (${args.category})`, resp || []); //  '${searchTerm}'

  if (!query || query?.length === 0) {
    return "No information found on question - respond with the word <NOT_FOUND>";
  }

  return resp;
}
