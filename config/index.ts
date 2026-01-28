import { type HydrateFlavor, type Other, hydrate } from "@grammyjs/hydrate"
import { Bot, Context } from "grammy"

const bot = new Bot<HydrateFlavor<Context>>(process.env.BOT_API_KEY)
bot.use(hydrate())

const msgTextConfig: Other<"editMessageText", "text"> = { link_preview_options: { is_disabled: true }, parse_mode: "HTML" }

const providers = ["google-gemini-cli", "google-antigravity"]

export { bot, msgTextConfig, providers }

// providers
// [
//   "amazon-bedrock", "anthropic", "cerebras", "github-copilot", "google", "google-antigravity",
//   "google-gemini-cli", "google-vertex", "groq", "minimax", "minimax-cn", "mistral", "openai", "openai-codex",
//   "opencode", "openrouter", "vercel-ai-gateway", "xai", "zai"
// ]

// google-gemini-cli oauth models
// [ "gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-3-flash-preview", "gemini-3-pro-preview" ]

// google-antigravity oauth models
// [ "claude-opus-4-5-thinking", "claude-sonnet-4-5", "claude-sonnet-4-5-thinking", "gemini-3-flash",
//   "gemini-3-pro-high", "gemini-3-pro-low", "gpt-oss-120b-medium"
// ]

// openai-codex oauth models
// [ "gpt-5.1", "gpt-5.1-codex-max", "gpt-5.1-codex-mini", "gpt-5.2", "gpt-5.2-codex" ]
