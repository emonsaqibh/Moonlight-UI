// Builds the Moonlight component registry (shadcn registry format) straight from the library source, so it can't drift.
//   components/ui/*        -> registry:ui   (one item per file; data-grid/* is one item)
//   components/app/*       -> registry:component (shell pieces: page header/body, theme toggle, sidebar template…)
//   app/globals.css tokens -> "moonlight-theme" (registry:style: cssVars, light + dark)
//   "moonlight"               -> meta item that pulls in the theme + every component
// Then runs `shadcn build` -> public/r/*.json and writes the AI-facing catalog public/r/llms.txt.
//
// Usage:  node moonlight/build-registry.mjs                                     (the published registry on GitHub Pages)
//         REGISTRY_URL=http://localhost:4111/r node moonlight/build-registry.mjs  (local testing, served by registry:serve)
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { execSync } from "node:child_process"

const ROOT = path.resolve(import.meta.dirname, "..")
const BASE = (process.env.REGISTRY_URL ?? "https://emonsaqibh.github.io/Moonlight-UI/r").replace(/\/$/, "")
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/")
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8")
const url = (name) => `${BASE}/${name}.json`

// ---- items -----------------------------------------------------------------------------------------------------
const ui = fs.readdirSync(path.join(ROOT, "components/ui"), { withFileTypes: true })
const items = [] // { name, type, title, description, files:[path], category }

for (const e of ui) {
  if (e.isFile() && e.name.endsWith(".tsx")) {
    const name = e.name.replace(/\.tsx$/, "")
    items.push({ name, type: "registry:ui", files: [`components/ui/${e.name}`], category: "ui" })
  }
}
const grid = fs.readdirSync(path.join(ROOT, "components/ui/data-grid")).filter((f) => f.endsWith(".tsx"))
items.push({ name: "data-grid", type: "registry:ui", files: grid.map((f) => `components/ui/data-grid/${f}`), category: "ui", target: true })

items.push({ name: "utils", type: "registry:lib", files: ["lib/utils.ts"], category: "core" })
items.push({ name: "use-mobile", type: "registry:hook", files: ["hooks/use-mobile.ts"], category: "core" })

// shell pieces: name -> file. They are templates (app-sidebar is the generic starter version: edit its nav array).
const APP = {
  "moonlight-theme-toggle": "theme.tsx",
  "moonlight-page-header": "page-header.tsx",
  "moonlight-page-body": "page-body.tsx",
  "moonlight-range-toggle": "range-toggle.tsx",
  "moonlight-run-strip": "run-strip.tsx",
}
for (const [name, file] of Object.entries(APP)) items.push({ name, type: "registry:component", files: [`components/app/${file}`], category: "shell" })

// templates for a NEW project: a generic sidebar (the demo one in components/app has the demo's navigation), the root
// layout (Geist + theme init script + tooltip provider) and a sample home page. Installed to `targets[file]`.
const targets = {
  "registry/starter/app-sidebar.tsx": "components/app/app-sidebar.tsx",
  "registry/starter/layout.tsx": "app/layout.tsx",
  "registry/starter/page.tsx": "app/page.tsx",
  "registry/starter/agents.generated.md": "AGENTS.md",
}
// Next.js-only (next/link, usePathname), so it stays out of the stack-neutral `moonlight` bundle; other stacks port it to their router
items.push({ name: "moonlight-app-sidebar", type: "registry:component", files: ["registry/starter/app-sidebar.tsx"], category: "starter" })
items.push({ name: "moonlight-layout", type: "registry:page", files: ["registry/starter/layout.tsx"], category: "starter" })
items.push({ name: "moonlight-home", type: "registry:page", files: ["registry/starter/page.tsx"], category: "starter" })
// AGENTS.md for the new project (read by Claude via CLAUDE.md's @AGENTS.md, and by Codex/Cursor/Copilot/Windsurf…). Generated from the guide below.
items.push({ name: "moonlight-agents", type: "registry:file", files: ["registry/starter/agents.generated.md"], category: "starter" })

