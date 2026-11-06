"use client"

import * as React from "react"
import {
  ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsUpDownIcon, ChevronUpIcon, CircleCheckIcon, CircleDashedIcon,
  CircleXIcon, CopyIcon, EllipsisIcon, FilterIcon, GitCommitHorizontalIcon, LoaderCircleIcon, PauseIcon, PlayIcon, RotateCcwIcon, SearchIcon, Settings2Icon, Trash2Icon, XIcon,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { releases as demoReleases, type DeployStatus, type Env, type Release } from "@/lib/data/releases-data"
import { cn } from "@/lib/utils"

const variant: Record<DeployStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  Running: "info-light",
  Succeeded: "success-light",
  Failed: "destructive-light",
  "Rolled back": "secondary",
}

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("")
const secs = (d: string) => d.split(":").reduce((a, v) => a * 60 + Number(v), 0)
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7)
const cluster = (r: Release) => (r.env === "Production" ? "prod-us-east-1" : "staging-us-east-1")

type Stage = { name: string; state: "passed" | "running" | "failed" | "pending" | "rolled"; took: string; note?: string }

/** Pipeline stages for a deploy, derived from how many of the 6 stages passed. */
export function stagesOf(r: Release): Stage[] {
  const names = ["Build", "Test", "Security scan", "Canary 25%", "Canary 50%", "Full rollout"]
  const h = hash(r.id)
  return names.map((name, i) => {
    const took = `${Math.floor(((h + i * 37) % 150) / 60)}:${String((h + i * 37) % 60).padStart(2, "0")}`
    const note = i >= 3 ? `Error 0.0${(h + i) % 9 + 1}%, p95 ${40 + ((h + i) % 60)} ms` : undefined
    if (r.status === "Failed" && i === r.pipeline - 1) return { name, state: "failed", took, note: "Health check failed: error rate over 2%" }
    if (r.status === "Rolled back" && i === r.pipeline) return { name, state: "rolled", took, note: "Rolled back to the previous version" }
    if (i < r.pipeline) return { name, state: "passed", took, note }
    if (r.status === "Running" && i === r.pipeline) return { name, state: "running", took: "…", note }
    return { name, state: "pending", took: "" }
  })
}

const stageIcon = {
  passed: <CircleCheckIcon className="size-4 text-success" />,
  running: <LoaderCircleIcon className="size-4 animate-spin text-info" />,
  failed: <CircleXIcon className="size-4 text-destructive" />,
  rolled: <RotateCcwIcon className="size-4 text-muted-foreground" />,
  pending: <CircleDashedIcon className="size-4 text-muted-foreground/60" />,
}

function PipelineDots({ r }: { r: Release }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 6 }, (_, k) => (
        <span key={k} className={cn("size-1.5 rounded-full", k < r.pipeline ? (r.status === "Failed" && k === r.pipeline - 1 ? "bg-destructive" : "bg-success") : r.status === "Running" && k === r.pipeline ? "bg-info" : "bg-muted")} />
      ))}
    </div>
  )
}

function StageList({ r }: { r: Release }) {
  return (
    <ol className="flex flex-col">
      {stagesOf(r).map((s) => (
        <li key={s.name} className={cn("flex items-start gap-2.5 py-1.5", s.state === "pending" && "text-muted-foreground")}>
          <span className="mt-0.5">{stageIcon[s.state]}</span>
          <div className="min-w-0 flex-1">
            <div className="text-sm">{s.name}</div>
            {s.note && s.state !== "pending" && <div className="text-xs text-muted-foreground">{s.note}</div>}
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{s.took}</span>
        </li>
      ))}
    </ol>
  )
}

const healthConfig = { errors: { label: "Error rate", color: "var(--destructive)" }, p95: { label: "p95 ms", color: "var(--info)" } } satisfies ChartConfig

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0">{children}</span>
    </div>
  )
}

type Actions = { onRollBack?: (r: Release) => void; onRetry?: (r: Release) => void }

