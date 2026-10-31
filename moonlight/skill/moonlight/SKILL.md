---
name: moonlight
description: Use whenever you create or change any user interface — pages, dashboards, forms, tables, charts, layouts, components — in a React/Next.js/Tailwind project. Moonlight is our default design system (a restyled shadcn/ui on Base UI) installed from a shadcn registry; use it instead of stock shadcn or hand-rolled primitives.
---

# Moonlight UI — how to build UI in any project

Moonlight is our design system: shadcn/ui on **Base UI** (style `base-nova`) + Tailwind v4, with a custom neutral look
(visual style derived from the Strata observability app) plus ReUI extras (Frame, IconTile, DataGrid, Tree).
**Use it instead of stock shadcn for all UI.**
Components are installed as source files into the project (shadcn registry), so they are editable and tree-shaken.

Registry: `http://localhost:4111/r` · catalog of every component: `http://localhost:4111/r/llms.txt`

## Rules (read before writing any UI)

1. **Never hand-roll a primitive that exists in the catalog**, and never run `npx shadcn add button` (the stock one) — add the
   Moonlight item by URL instead. Mixing stock and Moonlight components breaks the look.
2. **Only use semantic tokens** — `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border`,
   `ring`, and the status colors `success | info | warning | destructive | invert | focus`. No raw hex, no `bg-gray-*`.
3. **Status = Badge light variants** — `<Badge variant="success-light">`; also `*-outline`, solid, and `primary-light`.
   Sizes `xs sm default lg xl`; `radius="full"` for pills.
4. **Surfaces = Frame** — Moonlight's signature: a muted outer shell with white `FramePanel`s inside. Use
   `Frame > FramePanel > FrameHeader/FrameTitle/FrameDescription` instead of bare cards for dashboard sections.
   `Card` exists, but Frame is the default for page sections. `IconTile` is the icon chip used in lists/headers.
5. **Buttons**: `default` for the one primary action, `muted` for toolbar buttons (Filter, Display, Export), `outline`,
   `ghost`, `secondary`, `destructive`, `link`. Sizes `xs sm default lg icon icon-xs icon-sm icon-lg`.
6. **Tabs**: `<TabsList variant="line">` is the full-width underlined strip (Moonlight's page tabs). Default is the pill.
7. **Base UI, not Radix**: composition uses the `render` prop, not `asChild` —
   `<SidebarMenuButton render={<Link href="/x" />}>`, `<TooltipTrigger render={<Button />}>`.
8. **Density**: text is 13–14px, controls are `h-8`, radius `0.625rem`. Keep pages compact; don't scale things up.
9. **Dark mode** is the `.dark` class on `<html>` (the theme toggle + init script handle it). Never hard-code light colors.
10. Read the installed source in `components/ui/*` for props/variants — JSDoc at the top of each file documents the intent.

## Setup

**New project — one command** (creates the Next.js app, theme, every component, root layout with Inter + theme script, and a sample page):

```bash
npx shadcn@latest init -d -n my-app http://localhost:4111/r/moonlight-starter.json
```

**Existing shadcn project** (Next.js + Tailwind v4, `components.json` present):

```bash
# 1. Theme tokens (palette, radius, status colors, light + dark). --overwrite is REQUIRED: without it shadcn keeps the
#    project's existing --background/--primary/… and Moonlight's values never apply.
npx shadcn@latest add http://localhost:4111/r/moonlight-theme.json --overwrite --yes
# 2. Components: everything, or only what you need (dependencies come along automatically)
npx shadcn@latest add http://localhost:4111/r/moonlight.json --yes
npx shadcn@latest add http://localhost:4111/r/button.json http://localhost:4111/r/badge.json --yes
```

`moonlight` and the individual items never touch `app/layout.tsx` / `app/page.tsx`. In an existing project wire the root layout
yourself (what `moonlight-layout` installs): Inter as `--font-inter`, the theme init script (no light flash in dark mode) and
`TooltipProvider`:

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

Remove any starter `body { font-family }` / `prefers-color-scheme` rules left in `globals.css`.

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
            {/* table / chart / DataGrid */}
          </FramePanel>
        </Frame>
      </PageBody>
    </>
  )
}
```

## Updating

Re-run `npx shadcn@latest add http://localhost:4111/r/<name>.json --overwrite` to pull a newer version of a component
(this overwrites local edits to that file — diff first with `--diff`).


