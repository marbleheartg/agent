import { bot } from "../config"
import { log } from "../utils/log"

export function terminal() {
  process.on("SIGINT", async () => {
    log("warn", "\nShutting down bot…")
    await bot.stop()
    process.exit(0)
  })

  process.on("SIGTERM", async () => {
    log("warn", "\nShutting down bot…")
    await bot.stop()
    process.exit(0)
  })

  process.on("unhandledRejection", (reason, promise) => {
    log("error", "unhandledRejection", reason)
  })

  process.on("uncaughtException", (err) => {
    log("error", "uncaughtException", err)
  })
}