// blocks: the finished dashboard sections (charts, stat cards, tables, boards) exactly as the demo renders them, with their demo
// data. They are the reference for "what Moonlight looks like": install one, then swap the data for the project's own.
const BLOCKS = {
  "run-time-chart": ["components/overview/run-time-chart.tsx", "Stacked bar chart in a Frame: legend totals row, ChartContainer, footer stats."],
  "stat-cards": ["components/overview/stat-cards.tsx", "KPI stat card row with deltas and run strips."],
  "jobs-table": ["components/overview/jobs-table.tsx", "Jobs table with status badges, run strips and row actions."],
  "up-next": ["components/overview/up-next.tsx", "Upcoming-items list panel (Item + IconTile)."],
  "event-volume": ["components/logs/event-volume.tsx", "Stacked bar chart of event volume by level, with Y axis."],
  "events-table": ["components/logs/events-table.tsx", "Log events table with level badges."],
  "warnings-panel": ["components/logs/warnings-panel.tsx", "Grouped warnings list panel."],
  "check-history": ["components/monitors/check-history.tsx", "Uptime check history: per-region status bars."],
  "checkout-flow": ["components/monitors/checkout-flow.tsx", "Synthetic-check step timings as a horizontal bar chart."],
  "deploy-history": ["components/releases/deploy-history.tsx", "Deploy history table with environment and status badges."],
  environments: ["components/releases/environments.tsx", "Environment cards with current version and health."],
  "deploy-board": ["components/deploy/deploy-board.tsx", "Kanban-style deploy board (columns of cards)."],
  "week-view": ["components/calendar/week-view.tsx", "Calendar week view with on-call/event blocks."],
  "services-view": ["components/services/services-view.tsx", "Services list with filters, health badges and sparklines."],
  "settings-view": ["components/settings/settings-view.tsx", "Settings page: line tabs, Field groups, switches, selects."],
  "all-sources": ["components/sources/all-sources.tsx", "Sources table with sync status."],
  "sources-overview": ["components/sources/overview.tsx", "Sources overview: sparkline stat tiles, bar chart, attention list."],
  // whole screens: page header actions (New …, Pin, Export) wired to the blocks above through shared state
  "overview-view": ["components/overview/overview-view.tsx", "Overview screen: New Job form sheet, job detail sheet (overview, runs, settings), stat cards, jobs table, run time, up next."],
  "logs-view": ["components/logs/logs-view.tsx", "Logs screen: Pin, Export menu (filtered/all as CSV or JSON), event volume, warnings panel, events table with detail sheets."],
  "monitors-view": ["components/monitors/monitors-view.tsx", "Monitors screen: Pin, New Monitor form sheet, checkout-flow chart and check history with monitor detail sheets."],
  "releases-page": ["components/releases/releases-page.tsx", "Releases screen: Pin, New Deploy form sheet, environments and deploy history with deploy detail sheets."],
  "deploy-board-page": ["components/deploy/deploy-board-page.tsx", "Deploy board screen: Pin, New deploy form sheet, board with deploy detail sheets and approvals."],
  "services-page": ["components/services/services-page.tsx", "Services screen: Pin, New SLO form sheet, SLO table with detail sheets and the budget index chart."],
  "sources-page": ["components/sources/sources-page.tsx", "Sources screen: environment picker, New Source form sheet, overview and sources table with detail sheets."],
  "settings-page": ["components/settings/settings-page.tsx", "Settings screen: line tabs, billing (plans, usage, invoices) and the header's Manage Billing action."],
}
const targets_ = {} // file -> install path for blocks and their data (same path as here, so imports resolve unchanged)
for (const [name, [file, description]] of Object.entries(BLOCKS)) {
  items.push({ name, type: "registry:block", files: [file], category: "blocks", description })
  targets_[file] = file
}
for (const f of fs.readdirSync(path.join(ROOT, "lib/data")).filter((f) => f.endsWith(".ts"))) {
  const file = `lib/data/${f}`
  items.push({ name: `data-${f.replace(/-data\.ts$/, "")}`, type: "registry:lib", files: [file], category: "data" })
  targets_[file] = file
}
Object.assign(targets, targets_)

