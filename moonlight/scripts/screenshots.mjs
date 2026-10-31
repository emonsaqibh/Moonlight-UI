// Captures the README screenshots from a running dev server.
//   npm run dev -- -p 3111   (in another terminal)
//   node moonlight/scripts/screenshots.mjs            (BASE_URL / CHROME_PATH override the defaults)
import puppeteer from "puppeteer-core"
import path from "node:path"

const BASE = process.env.BASE_URL ?? "http://localhost:3111"
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const OUT = path.resolve(import.meta.dirname, "../../docs/assets")

const shots = [
  { name: "overview", route: "/" },
  { name: "services", route: "/services" },
  { name: "deploy-board", route: "/deployments/board" },
]

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 })

for (const theme of ["light", "dark"]) {
  for (const { name, route } of shots) {
    await page.goto(BASE + route, { waitUntil: "networkidle0", timeout: 120_000 })
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" })
    await page.evaluate((t) => document.documentElement.classList.toggle("dark", t === "dark"), theme)
    await new Promise((r) => setTimeout(r, 800))
    await page.screenshot({ path: path.join(OUT, `${name}-${theme}.png`) })
    console.log("saved", `${name}-${theme}.png`)
  }
}
await browser.close()
