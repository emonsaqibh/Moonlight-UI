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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { jobs as demoJobs, type Job, type JobStatus } from "@/lib/data/jobs-data"

const statusVariant: Record<JobStatus, "destructive-light" | "warning-light" | "success-light"> = {
  Failed: "destructive-light",
  "Timed Out": "warning-light",
  Succeeded: "success-light",
}

const tabs = [
  ["all", "All", () => true],
  ["healthy", "Healthy", (j: Job) => j.enabled && j.status === "Succeeded"],
  ["failing", "Failing", (j: Job) => j.enabled && j.status !== "Succeeded"],
  ["paused", "Paused", (j: Job) => !j.enabled],
] as const

/** Pass `jobs` + `onJobsChange` to control the rows; `onOpenJob` makes rows open the job (e.g. in a Sheet). */
export function JobsTable({ jobs: controlled, onJobsChange, onOpenJob, activeJob }: { jobs?: Job[]; onJobsChange?: (jobs: Job[]) => void; onOpenJob?: (job: Job) => void; activeJob?: string }) {
  const [own, setOwn] = React.useState(demoJobs)
  const list = controlled ?? own
  const setList = onJobsChange ?? setOwn
  const [tab, setTab] = React.useState<string>("all")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const match = tabs.find(([v]) => v === tab)![2]
  const q = query.trim().toLowerCase()
  const filtered = list.filter((j) => match(j) && (!q || j.name.toLowerCase().includes(q) || j.command.toLowerCase().includes(q)))
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, pages)
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize)
  const failing = list.filter(tabs[2][2]).length
  const all = rows.length > 0 && rows.every((r) => selected.has(r.name))
  const toggle = (name: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s)
      if (on) n.add(name)
      else n.delete(name)
      return n
    })
  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Jobs</FrameTitle>
            <FrameDescription>{list.length} jobs · {failing} failing</FrameDescription>
          </div>
          <Button variant="muted" size="sm"><SlidersHorizontalIcon /> Display</Button>
        </FrameHeader>
        <Tabs value={tab} onValueChange={(v) => { setTab(String(v)); setPage(1) }}>
          <TabsList variant="line">
            {tabs.map(([value, label, test]) => (
              <TabsTrigger key={value} value={value}>
                {label} <Badge variant="outline" size="sm" radius="full">{list.filter(test).length}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <InputGroup className="max-w-52">
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
            <InputGroupInput value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search jobs or commands…" />
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
              <TableRow
                key={j.name}
                data-state={selected.has(j.name) ? "selected" : undefined}
                data-active={activeJob === j.name || undefined}
                onClick={onOpenJob && (() => onOpenJob(j))}
                className={onOpenJob && "cursor-pointer data-active:bg-muted/50"}
              >
                <TableCell onClick={stop}><Checkbox checked={selected.has(j.name)} onCheckedChange={(v) => toggle(j.name, !!v)} aria-label={`Select ${j.name}`} /></TableCell>
                <TableCell>
                  {onOpenJob ? (
                    <button type="button" aria-label={`Open ${j.name}`} onClick={(e) => { stop(e); onOpenJob(j) }} className="block cursor-pointer text-left font-medium underline-offset-2 transition-colors hover:text-primary hover:underline">{j.name}</button>
                  ) : (
                    <div className="font-medium">{j.name}</div>
                  )}
                  <code className="font-mono text-[11px] text-muted-foreground">{j.command}</code>
                </TableCell>
                <TableCell>
                  <div>{j.schedule}</div>
                  <code className="font-mono text-[11px] text-muted-foreground">{j.cron}</code>
                </TableCell>
                <TableCell onClick={stop}><Switch checked={j.enabled} onCheckedChange={(v) => setList(list.map((x) => (x.name === j.name ? { ...x, enabled: v } : x)))} aria-label={`Enable ${j.name}`} /></TableCell>
                <TableCell>
                  {j.runs.length ? (
                    <>
                      <Badge variant={statusVariant[j.status]}>{j.status}</Badge>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{j.ago} · {j.duration}</div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Never run</span>
                  )}
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
          <span className="flex items-center gap-2">
            Rows per page
            <Select items={[10, 25, 50].map((n) => ({ value: n, label: String(n) }))} value={pageSize} onValueChange={(v) => { if (v) { setPageSize(v); setPage(1) } }}>
              <SelectTrigger size="sm" className="w-16"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 25, 50].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </span>
          <span>{filtered.length ? `${(current - 1) * pageSize + 1} - ${(current - 1) * pageSize + rows.length}` : 0} of {filtered.length} jobs</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Go to previous page" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeftIcon /></Button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Button key={p} variant={p === current ? "outline" : "ghost"} size="icon-sm" aria-label={`Go to page ${p}`} aria-current={p === current ? "page" : undefined} onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button variant="ghost" size="icon-sm" aria-label="Go to next page" disabled={current === pages} onClick={() => setPage(current + 1)}><ChevronRightIcon /></Button>
          </div>
        </div>
      </FramePanel>
    </Frame>
  )
}