// the AI guide with the registry URL filled in; also written out as the new project's AGENTS.md (read by the scan + build below).
// A local registry's Step 0 names this checkout's path, but only in copies that stay on this machine (public/r, ~/.claude/skills):
// committed copies (SKILL.md in the repo, agents.generated.md, which also lands in consumer projects) get machine-neutral wording.
const LOCAL_REGISTRY = /\/\/(localhost|127\.0\.0\.1)[:/]/.test(BASE)
const PORT = new URL(BASE).port || "80"
const SOURCE = LOCAL_REGISTRY ? ROOT : "moonlight"
const localCheck = (root) => {
  const expect = root
    ? `It must print \`${root}\``
    : "It must print the absolute path of a Moonlight checkout (a folder containing `moonlight/build-registry.mjs`)"
  const checkout = root ?? "<checkout>"
  return `${expect}. This registry is served from this machine, so fix anything else yourself:

- **Nothing printed** (connection refused): start it in the background with \`npm --prefix "${checkout}" run registry:serve\`,
  wait a second and re-check.${root ? "" : ` Find the checkout yourself (both commands return in about a second; never
  scan all of \`~\`, which walks ~/Library and caches and times out):
  \`mdfind -name build-registry.mjs 2>/dev/null | grep '/moonlight/build-registry\\.mjs$'\` (macOS), else
  \`find ~/Documents ~/Developer ~/Projects ~/projects ~/code ~/Code ~/src ~/dev ~/repos ~/git ~/workspace ~/Desktop -maxdepth 5 \\( -name node_modules -o -name .git -o -name Library \\) -prune -o -path '*/moonlight/build-registry.mjs' -print 2>/dev/null\`.
  The checkout is two levels up from the match; if there are several, take the most recently modified. If nothing is found,
  ask the user where their Moonlight checkout is.`}
- **${root ? "A different path printed" : "The printed path doesn't exist or has no `moonlight/build-registry.mjs`"}**, or "Address
  already in use" while a path prints: a stale copy of Moonlight holds port ${PORT}. Stop it with
  \`lsof -ti tcp:${PORT} -sTCP:LISTEN | xargs kill\`, start the right one as above and re-check. Never install from the stale copy.
- **Still failing**, or port ${PORT} is held by something that is not Moonlight (no path prints): stop and tell the user.`
}
const fill = (src, root = null) =>
  // function replacers: the check text contains `$'` (a grep anchor), which a string replacement would expand
  src.replaceAll("{{REGISTRY_URL}}", () => BASE).replaceAll("{{REGISTRY_CHECK}}", () =>
    LOCAL_REGISTRY
      ? localCheck(root)
      : `It must print \`${SOURCE}\`. If it doesn't, stop and tell the user the Moonlight registry at ${BASE} is unreachable.`,
  )
const guideSrc = path.join(ROOT, "moonlight/AI-GUIDE.md")
fs.writeFileSync(path.join(ROOT, "registry/starter/agents.generated.md"), fill(fs.readFileSync(guideSrc, "utf8")))

// import path -> registry item name
const LOCAL = {
  "@/lib/utils": "utils",
  "@/components/app/app-sidebar": "moonlight-app-sidebar",
  "@/hooks/use-mobile": "use-mobile",
  ...Object.fromEntries(Object.entries(APP).map(([n, f]) => [`@/components/app/${f.replace(/\.tsx$/, "")}`, n])),
}
for (const [name, [file]] of Object.entries(BLOCKS)) LOCAL[`@/${file.replace(/\.tsx$/, "")}`] = name
const localName = (spec) => {
  if (LOCAL[spec]) return LOCAL[spec]
  const d = spec.match(/^@\/lib\/data\/([\w-]+)-data$/)
  if (d) return `data-${d[1]}`
  const m = spec.match(/^@\/components\/ui\/(data-grid)(\/.*)?$/) || spec.match(/^@\/components\/ui\/([^/]+)$/)
  return m ? m[1] : null
}
const npmName = (spec) => {
  if (spec.startsWith("@")) return spec.split("/").slice(0, 2).join("/")
  return spec.split("/")[0]
}
const SKIP = new Set(["react", "react-dom", "next"])

for (const it of items) {
  const deps = new Set(), regDeps = new Set()
  for (const f of it.files) {
    if (!/\.(tsx?|jsx?)$/.test(f)) continue // markdown etc. has no imports (the guide's code samples would match)
    for (const m of read(f).matchAll(/from\s+"([^"]+)"/g)) {
      const spec = m[1]
      if (spec.startsWith(".")) continue
      if (spec.startsWith("@/")) {
        const n = localName(spec)
        if (!n) throw new Error(`${f}: unmapped import ${spec}`)
        if (n !== it.name) regDeps.add(n)
      } else if (!SKIP.has(npmName(spec))) deps.add(npmName(spec))
    }
  }
  it.dependencies = [...deps].sort()
  it.registryDependencies = [...regDeps].sort()
}

