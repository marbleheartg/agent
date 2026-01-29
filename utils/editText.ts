import type { MessageX } from "@grammyjs/hydrate/out/data/message"
import type { InlineKeyboard } from "grammy"
import { msgTextConfig } from "../config"
import { clean } from "./clean"

export async function editText(
  msg: MessageX,
  title: string,
  text: string,
  format?: "clean" | "processing" | "final" | "code",
  reply_markup?: InlineKeyboard,
) {
  let finalText = text.length ? text.slice(0, 4000) : "..."

  switch (format) {
    case "clean":
      break
    case "processing":
      finalText = `${finalText} 🤖`
      break
    case "final":
      finalText = `✅ ${finalText}`
      break
    default:
      break
  }

  finalText = `<blockquote expandable><b>${title}</b>\n\n${clean(finalText, format === "code").slice(0, 3500)}</blockquote>`

  if (msg.text === finalText && msg.reply_markup === reply_markup) return

  return msg.editText(finalText, {
    ...msgTextConfig,
    reply_markup,
  })
}
