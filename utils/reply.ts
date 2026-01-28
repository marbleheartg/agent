import type { HydrateFlavor } from "@grammyjs/hydrate"
import { Context, InlineKeyboard } from "grammy"
import { msgTextConfig } from "../config"
import { clean } from "./clean"

export async function reply(ctx: HydrateFlavor<Context>, title: string, text: string, reply_markup?: InlineKeyboard) {
  return ctx.reply(`<blockquote expandable><b>${title}</b>\n\n${clean(text)}</blockquote>`, {
    ...msgTextConfig,
    reply_markup,
  })
}