// ---- theme tokens from app/globals.css ---------------------------------------------------------------------------
const css = read("app/globals.css")
const block = (head) => {
  const i = css.indexOf(head)
  if (i < 0) throw new Error(`globals.css: ${head} not found`)
  const start = css.indexOf("{", i) + 1
  let depth = 1, j = start
  while (depth) { const c = css[j++]; if (c === "{") depth++; else if (c === "}") depth-- }
  return css.slice(start, j - 1)
}
const vars = (body) => Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
const theme = vars(block("@theme inline"))
const light = vars(block(":root"))
// Here .dark inherits what it doesn't redefine (chart-1..5, success, …) from :root. A consumer's globals.css has its own .dark values
// for those (stock shadcn ships dark chart colors), so spell every inherited token out or the stock dark values survive the install.
const dark = { ...Object.fromEntries(Object.entries(light).filter(([k]) => k !== "radius")), ...vars(block(".dark {")) }

const themeItem = {
  name: "moonlight-theme",
  type: "registry:style",
  title: "Moonlight theme",
  description: "Moonlight design tokens: neutral palette, 0.625rem radius, success/info/warning/invert/focus status colors, light + dark. Install this once per project.",
  extends: "none",
  dependencies: ["tw-animate-css", "class-variance-authority", "lucide-react", "cn", "@base-ui/react"],
  registryDependencies: [url("utils")],
  cssVars: { theme, light, dark },
  css: {
    "@layer base": { "*": { "@apply border-border outline-ring/50": {} }, body: { "@apply bg-background font-sans text-foreground antialiased": {} }, html: { "@apply font-sans": {} } },
  },
}

// ---- registry.json ---------------------------------------------------------------------------------------------
const DESC = JSON.parse(fs.existsSync(path.join(ROOT, "moonlight/registry-descriptions.json")) ? read("moonlight/registry-descriptions.json") : "{}")
const title = (n) => n.replace(/^moonlight-/, "").split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
const registryItems = items.map((it) => ({
  name: it.name,
  type: it.type,
  title: title(it.name),
  description: DESC[it.name] ?? it.description ?? `Moonlight ${title(it.name)}`,
  dependencies: it.dependencies,
  registryDependencies: it.registryDependencies.map(url),
  files: it.files.map((f) => ({
    path: f,
    type: it.type === "registry:block" ? "registry:component" : it.type,
    ...(targets[f] ? { target: targets[f] } : it.target ? { target: `components/ui/data-grid/${path.basename(f)}` } : {}),
  })),
}))
registryItems.push(themeItem)

// meta items. `moonlight` = theme + all components (safe for an existing project of any stack: touches no layout/page, imports no
// framework code).
// `moonlight-starter` = moonlight + root layout + home page, for `shadcn init` on a brand-new project.
const all = items.filter((i) => ["ui", "shell", "core"].includes(i.category)).map((i) => url(i.name))
registryItems.push({
  name: "moonlight",
  type: "registry:item",
  title: "Moonlight (everything)",
  description: "Moonlight theme + every Moonlight UI component and the framework-neutral shell pieces (use the individual items to install less). Works with any React stack; does not touch app/layout.tsx or app/page.tsx.",
  registryDependencies: [url("moonlight-theme"), ...all],
})
registryItems.push({
  name: "moonlight-blocks",
  type: "registry:item",
  title: "Moonlight blocks (all)",
  description: "Every finished Moonlight dashboard section (charts, stat cards, tables, boards) with its demo data.",
  registryDependencies: items.filter((i) => i.category === "blocks").map((i) => url(i.name)),
})
registryItems.push({
  name: "moonlight-starter",
  // registry:base: `shadcn init <url>` merges `config` into the new project's components.json, so the project is Base UI
  // (base-nova) from the start and `shadcn add @moonlight/<name>` works. Stock additions then also come out as base-nova.
  type: "registry:base",
  extends: "none",
  config: {
    style: "base-nova",
    iconLibrary: "lucide",
    tailwind: { baseColor: "neutral", cssVariables: true },
    registries: { "@moonlight": `${BASE}/{name}.json` },
  },
  title: "Moonlight starter (new projects)",
  description: "Everything in `moonlight` plus app/layout.tsx (Geist, theme init script, tooltip provider) and a sample app/page.tsx. Use with `shadcn init` on a NEW project only: it replaces layout and home page.",
  registryDependencies: [url("moonlight"), url("moonlight-layout"), url("moonlight-home"), url("moonlight-agents")],
})

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "moonlight",
  homepage: BASE.replace(/\/r$/, ""),
  items: registryItems,
}
fs.writeFileSync(path.join(ROOT, "registry.json"), JSON.stringify(registry, null, 2) + "\n")
console.log(`registry.json: ${registryItems.length} items, base ${BASE}`)

// ---- build -----------------------------------------------------------------------------------------------------
execSync("npx shadcn build", { cwd: ROOT, stdio: "inherit" })

