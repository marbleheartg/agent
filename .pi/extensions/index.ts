import { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import path from "path"

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event) => {
    if (event.toolName === "bash" && /\bgit\b/.test(event.input.command as string)) return { block: true, reason: "git commands are disabled" }

    const eventInputPath = event.input?.path as string

    if (eventInputPath) {
      const normalized = path.posix.normalize(eventInputPath)
      const allowed = normalized.startsWith("/app/projects/") || normalized.startsWith("projects/")
      if (!allowed || normalized.includes("..")) return { block: true, reason: "only projects folder is allowed" }
    }
  })
}
