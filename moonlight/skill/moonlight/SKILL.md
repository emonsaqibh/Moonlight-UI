---
name: moonlight
description: Use whenever the user mentions Moonlight or Moonlight UI, and whenever you build or change UI in a React/Next.js/Tailwind project — ALWAYS when shadcn/ui is involved (npx shadcn add, components.json), and for pages, dashboards, forms, tables, charts, layouts or a new project. Moonlight is our design system: shadcn/ui on Base UI restyled, installed with the shadcn CLI from the Moonlight registry. Install it with the CLI; never recreate its components or look by hand.
---

# Moonlight UI — how to build UI in any project

Moonlight is our design system: shadcn/ui on **Base UI** (style `base-nova`) + Tailwind v4, with a custom neutral look
(visual style derived from the Strata observability app) plus ReUI extras (Frame, IconTile, DataGrid, Tree) and finished
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

It must print `/Users/fringecore/Documents/Development-Projects/dashtemplate`. Nothing printed: it is served from this machine. Start it in the background with `npm --prefix "/Users/fringecore/Documents/Development-Projects/dashtemplate" run registry:serve`, wait a second and re-check. "Address already in use" means another (stale) copy of Moonlight holds port 4111: stop and tell the user to stop that process. If the re-check still fails, stop and tell the user. Anything else: a different (stale) copy of Moonlight is being
served on that port. Stop and tell the user; do not install from it.

## Step 1 — make sure the project has Moonlight

Run these checks from the project root and take the first branch that matches.

**A. No project yet** — one command creates a Next.js app with shadcn, the theme, every component, the root layout (Inter + theme
script), a sample page and an `AGENTS.md` with these rules:

```bash
npx shadcn@latest init -d -n my-app http://localhost:4111/r/moonlight-starter.json
```

**B. Next.js project without `components.json`** (shadcn not set up yet): run `npx shadcn@latest init -d -b base` first (Base UI,
neutral), then continue with C.

**C. `components.json` exists.**

1. `"style"` must start with `base-` (e.g. `base-nova`). If it is `new-york`, `default` or `radix-*`, the project uses Radix:
   stop and ask the user before converting (Moonlight is Base UI; mixing the two breaks composition).
2. Already set up? `grep -q '"@moonlight"' components.json && grep -q 'muted:' components/ui/button.tsx && echo installed`.
   If it prints `installed`, skip to **Adding components**.
3. Otherwise install Moonlight — all four commands, in order:

```bash
npx shadcn@latest registry add "@moonlight=http://localhost:4111/r/{name}.json"
npx shadcn@latest add http://localhost:4111/r/moonlight-theme.json --overwrite --yes
npx shadcn@latest add http://localhost:4111/r/moonlight.json --overwrite --yes
npx shadcn@latest add http://localhost:4111/r/moonlight-layout.json --overwrite --yes   # only if app/layout.tsx is still the default
```

   - `--overwrite` is **required** on Moonlight items. `shadcn init` already wrote a stock `button.tsx`; without the flag the CLI
     stops at "button.tsx already exists. Overwrite? (y/N)", which a non-interactive shell answers No, and it **silently installs
     almost nothing** (exit code 0). The theme also needs it, or the project's stock colors win.
   - `moonlight-layout` replaces `app/layout.tsx` with Inter (`--font-inter`), the theme init script and `TooltipProvider`. Use it
     when the layout is still the `shadcn init` / `create-next-app` default (Geist fonts, `ThemeProvider`), then delete
     `components/theme-provider.tsx` if nothing else imports it. If the layout has real app code, wire it by hand instead —
     see **Root layout** below. Without Inter the app renders in the system font and won't match.
4. Verify: `ls components/ui | wc -l` shows 35+, and the `installed` check from step 2 passes. Remove any leftover
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

