// Builds the Moonlight component registry (shadcn registry format) straight from the library source, so it can't drift.
//   components/ui/*        -> registry:ui   (one item per file; data-grid/* is one item)
//   components/app/*       -> registry:component (shell pieces: page header/body, theme toggle, sidebar template…)
//   app/globals.css tokens -> "moonlight-theme" (registry:style: cssVars, light + dark)
//   "moonlight"               -> meta item that pulls in the theme + every component
// Then runs `shadcn build` -> public/r/*.json and writes the AI-facing catalog public/r/llms.txt.
//
// Usage:  node moonlight/build-registry.mjs
//         REGISTRY_URL=https://ui.example.com/r node moonlight/build-registry.mjs   (what consumers will fetch from)
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"

const ROOT = path.resolve(import.meta.dirname, "..")
const BASE = (process.env.REGISTRY_URL ?? "http://localhost:4111/r").replace(/\/$/, "")
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

// templates for a NEW project: a generic sidebar (the demo one in components/app has the Strata replica's navigation), the root
// layout (Inter + theme init script + tooltip provider) and a sample home page. Installed to `targets[file]`.
const targets = {
  "registry/starter/app-sidebar.tsx": "components/app/app-sidebar.tsx",
  "registry/starter/layout.tsx": "app/layout.tsx",
  "registry/starter/page.tsx": "app/page.tsx",
  "registry/starter/agents.generated.md": "AGENTS.md",
}
items.push({ name: "moonlight-app-sidebar", type: "registry:component", files: ["registry/starter/app-sidebar.tsx"], category: "shell" })
items.push({ name: "moonlight-layout", type: "registry:page", files: ["registry/starter/layout.tsx"], category: "starter" })
items.push({ name: "moonlight-home", type: "registry:page", files: ["registry/starter/page.tsx"], category: "starter" })
// AGENTS.md for the new project (read by Claude via CLAUDE.md's @AGENTS.md, and by Codex/Cursor/Copilot/Windsurf…). Generated from the guide below.
items.push({ name: "moonlight-agents", type: "registry:file", files: ["registry/starter/agents.generated.md"], category: "starter" })

// the AI guide with the registry URL filled in; also written out as the new project's AGENTS.md (read by the scan + build below)
const guideSrc = path.join(ROOT, "moonlight/AI-GUIDE.md")
fs.writeFileSync(path.join(ROOT, "registry/starter/agents.generated.md"), fs.readFileSync(guideSrc, "utf8").replaceAll("{{REGISTRY_URL}}", BASE))

// import path -> registry item name
const LOCAL = {
  "@/lib/utils": "utils",
  "@/components/app/app-sidebar": "moonlight-app-sidebar",
  "@/hooks/use-mobile": "use-mobile",
  ...Object.fromEntries(Object.entries(APP).map(([n, f]) => [`@/components/app/${f.replace(/\.tsx$/, "")}`, n])),
}
const localName = (spec) => {
  if (LOCAL[spec]) return LOCAL[spec]
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
const dark = vars(block(".dark {"))

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
    "@layer base": { "*": { "@apply border-border outline-ring/50": {} }, body: { "@apply bg-background font-sans text-foreground antialiased": {} } },
  },
}

// ---- registry.json ---------------------------------------------------------------------------------------------
const DESC = JSON.parse(fs.existsSync(path.join(ROOT, "moonlight/registry-descriptions.json")) ? read("moonlight/registry-descriptions.json") : "{}")
const title = (n) => n.replace(/^moonlight-/, "").split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
const registryItems = items.map((it) => ({
  name: it.name,
  type: it.type,
  title: title(it.name),
  description: DESC[it.name] ?? `Moonlight ${title(it.name)}`,
  dependencies: it.dependencies,
  registryDependencies: it.registryDependencies.map(url),
  files: it.files.map((f) => ({
    path: f,
    type: it.type,
    ...(targets[f] ? { target: targets[f] } : it.target ? { target: `components/ui/data-grid/${path.basename(f)}` } : {}),
  })),
}))
registryItems.push(themeItem)

// meta items. `moonlight` = theme + all components (safe for an existing project: touches no layout/page).
// `moonlight-starter` = moonlight + root layout + home page, for `shadcn init` on a brand-new project.
const all = items.filter((i) => ["ui", "shell", "core"].includes(i.category)).map((i) => url(i.name))
registryItems.push({
  name: "moonlight",
  type: "registry:item",
  title: "Moonlight (everything)",
  description: "Moonlight theme + every Moonlight UI component and the shell pieces (use the individual items to install less). Does not touch app/layout.tsx or app/page.tsx.",
  registryDependencies: [url("moonlight-theme"), ...all],
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
  description: "Everything in `moonlight` plus app/layout.tsx (Inter, theme init script, tooltip provider) and a sample app/page.tsx. Use with `shadcn init` on a NEW project only: it replaces layout and home page.",
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
const guide = fs.existsSync(path.join(ROOT, "moonlight/AI-GUIDE.md")) ? read("moonlight/AI-GUIDE.md").replaceAll("{{REGISTRY_URL}}", BASE) : ""
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
for (const cat of [["ui", "UI components (registry:ui)"], ["shell", "App shell pieces (templates)"], ["core", "Core"], ["starter", "Starter files (new projects only; replace app/layout.tsx and app/page.tsx)"]]) {
  lines.push(`## ${cat[1]}`, "")
  for (const it of items.filter((i) => i.category === cat[0])) {
    const ex = exportsOf(it.files)
    const vs = variantsOf(it.files)
    lines.push(`- **${it.name}** — \`npx shadcn add ${url(it.name)}\``)
    if (ex.length) lines.push(`  - exports: ${ex.join(", ")}`)
    for (const v of vs) lines.push(`  - ${v}`)
    if (it.registryDependencies.length) lines.push(`  - also installs: ${it.registryDependencies.join(", ")}`)
    if (DESC[it.name]) lines.push(`  - ${DESC[it.name]}`)
  }
  lines.push("")
}
fs.writeFileSync(path.join(ROOT, "public/r/llms.txt"), `${guide}\n# Component catalog\n\n${lines.join("\n")}`)
console.log("public/r/llms.txt written")

// ---- Claude Code skill: moonlight/skill/moonlight/SKILL.md (copy into ~/.claude/skills/ once; every project then knows Moonlight)
const skillDir = path.join(ROOT, "moonlight/skill/moonlight")
fs.mkdirSync(skillDir, { recursive: true })
fs.writeFileSync(path.join(skillDir, "SKILL.md"), `---
name: moonlight
description: Use whenever you build or change UI in a React/Next.js/Tailwind project, and ALWAYS when shadcn/ui is involved: adding or installing a shadcn component (npx shadcn add, components.json), creating pages, dashboards, forms, tables, charts or layouts, or setting up a new project. Moonlight is our design system (a restyled shadcn/ui on Base UI, installed from a shadcn registry); it replaces vanilla shadcn, which must not be used for components Moonlight provides.
---

${guide}

# Component catalog

${lines.join("\n")}`)
console.log("skill written: moonlight/skill/moonlight/SKILL.md")
