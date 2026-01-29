import type { HydrateFlavor } from "@grammyjs/hydrate"
import { Context, InlineKeyboard } from "grammy"
import type { ReplyKeyboardMarkup } from "grammy/types"
import { msgTextConfig } from "../config"
import { clean } from "./clean"

export async function reply(
  ctx: HydrateFlavor<Context>,
  title: string,
  text: string,
  format?: "clean" | "code",
  reply_markup?: InlineKeyboard | ReplyKeyboardMarkup,
) {
  return ctx.reply(`<blockquote expandable><b>${title}</b>\n\n${clean(text, format === "code").slice(0, 3500)}</blockquote>`, {
    ...msgTextConfig,
    reply_markup,
  })
}
