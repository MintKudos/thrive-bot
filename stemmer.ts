// import * as natural from "natural";

export function checkMatchingWords(userText: string) {
  const trimmed = userText.trim();
  /// console.log("trimmed", trimmed, /[.!?¡¿«»'"]/.test(trimmed));
  // if (trimmed.length < 4) return false; // too short to be a question

  //check if numver of words is less than 3
  // if (trimmed.split(" ").length < 3) {
  //   console.log("Message too short");
  //   return false; // too short to be a question
  // }

  // ignore common face emojis
  // if (
  //   /[😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😍😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🤩🥳😏😒😞😔😟😕🙁☹️😣😖😫😩😢😭😤😠😡🤬🤯😳🥺😨😰😥😓🤗🤔🤭🤫🤥😶😐😑😬🙄😯😦😧😮😲😴🤤😪😵🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺💀👻👽🤖💩😺😸😹😻😼😽🙀😿😾🙈🙉🙊🦄🐶🐱🐭🐹🐰🦊🦝🦙🐻🐼🦘🦡🐨🐯🦁🐮🐷🐽🐗🦓🦒🦏🐴🦌🦄🐑🐘🦏🦛🦘🦙🦒🦍🦧🐵🐒🦖🦕🐉🐲🌵🎄🌲🌳🌴🌱🌿☘️🍀🎍🎋🍃🍂🍁🍄🌾🌺🌻🌹🥀🌷🌼🌸💐🍇🍈🍉🍊🍋🍌🍍🍎🍏🍐🍑🍒🍓🥝🥥🥭🥑🥦🥒]/.test(
  //     trimmed
  //   )
  // ) {
  //   console.log("Emoji found");

  //   return false;
  // }
  //
  if (/[.!?¡¿«»'"]/.test(trimmed)) return true;
  // german punctuation
  if (/[„“‚‘]/.test(trimmed)) return true;

  //true if in keyTriggerAIWords
  const trigs = keyTriggerAIWords.some((word) => {
    const regexTest = new RegExp("\\b(" + word + ")\\b", "i");
    return regexTest.test(trimmed);
  });
  if (trigs) return true;

  return false;

  // const stemmedSearchTerm = trimmed
  //   .toLowerCase()
  //   .split(/\W+/)
  //   .map((word) => stemmer.stem(word))
  //   .join(" ");
  // return regexTest.test(stemmedSearchTerm);
}

// export const stemmer = natural.PorterStemmer;
// // To limit the AI running all the time, look for info requests or commands
export const keyTriggerAIWords = [
  "list",
  "search",
  "have",
  "also",
  "are",
  "whats",
  "bot",
  "please",
  "are there",
  "is there",
  "show",
  "display",
  "post",
  "print",
  "this is",
  "this will be",
  "store",
  "remind",
  "know",
  "understand",
  "save",
  "update",
  "delete",
  "remember",
  "remind",
  "db",
  "set",
  "will be",
  "tell me",
  "going to be",
  "announce",
  "inform",
  "instruct",
  "let people know",
  "add",
  "create",
  "merge",
  "remove",
  "edit",
  "change",
  "how",
  "where",
  "what",
  "who",
  "find",
  "when",
  "why",
  "bug",
  "error",
  "issue",
  "problem",
  "fix",
  "help",
  "support",
  "assist",
  "troubleshoot",
  "lost",
  "anyone",
  "information",
  "hello",
  "name is",
  "about",
  "i am",
  "i m",
  "what s",
  // "will have",
  // "are going to have",
  "thrive",
  "thrivetogether",
  "thrive together",
];
// .map((word) =>
//   word
//     .split(/\W+/)
//     .map((word) => stemmer.stem(word))
//     .join(" ")
// );

// const regexTest = new RegExp(
//   "\\b(" + keyTriggerAIWords.join("|") + ")\\b",
//   "i"
// );
// map into regex expression with a list to match
