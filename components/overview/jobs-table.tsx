"use client"

import * as React from "react"
import { ArrowUpDownIcon, ChevronLeftIcon, ChevronRightIcon, FilterIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"

import { RunStrip } from "@/components/app/run-strip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { jobs, type JobStatus } from "@/lib/data/jobs-data"

const statusVariant: Record<JobStatus, "destructive-light" | "warning-light" | "success-light"> = {
  Failed: "destructive-light",
  "Timed Out": "warning-light",
  Succeeded: "success-light",
}

const tabs = [
  ["all", "All", 32],
  ["healthy", "Healthy", 24],
  ["failing", "Failing", 3],
  ["paused", "Paused", 5],
] as const

export function JobsTable() {
  const [tab, setTab] = React.useState<string>("all")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const rows = jobs.filter((j) => {
    if (tab === "paused") return false
    if (tab === "healthy" && j.status !== "Succeeded") return false
    if (tab === "failing" && j.status === "Succeeded") return false
    const q = query.trim().toLowerCase()
    return !q || j.name.toLowerCase().includes(q) || j.command.toLowerCase().includes(q)
  })
  const all = rows.length > 0 && rows.every((r) => selected.has(r.name))
  const toggle = (name: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s)
      if (on) n.add(name)
      else n.delete(name)
      return n
    })

  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Jobs</FrameTitle>
            <FrameDescription>32 jobs · 3 failing</FrameDescription>
          </div>
          <Button variant="muted" size="sm"><SlidersHorizontalIcon /> Display</Button>
        </FrameHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList variant="line">
            {tabs.map(([value, label, n]) => (
              <TabsTrigger key={value} value={value}>
                {label} <Badge variant="outline" size="sm" radius="full">{n}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <InputGroup className="max-w-52">
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
            <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs or commands…" />
          </InputGroup>
          <Button variant="muted" size="sm"><FilterIcon /> Filter</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={all} onCheckedChange={(v) => setSelected(v ? new Set(rows.map((r) => r.name)) : new Set())} aria-label="Select all" />
              </TableHead>
              <TableHead><span className="inline-flex items-center gap-1">Job <ArrowUpDownIcon className="size-3 text-muted-foreground" /></span></TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead><span className="inline-flex items-center gap-1">Last Run <ArrowUpDownIcon className="size-3 text-muted-foreground" /></span></TableHead>
              <TableHead>Last 20 Runs</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((j) => (
              <TableRow key={j.name} data-state={selected.has(j.name) ? "selected" : undefined}>
                <TableCell><Checkbox checked={selected.has(j.name)} onCheckedChange={(v) => toggle(j.name, !!v)} aria-label={`Select ${j.name}`} /></TableCell>
                <TableCell>
                  <div className="font-medium">{j.name}</div>
                  <code className="font-mono text-[11px] text-muted-foreground">{j.command}</code>
                </TableCell>
                <TableCell>
                  <div>{j.schedule}</div>
                  <code className="font-mono text-[11px] text-muted-foreground">{j.cron}</code>
                </TableCell>
                <TableCell><Switch defaultChecked={j.enabled} /></TableCell>
                <TableCell>
                  <Badge variant={statusVariant[j.status]}>{j.status}</Badge>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{j.ago} · {j.duration}</div>
                </TableCell>
                <TableCell><RunStrip runs={j.runs} /></TableCell>
                <TableCell>
                  <div>{j.target}</div>
                  <div className="text-[11px] text-muted-foreground">{j.region}</div>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    <Avatar className="size-5"><AvatarFallback className="text-[9px]">{j.owner.split(" ").map((p) => p[0]).join("")}</AvatarFallback></Avatar>
                    {j.owner}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No jobs match.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs text-muted-foreground">
          <span>Rows per page 10</span>
          <span>1 - {rows.length} of 32 jobs</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Go to previous page"><ChevronLeftIcon /></Button>
            {[1, 2, 3, 4].map((p) => (
              <Button key={p} variant={p === 1 ? "outline" : "ghost"} size="icon-sm">{p}</Button>
            ))}
            <Button variant="ghost" size="icon-sm" aria-label="Go to next page"><ChevronRightIcon /></Button>
          </div>
        </div>
      </FramePanel>
    </Frame>
  )
}