/** Detail sheet for one deploy: header actions, Pipeline / Logs / Health / Changes tabs and the release facts. */
export function DeploySheet({ release: r, open, onOpenChange, list, onNavigate, onRollBack, onRetry }: {
  release: Release | undefined; open: boolean; onOpenChange: (o: boolean) => void; list?: Release[]; onNavigate?: (r: Release) => void
} & Actions) {
  const [tab, setTab] = React.useState("pipeline")
  const [paused, setPaused] = React.useState<string[]>([])
  if (!r) return null
  const idx = list?.findIndex((x) => x.id === r.id) ?? -1
  const h = hash(r.id)
  const health = Array.from({ length: 12 }, (_, i) => ({
    t: `+${i}m`,
    errors: +(((h + i * 13) % 9) / 100 + (r.status === "Failed" && i > 8 ? 2.1 : 0.02)).toFixed(2),
    p95: 40 + ((h + i * 17) % 30) + (r.status === "Failed" && i > 8 ? 180 : 0),
  }))
  const changes = Array.from({ length: r.commits }, (_, i) => ({
    sha: i === 0 ? r.sha : ((h * (i + 3)) % 0xfffffff).toString(16).padStart(7, "0").slice(0, 7),
    msg: i === 0 ? r.message : ["Bump dependencies", "Add tracing spans", "Tidy config keys", "Fix flaky test", "Update runbook link"][(h + i) % 5],
  }))
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg" showCloseButton={false}>
        <SheetHeader className="gap-2 border-b">
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" size="icon-xs" aria-label="Copy deploy ID" onClick={() => navigator.clipboard?.writeText(r.id)} />}><CopyIcon /></TooltipTrigger>
              <TooltipContent>Copy ID</TooltipContent>
            </Tooltip>
            {list && idx >= 0 && (
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                {idx + 1} of {list.length}
                <Button variant="ghost" size="icon-xs" aria-label="Previous deploy" disabled={idx === 0} onClick={() => onNavigate?.(list[idx - 1])}><ChevronUpIcon /></Button>
                <Button variant="ghost" size="icon-xs" aria-label="Next deploy" disabled={idx === list.length - 1} onClick={() => onNavigate?.(list[idx + 1])}><ChevronDownIcon /></Button>
              </span>
            )}
            <SheetClose render={<Button variant="ghost" size="icon-xs" className={cn(!(list && idx >= 0) && "ml-auto")} aria-label="Close" />}><XIcon /></SheetClose>
          </div>
          <SheetTitle className="flex items-center gap-2">{r.service} <span className="font-mono text-sm font-normal text-muted-foreground">{r.version}</span><Badge variant={variant[r.status]}>{r.status}</Badge>{paused.includes(r.id) && r.status === "Running" && <Badge variant="warning-light">Paused</Badge>}</SheetTitle>
          <SheetDescription className="flex items-center gap-1.5 text-xs"><Badge variant="outline">{r.env}</Badge><span className="font-mono">{cluster(r)}</span></SheetDescription>
          <div className="flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-0.5 overflow-hidden rounded-full">
              {stagesOf(r).map((s) => <span key={s.name} className={cn("flex-1", { passed: "bg-success", running: "bg-info", failed: "bg-destructive", rolled: "bg-muted-foreground/40", pending: "bg-muted" }[s.state])} />)}
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">{r.pipeline}/6 · {r.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            {r.status === "Running" && (
              <Button variant="outline" size="sm" onClick={() => setPaused((p) => (p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id]))}>
                {paused.includes(r.id) ? <><PlayIcon /> Resume</> : <><PauseIcon /> Pause</>}
              </Button>
            )}
            {r.status === "Failed" && onRetry && <Button variant="outline" size="sm" onClick={() => onRetry?.(r)}><PlayIcon /> Retry</Button>}
            {(r.status === "Running" || r.status === "Succeeded") && onRollBack && <Button variant="outline" size="sm" onClick={() => onRollBack?.(r)}><RotateCcwIcon /> Roll back</Button>}
          </div>
        </SheetHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="gap-0">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto px-2">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="changes">Changes <Badge variant="outline" size="sm" radius="full">{r.commits}</Badge></TabsTrigger>
          </TabsList>
          <TabsContent value="pipeline" className="px-4 pt-3"><div className="rounded-lg border px-3 py-1"><StageList r={r} /></div></TabsContent>
          <TabsContent value="logs" className="px-4 pt-3">
            <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-[11px] leading-5 text-muted-foreground">
              {stagesOf(r).filter((s) => s.state !== "pending").map((s, i) => `13:${String(40 + i * 2).padStart(2, "0")}:0${i}  ${s.state === "failed" ? "ERROR" : "INFO "}  ${s.name.toLowerCase()} ${s.state}${s.note ? `  ${s.note}` : ""}`).join("\n")}
            </pre>
          </TabsContent>
          <TabsContent value="health" className="px-4 pt-3">
            <ChartContainer config={healthConfig} className="aspect-auto h-40 w-full">
              <AreaChart data={health} margin={{ left: 12, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="t" tickLine={false} axisLine={false} interval={2} />
                <YAxis yAxisId="ms" hide />
                <YAxis yAxisId="err" hide orientation="right" domain={[0, 3]} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area yAxisId="ms" dataKey="p95" stroke="var(--color-p95)" fill="var(--color-p95)" fillOpacity={0.1} isAnimationActive={false} />
                <Area yAxisId="err" dataKey="errors" stroke="var(--color-errors)" fill="var(--color-errors)" fillOpacity={0.1} isAnimationActive={false} />
              </AreaChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="changes" className="flex flex-col gap-2 px-4 pt-3">
            {changes.map((c) => (
              <div key={c.sha} className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="font-mono">{c.sha}</Badge><span className="truncate">{c.msg}</span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
        <div className="divide-y px-4 pb-4">
          <div className="pb-1 text-xs font-medium text-muted-foreground">Release</div>
          <Line label="Service">{r.service}</Line>
          <Line label="Version"><span className="font-mono">{r.version}</span></Line>
          <Line label="Commit"><span className="font-mono">{r.sha}</span> <span className="text-muted-foreground">{r.message}</span></Line>
          <Line label="Image"><span className="font-mono text-xs break-all">registry.acme.com/{r.service}:{r.version}</span></Line>
          <Line label="Author"><span className="flex items-center gap-1.5"><Avatar className="size-5"><AvatarFallback className="text-[9px]">{initials(r.author)}</AvatarFallback></Avatar>{r.author}</span></Line>
          <Line label="Started">{r.started} UTC <span className="text-muted-foreground">· {r.ago}</span></Line>
          <Line label="Duration"><span className="tabular-nums">{r.duration}</span></Line>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const services = [...new Set(demoReleases.map((r) => r.service))].sort()

/** "New deploy" form in a Sheet; `onCreate` gets a Running deploy and the sheet closes. */
export function NewDeploySheet({ open, onOpenChange, onCreate, nextId }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (r: Release) => void; nextId: string }) {
  const [service, setService] = React.useState(services[0])
  const [env, setEnv] = React.useState<Env>("Staging")
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const version = String(f.get("version") || "").trim() || "v1.0.0"
    const message = String(f.get("message") || "").trim() || `Deploy ${service} ${version}`
    onCreate({ service, version, id: nextId, sha: (Date.now() % 0xfffffff).toString(16).padStart(7, "0").slice(0, 7), message, status: "Running", pipeline: 0, duration: "0:00", author: "Shadcn", started: "Oct 22, 14:00", ago: "Just now", env, commits: 1 })
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b">
            <SheetTitle>New deploy</SheetTitle>
            <SheetDescription>Ship a version of a service to an environment.</SheetDescription>
          </SheetHeader>
          <FieldGroup className="flex-1 overflow-y-auto p-4">
            <Field>
              <FieldLabel>Service</FieldLabel>
              <Select value={service} onValueChange={(v) => v && setService(v)} items={services.map((s) => ({ value: s, label: s }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="deploy-version">Version</FieldLabel>
                <Input id="deploy-version" name="version" placeholder="v1.15.0" className="font-mono" />
              </Field>
              <Field>
                <FieldLabel>Environment</FieldLabel>
                <Select value={env} onValueChange={(v) => v && setEnv(v as Env)} items={["Staging", "Sandbox", "Production"].map((s) => ({ value: s, label: s }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Staging", "Sandbox", "Production"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="deploy-message">Notes</FieldLabel>
              <Textarea id="deploy-message" name="message" rows={3} placeholder="What does this deploy change?" />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="deploy-canary">Canary first</FieldLabel>
              <Switch id="deploy-canary" defaultChecked />
            </Field>
          </FieldGroup>
          <SheetFooter className="flex-row justify-end border-t">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="submit">Start deploy</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

type SortKey = "service" | "status" | "pipeline" | "duration" | "author" | "started"
const sorters: Record<SortKey, (a: Release, b: Release) => number> = {
  service: (a, b) => a.service.localeCompare(b.service),
  status: (a, b) => a.status.localeCompare(b.status),
  pipeline: (a, b) => a.pipeline - b.pipeline,
  duration: (a, b) => secs(a.duration) - secs(b.duration),
  author: (a, b) => a.author.localeCompare(b.author),
  started: () => 0,
}
const columns = [["service", "Deploy"], ["commit", "Commit"], ["status", "Status"], ["pipeline", "Pipeline"], ["duration", "Duration"], ["author", "Author"], ["started", "Started"]] as const
const statuses: DeployStatus[] = ["Running", "Succeeded", "Failed", "Rolled back"]
const PAGE = 10

/** Pass `releases` + `onReleasesChange` to control the rows (e.g. to add one from a "New deploy" sheet). */
export function DeployHistory({ releases: controlled, onReleasesChange }: { releases?: Release[]; onReleasesChange?: (r: Release[]) => void }) {
  const [own, setOwn] = React.useState(demoReleases)
  const list = controlled ?? own
  const setList = (next: Release[]) => (onReleasesChange ? onReleasesChange(next) : setOwn(next))
  const [tab, setTab] = React.useState("all")
  const [q, setQ] = React.useState("")
  const [sort, setSort] = React.useState<[SortKey, 1 | -1]>(["started", -1])
  const [page, setPage] = React.useState(0)
  const [only, setOnly] = React.useState<DeployStatus[]>([])
  const [hidden, setHidden] = React.useState<string[]>([])
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  const update = (id: string, patch: Partial<Release>) => setList(list.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const actions: Actions = {
    onRollBack: (r) => update(r.id, { status: "Rolled back" }),
    onRetry: (r) => update(r.id, { status: "Running", pipeline: Math.max(0, r.pipeline - 1), ago: "Just now" }),
  }
  const count = (s?: DeployStatus) => list.filter((r) => !s || r.status === s).length
  const tabs = [["all", "All", count()], ["live", "Live", count("Running")], ["failed", "Failed", count("Failed")], ["rolled", "Rolled back", count("Rolled back")]] as const
  const n = q.trim().toLowerCase()
  const rows = list.filter((r) => {
    if (tab === "live" && r.status !== "Running") return false
    if (tab === "failed" && r.status !== "Failed") return false
    if (tab === "rolled" && r.status !== "Rolled back") return false
    if (only.length && !only.includes(r.status)) return false
    return !n || [r.service, r.id, r.sha, r.message].some((v) => v.toLowerCase().includes(n))
  })
  if (sort[0] === "started") { if (sort[1] === 1) rows.reverse() } else rows.sort((a, b) => sorters[sort[0]](a, b) * sort[1])
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const p = Math.min(page, pages - 1)
  const shown = rows.slice(p * PAGE, p * PAGE + PAGE)
  const show = (k: string) => !hidden.includes(k)
  const opened = list.find((r) => r.id === openId)
  const openRow = (r: Release) => { setOpenId(r.id); setOpen(true) }
  const onSort = (k: SortKey) => setSort(([sk, d]) => [k, sk === k ? (d === 1 ? -1 : 1) : 1])

  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Deploy History</FrameTitle>
            <FrameDescription>{list.length} deploys</FrameDescription>
          </div>
          <Popover>
            <PopoverTrigger render={<Button variant="muted" size="sm" />}><Settings2Icon /> Settings</PopoverTrigger>
            <PopoverContent align="end" className="w-56">
              <PopoverHeader><PopoverTitle>Columns</PopoverTitle><PopoverDescription>Choose what the table shows.</PopoverDescription></PopoverHeader>
              <FieldGroup className="gap-2">
                {columns.slice(1).map(([k, l]) => (
                  <Field key={k} orientation="horizontal">
                    <FieldLabel htmlFor={`col-${k}`} className="font-normal">{l}</FieldLabel>
                    <Switch id={`col-${k}`} size="sm" checked={show(k)} onCheckedChange={(c) => setHidden((h) => (c ? h.filter((x) => x !== k) : [...h, k]))} />
                  </Field>
                ))}
              </FieldGroup>
            </PopoverContent>
          </Popover>
        </FrameHeader>
        <Tabs value={tab} onValueChange={(v) => { setTab(String(v)); setPage(0) }}>
          <TabsList variant="line">
            {tabs.map(([v, l, c]) => (
              <TabsTrigger key={v} value={v}>{l} <Badge variant="outline" size="sm" radius="full">{c}</Badge></TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <InputGroup className="max-w-60">
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
            <InputGroupInput value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} placeholder="Search deploys or commits…" />
          </InputGroup>
          <Popover>
            <PopoverTrigger render={<Button variant="muted" size="sm" />}><FilterIcon /> Filter{only.length > 0 && <Badge size="sm" radius="full">{only.length}</Badge>}</PopoverTrigger>
            <PopoverContent align="end" className="w-52">
              <PopoverHeader><PopoverTitle>Status</PopoverTitle></PopoverHeader>
              <FieldGroup className="gap-2">
                {statuses.map((s) => (
                  <Field key={s} orientation="horizontal">
                    <Checkbox id={`st-${s}`} checked={only.includes(s)} onCheckedChange={(c) => { setOnly((o) => (c ? [...o, s] : o.filter((x) => x !== s))); setPage(0) }} />
                    <FieldLabel htmlFor={`st-${s}`} className="font-normal">{s}</FieldLabel>
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">{count(s)}</span>
                  </Field>
                ))}
              </FieldGroup>
              {only.length > 0 && <Button variant="ghost" size="sm" onClick={() => setOnly([])}>Clear filters</Button>}
            </PopoverContent>
          </Popover>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.filter(([k]) => show(k)).map(([k, h]) => (
                <TableHead key={k}>
                  {k === "commit" ? h : (
                    <button type="button" onClick={() => onSort(k)} className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 hover:text-foreground">
                      {h}{sort[0] !== k ? <ChevronsUpDownIcon className="size-3.5 text-muted-foreground/60" /> : sort[1] === 1 ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />}
                    </button>
                  )}
                </TableHead>
              ))}
              <TableHead className="w-0"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((r) => (
              <TableRow key={r.id} onClick={() => openRow(r)} data-state={open && openId === r.id ? "selected" : undefined} className="cursor-pointer">
                <TableCell>
                  <button type="button" aria-label={`Open ${r.id}, ${r.service} ${r.version}`} onClick={(e) => { e.stopPropagation(); openRow(r) }} className="text-left font-medium outline-none focus-visible:underline">{r.service}</button>
                  <div className="font-mono text-[11px] text-muted-foreground">{r.version} · {r.id}</div>
                </TableCell>
                {show("commit") && (
                  <TableCell className="max-w-64" onClick={(e) => e.stopPropagation()}>
                    <HoverCard>
                      <HoverCardTrigger delay={200} render={<button type="button" className="block max-w-full text-left" aria-label={`Commit ${r.sha}, ${r.message}`} />}>
                        <span className="flex items-center gap-1 font-mono text-xs"><GitCommitHorizontalIcon className="size-3.5 text-muted-foreground" />{r.sha}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{r.message}</span>
                      </HoverCardTrigger>
                      <HoverCardContent align="start" className="w-72">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><GitCommitHorizontalIcon className="size-3.5" /><span className="font-mono">{r.sha}</span>· {r.commits} commit{r.commits > 1 ? "s" : ""}</div>
                        <div className="mt-1 font-medium">{r.message}</div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Avatar className="size-4"><AvatarFallback className="text-[8px]">{initials(r.author)}</AvatarFallback></Avatar>{r.author} committed {r.ago}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                )}
                {show("status") && <TableCell><Badge variant={variant[r.status]}>{r.status}</Badge></TableCell>}
                {show("pipeline") && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <HoverCard>
                      <HoverCardTrigger delay={200} render={<button type="button" className="flex items-center gap-2" aria-label={`${r.pipeline} of 6 stages passed`} />}>
                        <PipelineDots r={r} />
                        <span className="text-[11px] tabular-nums text-muted-foreground">{r.pipeline}/6</span>
                      </HoverCardTrigger>
                      <HoverCardContent align="start" className="w-64"><StageList r={r} /></HoverCardContent>
                    </HoverCard>
                  </TableCell>
                )}
                {show("duration") && <TableCell className="tabular-nums">{r.duration}</TableCell>}
                {show("author") && (
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <Avatar className="size-5"><AvatarFallback className="text-[9px]">{initials(r.author)}</AvatarFallback></Avatar>
                      {r.author}
                    </span>
                  </TableCell>
                )}
                {show("started") && (
                  <TableCell>
                    <div className="tabular-nums">{r.started}</div>
                    <div className="text-[11px] text-muted-foreground">{r.ago}</div>
                  </TableCell>
                )}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${r.id}`} />}><EllipsisIcon /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Deploy</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openRow(r)}>View details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(r.id)}><CopyIcon /> Copy ID</DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Rollout</DropdownMenuLabel>
                        <DropdownMenuItem disabled={r.status !== "Failed"} onClick={() => actions.onRetry?.(r)}><PlayIcon /> Retry</DropdownMenuItem>
                        <DropdownMenuItem disabled={r.status === "Rolled back" || r.status === "Failed"} onClick={() => actions.onRollBack?.(r)}><RotateCcwIcon /> Roll back</DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setList(list.filter((x) => x.id !== r.id))}><Trash2Icon /> Delete deploy</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {shown.length === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No deploys match.</TableCell></TableRow>}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
          <span>Rows per page {PAGE}</span>
          <span>{rows.length ? p * PAGE + 1 : 0} - {p * PAGE + shown.length} of {rows.length} deploys</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Go to previous page" disabled={p === 0} onClick={() => setPage(p - 1)}><ChevronLeftIcon /></Button>
            {Array.from({ length: pages }, (_, i) => (
              <Button key={i} variant={i === p ? "outline" : "ghost"} size="icon-sm" aria-label={`Go to page ${i + 1}`} aria-current={i === p ? "page" : undefined} onClick={() => setPage(i)}>{i + 1}</Button>
            ))}
            <Button variant="ghost" size="icon-sm" aria-label="Go to next page" disabled={p === pages - 1} onClick={() => setPage(p + 1)}><ChevronRightIcon /></Button>
          </div>
        </div>
      </FramePanel>
      <DeploySheet release={opened} open={open} onOpenChange={setOpen} list={rows} onNavigate={(r) => setOpenId(r.id)} {...actions} />
    </Frame>
  )
}
