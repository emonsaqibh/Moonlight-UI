"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ActivityIcon, AudioWaveformIcon, BugIcon, CalendarIcon, ChevronsUpDownIcon, FileTextIcon, GitPullRequestIcon,
  GlobeIcon, LayersIcon, LayoutDashboardIcon, PlugIcon, SearchIcon, SettingsIcon, SirenIcon, TagIcon,
  type LucideIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { IconTile } from "@/components/ui/icon-tile"
import { Kbd } from "@/components/ui/kbd"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"

type Item = { href: string; label: string; icon: LucideIcon }

const observe: Item[] = [
  { href: "/services", label: "Services", icon: LayersIcon },
  { href: "/logs", label: "Logs", icon: FileTextIcon },
  { href: "/monitors", label: "Monitors", icon: ActivityIcon },
]
const ship: Item[] = [
  { href: "/deployments", label: "Releases", icon: TagIcon },
  { href: "/deployments/board", label: "Deploy board", icon: GitPullRequestIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
]
const pinned: Item[] = [
  { href: "/services/checkout-api", label: "checkout-api", icon: LayersIcon },
  { href: "/monitors/api-acme-com", label: "api.acme.com", icon: GlobeIcon },
  { href: "/logs/errors-payments", label: "Errors · payments", icon: BugIcon },
  { href: "/calendar/on-call-payments", label: "On-call · payments", icon: SirenIcon },
]

function Group({ label, items, count }: { label?: string; items: Item[]; count?: number }) {
  const pathname = usePathname()
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel>
          {label}
          {count !== undefined && <Badge variant="outline" size="sm" className="ml-auto">{count}</Badge>}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton isActive={pathname === href} render={<Link href={href} />}>
                <Icon /> <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="border bg-background shadow-xs">
              <IconTile size="sm" className="bg-emerald-600 text-white [&_svg]:text-white"><AudioWaveformIcon /></IconTile>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium text-foreground">Acme Core</span>
                <span className="truncate text-xs text-muted-foreground">Production · EU West</span>
              </div>
              <ChevronsUpDownIcon />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="border bg-background shadow-xs">
              <SearchIcon /> <span className="flex-1">Search</span> <Kbd>⌘F</Kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <Group items={[{ href: "/", label: "Overview", icon: LayoutDashboardIcon }]} />
        <Group label="Observe" items={observe} />
        <Group label="Ship" items={ship} />
        <Group label="Pinned" count={pinned.length} items={pinned} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem><SidebarMenuButton render={<Link href="/sources" />}><PlugIcon /> <span>Sources</span></SidebarMenuButton></SidebarMenuItem>
          <SidebarMenuItem><SidebarMenuButton render={<Link href="/settings" />}><SettingsIcon /> <span>Settings</span></SidebarMenuButton></SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="border bg-background shadow-xs">
              <Avatar size="sm"><AvatarFallback>S</AvatarFallback></Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium text-foreground">Shadcn</span>
                <span className="truncate text-xs text-muted-foreground">Author of Shadcn/ui</span>
              </div>
              <ChevronsUpDownIcon />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
