import type { HydrateFlavor } from "@grammyjs/hydrate"
import { $ } from "bun"
import { InlineKeyboard, InputFile, type Context } from "grammy"
import { bot, providers } from "../config"
import { editText } from "../utils/editText"
import { log } from "../utils/log"
import { reply } from "../utils/reply"

async function check(ctx: HydrateFlavor<Context>) {
  await ctx.answerCallbackQuery()
  if (ctx.from.id !== Number(process.env.ADMIN_ID)) throw new Error("Access Denied")
}

export function callbacks() {
  bot.callbackQuery(/^diff:(.+)$/, async (ctx) => {
    const msg = ctx.msg

    await check(ctx)

    const proj = ctx.match[1]

    await $`git add .`.cwd(`/app/projects/${proj}`)

    const gitDiff = await $`git diff --cached`.cwd(`/app/projects/${proj}`).text()

    const kb = new InlineKeyboard().text("✅", `approve:${proj}`).text("❌", `reject:${proj}`)

    await editText(msg, "✅ Git Diff", `${gitDiff || "no changes"}`, "code", kb)

    const date = new Date().toISOString().slice(5, 16).replace("T", "_").replace(/:/g, "-")

    await ctx.replyWithDocument(new InputFile(Buffer.from(gitDiff), `${proj}-${date}.diff`))
  })

  bot.callbackQuery(/^approve:(.+)$/, async (ctx) => {
    const msg = ctx.msg
    const text = msg.text.split("\n\n").slice(1).join("\n\n")

    ;(async () => {
      try {
        await check(ctx)

        const proj = ctx.match[1]

        await editText(msg, "⏳ Processing", text, "code")

        await $`git add .`.cwd(`/app/projects/${proj}`)

        const gitDiff = await $`git diff --cached`.cwd(`/app/projects/${proj}`).text()

        if (!gitDiff.length) return await editText(msg, "✅ No Changes", text, "code")

        let commit: any

        async function loop() {
          for (const provider of providers) {
            try {
              commit = await $`
               bun x @mariozechner/pi-coding-agent \
               --provider ${provider} \
               --no-tools \
               --no-session \
               -p "Reply strictly and only with a concise commit message for these changes: ${text.slice(0, 4000)}"`
                .cwd(`/app/projects/${proj}`)
                .text()

              return
            } catch (err) {
              log("error", `provider ${provider}`, err)
            }
          }

          log("error", `all providers error`)
          throw new Error("all providers error")
        }

        await loop()

        await $`git commit -m ${commit.trim()}`.cwd(`/app/projects/${proj}`)
        await $`git push`.cwd(`/app/projects/${proj}`)

        await editText(msg, "✅ Approved", `Commit: ${commit.trim()}\n\n${text}`, "code")
      } catch (err) {
        await editText(msg, "❌ Error", text, "code")
        await reply(ctx, "error", JSON.stringify(err))
        log("error", "approve callback", err)
      }
    })()
  })

  bot.callbackQuery(/^reject:(.+)$/, async (ctx) => {
    const msg = ctx.msg
    const text = msg.text

    try {
      await check(ctx)

      const proj = ctx.match[1]

      await editText(msg, "⏳ Processing", text, "code")
      await $`git reset --hard HEAD`.cwd(`/app/projects/${proj}`)
      await $`git clean -fd`.cwd(`/app/projects/${proj}`)
      await editText(msg, "✅ Rejected", text, "code")
    } catch (err) {
      await editText(msg, "❌ Error", text, "code")
      log("error", "reject callback", err)
    }
  })
}
