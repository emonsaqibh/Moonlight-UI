# Moonlight UI — how to build UI in any project

Moonlight is our design system: shadcn/ui on **Base UI** (style `base-nova`) + Tailwind v4, with a custom neutral look
plus extras (Frame, IconTile, DataGrid, Tree) and finished
dashboard blocks (charts, stat cards, tables, boards).
Everything is installed **with the shadcn CLI** from the Moonlight registry as source files in the project.

**Moonlight follows the project's stack; it never picks one.** Whatever the user built or asked for (Next.js, Vite, TanStack
Start, React Router, Astro, Laravel…), shadcn is set up the way shadcn does it for that stack, and Moonlight only changes how
shadcn looks. Don't create, convert or restructure the app into another framework.

Registry: `https://emonsaqibh.github.io/Moonlight-UI/r` · catalog of every item: `https://emonsaqibh.github.io/Moonlight-UI/r/llms.txt`

## The one rule

**Moonlight is installed, never imitated.** Do not write your own Button/Badge/Card/Frame/chart wrapper, do not copy class strings
from memory, do not "make it look like Moonlight" with hand-written Tailwind. Every component and block below comes from
`npx shadcn add`. If a command fails, fix the cause (steps below) or stop and tell the user. Hand-rolling is never the fallback.

## Step 0 — check the registry is reachable (every session, before anything else)

```bash
curl -sf https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-source.txt
```

It must print `moonlight`. If it doesn't, stop and tell the user the Moonlight registry at https://emonsaqibh.github.io/Moonlight-UI/r is unreachable.

## Step 1 — make sure the project has Moonlight

Run these checks from the project root and take the first branch that matches. Paths below say `components/ui`; read it as
wherever `components.json`'s `aliases.ui` points (`src/components/ui` in Vite, TanStack Start and React Router projects).

**A. No project yet** — create it with the stack the user asked for, through shadcn's own init (Base UI, Moonlight's preset),
then continue with C:

```bash
npx shadcn@latest init -t <next|vite|start|react-router|astro|laravel> -b base -p nova -n my-app --no-monorepo -y
```

If the user named no stack, ask which one; don't choose for them. For Next.js only, there is a one-command shortcut that also
adds the root layout, a sample page with the sidebar shell and an `AGENTS.md`:
`npx shadcn@latest init -d -n my-app https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-starter.json`.

**B. Existing project without `components.json`** (any stack; shadcn not set up yet): check Tailwind (C.1), run
`npx shadcn@latest init -b base -p nova --no-monorepo -y` (shadcn detects the framework), then continue with C.

**C. `components.json` exists.** Work through every step; none of them is a reason to stop and hand-roll instead. Installing
Moonlight replaces the stock files of the same name (`button.tsx`, `badge.tsx`…) and fixes the app code that uses them; that is
the job, not damage to avoid. If `git status` shows uncommitted changes under `components/ui`, ask the user before any
`--overwrite`; otherwise go ahead without asking.

*Theme only*: if the user asks for just Moonlight's colors/tokens and to keep their current components (e.g. "only theme it",
"don't touch my components"), do step 1, then run only
`npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-theme.json --overwrite --yes` and stop. Tell them their components keep stock
shadcn shapes. When the task is a page or a component, install the Moonlight components it uses (step 4) instead.

1. **Tailwind v4.** `package.json` must have `"tailwindcss": "^4…"`. On v3 (a `tailwind.config.*` file, `@tailwind base;` in the
   CSS), upgrade first with `npx @tailwindcss/upgrade` (it wants a clean git tree, so commit first), then make sure
   `npm run build` passes. Moonlight's theme and components use v4 syntax and break on v3.
2. **Already set up?** `grep -q '"@moonlight"' components.json && echo installed`. If it prints `installed`, skip to
   **Adding components**.
3. **Base UI or Radix?** If `"style"` starts with `base-` (e.g. `base-nova`), it is a Base UI project. If it is `new-york`,
   `default` or `radix-*`, it is a **Radix project: keep it Radix.** Don't change `style`, don't reinstall or convert the stock
   components. Moonlight's components are Base UI and run side by side with Radix ones (`@base-ui/react` next to `radix-ui`; a
   Radix `<DialogTrigger asChild>` can wrap a Moonlight `Button`). Only the components Moonlight replaces change, and step 5
   fixes the app code that uses them. Convert the whole project only when the user asks for it (**Converting a Radix project**
   below).
