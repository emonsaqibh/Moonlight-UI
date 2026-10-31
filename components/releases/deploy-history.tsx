"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon, GitCommitHorizontalIcon, SearchIcon, Settings2Icon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { releases, type DeployStatus } from "@/lib/data/releases-data"
import { cn } from "@/lib/utils"

const variant: Record<DeployStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  Running: "info-light",
  Succeeded: "success-light",
  Failed: "destructive-light",
  "Rolled back": "secondary",
}

const tabs = [["all", "All", 23], ["live", "Live", 1], ["failed", "Failed", 2], ["rolled", "Rolled back", 2]] as const

export function DeployHistory() {
  const [tab, setTab] = React.useState("all")
  const [q, setQ] = React.useState("")
  const rows = releases.filter((r) => {
    if (tab === "live" && r.status !== "Running") return false
    if (tab === "failed" && r.status !== "Failed") return false
    if (tab === "rolled" && r.status !== "Rolled back") return false
    const n = q.trim().toLowerCase()
    return !n || [r.service, r.id, r.sha, r.message].some((v) => v.toLowerCase().includes(n))
  })
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Deploy History</FrameTitle>
            <FrameDescription>23 deploys</FrameDescription>
          </div>
          <Button variant="muted" size="sm"><Settings2Icon /> Settings</Button>
        </FrameHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList variant="line">
            {tabs.map(([v, l, n]) => (
              <TabsTrigger key={v} value={v}>{l} <Badge variant="outline" size="sm" radius="full">{n}</Badge></TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <InputGroup className="max-w-60">
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
            <InputGroupInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search deploys or commits…" />
          </InputGroup>
          <Button variant="muted" size="sm"><FilterIcon /> Filter</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {["Deploy", "Commit", "Status", "Pipeline", "Duration", "Author", "Started"].map((h) => <TableHead key={h}>{h}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="font-medium">{r.service}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{r.version} · {r.id}</div>
                </TableCell>
                <TableCell className="max-w-64">
                  <div className="flex items-center gap-1 font-mono text-xs"><GitCommitHorizontalIcon className="size-3.5 text-muted-foreground" />{r.sha}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{r.message}</div>
                </TableCell>
                <TableCell><Badge variant={variant[r.status]}>{r.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 6 }, (_, k) => (
                        <span key={k} className={cn("size-1.5 rounded-full", k < r.pipeline ? (r.status === "Failed" && k === r.pipeline - 1 ? "bg-destructive" : "bg-success") : "bg-muted")} />
                      ))}
                    </div>
                    <span className="text-[11px] tabular-nums text-muted-foreground">{r.pipeline}/6</span>
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">{r.duration}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    <Avatar className="size-5"><AvatarFallback className="text-[9px]">{r.author.split(" ").map((p) => p[0]).join("")}</AvatarFallback></Avatar>
                    {r.author}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="tabular-nums">{r.started}</div>
                  <div className="text-[11px] text-muted-foreground">{r.ago}</div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No deploys match.</TableCell></TableRow>}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
          <span>Rows per page 10</span>
          <span>1 - {rows.length} of 23 deploys</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Go to previous page"><ChevronLeftIcon /></Button>
            {[1, 2, 3].map((p) => <Button key={p} variant={p === 1 ? "outline" : "ghost"} size="icon-sm">{p}</Button>)}
            <Button variant="ghost" size="icon-sm" aria-label="Go to next page"><ChevronRightIcon /></Button>
          </div>
        </div>
      </FramePanel>
    </Frame>
  )
}
