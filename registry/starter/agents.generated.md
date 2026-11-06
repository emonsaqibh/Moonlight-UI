# Moonlight UI — how to build UI in any project

Moonlight is our design system: shadcn/ui on **Base UI** (style `base-nova`) + Tailwind v4, with a custom neutral look
plus extras (Frame, IconTile, DataGrid, Tree) and finished
dashboard blocks (charts, stat cards, tables, boards).
Everything is installed **with the shadcn CLI** from the Moonlight registry as source files in the project.

Registry: `http://localhost:4111/r` · catalog of every item: `http://localhost:4111/r/llms.txt`

## The one rule

**Moonlight is installed, never imitated.** Do not write your own Button/Badge/Card/Frame/chart wrapper, do not copy class strings
from memory, do not "make it look like Moonlight" with hand-written Tailwind. Every component and block below comes from
`npx shadcn add`. If a command fails, fix the cause (steps below) or stop and tell the user. Hand-rolling is never the fallback.

## Step 0 — check the registry is reachable (every session, before anything else)

```bash
curl -sf http://localhost:4111/r/moonlight-source.txt
```

It must print `/Users/fringecore/Documents/Development-Projects/dashtemplate`. This registry is served from this machine, so fix anything else yourself:

- **Nothing printed** (connection refused): start it in the background with `npm --prefix "/Users/fringecore/Documents/Development-Projects/dashtemplate" run registry:serve`,
  wait a second and re-check.
- **A different path printed**, or "Address already in use" while a path prints: a stale copy of Moonlight holds port 4111.
  Stop it with `lsof -ti tcp:4111 -sTCP:LISTEN | xargs kill`, start the right one as above and re-check. Never install
  from the stale copy.
- **Still failing**, or port 4111 is held by something that is not Moonlight (no path prints): stop and tell the user.

## Step 1 — make sure the project has Moonlight

Run these checks from the project root and take the first branch that matches.

**A. No project yet** — one command creates a Next.js app with shadcn, the theme, every component, the root layout (Inter + theme
script), a sample page and an `AGENTS.md` with these rules:

```bash
npx shadcn@latest init -d -n my-app http://localhost:4111/r/moonlight-starter.json
```

**B. Next.js project without `components.json`** (shadcn not set up yet): check Tailwind (C.1), run
`npx shadcn@latest init -d -b base` (Base UI, neutral), then continue with C.

**C. `components.json` exists.** Work through every step; none of them is a reason to stop and hand-roll instead.

1. **Tailwind v4.** `package.json` must have `"tailwindcss": "^4…"`. On v3 (a `tailwind.config.*` file, `@tailwind base;` in the
   CSS), upgrade first with `npx @tailwindcss/upgrade` (it wants a clean git tree, so commit first), then make sure
   `npm run build` passes. Moonlight's theme and components use v4 syntax and break on v3.
2. **Already set up?** `grep -q '"@moonlight"' components.json && grep -q 'muted:' components/ui/button.tsx && echo installed`.
   If it prints `installed`, skip to **Adding components**.
3. **Base UI, not Radix.** If `"style"` starts with `base-` (e.g. `base-nova`), go on to step 4. If it is `new-york`, `default` or
   `radix-*`, the project's components are Radix. Convert them now; Moonlight is Base UI and the two don't compose. If
   `git status` shows uncommitted changes under `components/ui`, ask the user first; otherwise convert without asking:
   a. Set `"style": "base-nova"` in `components.json`.
   b. Reinstall every existing component as its Base UI version:
      `ls components/ui/*.tsx | xargs -n1 basename | sed 's/\.tsx$//' | xargs npx shadcn@latest add --overwrite --yes`
   c. Do step 4 (install Moonlight), then come back here for d and e.
   d. Run `npx tsc --noEmit`. It lists every Radix prop left in app code. Convert `asChild` to `render`:
      `<DialogTrigger asChild><Button variant="outline">Open</Button></DialogTrigger>` becomes
      `<DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>`. When a `Button` renders a link,
      write `<Button nativeButton={false} render={<Link href="/x" />}>Docs</Button>`. For any other error, read the
      component's new source in `components/ui`.
   e. Once nothing imports `radix-ui` or `@radix-ui/*` any more, `npm uninstall` them. `npx tsc --noEmit` and
      `npm run build` must pass. Tell the user the project was converted from Radix to Base UI.
4. **Install Moonlight**: all four commands, in order:

```bash
npx shadcn@latest registry add "@moonlight=http://localhost:4111/r/{name}.json"
npx shadcn@latest add http://localhost:4111/r/moonlight-theme.json --overwrite --yes
npx shadcn@latest add http://localhost:4111/r/moonlight.json --overwrite --yes
npx shadcn@latest add http://localhost:4111/r/moonlight-layout.json --overwrite --yes   # only if app/layout.tsx is still the default
```

   - `--overwrite` is **required** on Moonlight items. `shadcn init` already wrote a stock `button.tsx`; without the flag the CLI
     stops at "button.tsx already exists. Overwrite? (y/N)", which a non-interactive shell answers No, and it **silently installs
     almost nothing** (exit code 0). The theme also needs it, or the project's stock colors win. With the flag, a
     "Skipped N files (files might be identical…)" line is normal: those files already match.
   - `moonlight-layout` replaces `app/layout.tsx` with Inter (`--font-inter`), the theme init script and `TooltipProvider`. Use it
     when the layout is still the `shadcn init` / `create-next-app` default (Geist fonts, `ThemeProvider`), then delete
     `components/theme-provider.tsx` and the `next-themes` package if nothing else imports them. If the layout has real app code, wire it by hand instead —
     see **Root layout** below. Without Inter the app renders in the system font and won't match.
5. **Verify**: `ls components/ui | wc -l` shows 35+, and the `installed` check from step 2 passes. Remove any leftover
   `body { font-family }` / `prefers-color-scheme` rules from `globals.css`.

## Adding components

Look the name up in the catalog at the end of this guide (or `http://localhost:4111/r/llms.txt`):

- **In the catalog** (component or block) — install Moonlight's version, always with `--overwrite`, which replaces a stock copy:
  `npx shadcn@latest add @moonlight/<name> --overwrite --yes`. Several at once: `add @moonlight/badge @moonlight/tabs …`.
  Never plain `npx shadcn add <name>` for these: that installs the vanilla look.
- **Not in the catalog** (dialog, alert, alert-dialog, accordion, command, calendar, collapsible, pagination, radio-group,
  slider, sonner, …) — install the stock Base UI version, answering **No** to every overwrite prompt:
  `yes n | npx shadcn@latest add <name> --yes`. The `yes n |` matters: stock items depend on `button`, `input`, … and without it the
  CLI silently aborts and writes nothing. Never `--overwrite` a stock item (it would replace Moonlight's button with the vanilla
  one). Stock items pick up the Moonlight tokens automatically; keep them at Moonlight density (rule 8).
- **Neither exists** — compose it from Moonlight components (Frame, Item, Badge, Button, …), not raw `div`s with ad-hoc styles.

## Blocks first for dashboards and charts

Before building a chart, KPI row, table or board, check the **Blocks** list in the catalog. Install the closest block and adapt it:

```bash
npx shadcn@latest add @moonlight/run-time-chart --overwrite --yes
```

Blocks install to `components/<area>/<name>.tsx` with demo data in `lib/data/*-data.ts`. Keep the block's markup and classes,
replace the data import with the project's own data, and rename labels. This is what makes pages match Moonlight one-to-one.
Blocks use container queries (`@lg:`, `@4xl:`), so render them inside `PageBody` (or another `@container` parent).

## Charts

Charts are Recharts inside Moonlight's `ChartContainer` (`@moonlight/chart`). Follow `run-time-chart` / `event-volume`:

```tsx
const config = {
  succeeded: { label: "Succeeded", color: "var(--success)" },
  failed: { label: "Failed", color: "var(--destructive)" },
} satisfies ChartConfig

<Frame>
  <FramePanel className="p-0">
    <FrameHeader><FrameTitle>Run Time</FrameTitle><FrameDescription>By start hour, UTC</FrameDescription></FrameHeader>
    <ChartContainer config={config} className="h-44 w-full px-2 pt-3">
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="hour" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="succeeded" stackId="a" fill="var(--color-succeeded)" radius={[0, 0, 2, 2]} />
        <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ChartContainer>
  </FramePanel>
</Frame>
```

- **Give `ChartContainer` an explicit height** (`h-36`–`h-56 w-full`); otherwise it is `aspect-video` and charts come out huge or
  collapse to 0 inside flex/grid parents.
- Series colors come from `config` and are referenced as `var(--color-<key>)`. Status series use `var(--success|warning|destructive|info|focus)`.
  Neutral categories use `var(--chart-1)`…`var(--chart-5)` — a monochrome grey ramp (light → dark) by design; don't swap in a rainbow.
- Bars: `radius={2}` (stacked: `[0, 0, 2, 2]` bottom, `[2, 2, 0, 0]` top). Grid: `vertical={false}`. Axes: `tickLine={false} axisLine={false}`,
  or `hide` for sparkline-style charts. Legends are small `text-xs` rows above the chart (see the blocks), not Recharts `<Legend>`.