4. **Install Moonlight**, in order:

```bash
npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-theme.json --overwrite --yes
npx shadcn@latest registry add "@moonlight=https://emonsaqibh.github.io/Moonlight-UI/r/{name}.json"
npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight.json --overwrite --yes   # see below for Radix projects
npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-layout.json --overwrite --yes   # Next.js only, and only if app/layout.tsx is still the default
```

   - **Radix project**: instead of the whole `moonlight.json` bundle, install the Moonlight components and blocks the task uses
     (`npx shadcn@latest add @moonlight/frame @moonlight/run-time-chart --overwrite --yes`; their dependencies come along). Use
     the bundle only when the user wants the whole app restyled.
   - `--overwrite` is **required** on Moonlight items. `shadcn init` already wrote a stock `button.tsx`; without the flag the CLI
     stops at "button.tsx already exists. Overwrite? (y/N)", which a non-interactive shell answers No, and it **silently installs
     almost nothing** (exit code 0). The theme also needs it, or the project's stock colors win. With the flag, a
     "Skipped N files (files might be identical…)" line is normal: those files already match.
   - **Next.js**: `moonlight-layout` replaces `app/layout.tsx` with Geist and Geist Mono (`--font-geist-sans`, `--font-geist-mono`), the theme init script and
     `TooltipProvider`. Use it when the layout is still the `shadcn init` / `create-next-app` default (Geist fonts,
     `ThemeProvider`), then delete `components/theme-provider.tsx` and the `next-themes` package if nothing else imports them. If
     the layout has real app code, wire it by hand instead — see **Root setup** below.
   - **Any other stack**: skip `moonlight-layout` (it is a Next.js file) and do **Root setup** below for your stack.
   - Without Geist the app renders in the system font and won't match.
5. **Fix call sites**: run `npx tsc --noEmit`. Errors in app code that uses a component Moonlight just replaced are Radix props
   (Base UI projects usually have none). Convert `asChild` to `render`:
   `<TooltipTrigger asChild><Button variant="outline">Open</Button></TooltipTrigger>` becomes
   `<TooltipTrigger render={<Button variant="outline" />}>Open</TooltipTrigger>`. When a `Button` renders a link, write
   `<Button nativeButton={false} render={<Link href="/x" />}>Docs</Button>`. Fix only those errors, in place; stock Radix
   components Moonlight didn't replace keep their `asChild`. For any other error, read the component's new source in
   `components/ui`.
6. **Verify**: the `installed` check from step 2 passes, `npx tsc --noEmit` and `npm run build` pass, and after the full bundle
   `ls components/ui | wc -l` shows 35+. Remove any leftover `body { font-family }` / `prefers-color-scheme` rules and any
   other font import (e.g. Inter) from the CSS; Geist stays.

### Converting a Radix project (only when the user asks)

For "convert/migrate the project to Base UI". Ask first if `components/ui` has uncommitted changes.

