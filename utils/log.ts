import { createWriteStream, writeFileSync } from "fs"

writeFileSync("logs/bot.log", "")
const logStream = createWriteStream("logs/bot.log", { flags: "a" })

type LogLevel = "info" | "warn" | "error"

function serializeError(err: unknown) {
  if (!err) return ""

  if (err instanceof Error)
    return {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    }

  try {
    return JSON.stringify(err, null, 2)
  } catch {
    return String(err)
  }
}

export function log(level: LogLevel, message: string, err?: unknown) {
  const timestamp = new Date().toISOString()

  const errorPart = err ? serializeError(err) : ""

  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}` + (errorPart ? `\n${JSON.stringify(errorPart, null, 2)}` : "") + "\n"

  // stdout / stderr
  if (level === "error") {
    console.error(message, JSON.stringify(errorPart).slice(0, 170).trim() + "\n")
  } else if (level === "warn") {
    console.warn(message)
  } else {
    console.log(message)
  }

  logStream.write(line)
}
