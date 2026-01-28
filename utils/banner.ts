export function banner() {
  const final = [
    "    _       ____  U _____ u _   _     _____   ",
    'U  /"\\  uU /"___|u\\| ___"|/| \\ |"|   |_ " _|  ',
    ' \\/ _ \\/ \\| |  _ / |  _|" <|  \\| |>    | |    ',
    " / ___ \\  | |_| |  | |___ U| |\\  |u   /| |\\   ",
    "/_/   \\_\\  \\____|  |_____| |_| \\_|   u |_|U   ",
    " \\\\    >>  _)(|_   <<   >> ||   \\\\,-._// \\\\_  ",
    '(__)  (__)(__)__) (__) (__)(_" )  (_/(__) (__)',
  ]

  const chars = "█▓▒░_\\/|(){}[]<>"

  let frame = 0
  const frames = 10

  const timer = setInterval(() => {
    process.stdout.write("\x1Bc")

    for (const line of final) {
      let out = ""
      for (let i = 0; i < line.length; i++) {
        out += frame < frames - 1 && Math.random() < 0.4 ? chars[Math.floor(Math.random() * chars.length)] : line[i]
      }
      process.stdout.write("\x1b[36m" + out + "\x1b[0m\n")
    }

    frame++
    if (frame >= frames) {
      clearInterval(timer)
      process.stdout.write("\x1Bc")
      process.stdout.write("\x1b[36m" + final.join("\n") + "\x1b[0m\n")
    }
  }, 70)
}
