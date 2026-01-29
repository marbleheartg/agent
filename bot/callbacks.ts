import { $ } from "bun"
import { bot, providers } from "../config"
import { check } from "../utils/check"
import { editText } from "../utils/editText"
import { log } from "../utils/log"
import { reply } from "../utils/reply"

export function callbacks() {
  bot.callbackQuery(/^approve:(.+)$/, async (ctx) => {
    const msg = ctx.callbackQuery.message
    if (!msg || !("text" in msg)) return
    const text = msg.text.split("\n\n").slice(1).join("\n\n")

    ;(async () => {
      try {
        await check(ctx)

        const proj = ctx.match[1]

        await editText(msg, "⏳ Processing", text, "code")

        await $`git add .`.cwd(`/app/projects/${proj}`)

        const gitDiff = await $`git diff --cached`.cwd(`/app/projects/${proj}`).text()

        if (!gitDiff.length) return await editText(msg, "✅ No Changes", text, "code")

        let commitMsg: any

        async function loop() {
          for (const provider of providers) {
            try {
              commitMsg = await $`
               bun x @mariozechner/pi-coding-agent \
               --provider ${provider} \
               --no-tools \
               --no-session \
               -p "Reply strictly and only with a concise commit message for these changes: ${text.slice(0, 3500)}"`
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

        await $`git commit -m ${commitMsg.trim()}`.cwd(`/app/projects/${proj}`)
        await $`git push`.cwd(`/app/projects/${proj}`)

        await editText(msg, "✅ Approved", `${commitMsg.trim()}\n\n${text}`, "code")
      } catch (err) {
        await editText(msg, "❌ Error", text, "code")
        await reply(ctx, "error", JSON.stringify(err))
        log("error", "approve callback", err)
      }
    })()
  })

  bot.callbackQuery(/^reject:(.+)$/, async (ctx) => {
    const msg = ctx.callbackQuery.message
    if (!msg || !("text" in msg)) return
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