`moonlight-app-sidebar` is a **template**: edit the `nav` array (and the `EDIT:` workspace name) in
`components/app/app-sidebar.tsx` to the project's own routes. `moonlight-page-header` (breadcrumbs + sidebar trigger + theme
toggle) and `moonlight-page-body` complete the shell.

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


# Component catalog

## UI components (registry:ui)

- **avatar** — `npx shadcn@latest add http://localhost:4111/r/avatar.json --overwrite --yes`
  - exports: Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage
- **badge** — `npx shadcn@latest add http://localhost:4111/r/badge.json --overwrite --yes`
  - exports: Badge
  - variant: default | outline | secondary | info | success | warning | destructive | focus | invert | primary-light | warning-light | success-light | info-light | destructive-light | invert-light | focus-light | primary-outline | warning-outline | success-outline | info-outline | destructive-outline | invert-outline | focus-outline
  - size: xs | sm | default | lg | xl
  - radius: default | full
- **breadcrumb** — `npx shadcn@latest add http://localhost:4111/r/breadcrumb.json --overwrite --yes`
  - exports: Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
- **button** — `npx shadcn@latest add http://localhost:4111/r/button.json --overwrite --yes`
  - exports: Button
  - variant: default | outline | secondary | ghost | muted | destructive | link
  - size: default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg
- **card** — `npx shadcn@latest add http://localhost:4111/r/card.json --overwrite --yes`
  - exports: Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
- **chart** — `npx shadcn@latest add http://localhost:4111/r/chart.json --overwrite --yes`
  - exports: ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent
- **checkbox** — `npx shadcn@latest add http://localhost:4111/r/checkbox.json --overwrite --yes`
  - exports: Checkbox
- **dropdown-menu** — `npx shadcn@latest add http://localhost:4111/r/dropdown-menu.json --overwrite --yes`
  - exports: DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
- **field** — `npx shadcn@latest add http://localhost:4111/r/field.json --overwrite --yes`
  - exports: Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle
  - also installs: label, separator
- **frame** — `npx shadcn@latest add http://localhost:4111/r/frame.json --overwrite --yes`
  - exports: Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle
  - variant: default | inverse | ghost
  - spacing: xs | sm | default | lg
- **hover-card** — `npx shadcn@latest add http://localhost:4111/r/hover-card.json --overwrite --yes`
  - exports: HoverCard, HoverCardContent, HoverCardTrigger
- **icon-tile** — `npx shadcn@latest add http://localhost:4111/r/icon-tile.json --overwrite --yes`
  - exports: IconTile
  - variant: outline | elevated | soft | solid | frame
  - size: xs | sm | default | lg | xl
  - radius: default | full
- **input-group** — `npx shadcn@latest add http://localhost:4111/r/input-group.json --overwrite --yes`
  - exports: InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea
  - size: xs | sm | icon-xs | icon-sm
  - also installs: button, input, textarea
- **input** — `npx shadcn@latest add http://localhost:4111/r/input.json --overwrite --yes`
  - exports: Input
- **item** — `npx shadcn@latest add http://localhost:4111/r/item.json --overwrite --yes`
  - exports: Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle
  - variant: default | outline | muted
  - size: default | sm | xs
  - variant: default | icon | image
  - also installs: separator
- **kbd** — `npx shadcn@latest add http://localhost:4111/r/kbd.json --overwrite --yes`
  - exports: Kbd, KbdGroup
- **label** — `npx shadcn@latest add http://localhost:4111/r/label.json --overwrite --yes`
  - exports: Label
- **popover** — `npx shadcn@latest add http://localhost:4111/r/popover.json --overwrite --yes`
  - exports: Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger
- **progress** — `npx shadcn@latest add http://localhost:4111/r/progress.json --overwrite --yes`
  - exports: Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue
- **scroll-area** — `npx shadcn@latest add http://localhost:4111/r/scroll-area.json --overwrite --yes`
  - exports: ScrollArea, ScrollBar
