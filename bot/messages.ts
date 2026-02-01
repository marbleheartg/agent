import type { HydrateFlavor } from "@grammyjs/hydrate"
import { $, sleep, spawn } from "bun"
import { readdir } from "fs/promises"
import { Context, InlineKeyboard, InputFile, Keyboard } from "grammy"
import { bot, providers } from "../config"
import { editText } from "../utils/editText"
import { log } from "../utils/log"
import { reply } from "../utils/reply"
import { updateTime } from "../utils/updateTime"

let model: string

const projects = (await readdir("/agent/projects", { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name)

async function agentLoop(state: { text: string }, prompt: string) {
  for (const provider of providers) {
    try {
      const proc = spawn(
        [
          "bun",
          "x",
          "@mariozechner/pi-coding-agent",
          "--provider",
          provider,
          "--tools",
          "read,write,bash,edit,grep,find,ls",
          "--mode",
          "json",
          "--no-session",
          "--extension",
          "/agent/.pi/extensions/index.ts",
          "-p",
          prompt,
        ],
        {
          cwd: "/agent/projects",
        },
      )

      const reader = proc.stdout.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""
        for (const line of lines) {
          if (!line?.trim()) continue
          const event = JSON.parse(line)

          switch (event.type) {
            case "message_start":
              const { message } = event
              if (message.model) model = message.model
              break
            case "message_update":
              const { assistantMessageEvent } = event
              switch (assistantMessageEvent.type) {
                case "text_delta":
                  state.text = state.text + assistantMessageEvent.delta
                  break
                // case "toolcall_delta":
                //   state.text = state.text + assistantMessageEvent.delta + "\n"
                //   break
                default:
                  break
              }
              break

            default:
              break
          }
        }
      }

      return
    } catch (err) {
      state.text = `provider error ${provider}`
      log("error", `provider ${provider}`, err)
    }
  }

  state.text = `all providers error`
  log("error", `all providers error`)
  throw new Error("all providers error")
}

async function diff(ctx: HydrateFlavor<Context>) {
  const msg = ctx.msg

  const proj = msg.text

  await $`git add .`.cwd(`/agent/projects/${proj}`)

  const gitDiff = await $`git diff --cached`.cwd(`/agent/projects/${proj}`).text()

  const kb = new InlineKeyboard().text("✅", `approve:${proj}`).text("❌", `reject:${proj}`)

  await msg.delete()

  await sleep(1000)

  const date = new Date().toISOString().slice(5, 16).replace("T", "_").replace(/:/g, "-")

  if (gitDiff.length) await ctx.replyWithDocument(new InputFile(Buffer.from(gitDiff), `${proj}-${date}.diff`))

  await sleep(1000)

  await reply(ctx, "✅ Git Diff", `${gitDiff || "no changes"}`, "code", kb)
}

export async function messages() {
  bot.command("start", async (ctx) => {
    if (ctx.msg.from.id !== Number(Bun.env.ADMIN_ID)) return

    const keyboard = new Keyboard()

    projects.forEach((proj, i) => (i !== 0 && i % 4 === 0 ? keyboard.row().text(proj) : keyboard.text(proj)))

    keyboard.resized().persistent()

    await reply(ctx, "init success", "", "clean", keyboard)
  })

  bot.command("cmd", async (ctx) => {
    if (ctx.msg.from.id !== Number(Bun.env.ADMIN_ID)) return

    const cmd = ctx.msg.text.split(" ").slice(1).join(" ")

    if (!cmd) return

    try {
      const text = await $`bash -lc ${cmd}`.text()
      await reply(ctx, `✅ Command executed`, `${text}`)

      log("info", `Command executed ${cmd}`)
    } catch (err) {
      await reply(ctx, "❌ Command failed", `${err}`)
      log("error", `Command failed ${cmd}`, err)
    }
  })

  bot.on("message", (ctx) => {
    ;(async () => {
      if (ctx.msg.from.id !== Number(Bun.env.ADMIN_ID)) return

      if (projects.some((proj) => proj === ctx.msg.text)) return await diff(ctx)

      let replyToText: string
      const reply_to_message = ctx.msg?.reply_to_message
      if (reply_to_message) replyToText = [reply_to_message?.text?.trim(), reply_to_message?.caption?.trim()].filter(Boolean).join("\n")

      const prompt = [ctx.msg.text, replyToText && `Replied to this message: ${replyToText}`].filter(Boolean).join("\n\n")

      if (!prompt?.length) return

      const startTime = Date.now()

      const msg = await reply(ctx, "🤖", "", "clean")

      const state = { text: "" }

      const interval = setInterval(() => updateTime(msg, state.text, startTime).catch(() => {}), 1000)

      try {
        await agentLoop(state, prompt + ". never add any comments to the code.")

        clearInterval(interval)

        await sleep(1000)

        await editText(msg, `✅ ${model} [${Math.floor((Date.now() - startTime) / 1000)}s]`, state.text, "clean")

        const pingMsg = await reply(ctx, "ping", "")

        await sleep(5000)

        pingMsg.delete()
      } catch (err) {
        clearInterval(interval)
        log("error", "cli process failed:", err)
        await sleep(1000)
        await editText(msg, "cli process failed", "clean")
      }
    })()
  })
}
