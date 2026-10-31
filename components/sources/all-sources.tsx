"use client"

import * as React from "react"
import { ChevronDownIcon, FilterIcon, LayersIcon, RefreshCwIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { groups, type SourceStatus } from "@/lib/data/sources-data"
import { cn } from "@/lib/utils"

const variant: Record<SourceStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  Healthy: "success-light",
  Degraded: "warning-light",
  Failing: "destructive-light",
  Paused: "secondary",
}

export function AllSources() {
  const [q, setQ] = React.useState("")
  const [open, setOpen] = React.useState<Record<string, boolean>>({})
  const n = q.trim().toLowerCase()
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>All Sources</FrameTitle>
            <FrameDescription>Grouped by category, worst first</FrameDescription>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Sources <b className="font-medium text-foreground">13</b></span>
            <span>Unhealthy <b className="font-medium text-foreground">2</b></span>
          </div>
        </FrameHeader>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <InputGroup className="max-w-60">
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
            <InputGroupInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sources or datasets…" />
          </InputGroup>
          <div className="flex items-center gap-2">
            <Button variant="muted" size="sm"><LayersIcon /> Categories</Button>
            <Button variant="muted" size="sm"><FilterIcon /> Filter</Button>
            <Button variant="muted" size="sm"><SlidersHorizontalIcon /> Display</Button>
          </div>
        </div>
        {groups.map((g) => {
          const sources = g.sources.filter((s) => !n || s.name.toLowerCase().includes(n) || s.kind.toLowerCase().includes(n) || s.datasets.toLowerCase().includes(n))
          if (!sources.length) return null
          const collapsed = open[g.name] === false
          return (
            <section key={g.name}>
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [g.name]: collapsed }))}
                className="flex w-full items-center gap-2 border-y bg-muted/40 px-4 py-1.5 text-left text-sm"
              >
                <ChevronDownIcon className={cn("size-3.5 text-muted-foreground transition-transform", collapsed && "-rotate-90")} />
                <span className="font-medium">{g.name}</span>
                <Badge variant="outline" size="sm" radius="full">{g.sources.length}</Badge>
                <span className="ml-auto text-xs text-muted-foreground">{g.summary}</span>
              </button>
              {!collapsed && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {["Source", "Status", "Datasets", "Linked", "Last Sync", "Owner", "Sync"].map((h) => <TableHead key={h}>{h}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources.map((s) => (
                      <TableRow key={s.name}>
                        <TableCell>
                          <div className="font-medium">{s.name} <span className="text-xs font-normal text-muted-foreground">{s.kind}</span></div>
                          <div className="max-w-56 truncate font-mono text-[11px] text-muted-foreground">{s.endpoint}</div>
                        </TableCell>
                        <TableCell><Badge variant={variant[s.status]}>{s.status}</Badge></TableCell>
                        <TableCell>
                          <span className="font-mono text-xs">{s.datasets}</span>
                          {s.more > 0 && <Badge variant="outline" size="sm" className="ml-1.5">+{s.more}</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary/70" style={{ width: `${(s.linked[0] / s.linked[1]) * 100}%` }} /></div>
                            <span className="text-[11px] tabular-nums text-muted-foreground">{s.linked[0]}/{s.linked[1]}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={cn(s.status === "Failing" && "text-destructive-foreground")}>{s.lastSync}</div>
                          <div className="text-[11px] text-muted-foreground">{s.cadence}</div>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5">
                            <Avatar className="size-5"><AvatarFallback className="text-[9px]">{s.owner.split(" ").map((p) => p[0]).join("")}</AvatarFallback></Avatar>
                            {s.owner}
                          </span>
                        </TableCell>
                        <TableCell><Button variant="ghost" size="icon-sm" aria-label={`Sync ${s.name}`}><RefreshCwIcon /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </section>
          )
        })}
      </FramePanel>
    </Frame>
  )
}
