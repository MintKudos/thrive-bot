// import Telegram from "node-telegram-bot-api";
import { Telegraf } from "telegraf";
import { message as tg_message } from "telegraf/filters";
import type { ReactionTypeEmoji } from "telegraf/types";
import { addHistory } from ".";

export const api = !process.env["TELEGRAM_TOKEN"]
  ? null
  : new Telegraf(process.env["TELEGRAM_TOKEN"] as string, {});

api?.start((ctx) => ctx.reply("Welcome"));
api?.help((ctx) =>
  ctx.reply("I'm a bot that can help you with your community coordination")
);
api?.launch();

export const tg_enabled = !!api;

// send message to chat
export function sendTgMessage(
  chatId: string,
  messageId: number,
  message: string
) {
  if (!api) return;
  api?.telegram.sendMessage(chatId, message, {
    message_thread_id: messageId,
    disable_notification: false,
  });
}

// add emoji reactions to messages
export async function addTgReactions(
  chatId: string,
  messageId: number,
  reactions: string
) {
  if (!api) return;

  if (!reactions) {
    // delete my last 2 messages in the chat
    // await api.deleteMessage(chatId, messageId);
    // await api.deleteMessage(chatId, messageId - 1);
    // await api.sendChatAction(chatId, "typing");
    // await api.sendChatAction(chatId, "typing");
    return;
  }

  // get the message and add thumbs up, not a message but a reaction emoji
  // await api.sendMessage(chatId, reactions, {
  //   reply_to_message_id: messageId,
  //   disable_notification: true,
  // });

  await api.reaction;
  //await api.sendChatAction(chatId, "typing");

  // (api as any).setMessageReaction(chatId, messageId, { reaction: "👍" });
}

// listen for messages
// isAdmin true if message is a group admin
// export function onTgMessage(
//   callback: (
//     message: string,
//     user: string,
//     channel: string,
//     isAdmin: boolean,
//     messageId: any
//   ) => void
// ) {
//   if (!api) {
//     console.log("info: Telegram API not initialized");
//     return;
//   }

// }

// Telegram client setup
export function initTg() {
  api?.on(tg_message("text"), async (ctx) => {
    const message = {
      text: ctx.text,
      from: ctx.message?.from,
      chat: ctx.message.chat,
      message_id: ctx.message.message_id,
      reply_to_message: ctx.message.reply_to_message,
    };

    // console.log("info: Telegram message received", message);

    if (message?.from?.is_bot) return;

    let content = message.text;

    // get text on message reply source if exists
    const replySource = (message.reply_to_message as any)?.text;
    if (replySource) {
      content += "\n\n<OLD_MESSAGE_HISTORY>\n" + replySource;
    }

    if (!message.text) return;

    const user = message.from?.id.toString();
    const channel = message.chat.id.toString();
    const messageId = message.message_id;

    // check if user is admin in message chat
    const isAdmin = await api.telegram
      .getChatMember(channel, message.from?.id)
      .then((r) => {
        return r.status === "administrator" || r.status === "creator";
      });

    // console.log("TG message:", isAdmin, message, user, channel);

    // addTgReactions(channel, messageId, "🤔"); // thumb up // Thinking...

    api.telegram.sendChatAction(channel, "typing");

    ctx.react({
      type: "emoji",
      emoji: "🤔",
    });

    addHistory({
      react: (msg: any) => {
        // console.log("!!react", msg);

        // if (!msg) {
        //   api.telegram.setMessageReaction(channel, messageId);
        //   return;
        // }

        // api.telegram.setMessageReaction(channel, messageId, [
        //   {
        //     emoji: msg,
        //     type: "emoji",
        //   },
        // ]);

        // return;

        if (msg)
          ctx.react({
            type: "emoji",
            emoji: "👍",
          });
        else api.telegram.setMessageReaction(channel, messageId);
        // addTgReactions(channel, messageId, msg);
      },
      isAdmin: isAdmin,
      userText: content,
      channel: channel,
      messageId: messageId.toString(),
      reply: async (msg: string) => {
        // convert all #userid_XYZ to Username if exists
        msg = msg.replace(/#userid_([0-9]+)/g, (match, id) => {
          // convert id to username
          return `@${id}`;
        });

        ctx.reply(msg, { reply_parameters: { message_id: messageId } });
        // sendTgMessage(channel, messageId, msg);
      },
      userId: `${ctx.message.from?.username}`,
      isTelegram: true,
    });

    // callback(
    //   content,
    //   message.from?.first_name || "",
    //   message.chat.id.toString(),
    //   true,
    //   message.message_id
    // );
  });
}
