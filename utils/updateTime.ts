import { clean } from "./clean"
import { editText } from "./editText"

export async function updateTime(msg: any, text: string, startTime: number) {
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  return editText(msg, `⏳ <b>[${elapsed}s]</b>`, `${clean(text)}`, "processing")
}
