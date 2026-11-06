"use client"

import * as React from "react"
import { ArrowRightIcon, CopyIcon, GitCommitHorizontalIcon, ListIcon, MoreHorizontalIcon, SnowflakeIcon } from "lucide-react"

import { DeploySheet } from "@/components/releases/deploy-history"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { environments, releases } from "@/lib/data/releases-data"
import { cn } from "@/lib/utils"

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("")

/** Environment cards; a card opens its latest deploy in a Sheet, the menu can freeze deploys to it. */
export function Environments() {
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [frozen, setFrozen] = React.useState<string[]>([])
  const show = (id: string) => { setOpenId(id); setOpen(true) }
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Environments</FrameTitle>
            <FrameDescription>8 services across 3 environments</FrameDescription>
          </div>
          <Select defaultValue="services" items={[{ value: "services", label: "Services" }, { value: "regions", label: "Regions" }]}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="regions">Regions</SelectItem>
            </SelectContent>
          </Select>
        </FrameHeader>
        <div className="grid items-stretch gap-3 px-4 pb-4 @3xl:grid-cols-3">
          {environments.map((e, i) => (
            <div
              key={e.name}
              role="button"
              tabIndex={0}
              aria-label={`Open ${e.id}, ${e.service}`}
              onClick={() => show(e.id)}
              onKeyDown={(k) => (k.key === "Enter" || k.key === " ") && (k.preventDefault(), show(e.id))}
              className="relative flex cursor-pointer flex-col gap-3 rounded-lg border bg-card p-3 outline-none transition-colors hover:bg-muted/30 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {i > 0 && (
                <Tooltip>
                  <TooltipTrigger render={<span className="absolute -left-[17px] top-1/2 hidden -translate-y-1/2 text-muted-foreground @3xl:block" />}><ArrowRightIcon className="size-3.5" /></TooltipTrigger>
                  <TooltipContent>Promotes from {environments[i - 1].name} to {e.name}</TooltipContent>
                </Tooltip>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{e.name}</span>
                <Badge variant={e.tone}>{e.health}</Badge>
                {frozen.includes(e.name) && <Badge variant="info-light"><SnowflakeIcon />Frozen</Badge>}
                <span className="ml-auto" onClick={(ev) => ev.stopPropagation()} onKeyDown={(ev) => ev.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`${e.name} actions`} />}><MoreHorizontalIcon /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>{e.name}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => show(e.id)}><ListIcon /> Open latest</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(e.version)}><CopyIcon /> Copy version</DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setFrozen((f) => (f.includes(e.name) ? f.filter((x) => x !== e.name) : [...f, e.name]))}>
                        <SnowflakeIcon /> {frozen.includes(e.name) ? "Unfreeze deploys" : "Freeze deploys"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                {e.regions.map((r) => <span key={r} className="font-mono">{r}</span>)}
                {e.note && <span>{e.note}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{e.service}</span>
                <Badge variant={e.status === "Running" ? "info-light" : "success-light"} className="ml-auto">{e.status}</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold tabular-nums">{e.version}</span>
                <span className="text-xs text-muted-foreground">from {e.from}</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="flex shrink-0 items-center gap-1 font-mono text-muted-foreground"><GitCommitHorizontalIcon className="size-3.5" />{e.sha}</span>
                <span className="line-clamp-2 text-muted-foreground">{e.message}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-1.5 flex-1 gap-0.5 overflow-hidden rounded-full">
                  {Array.from({ length: 6 }, (_, k) => (
                    <span key={k} className={cn("flex-1", e.status === "Running" && k >= 3 ? "bg-muted" : "bg-success")} />
                  ))}
                </div>
                <span className="text-[11px] tabular-nums text-muted-foreground">{e.progress}</span>
              </div>
              <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <Avatar className="size-5"><AvatarFallback className="text-[9px]">{initials(e.author)}</AvatarFallback></Avatar>
                {e.author}
                <span className="ml-auto">{e.when}</span>
              </div>
            </div>
          ))}
        </div>
      </FramePanel>
      <DeploySheet release={releases.find((r) => r.id === openId)} open={open} onOpenChange={setOpen} />
    </Frame>
  )
}
