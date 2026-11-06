---
name: moonlight
description: Use whenever the user mentions Moonlight or Moonlight UI, and whenever you build or change UI in a React/Next.js/Tailwind project — ALWAYS when shadcn/ui is involved (npx shadcn add, components.json), and for pages, dashboards, forms, tables, charts, layouts or a new project. Moonlight is our design system: shadcn/ui on Base UI restyled, installed with the shadcn CLI from the Moonlight registry. Install it with the CLI; never recreate its components or look by hand.
---

# Moonlight UI — how to build UI in any project

Moonlight is our design system: shadcn/ui on **Base UI** (style `base-nova`) + Tailwind v4, with a custom neutral look
plus extras (Frame, IconTile, DataGrid, Tree) and finished
dashboard blocks (charts, stat cards, tables, boards).
Everything is installed **with the shadcn CLI** from the Moonlight registry as source files in the project.

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

Run these checks from the project root and take the first branch that matches.

**A. No project yet** — one command creates a Next.js app with shadcn, the theme, every component, the root layout (Inter + theme
script), a sample page and an `AGENTS.md` with these rules:

```bash
npx shadcn@latest init -d -n my-app https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-starter.json
```

**B. Next.js project without `components.json`** (shadcn not set up yet): check Tailwind (C.1), run
`npx shadcn@latest init -d -b base` (Base UI, neutral), then continue with C.

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
npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-layout.json --overwrite --yes   # only if app/layout.tsx is still the default
```

   - **Radix project**: instead of the whole `moonlight.json` bundle, install the Moonlight components and blocks the task uses
     (`npx shadcn@latest add @moonlight/frame @moonlight/run-time-chart --overwrite --yes`; their dependencies come along). Use
     the bundle only when the user wants the whole app restyled.
   - `--overwrite` is **required** on Moonlight items. `shadcn init` already wrote a stock `button.tsx`; without the flag the CLI
     stops at "button.tsx already exists. Overwrite? (y/N)", which a non-interactive shell answers No, and it **silently installs
     almost nothing** (exit code 0). The theme also needs it, or the project's stock colors win. With the flag, a
     "Skipped N files (files might be identical…)" line is normal: those files already match.
   - `moonlight-layout` replaces `app/layout.tsx` with Inter (`--font-inter`), the theme init script and `TooltipProvider`. Use it
     when the layout is still the `shadcn init` / `create-next-app` default (Geist fonts, `ThemeProvider`), then delete
     `components/theme-provider.tsx` and the `next-themes` package if nothing else imports them. If the layout has real app code, wire it by hand instead —
     see **Root layout** below. Without Inter the app renders in the system font and won't match.
5. **Fix call sites**: run `npx tsc --noEmit`. Errors in app code that uses a component Moonlight just replaced are Radix props
   (Base UI projects usually have none). Convert `asChild` to `render`:
   `<TooltipTrigger asChild><Button variant="outline">Open</Button></TooltipTrigger>` becomes
   `<TooltipTrigger render={<Button variant="outline" />}>Open</TooltipTrigger>`. When a `Button` renders a link, write
   `<Button nativeButton={false} render={<Link href="/x" />}>Docs</Button>`. Fix only those errors, in place; stock Radix
   components Moonlight didn't replace keep their `asChild`. For any other error, read the component's new source in
   `components/ui`.
6. **Verify**: the `installed` check from step 2 passes, `npx tsc --noEmit` and `npm run build` pass, and after the full bundle
   `ls components/ui | wc -l` shows 35+. Remove any leftover `body { font-family }` / `prefers-color-scheme` rules from
   `globals.css`.

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
Use the Moonlight design system for all UI. Read https://emonsaqibh.github.io/Moonlight-UI/r/llms.txt and follow its setup steps before any UI work.
Moonlight is installed with the shadcn CLI, never recreated by hand:
- Moonlight items: `npx shadcn@latest add @moonlight/<name> --overwrite --yes`
- Stock items Moonlight lacks: `yes n | npx shadcn@latest add <name> --yes` (never --overwrite)
```