- **select** — `npx shadcn@latest add http://localhost:4111/r/select.json --overwrite --yes`
  - exports: Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue
- **separator** — `npx shadcn@latest add http://localhost:4111/r/separator.json --overwrite --yes`
  - exports: Separator
- **sheet** — `npx shadcn@latest add http://localhost:4111/r/sheet.json --overwrite --yes`
  - exports: Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger
  - also installs: button
- **sidebar** — `npx shadcn@latest add http://localhost:4111/r/sidebar.json --overwrite --yes`
  - exports: Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger
  - variant: default | outline
  - size: default | sm | lg
  - also installs: button, input, separator, sheet, skeleton, tooltip, use-mobile
- **skeleton** — `npx shadcn@latest add http://localhost:4111/r/skeleton.json --overwrite --yes`
  - exports: Skeleton
- **spinner** — `npx shadcn@latest add http://localhost:4111/r/spinner.json --overwrite --yes`
  - exports: Spinner
- **switch** — `npx shadcn@latest add http://localhost:4111/r/switch.json --overwrite --yes`
  - exports: Switch
- **table** — `npx shadcn@latest add http://localhost:4111/r/table.json --overwrite --yes`
  - exports: Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow
- **tabs** — `npx shadcn@latest add http://localhost:4111/r/tabs.json --overwrite --yes`
  - exports: Tabs, TabsContent, TabsList, TabsTrigger
  - variant: default | line
- **textarea** — `npx shadcn@latest add http://localhost:4111/r/textarea.json --overwrite --yes`
  - exports: Textarea
- **toggle-group** — `npx shadcn@latest add http://localhost:4111/r/toggle-group.json --overwrite --yes`
  - exports: ToggleGroup, ToggleGroupItem
  - also installs: toggle
- **toggle** — `npx shadcn@latest add http://localhost:4111/r/toggle.json --overwrite --yes`
  - exports: Toggle
  - variant: default | outline
  - size: default | sm | lg
- **tooltip** — `npx shadcn@latest add http://localhost:4111/r/tooltip.json --overwrite --yes`
  - exports: Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
- **tree** — `npx shadcn@latest add http://localhost:4111/r/tree.json --overwrite --yes`
  - exports: Tree, TreeDragLine, TreeItem, TreeItemLabel
- **data-grid** — `npx shadcn@latest add http://localhost:4111/r/data-grid.json --overwrite --yes`
  - exports: DataGrid, DataGridCellSelection, DataGridColumnFilter, DataGridColumnHeader, DataGridColumnVisibility, DataGridContainer, DataGridPagination, DataGridProvider, DataGridScrollArea, DataGridSelectionBar, DataGridTable, DataGridTableAddRow, DataGridTableBase, DataGridTableBody, DataGridTableBodyRow, DataGridTableBodyRowCell, DataGridTableBodyRowExpandded, DataGridTableBodyRowSkeleton, DataGridTableBodyRowSkeletonCell, DataGridTableDnd, DataGridTableDndRowHandle, DataGridTableDndRows, DataGridTableEmpty, DataGridTableFillBodyCell, DataGridTableFillHeadCell, DataGridTableFoot, DataGridTableFootRow, DataGridTableFootRowCell, DataGridTableHead, DataGridTableHeadRow, DataGridTableHeadRowCell, DataGridTableHeadRowCellResize, DataGridTableHeader, DataGridTableLoader, DataGridTableRenderedRow, DataGridTableRowExpand, DataGridTableRowPin, DataGridTableRowSelect, DataGridTableRowSelectAll, DataGridTableRowSpacer, DataGridTableViewport, DataGridTableVirtual
  - also installs: badge, button, checkbox, dropdown-menu, input, popover, select, separator, skeleton, spinner

## App shell pieces (templates)

- **moonlight-theme-toggle** — `npx shadcn@latest add http://localhost:4111/r/moonlight-theme-toggle.json --overwrite --yes`
  - exports: ThemeToggle
  - also installs: button
