"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, CircleCheckIcon, CircleDashedIcon, CircleXIcon, ClockIcon, GitPullRequestIcon, LoaderCircleIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { deploys as demoDeploys, merges, type Deploy, type DeployState, type Merge } from "@/lib/data/deploy-data"
import { cn } from "@/lib/utils"

const variant: Record<DeployState, React.ComponentProps<typeof Badge>["variant"]> = {
  failed: "destructive-light",
  "rolled-back": "secondary",
  deployed: "success-light",
  checks: "info-light",
  rolling: "primary-light",
  queued: "outline",
  approval: "warning-light",
  scheduled: "outline",
}
const mergeVariant: Record<Merge["state"], React.ComponentProps<typeof Badge>["variant"]> = { merged: "success-light", queued: "outline", checks: "info-light", blocked: "destructive-light" }
const envs = ["Production", "Staging", "Sandbox"] as const
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("")
const checksOf = (d: Deploy) => {
  const m = d.label.match(/(\d+)\/(\d+)/)
  const done = m ? +m[1] : ["deployed", "rolling", "queued", "approval", "scheduled"].includes(d.state) ? 9 : d.state === "failed" ? 4 : 9
  return ["Unit tests", "Integration tests", "Lint", "Type check", "Container scan", "Migrations dry run", "Contract tests", "Smoke test", "SLO budget gate"].map((name, i) => ({
    name,
    state: i < done ? "passed" : d.state === "failed" && i === done ? "failed" : d.state === "checks" && i === done ? "running" : "pending",
  }))
}
const checkIcon = {
  passed: <CircleCheckIcon className="size-4 text-success" />,
  failed: <CircleXIcon className="size-4 text-destructive" />,
  running: <LoaderCircleIcon className="size-4 animate-spin text-info" />,
  pending: <CircleDashedIcon className="size-4 text-muted-foreground/60" />,
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  )
}