## Updating

Re-run `npx shadcn@latest add @moonlight/<name> --overwrite --yes` to pull a newer version of a component
(this overwrites local edits to that file — check first with `--diff`).


# Component catalog

## UI components (registry:ui)

- **avatar** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/avatar.json --overwrite --yes`
  - exports: Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage
- **badge** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/badge.json --overwrite --yes`
  - exports: Badge
  - variant: default | outline | secondary | info | success | warning | destructive | focus | invert | primary-light | warning-light | success-light | info-light | destructive-light | invert-light | focus-light | primary-outline | warning-outline | success-outline | info-outline | destructive-outline | invert-outline | focus-outline
  - size: xs | sm | default | lg | xl
  - radius: default | full
- **breadcrumb** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/breadcrumb.json --overwrite --yes`
  - exports: Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
- **button** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/button.json --overwrite --yes`
  - exports: Button
  - variant: default | outline | secondary | ghost | muted | destructive | link
  - size: default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg
- **card** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/card.json --overwrite --yes`
  - exports: Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
- **chart** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/chart.json --overwrite --yes`
  - exports: ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent
- **checkbox** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/checkbox.json --overwrite --yes`
  - exports: Checkbox
- **dropdown-menu** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/dropdown-menu.json --overwrite --yes`
  - exports: DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
- **field** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/field.json --overwrite --yes`
  - exports: Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle
  - also installs: label, separator
- **frame** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/frame.json --overwrite --yes`
  - exports: Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle
  - variant: default | inverse | ghost
  - spacing: xs | sm | default | lg
- **hover-card** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/hover-card.json --overwrite --yes`
  - exports: HoverCard, HoverCardContent, HoverCardTrigger
- **icon-tile** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/icon-tile.json --overwrite --yes`
  - exports: IconTile
  - variant: outline | elevated | soft | solid | frame
  - size: xs | sm | default | lg | xl
  - radius: default | full
- **input-group** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/input-group.json --overwrite --yes`
  - exports: InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea
  - size: xs | sm | icon-xs | icon-sm
  - also installs: button, input, textarea
- **input** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/input.json --overwrite --yes`
  - exports: Input
- **item** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/item.json --overwrite --yes`
  - exports: Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle
  - variant: default | outline | muted
  - size: default | sm | xs
  - variant: default | icon | image
  - also installs: separator
- **kbd** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/kbd.json --overwrite --yes`
  - exports: Kbd, KbdGroup
- **label** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/label.json --overwrite --yes`
  - exports: Label
- **popover** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/popover.json --overwrite --yes`
  - exports: Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger
- **progress** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/progress.json --overwrite --yes`
  - exports: Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue
- **scroll-area** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/scroll-area.json --overwrite --yes`
  - exports: ScrollArea, ScrollBar
- **select** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/select.json --overwrite --yes`
  - exports: Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue
- **separator** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/separator.json --overwrite --yes`
  - exports: Separator
- **sheet** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/sheet.json --overwrite --yes`
  - exports: Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger
  - also installs: button
- **sidebar** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/sidebar.json --overwrite --yes`
  - exports: Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger
  - variant: default | outline
  - size: default | sm | lg
  - also installs: button, input, separator, sheet, skeleton, tooltip, use-mobile
- **skeleton** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/skeleton.json --overwrite --yes`
  - exports: Skeleton
- **spinner** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/spinner.json --overwrite --yes`
  - exports: Spinner
- **switch** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/switch.json --overwrite --yes`
  - exports: Switch
- **table** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/table.json --overwrite --yes`
  - exports: Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow
- **tabs** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/tabs.json --overwrite --yes`
  - exports: Tabs, TabsContent, TabsList, TabsTrigger
  - variant: default | line
- **textarea** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/textarea.json --overwrite --yes`
  - exports: Textarea