- **moonlight-page-header** — `npx shadcn@latest add http://localhost:4111/r/moonlight-page-header.json --overwrite --yes`
  - exports: PageHeader
  - also installs: breadcrumb, moonlight-theme-toggle, separator, sidebar
- **moonlight-page-body** — `npx shadcn@latest add http://localhost:4111/r/moonlight-page-body.json --overwrite --yes`
  - exports: PageBody
  - also installs: utils
- **moonlight-range-toggle** — `npx shadcn@latest add http://localhost:4111/r/moonlight-range-toggle.json --overwrite --yes`
  - exports: RangeToggle
  - also installs: toggle-group
- **moonlight-run-strip** — `npx shadcn@latest add http://localhost:4111/r/moonlight-run-strip.json --overwrite --yes`
  - exports: RunStrip
  - also installs: utils
- **moonlight-app-sidebar** — `npx shadcn@latest add http://localhost:4111/r/moonlight-app-sidebar.json --overwrite --yes`
  - exports: AppSidebar
  - also installs: avatar, icon-tile, kbd, sidebar

## Blocks: finished dashboard sections and charts (registry:block, installed with their demo data)

- **run-time-chart** — `npx shadcn@latest add http://localhost:4111/r/run-time-chart.json --overwrite --yes`
  - exports: RunTimeChart
  - also installs: chart, data-jobs, frame
  - Stacked bar chart in a Frame: legend totals row, ChartContainer, footer stats.
- **stat-cards** — `npx shadcn@latest add http://localhost:4111/r/stat-cards.json --overwrite --yes`
  - exports: StatCards
  - also installs: badge, data-jobs, frame, icon-tile, moonlight-run-strip, progress, utils
  - KPI stat card row with deltas and run strips.
- **jobs-table** — `npx shadcn@latest add http://localhost:4111/r/jobs-table.json --overwrite --yes`
  - exports: JobsTable
  - also installs: avatar, badge, button, checkbox, data-jobs, frame, input-group, moonlight-run-strip, switch, table, tabs
  - Jobs table with status badges, run strips and row actions.
- **up-next** — `npx shadcn@latest add http://localhost:4111/r/up-next.json --overwrite --yes`
  - exports: UpNext
  - also installs: badge, data-jobs, frame, icon-tile, item
  - Upcoming-items list panel (Item + IconTile).
- **event-volume** — `npx shadcn@latest add http://localhost:4111/r/event-volume.json --overwrite --yes`
  - exports: EventVolume
  - also installs: chart, data-logs, frame
  - Stacked bar chart of event volume by level, with Y axis.
- **events-table** — `npx shadcn@latest add http://localhost:4111/r/events-table.json --overwrite --yes`
  - exports: EventsTable
  - also installs: avatar, badge, button, data-logs, frame, table
  - Log events table with level badges.
- **warnings-panel** — `npx shadcn@latest add http://localhost:4111/r/warnings-panel.json --overwrite --yes`
  - exports: WarningsPanel
  - also installs: avatar, button, data-logs, frame, item
  - Grouped warnings list panel.
- **check-history** — `npx shadcn@latest add http://localhost:4111/r/check-history.json --overwrite --yes`
  - exports: CheckHistory
  - also installs: badge, button, data-monitors, frame, icon-tile, item, utils
  - Uptime check history: per-region status bars.
- **checkout-flow** — `npx shadcn@latest add http://localhost:4111/r/checkout-flow.json --overwrite --yes`
  - exports: CheckoutFlow
  - also installs: badge, button, chart, data-monitors, frame
  - Synthetic-check step timings as a horizontal bar chart.
- **deploy-history** — `npx shadcn@latest add http://localhost:4111/r/deploy-history.json --overwrite --yes`
  - exports: DeployHistory
  - also installs: avatar, badge, button, data-releases, frame, input-group, table, tabs, utils
  - Deploy history table with environment and status badges.