1. Set `"style": "base-nova"` in `components.json`.
2. Reinstall every existing stock component as its Base UI version. Filter to shadcn's own names: one unknown name makes the
   whole `add` fail (while still exiting 0):
   ```sh
   curl -sf https://ui.shadcn.com/r/index.json | grep -o '"name": *"[^"]*"' | cut -d'"' -f4 > /tmp/shadcn-names.txt
   ls components/ui/*.tsx | xargs -n1 basename | sed 's/\.tsx$//' | grep -Fx -f /tmp/shadcn-names.txt | xargs -r npx shadcn@latest add --overwrite --yes
   ```
   Files that are not stock shadcn (the user's own components, subfolders) are left alone; fix them in place if `tsc` flags
   them, don't delete them.
3. Install Moonlight (C.4, full bundle), then fix every `tsc` error as in C.5.
4. Once nothing imports `radix-ui` or `@radix-ui/*` any more, `npm uninstall` them (if one of the user's own files still does,
   keep the package and say so). `npx tsc --noEmit` and `npm run build` must pass. Tell the user the project was converted.

## Adding components

Look the name up in the catalog at the end of this guide (or `https://emonsaqibh.github.io/Moonlight-UI/r/llms.txt`):

- **In the catalog** (component or block) — install Moonlight's version, always with `--overwrite`, which replaces a stock copy:
  `npx shadcn@latest add @moonlight/<name> --overwrite --yes`. Several at once: `add @moonlight/badge @moonlight/tabs …`.
  Never plain `npx shadcn add <name>` for these: that installs the vanilla look. Then run `npx tsc --noEmit` and fix call sites
  of anything it replaced (Step 1 C.5).
- **Not in the catalog** (dialog, alert, alert-dialog, accordion, command, calendar, collapsible, pagination, radio-group,
  slider, sonner, …) — install the stock version (Base UI, or Radix in a Radix project), answering **No** to every overwrite prompt:
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
6. **Moonlight components are Base UI**: composition uses the `render` prop, not `asChild` (stock Radix components left in a
   Radix project keep `asChild`) —
   `<SidebarMenuButton render={<Link href="/x" />}>`, `<TooltipTrigger render={<Button />}>`. `Link` is the project's own
   router link (`next/link`, or `<Link to="/x" />` from React Router / TanStack Router); a plain `<a href>` without a router.
7. **Tables**: `Table` for lists (see the `jobs-table` block), `DataGrid` (TanStack) when you need sorting/filtering/pagination.
8. **Density**: text is 13–14px, controls are `h-8`, radius `0.625rem`. Keep pages compact; don't scale things up.
9. **Dark mode** is the `.dark` class on `<html>` (the theme toggle + init script handle it). Never hard-code light colors.
   Don't add `next-themes`; Moonlight's `moonlight-theme-toggle` owns the theme.
10. Read the installed source in `components/ui/*` for props/variants — JSDoc at the top of each file documents the intent.

## Root setup (font, theme script, tooltip provider)

Every stack needs the same three things at its root: the Geist fonts (sans and mono), the theme init script in `<head>` (no light flash in dark
mode) and `TooltipProvider` around the app. Remove any other font (Inter, a system stack) and any `ThemeProvider` /
`theme-provider.tsx` / `next-themes`; Moonlight's theme toggle owns dark mode.

**Next.js** — what `moonlight-layout` installs; merge it into a custom `app/layout.tsx`:

```tsx
// app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { themeInitScript } from "@/components/app/theme"
import { TooltipProvider } from "@/components/ui/tooltip"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body><TooltipProvider>{children}</TooltipProvider></body>
    </html>
  )
}
```

**Any other stack** (Vite, TanStack Start, React Router, Astro, Laravel): `npm i @fontsource-variable/geist @fontsource-variable/geist-mono`
and import both once in the app entry (e.g. `src/main.tsx`); the theme's font stacks pick up "Geist Variable" and "Geist Mono
Variable" when `--font-geist-sans` / `--font-geist-mono` aren't set. Put the theme init script inline in the HTML `<head>` (`index.html`, the root route's head, the
Astro layout or the Blade layout): copy the string value of `themeInitScript` from `components/app/theme.tsx` into
`<script>…</script>`. Wrap the app's root component in `<TooltipProvider>`. For Vite:

```tsx
// src/main.tsx
import "@fontsource-variable/geist"
import "@fontsource-variable/geist-mono"
import "./index.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { TooltipProvider } from "@/components/ui/tooltip"
import App from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode><TooltipProvider><App /></TooltipProvider></StrictMode>,
)
```

## App shell (sidebar + header + body)

`moonlight-app-sidebar` is a **template** written for Next.js (`next/link`, `usePathname`). On another stack, install it and
swap those two for the project's router (`Link` + `useLocation().pathname` in React Router, `Link` + `useRouterState` in TanStack
Router). Edit the `nav` array, the `EDIT:` workspace name and the footer links in
`components/app/app-sidebar.tsx` to the project's own routes, and drop icon imports you no longer use. `moonlight-page-header` (breadcrumbs + sidebar trigger + theme
toggle) and `moonlight-page-body` complete the shell. In an app that already has pages, put the shell layout on the route
group of the pages that should get it; don't move existing pages into it unless the user asks. The example below uses Next.js
route files; on other stacks put the same JSX in the router's layout route.

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
Use the Moonlight design system for all UI. Read https://emonsaqibh.github.io/Moonlight-UI/r/llms.txt and follow its setup steps before any UI work.
Moonlight is installed with the shadcn CLI, never recreated by hand:
- Moonlight items: `npx shadcn@latest add @moonlight/<name> --overwrite --yes`
- Stock items Moonlight lacks: `yes n | npx shadcn@latest add <name> --yes` (never --overwrite)
```

## Updating

Re-run `npx shadcn@latest add @moonlight/<name> --overwrite --yes` to pull a newer version of a component
(this overwrites local edits to that file — check first with `--diff`).