// ---- AI catalog (public/r/llms.txt) -----------------------------------------------------------------------------
const guide = fill(read("moonlight/AI-GUIDE.md"), ROOT)
const exportsOf = (files) => {
  const out = new Set()
  for (const f of files) for (const m of read(f).matchAll(/^export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class)\s+([A-Z]\w+)/gm)) out.add(m[1])
  for (const f of files) for (const m of read(f).matchAll(/^export\s*\{([^}]+)\}/gm)) for (const n of m[1].split(",")) { const x = n.trim().split(/\s+as\s+/).pop(); if (/^[A-Z]/.test(x) && !/^type /.test(n.trim())) out.add(x) }
  return [...out].sort()
}
const variantsOf = (files) => {
  const out = []
  for (const f of files) {
    const src = read(f)
    for (const m of src.matchAll(/\b(variant|size|radius|spacing):\s*\{/g)) {
      let depth = 1, j = m.index + m[0].length
      const start = j
      while (depth && j < src.length) { const c = src[j++]; if (c === "{") depth++; else if (c === "}") depth-- }
      const keys = [...src.slice(start, j - 1).matchAll(/^\s{6,10}(?:"([\w-]+)"|([\w-]+)):/gm)].map((k) => k[1] ?? k[2])
      const line = `${m[1]}: ${[...new Set(keys)].join(" | ")}`
      if (keys.length > 1 && !out.includes(line)) out.push(line)
    }
  }
  return out
}
const lines = []
for (const cat of [["ui", "UI components (registry:ui)"], ["shell", "App shell pieces (templates)"], ["blocks", "Blocks: finished dashboard sections and charts (registry:block, installed with their demo data)"], ["data", "Demo data used by the blocks"], ["core", "Core"], ["starter", "Starter files (new projects only; replace app/layout.tsx and app/page.tsx)"]]) {
  lines.push(`## ${cat[1]}`, "")
  for (const it of items.filter((i) => i.category === cat[0])) {
    const ex = exportsOf(it.files)
    const vs = variantsOf(it.files)
    lines.push(`- **${it.name}** — \`npx shadcn@latest add ${url(it.name)} --overwrite --yes\``)
    if (ex.length) lines.push(`  - exports: ${ex.join(", ")}`)
    for (const v of vs) lines.push(`  - ${v}`)
    if (it.registryDependencies.length) lines.push(`  - also installs: ${it.registryDependencies.join(", ")}`)
    if (DESC[it.name] ?? it.description) lines.push(`  - ${DESC[it.name] ?? it.description}`)
  }
  lines.push("")
}
// marker the guide's Step 0 checks, so a stale server on the same port (an old clone) is caught instead of silently installed from
fs.writeFileSync(path.join(ROOT, "public/r/moonlight-source.txt"), `${SOURCE}\n`)
fs.writeFileSync(path.join(ROOT, "public/r/llms.txt"), `${guide}\n# Component catalog\n\n${lines.join("\n")}`)
console.log("public/r/llms.txt written")

// ---- Claude Code skill: moonlight/skill/moonlight/SKILL.md, also installed to ~/.claude/skills/moonlight so every project gets the
// current rules (a stale copy there is what the AI actually reads). MOONLIGHT_SKILL_INSTALL=0 skips the copy.
const skillDir = path.join(ROOT, "moonlight/skill/moonlight")
fs.mkdirSync(skillDir, { recursive: true })
const skillFor = (guide) => `---
name: moonlight
description: Use whenever the user mentions Moonlight or Moonlight UI, and whenever you build or change UI in a React/Next.js/Tailwind project — ALWAYS when shadcn/ui is involved (npx shadcn add, components.json), and for pages, dashboards, forms, tables, charts, layouts or a new project. Moonlight is our design system: shadcn/ui on Base UI restyled, installed with the shadcn CLI from the Moonlight registry. Install it with the CLI; never recreate its components or look by hand.
---

${guide}

# Component catalog

${lines.join("\n")}`
fs.writeFileSync(path.join(skillDir, "SKILL.md"), skillFor(fill(read("moonlight/AI-GUIDE.md"))))
console.log("skill written: moonlight/skill/moonlight/SKILL.md")
if (process.env.MOONLIGHT_SKILL_INSTALL !== "0") {
  const home = path.join(os.homedir(), ".claude/skills/moonlight")
  fs.mkdirSync(home, { recursive: true })
  fs.writeFileSync(path.join(home, "SKILL.md"), skillFor(guide))
  console.log(`skill installed: ${home}/SKILL.md`)
}