- The file that renders a chart needs `"use client"`.

## Rules for building UI

1. **Only use semantic tokens** — `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border`,
   `ring`, and the status colors `success | info | warning | destructive | invert | focus`. No raw hex, no `bg-gray-*`.
2. **Status = Badge light variants** — `<Badge variant="success-light">`; also `*-outline`, solid, and `primary-light`.
   Sizes `xs sm default lg xl`; `radius="full"` for pills.
3. **Surfaces = Frame** — Moonlight's signature: a muted outer shell with white `FramePanel`s inside. Use
   `Frame > FramePanel > FrameHeader/FrameTitle/FrameDescription` instead of bare cards for dashboard sections.
   `Card` exists, but Frame is the default for page sections. `IconTile` is the icon chip used in lists/headers.
4. **Buttons**: `default` for the one primary action, `muted` for toolbar buttons (Filter, Display, Export), `outline`,
   `ghost`, `secondary`, `destructive`, `link`. Sizes `xs sm default lg icon icon-xs icon-sm icon-lg`.
5. **Tabs**: `<TabsList variant="line">` is the full-width underlined strip (Moonlight's page tabs). Default is the pill.
6. **Base UI, not Radix**: composition uses the `render` prop, not `asChild` —
   `<SidebarMenuButton render={<Link href="/x" />}>`, `<TooltipTrigger render={<Button />}>`.
7. **Tables**: `Table` for lists (see the `jobs-table` block), `DataGrid` (TanStack) when you need sorting/filtering/pagination.
8. **Density**: text is 13–14px, controls are `h-8`, radius `0.625rem`. Keep pages compact; don't scale things up.
9. **Dark mode** is the `.dark` class on `<html>` (the theme toggle + init script handle it). Never hard-code light colors.
   Don't add `next-themes`; Moonlight's `moonlight-theme-toggle` owns the theme.
10. Read the installed source in `components/ui/*` for props/variants — JSDoc at the top of each file documents the intent.

## Root layout (existing projects with a custom layout)

What `moonlight-layout` installs — merge it into the project's own `app/layout.tsx`: Inter as `--font-inter`, the theme init
script (no light flash in dark mode) and `TooltipProvider`. Remove other font variables on `<html>` and any `ThemeProvider`.

```tsx
// app/layout.tsx
import { Inter } from "next/font/google"
import "./globals.css"
import { themeInitScript } from "@/components/app/theme"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body><TooltipProvider>{children}</TooltipProvider></body>
    </html>
  )
}
```

## App shell (sidebar + header + body)

`moonlight-app-sidebar` is a **template**: edit the `nav` array, the `EDIT:` workspace name and the footer links in
`components/app/app-sidebar.tsx` to the project's own routes, and drop icon imports you no longer use. `moonlight-page-header` (breadcrumbs + sidebar trigger + theme
toggle) and `moonlight-page-body` complete the shell. In an app that already has pages, put the shell layout on the route
group of the pages that should get it; don't move existing pages into it unless the user asks.

```tsx
// app/(app)/layout.tsx
import { AppSidebar } from "@/components/app/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">{children}</SidebarInset>
    </SidebarProvider>
  )
}

// app/(app)/services/page.tsx
export default function Page() {
  return (
    <>
      <PageHeader crumbs={["Observe", "Services"]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <Button><PlusIcon /> New service</Button>
      </PageHeader>
      <PageBody>
        <Frame>
          <FramePanel>
            <FrameHeader><FrameTitle>Services</FrameTitle><FrameDescription>Health over the last 24h</FrameDescription></FrameHeader>
            {/* table / chart / DataGrid — or an installed block */}
          </FramePanel>
        </Frame>
      </PageBody>
    </>
  )
}
```

## Telling an existing project's AI about Moonlight

Paste into the project's `AGENTS.md` / `CLAUDE.md` (the starter installs this whole guide as `AGENTS.md` for new projects):

```md
## UI
Use the Moonlight design system for all UI. Read http://localhost:4111/r/llms.txt and follow its setup steps before any UI work.
Moonlight is installed with the shadcn CLI, never recreated by hand:
- Moonlight items: `npx shadcn@latest add @moonlight/<name> --overwrite --yes`
- Stock items Moonlight lacks: `yes n | npx shadcn@latest add <name> --yes` (never --overwrite)
```

## Updating

Re-run `npx shadcn@latest add @moonlight/<name> --overwrite --yes` to pull a newer version of a component
(this overwrites local edits to that file — check first with `--diff`).
