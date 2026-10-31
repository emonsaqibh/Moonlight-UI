"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronsUpDownIcon, LayoutDashboardIcon, SearchIcon, SettingsIcon, SparklesIcon, type LucideIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { IconTile } from "@/components/ui/icon-tile"
import { Kbd } from "@/components/ui/kbd"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"

type Item = { href: string; label: string; icon: LucideIcon }

// EDIT: your routes. `label` on a group is optional (omit it for the top group).
const nav: { label?: string; items: Item[] }[] = [
  { items: [{ href: "/", label: "Overview", icon: LayoutDashboardIcon }] },
  { label: "Workspace", items: [{ href: "/projects", label: "Projects", icon: SparklesIcon }] },
]

function Group({ label, items }: { label?: string; items: Item[] }) {
  const pathname = usePathname()
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
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
              <IconTile size="sm" className="bg-emerald-600 text-white [&_svg]:text-white"><SparklesIcon /></IconTile>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium text-foreground">My workspace</span>{/* EDIT: product / workspace name */}
                <span className="truncate text-xs text-muted-foreground">Production</span>
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
        {nav.map((g, i) => <Group key={i} {...g} />)}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem><SidebarMenuButton render={<Link href="/settings" />}><SettingsIcon /> <span>Settings</span></SidebarMenuButton></SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="border bg-background shadow-xs">
              <Avatar size="sm"><AvatarFallback>U</AvatarFallback></Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium text-foreground">User</span>
                <span className="truncate text-xs text-muted-foreground">user@example.com</span>
              </div>
              <ChevronsUpDownIcon />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