- **toggle-group** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/toggle-group.json --overwrite --yes`
  - exports: ToggleGroup, ToggleGroupItem
  - also installs: toggle
- **toggle** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/toggle.json --overwrite --yes`
  - exports: Toggle
  - variant: default | outline
  - size: default | sm | lg
- **tooltip** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/tooltip.json --overwrite --yes`
  - exports: Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
- **tree** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/tree.json --overwrite --yes`
  - exports: Tree, TreeDragLine, TreeItem, TreeItemLabel
- **data-grid** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/data-grid.json --overwrite --yes`
  - exports: DataGrid, DataGridCellSelection, DataGridColumnFilter, DataGridColumnHeader, DataGridColumnVisibility, DataGridContainer, DataGridPagination, DataGridProvider, DataGridScrollArea, DataGridSelectionBar, DataGridTable, DataGridTableAddRow, DataGridTableBase, DataGridTableBody, DataGridTableBodyRow, DataGridTableBodyRowCell, DataGridTableBodyRowExpandded, DataGridTableBodyRowSkeleton, DataGridTableBodyRowSkeletonCell, DataGridTableDnd, DataGridTableDndRowHandle, DataGridTableDndRows, DataGridTableEmpty, DataGridTableFillBodyCell, DataGridTableFillHeadCell, DataGridTableFoot, DataGridTableFootRow, DataGridTableFootRowCell, DataGridTableHead, DataGridTableHeadRow, DataGridTableHeadRowCell, DataGridTableHeadRowCellResize, DataGridTableHeader, DataGridTableLoader, DataGridTableRenderedRow, DataGridTableRowExpand, DataGridTableRowPin, DataGridTableRowSelect, DataGridTableRowSelectAll, DataGridTableRowSpacer, DataGridTableViewport, DataGridTableVirtual
  - also installs: badge, button, checkbox, dropdown-menu, input, popover, select, separator, skeleton, spinner

## App shell pieces (templates)

- **moonlight-theme-toggle** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-theme-toggle.json --overwrite --yes`
  - exports: ThemeToggle
  - also installs: button
- **moonlight-page-header** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-page-header.json --overwrite --yes`
  - exports: PageHeader
  - also installs: breadcrumb, moonlight-theme-toggle, separator, sidebar
- **moonlight-page-body** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-page-body.json --overwrite --yes`
  - exports: PageBody
  - also installs: utils
- **moonlight-range-toggle** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-range-toggle.json --overwrite --yes`
  - exports: RangeToggle
  - also installs: toggle-group
- **moonlight-run-strip** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-run-strip.json --overwrite --yes`
  - exports: RunStrip
  - also installs: utils
- **moonlight-app-sidebar** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-app-sidebar.json --overwrite --yes`
  - exports: AppSidebar
  - also installs: avatar, icon-tile, kbd, sidebar

## Blocks: finished dashboard sections and charts (registry:block, installed with their demo data)

- **run-time-chart** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/run-time-chart.json --overwrite --yes`
  - exports: RunTimeChart
  - also installs: chart, data-jobs, frame
  - Stacked bar chart in a Frame: legend totals row, ChartContainer, footer stats.
- **stat-cards** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/stat-cards.json --overwrite --yes`
  - exports: StatCards
  - also installs: badge, data-jobs, frame, icon-tile, moonlight-run-strip, progress, utils
  - KPI stat card row with deltas and run strips.
- **jobs-table** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/jobs-table.json --overwrite --yes`
  - exports: JobsTable
  - also installs: avatar, badge, button, checkbox, data-jobs, frame, input-group, moonlight-run-strip, switch, table, tabs
  - Jobs table with status badges, run strips and row actions.
- **up-next** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/up-next.json --overwrite --yes`
  - exports: UpNext
  - also installs: badge, data-jobs, frame, icon-tile, item
  - Upcoming-items list panel (Item + IconTile).
- **event-volume** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/event-volume.json --overwrite --yes`
  - exports: EventVolume
  - also installs: chart, data-logs, frame
  - Stacked bar chart of event volume by level, with Y axis.
