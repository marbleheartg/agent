import { serve } from "bun"
import { webhookCallback } from "grammy"
import { callbacks } from "./bot/callbacks"
import { errors } from "./bot/errors"
import { messages } from "./bot/messages"
import { terminal } from "./bot/terminal"
import { bot } from "./config"
import { banner } from "./utils/banner"
import { log } from "./utils/log"

async function main() {
  banner()
  callbacks()
  messages()
  errors()
  serve({
    port: 8080,
    fetch(req) {
      const url = new URL(req.url)
      if (req.method === "POST" && url.pathname === "/webhook") {
        const secretToken = req.headers.get("x-telegram-bot-api-secret-token")
        if (secretToken !== process.env.SECRET_TOKEN) return new Response("Not found", { status: 404 })
        return webhookCallback(bot, "bun")(req)
      }
      return new Response("Not found", { status: 404 })
    },
  })
}

main().catch((err) => log("error", "main error", err))

terminal()
