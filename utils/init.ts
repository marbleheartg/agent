import { $ } from "bun"
import { log } from "console"
import { bot } from "../config"

export async function init() {
  const gitStatus = await $`git status --porcelain`.text()

  if (!gitStatus.length) return

  try {
    await $`git pull`
    await $`bun install --frozen-lockfile`
    await bot.stop()
    process.exit(0)
  } catch (err) {
    log("error", "init error", err)
  }
}
