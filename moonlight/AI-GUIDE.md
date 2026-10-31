# Moonlight UI — how to build UI in any project

Moonlight is our design system: shadcn/ui on **Base UI** (style `base-nova`) + Tailwind v4, with a custom neutral look
(visual style derived from the Strata observability app) plus ReUI extras (Frame, IconTile, DataGrid, Tree).
**Use it instead of stock shadcn for all UI.**
Components are installed as source files into the project (shadcn registry), so they are editable and tree-shaken.

Registry: `{{REGISTRY_URL}}` · catalog of every component: `{{REGISTRY_URL}}/llms.txt`

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
npx shadcn@latest init -d -n my-app {{REGISTRY_URL}}/moonlight-starter.json
```

**Existing shadcn project** (Next.js + Tailwind v4, `components.json` present):

```bash
# 1. Theme tokens (palette, radius, status colors, light + dark). --overwrite is REQUIRED: without it shadcn keeps the
#    project's existing --background/--primary/… and Moonlight's values never apply.
npx shadcn@latest add {{REGISTRY_URL}}/moonlight-theme.json --overwrite --yes
# 2. Components: everything, or only what you need (dependencies come along automatically)
npx shadcn@latest add {{REGISTRY_URL}}/moonlight.json --yes
npx shadcn@latest add {{REGISTRY_URL}}/button.json {{REGISTRY_URL}}/badge.json --yes
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

Re-run `npx shadcn@latest add {{REGISTRY_URL}}/<name>.json --overwrite` to pull a newer version of a component
(this overwrites local edits to that file — diff first with `--diff`).