- **events-table** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/events-table.json --overwrite --yes`
  - exports: EventsTable
  - also installs: avatar, badge, button, data-logs, frame, table
  - Log events table with level badges.
- **warnings-panel** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/warnings-panel.json --overwrite --yes`
  - exports: WarningsPanel
  - also installs: avatar, button, data-logs, frame, item
  - Grouped warnings list panel.
- **check-history** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/check-history.json --overwrite --yes`
  - exports: CheckHistory
  - also installs: badge, button, data-monitors, frame, icon-tile, item, utils
  - Uptime check history: per-region status bars.
- **checkout-flow** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/checkout-flow.json --overwrite --yes`
  - exports: CheckoutFlow
  - also installs: badge, button, chart, data-monitors, frame
  - Synthetic-check step timings as a horizontal bar chart.
- **deploy-history** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/deploy-history.json --overwrite --yes`
  - exports: DeployHistory
  - also installs: avatar, badge, button, data-releases, frame, input-group, table, tabs, utils
  - Deploy history table with environment and status badges.
- **environments** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/environments.json --overwrite --yes`
  - exports: Environments
  - also installs: avatar, badge, button, data-releases, frame, select, utils
  - Environment cards with current version and health.
- **deploy-board** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/deploy-board.json --overwrite --yes`
  - exports: DeployBoard
  - also installs: badge, button, data-deploy, frame, input-group, table, tabs
  - Kanban-style deploy board (columns of cards).
- **week-view** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/week-view.json --overwrite --yes`
  - exports: WeekView
  - also installs: badge, button, data-calendar, utils
  - Calendar week view with on-call/event blocks.
- **services-view** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/services-view.json --overwrite --yes`
  - exports: ServicesView
  - also installs: avatar, badge, button, data-services, frame, input-group, select, table, tabs, toggle-group, utils
  - Services list with filters, health badges and sparklines.
- **settings-view** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/settings-view.json --overwrite --yes`
  - exports: SettingsView
  - also installs: badge, frame, moonlight-theme-toggle, select, switch, utils
  - Settings page: line tabs, Field groups, switches, selects.
- **all-sources** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/all-sources.json --overwrite --yes`
  - exports: AllSources
  - also installs: avatar, badge, button, data-sources, frame, input-group, table, utils
  - Sources table with sync status.
- **sources-overview** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/sources-overview.json --overwrite --yes`
  - exports: SourcesOverview
  - also installs: badge, button, chart, data-sources, frame, icon-tile, item, toggle-group, utils
  - Sources overview: sparkline stat tiles, bar chart, attention list.

## Demo data used by the blocks

- **data-calendar** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/data-calendar.json --overwrite --yes`
- **data-deploy** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/data-deploy.json --overwrite --yes`
- **data-jobs** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/data-jobs.json --overwrite --yes`
- **data-logs** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/data-logs.json --overwrite --yes`
- **data-monitors** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/data-monitors.json --overwrite --yes`
- **data-releases** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/data-releases.json --overwrite --yes`
- **data-services** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/data-services.json --overwrite --yes`
- **data-sources** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/data-sources.json --overwrite --yes`

## Core

- **utils** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/utils.json --overwrite --yes`
- **use-mobile** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/use-mobile.json --overwrite --yes`

## Starter files (new projects only; replace app/layout.tsx and app/page.tsx)

- **moonlight-layout** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-layout.json --overwrite --yes`
  - exports: RootLayout
  - also installs: moonlight-theme-toggle, tooltip
- **moonlight-home** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-home.json --overwrite --yes`
  - exports: Page
  - also installs: badge, button, frame, icon-tile, moonlight-app-sidebar, moonlight-page-body, moonlight-page-header, sidebar, table
- **moonlight-agents** — `npx shadcn@latest add https://emonsaqibh.github.io/Moonlight-UI/r/moonlight-agents.json --overwrite --yes`
  - exports: Layout, Page, RootLayout
