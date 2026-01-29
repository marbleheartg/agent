import type { HydrateFlavor } from "@grammyjs/hydrate"
import type { Context } from "grammy"

export async function check(ctx: HydrateFlavor<Context>) {
  await ctx.answerCallbackQuery()
  if (ctx.from.id !== Number(process.env.ADMIN_ID)) throw new Error("Access Denied")
}
