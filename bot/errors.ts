import { sleep } from "bun"
import { GrammyError, HttpError } from "grammy"
import { bot } from "../config"
import { log } from "../utils/log"

export function errors() {
  bot.catch(async (err: any) => {
    const ctx = err?.ctx
    log("error", `Error while handling update ${ctx.update.update_id}:`, err?.error)
    const e = err?.error
    if (e instanceof GrammyError) {
      log("error", "Error in request:", e.description)
    } else if (e instanceof HttpError) {
      log("error", "Could not contact Telegram:", e)
    } else {
      log("error", "Unknown error:", e)
    }
    await sleep(1000)
  })
}