- **environments** — `npx shadcn@latest add http://localhost:4111/r/environments.json --overwrite --yes`
  - exports: Environments
  - also installs: avatar, badge, button, data-releases, frame, select, utils
  - Environment cards with current version and health.
- **deploy-board** — `npx shadcn@latest add http://localhost:4111/r/deploy-board.json --overwrite --yes`
  - exports: DeployBoard
  - also installs: badge, button, data-deploy, frame, input-group, table, tabs
  - Kanban-style deploy board (columns of cards).
- **week-view** — `npx shadcn@latest add http://localhost:4111/r/week-view.json --overwrite --yes`
  - exports: WeekView
  - also installs: badge, button, data-calendar, utils
  - Calendar week view with on-call/event blocks.
- **services-view** — `npx shadcn@latest add http://localhost:4111/r/services-view.json --overwrite --yes`
  - exports: ServicesView
  - also installs: avatar, badge, button, data-services, frame, input-group, select, table, tabs, toggle-group, utils
  - Services list with filters, health badges and sparklines.
- **settings-view** — `npx shadcn@latest add http://localhost:4111/r/settings-view.json --overwrite --yes`
  - exports: SettingsView
  - also installs: badge, frame, moonlight-theme-toggle, select, switch, utils
  - Settings page: line tabs, Field groups, switches, selects.
- **all-sources** — `npx shadcn@latest add http://localhost:4111/r/all-sources.json --overwrite --yes`
  - exports: AllSources
  - also installs: avatar, badge, button, data-sources, frame, input-group, table, utils
  - Sources table with sync status.
- **sources-overview** — `npx shadcn@latest add http://localhost:4111/r/sources-overview.json --overwrite --yes`
  - exports: SourcesOverview
  - also installs: badge, button, chart, data-sources, frame, icon-tile, item, toggle-group, utils
  - Sources overview: sparkline stat tiles, bar chart, attention list.

## Demo data used by the blocks

- **data-calendar** — `npx shadcn@latest add http://localhost:4111/r/data-calendar.json --overwrite --yes`
- **data-deploy** — `npx shadcn@latest add http://localhost:4111/r/data-deploy.json --overwrite --yes`
- **data-jobs** — `npx shadcn@latest add http://localhost:4111/r/data-jobs.json --overwrite --yes`
- **data-logs** — `npx shadcn@latest add http://localhost:4111/r/data-logs.json --overwrite --yes`
- **data-monitors** — `npx shadcn@latest add http://localhost:4111/r/data-monitors.json --overwrite --yes`
- **data-releases** — `npx shadcn@latest add http://localhost:4111/r/data-releases.json --overwrite --yes`
- **data-services** — `npx shadcn@latest add http://localhost:4111/r/data-services.json --overwrite --yes`
- **data-sources** — `npx shadcn@latest add http://localhost:4111/r/data-sources.json --overwrite --yes`

## Core

- **utils** — `npx shadcn@latest add http://localhost:4111/r/utils.json --overwrite --yes`
- **use-mobile** — `npx shadcn@latest add http://localhost:4111/r/use-mobile.json --overwrite --yes`

## Starter files (new projects only; replace app/layout.tsx and app/page.tsx)

- **moonlight-layout** — `npx shadcn@latest add http://localhost:4111/r/moonlight-layout.json --overwrite --yes`
  - exports: RootLayout
  - also installs: moonlight-theme-toggle, tooltip
- **moonlight-home** — `npx shadcn@latest add http://localhost:4111/r/moonlight-home.json --overwrite --yes`
  - exports: Page
  - also installs: badge, button, frame, icon-tile, moonlight-app-sidebar, moonlight-page-body, moonlight-page-header, sidebar, table
- **moonlight-agents** — `npx shadcn@latest add http://localhost:4111/r/moonlight-agents.json --overwrite --yes`
  - exports: Layout, Page, RootLayout