/** Detail sheet for one board deploy: approve when it needs approval, Overview / Rollout / Checks / Changes / Log tabs. */
export function BoardDeploySheet({ deploy: d, open, onOpenChange, list, onNavigate, onApprove }: {
  deploy: Deploy | undefined; open: boolean; onOpenChange: (o: boolean) => void; list?: Deploy[]; onNavigate?: (d: Deploy) => void; onApprove?: (d: Deploy) => void
}) {
  const [tab, setTab] = React.useState("overview")
  if (!d) return null
  const idx = list?.findIndex((x) => x.id === d.id) ?? -1
  const prs = merges.filter((m) => m.service === d.service)
  const pct = d.state === "deployed" ? 100 : d.state === "rolling" ? 5 : 0
  const checks = checksOf(d)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg" showCloseButton={false}>
        <SheetHeader className="gap-2 border-b">
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs text-muted-foreground">{d.id}</span>
            {list && idx >= 0 && (
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                {idx + 1} of {list.length}
                <Button variant="ghost" size="icon-xs" aria-label="Previous deploy" disabled={idx === 0} onClick={() => onNavigate?.(list[idx - 1])}><ChevronUpIcon /></Button>
                <Button variant="ghost" size="icon-xs" aria-label="Next deploy" disabled={idx === list.length - 1} onClick={() => onNavigate?.(list[idx + 1])}><ChevronDownIcon /></Button>
              </span>
            )}
            <SheetClose render={<Button variant="ghost" size="icon-xs" className={cn(!(list && idx >= 0) && "ml-auto")} aria-label="Close" />}><XIcon /></SheetClose>
          </div>
          <SheetTitle className="flex items-center gap-2">{d.service} <span className="font-mono text-sm font-normal text-muted-foreground">{d.version}</span><Badge variant={variant[d.state]}>{d.label}</Badge></SheetTitle>
          <SheetDescription className="flex items-center gap-1.5 text-xs"><Badge variant="outline">{d.env}</Badge><span className="font-mono">{d.region}</span> · from {d.from}</SheetDescription>
          {d.state === "approval" && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-warning/20 bg-warning/5 p-2.5">
              <span className="text-xs text-muted-foreground">Second approval, as release manager</span>
              <Button size="sm" onClick={() => onApprove?.(d)}><CheckIcon /> Approve</Button>
            </div>
          )}
        </SheetHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="gap-0">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto px-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rollout">Rollout</TabsTrigger>
            <TabsTrigger value="checks">Checks</TabsTrigger>
            <TabsTrigger value="changes">Changes <Badge variant="outline" size="sm" radius="full">{prs.length}</Badge></TabsTrigger>
            <TabsTrigger value="log">Log</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Fact label="Region">{d.region}</Fact>
              <Fact label="Window">{d.time} UTC</Fact>
              <Fact label="Traffic">{pct ? `${pct}%` : "None yet"}</Fact>
              <Fact label="Step">{d.env === "Production" ? "Canary" : "Rolling"}</Fact>
              <Fact label="From"><span className="font-mono">{d.from}</span></Fact>
              <Fact label="To"><span className="font-mono">{d.version}</span></Fact>
            </div>
            {d.env === "Production" && (
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium">Approvals <span className="font-normal text-muted-foreground">· {d.state === "approval" ? "1 of 2" : "2 of 2"} approved</span></div>
                {[["Leo Grant", "Code owner", "Approved 13:56"], ["Shadcn", "Release manager", d.state === "approval" ? "Waiting" : "Approved 14:01"]].map(([n, role, st]) => (
                  <div key={n} className="flex items-center gap-2 text-sm">
                    <Avatar className="size-6"><AvatarFallback className="text-[10px]">{initials(n)}</AvatarFallback></Avatar>
                    <div className="flex-1"><div>{n}</div><div className="text-xs text-muted-foreground">{role}</div></div>
                    <Badge variant={st === "Waiting" ? "warning-light" : "success-light"}>{st}</Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="rollout" className="flex flex-col gap-3 p-4">
            {["Canary", "25%", "50%", "100%"].map((s, i) => {
              const v = Math.max(0, Math.min(100, (pct - [0, 5, 25, 50][i]) * (100 / [5, 20, 25, 50][i])))
              return (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-16 text-muted-foreground">{s}</span>
                  <Progress value={v} className="flex-1" />
                  <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{Math.round(v)}%</span>
                </div>
              )
            })}
          </TabsContent>
          <TabsContent value="checks" className="flex flex-col p-4">
            {checks.map((c) => (
              <div key={c.name} className={cn("flex items-center gap-2.5 py-1.5 text-sm", c.state === "pending" && "text-muted-foreground")}>{checkIcon[c.state as keyof typeof checkIcon]}{c.name}</div>
            ))}
          </TabsContent>
          <TabsContent value="changes" className="flex flex-col gap-2 p-4">
            {prs.length ? prs.map((m) => (
              <div key={m.pr} className="flex items-center gap-2 text-sm">
                <GitPullRequestIcon className="size-4 text-muted-foreground" /><span className="font-mono text-xs text-muted-foreground">{m.pr}</span><span className="truncate">{m.title}</span>
              </div>
            )) : <span className="text-sm text-muted-foreground">No pull requests in this deploy.</span>}
          </TabsContent>
          <TabsContent value="log" className="p-4">
            <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-[11px] leading-5 text-muted-foreground">
              {[`${d.time}:00  created ${d.id} ${d.from} -> ${d.version}`, `${d.time}:04  checks ${checks.filter((c) => c.state === "passed").length}/9 passed`, `${d.time}:09  ${d.label.toLowerCase()}`].join("\n")}
            </pre>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

const services = [...new Set(demoDeploys.map((d) => d.service))].sort()

/** "New deploy" form for the board; `onCreate` gets a scheduled deploy (Production needs approval) and the sheet closes. */
export function NewBoardDeploySheet({ open, onOpenChange, onCreate, nextId }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (d: Deploy) => void; nextId: string }) {
  const [service, setService] = React.useState(services[0])
  const [env, setEnv] = React.useState<Deploy["env"]>("Production")
  const [time, setTime] = React.useState("15:00")
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const version = String(f.get("version") || "").trim() || "v1.0.0"
    const approval = env === "Production" && f.get("approval") === "on"
    onCreate({ id: nextId, time, service, version, from: String(f.get("from") || "").trim() || "v0.0.0", env, region: String(f.get("region") || "us-east-1"), state: approval ? "approval" : "scheduled", label: approval ? "Needs approval" : "Scheduled" })
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b">
            <SheetTitle>New deploy</SheetTitle>
            <SheetDescription>Schedule a version into the next deploy window.</SheetDescription>
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
                <FieldLabel htmlFor="board-from">From</FieldLabel>
                <Input id="board-from" name="from" placeholder="v2.40.3" className="font-mono" />
              </Field>
              <Field>
                <FieldLabel htmlFor="board-version">To</FieldLabel>
                <Input id="board-version" name="version" placeholder="v2.41.0" className="font-mono" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Environment</FieldLabel>
                <Select value={env} onValueChange={(v) => v && setEnv(v as Deploy["env"])} items={envs.map((s) => ({ value: s, label: s }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{envs.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Region</FieldLabel>
                <Select name="region" defaultValue="us-east-1" items={["us-east-1", "eu-central-1", "ap-southeast-1"].map((s) => ({ value: s, label: s }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{["us-east-1", "eu-central-1", "ap-southeast-1"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel>Window</FieldLabel>
              <Select value={time} onValueChange={(v) => v && setTime(v)} items={["14:20", "14:40", "15:00", "15:20"].map((s) => ({ value: s, label: `${s} UTC` }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{["14:20", "14:40", "15:00", "15:20"].map((s) => <SelectItem key={s} value={s}>{s} UTC</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="board-approval">Require approval</FieldLabel>
              <Switch id="board-approval" name="approval" defaultChecked disabled={env !== "Production"} />
            </Field>
          </FieldGroup>
          <SheetFooter className="flex-row justify-end border-t">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="submit">Schedule deploy</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/** Pass `deploys` + `onDeploysChange` to control the rows (e.g. to add one from a "New deploy" sheet). Rows open a detail Sheet. */
export function DeployBoard({ deploys: controlled, onDeploysChange }: { deploys?: Deploy[]; onDeploysChange?: (d: Deploy[]) => void }) {
  const [own, setOwn] = React.useState(demoDeploys)
  const list = controlled ?? own
  const setList = (next: Deploy[]) => (onDeploysChange ? onDeploysChange(next) : setOwn(next))
  const [tab, setTab] = React.useState("deploys")
  const [q, setQ] = React.useState("")
  const [env, setEnv] = React.useState("all")
  const [compact, setCompact] = React.useState(false)
  const [region, setRegion] = React.useState(false)
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const n = q.trim().toLowerCase()
  const rows = list.filter((d) => (env === "all" || d.env === env) && (!n || [d.service, d.id, d.version, d.label].some((v) => v.toLowerCase().includes(n))))
  const mergeRows = merges.filter((m) => !n || [m.service, m.title, m.pr].some((v) => v.toLowerCase().includes(n)))
  const openRow = (d: Deploy) => { setOpenId(d.id); setOpen(true) }
  const approve = (d: Deploy) => setList(list.map((x) => (x.id === d.id ? { ...x, state: "queued", label: `Queued ${x.time}` } : x)))
  const cell = cn(compact && "py-1")
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Deploy Board</FrameTitle>
            <FrameDescription>Main ships to production every 20 minutes</FrameDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Next window 14:20
            <Badge variant="outline" className="font-mono tabular-nums"><ClockIcon />14:00 UTC</Badge>
          </div>
        </FrameHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList variant="line">
            <TabsTrigger value="deploys">Deploys <Badge variant="outline" size="sm" radius="full">{list.length}</Badge></TabsTrigger>
            <TabsTrigger value="merges">Merges <Badge variant="outline" size="sm" radius="full">{merges.length}</Badge></TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <InputGroup className="max-w-56">
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
            <InputGroupInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search the board" />
          </InputGroup>
          <div className="flex items-center gap-2">
            <Select value={env} onValueChange={(v) => v && setEnv(v)} items={[{ value: "all", label: "All envs" }, ...envs.map((e) => ({ value: e, label: e }))]}>
              <SelectTrigger size="sm" className="w-32" aria-label="Environment"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All envs</SelectItem>
                {envs.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger render={<Button variant="muted" size="icon" aria-label="Display" />}><SlidersHorizontalIcon /></PopoverTrigger>
              <PopoverContent align="end" className="w-52">
                <PopoverHeader><PopoverTitle>Display</PopoverTitle></PopoverHeader>
                <FieldGroup className="gap-2">
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor="board-compact" className="font-normal">Compact rows</FieldLabel>
                    <Switch id="board-compact" size="sm" checked={compact} onCheckedChange={setCompact} />
                  </Field>
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor="board-region" className="font-normal">Show region</FieldLabel>
                    <Switch id="board-region" size="sm" checked={region} onCheckedChange={setRegion} />
                  </Field>
                </FieldGroup>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {tab === "deploys" ? (
          <Table>
            <TableHeader>
              <TableRow>
                {["Time", "Service", "Version", "Environment", ...(region ? ["Region"] : []), "Status"].map((h) => <TableHead key={h} className="text-xs uppercase tracking-wide text-muted-foreground">{h}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow
                  key={d.id}
                  tabIndex={0}
                  onClick={() => openRow(d)}
                  onKeyDown={(e) => e.key === "Enter" && openRow(d)}
                  data-state={open && openId === d.id ? "selected" : undefined}
                  aria-label={`Open ${d.id}, ${d.service} ${d.version} to ${d.env} ${d.region}, ${d.label}`}
                  className="cursor-pointer"
                >
                  <TableCell className={cell}><Badge variant="outline" className="font-mono tabular-nums">{d.time}</Badge></TableCell>
                  <TableCell className={cn(cell, "font-medium")}>{d.service}</TableCell>
                  <TableCell className={cell}>
                    <Tooltip>
                      <TooltipTrigger render={<span className="inline-flex" />}><Badge variant="outline" className="font-mono">{d.version}</Badge></TooltipTrigger>
                      <TooltipContent>{d.version}, from {d.from}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className={cell}><Badge variant="outline">{d.env}</Badge></TableCell>
                  {region && <TableCell className={cn(cell, "font-mono text-xs text-muted-foreground")}>{d.region}</TableCell>}
                  <TableCell className={cell}>
                    <span className="inline-flex items-center gap-2">
                      <Badge variant={variant[d.state]}>{d.label}</Badge>
                      {d.state === "approval" && <span className="text-xs text-muted-foreground">20 min</span>}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No deploys match.</TableCell></TableRow>}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>{["Time", "Pull request", "Service", "Author", "Status"].map((h) => <TableHead key={h} className="text-xs uppercase tracking-wide text-muted-foreground">{h}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {mergeRows.map((m) => (
                <TableRow key={m.pr}>
                  <TableCell className={cell}><Badge variant="outline" className="font-mono tabular-nums">{m.time}</Badge></TableCell>
                  <TableCell className={cn(cell, "max-w-72")}><div className="truncate font-medium">{m.title}</div><div className="font-mono text-[11px] text-muted-foreground">{m.pr}</div></TableCell>
                  <TableCell className={cell}>{m.service}</TableCell>
                  <TableCell className={cell}><span className="flex items-center gap-1.5"><Avatar className="size-5"><AvatarFallback className="text-[9px]">{initials(m.author)}</AvatarFallback></Avatar>{m.author}</span></TableCell>
                  <TableCell className={cell}><Badge variant={mergeVariant[m.state]} className="capitalize">{m.state}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <FrameFooter className="flex-row justify-between border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" />Needs approval</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Rolling out</span>
          </span>
          <span>All times UTC</span>
        </FrameFooter>
      </FramePanel>
      <BoardDeploySheet deploy={list.find((d) => d.id === openId)} open={open} onOpenChange={setOpen} list={rows} onNavigate={(d) => setOpenId(d.id)} onApprove={approve} />
    </Frame>
  )
}
