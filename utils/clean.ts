import MarkdownIt from "markdown-it"
import sanitizeHtml from "sanitize-html"

export function clean(text: string, code?: boolean) {
  const md = new MarkdownIt({
    html: false,
    breaks: true,
  })

  if (code) md.disable("list")

  const rawHtml = md.render(text)

  let cleaned = rawHtml
    .replace(/<\/?(ol|ul)>/g, "")
    .replace(/<li[^>]*>/g, "• ")
    .replace(/<\/li>/g, "")

  cleaned = cleaned
    .split("\n")
    .filter((l: string) => l !== "• ")
    .join("\n")
    .trim()

  cleaned = cleaned.replace(/<p[^>]*>/g, "").replace(/<\/p>/g, "\n")

  cleaned = cleaned
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()

  return sanitizeHtml(cleaned, {
    allowedTags: ["b", "i", "u", "ins", "s", "strike", "del", "a", "pre", "blockquote"],
    allowedAttributes: {
      a: ["href"],
    },
  })
}