# Component catalog

## UI components (registry:ui)

- **avatar** — `npx shadcn add http://localhost:4111/r/avatar.json`
  - exports: Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage
- **badge** — `npx shadcn add http://localhost:4111/r/badge.json`
  - exports: Badge
  - variant: default | outline | secondary | info | success | warning | destructive | focus | invert | primary-light | warning-light | success-light | info-light | destructive-light | invert-light | focus-light | primary-outline | warning-outline | success-outline | info-outline | destructive-outline | invert-outline | focus-outline
  - size: xs | sm | default | lg | xl
  - radius: default | full
- **breadcrumb** — `npx shadcn add http://localhost:4111/r/breadcrumb.json`
  - exports: Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
- **button** — `npx shadcn add http://localhost:4111/r/button.json`
  - exports: Button
  - variant: default | outline | secondary | ghost | muted | destructive | link
  - size: default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg
- **card** — `npx shadcn add http://localhost:4111/r/card.json`
  - exports: Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
- **chart** — `npx shadcn add http://localhost:4111/r/chart.json`
  - exports: ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent
- **checkbox** — `npx shadcn add http://localhost:4111/r/checkbox.json`
  - exports: Checkbox
- **dropdown-menu** — `npx shadcn add http://localhost:4111/r/dropdown-menu.json`
  - exports: DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
- **field** — `npx shadcn add http://localhost:4111/r/field.json`
  - exports: Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle
  - also installs: label, separator
- **frame** — `npx shadcn add http://localhost:4111/r/frame.json`
  - exports: Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle
  - variant: default | inverse | ghost
  - spacing: xs | sm | default | lg
- **hover-card** — `npx shadcn add http://localhost:4111/r/hover-card.json`
  - exports: HoverCard, HoverCardContent, HoverCardTrigger
- **icon-tile** — `npx shadcn add http://localhost:4111/r/icon-tile.json`
  - exports: IconTile
  - variant: outline | elevated | soft | solid | frame
  - size: xs | sm | default | lg | xl
  - radius: default | full
- **input-group** — `npx shadcn add http://localhost:4111/r/input-group.json`
  - exports: InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea
  - size: xs | sm | icon-xs | icon-sm
  - also installs: button, input, textarea
- **input** — `npx shadcn add http://localhost:4111/r/input.json`
  - exports: Input
- **item** — `npx shadcn add http://localhost:4111/r/item.json`
  - exports: Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle
  - variant: default | outline | muted
  - size: default | sm | xs
  - variant: default | icon | image
  - also installs: separator
- **kbd** — `npx shadcn add http://localhost:4111/r/kbd.json`
  - exports: Kbd, KbdGroup
- **label** — `npx shadcn add http://localhost:4111/r/label.json`
  - exports: Label
- **popover** — `npx shadcn add http://localhost:4111/r/popover.json`
  - exports: Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger
- **progress** — `npx shadcn add http://localhost:4111/r/progress.json`
  - exports: Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue
- **scroll-area** — `npx shadcn add http://localhost:4111/r/scroll-area.json`
  - exports: ScrollArea, ScrollBar
- **select** — `npx shadcn add http://localhost:4111/r/select.json`
  - exports: Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue
- **separator** — `npx shadcn add http://localhost:4111/r/separator.json`
  - exports: Separator
- **sheet** — `npx shadcn add http://localhost:4111/r/sheet.json`
  - exports: Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger
  - also installs: button
- **sidebar** — `npx shadcn add http://localhost:4111/r/sidebar.json`
  - exports: Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger
  - variant: default | outline
  - size: default | sm | lg
  - also installs: button, input, separator, sheet, skeleton, tooltip, use-mobile
- **skeleton** — `npx shadcn add http://localhost:4111/r/skeleton.json`
  - exports: Skeleton
- **spinner** — `npx shadcn add http://localhost:4111/r/spinner.json`
  - exports: Spinner
- **switch** — `npx shadcn add http://localhost:4111/r/switch.json`
  - exports: Switch
- **table** — `npx shadcn add http://localhost:4111/r/table.json`
  - exports: Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow
- **tabs** — `npx shadcn add http://localhost:4111/r/tabs.json`
  - exports: Tabs, TabsContent, TabsList, TabsTrigger
  - variant: default | line
- **textarea** — `npx shadcn add http://localhost:4111/r/textarea.json`
  - exports: Textarea
- **toggle-group** — `npx shadcn add http://localhost:4111/r/toggle-group.json`
  - exports: ToggleGroup, ToggleGroupItem
  - also installs: toggle
- **toggle** — `npx shadcn add http://localhost:4111/r/toggle.json`
  - exports: Toggle
  - variant: default | outline
  - size: default | sm | lg
- **tooltip** — `npx shadcn add http://localhost:4111/r/tooltip.json`
  - exports: Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
- **tree** — `npx shadcn add http://localhost:4111/r/tree.json`
  - exports: Tree, TreeDragLine, TreeItem, TreeItemLabel
- **data-grid** — `npx shadcn add http://localhost:4111/r/data-grid.json`
  - exports: DataGrid, DataGridCellSelection, DataGridColumnFilter, DataGridColumnHeader, DataGridColumnVisibility, DataGridContainer, DataGridPagination, DataGridProvider, DataGridScrollArea, DataGridSelectionBar, DataGridTable, DataGridTableAddRow, DataGridTableBase, DataGridTableBody, DataGridTableBodyRow, DataGridTableBodyRowCell, DataGridTableBodyRowExpandded, DataGridTableBodyRowSkeleton, DataGridTableBodyRowSkeletonCell, DataGridTableDnd, DataGridTableDndRowHandle, DataGridTableDndRows, DataGridTableEmpty, DataGridTableFillBodyCell, DataGridTableFillHeadCell, DataGridTableFoot, DataGridTableFootRow, DataGridTableFootRowCell, DataGridTableHead, DataGridTableHeadRow, DataGridTableHeadRowCell, DataGridTableHeadRowCellResize, DataGridTableHeader, DataGridTableLoader, DataGridTableRenderedRow, DataGridTableRowExpand, DataGridTableRowPin, DataGridTableRowSelect, DataGridTableRowSelectAll, DataGridTableRowSpacer, DataGridTableViewport, DataGridTableVirtual
  - also installs: badge, button, checkbox, dropdown-menu, input, popover, select, separator, skeleton, spinner

## App shell pieces (templates)

- **moonlight-theme-toggle** — `npx shadcn add http://localhost:4111/r/moonlight-theme-toggle.json`
  - exports: ThemeToggle
  - also installs: button
- **moonlight-page-header** — `npx shadcn add http://localhost:4111/r/moonlight-page-header.json`
  - exports: PageHeader
  - also installs: breadcrumb, moonlight-theme-toggle, separator, sidebar
- **moonlight-page-body** — `npx shadcn add http://localhost:4111/r/moonlight-page-body.json`
  - exports: PageBody
  - also installs: utils
- **moonlight-range-toggle** — `npx shadcn add http://localhost:4111/r/moonlight-range-toggle.json`
  - exports: RangeToggle
  - also installs: toggle-group
- **moonlight-run-strip** — `npx shadcn add http://localhost:4111/r/moonlight-run-strip.json`
  - exports: RunStrip
  - also installs: utils
- **moonlight-app-sidebar** — `npx shadcn add http://localhost:4111/r/moonlight-app-sidebar.json`
  - exports: AppSidebar
  - also installs: avatar, icon-tile, kbd, sidebar

## Core

- **utils** — `npx shadcn add http://localhost:4111/r/utils.json`
- **use-mobile** — `npx shadcn add http://localhost:4111/r/use-mobile.json`

## Starter files (new projects only; replace app/layout.tsx and app/page.tsx)

- **moonlight-layout** — `npx shadcn add http://localhost:4111/r/moonlight-layout.json`
  - exports: RootLayout
  - also installs: moonlight-theme-toggle, tooltip
- **moonlight-home** — `npx shadcn add http://localhost:4111/r/moonlight-home.json`
  - exports: Page
  - also installs: badge, button, frame, icon-tile, moonlight-app-sidebar, moonlight-page-body, moonlight-page-header, sidebar, table
