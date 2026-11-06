"use client"

import * as React from "react"
import {
  ChevronDownIcon, ChevronUpIcon, CircleAlertIcon, CopyIcon, EllipsisIcon, EyeIcon, FilterIcon, LayersIcon, PauseIcon, PlayIcon, RefreshCwIcon, SearchIcon,
  SlidersHorizontalIcon, Trash2Icon, XIcon,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { groups as demoGroups, type Source, type SourceStatus } from "@/lib/data/sources-data"
import { cn } from "@/lib/utils"

const variant: Record<SourceStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  Healthy: "success-light",
  Degraded: "warning-light",
  Failing: "destructive-light",
  Paused: "secondary",
}
const statuses: SourceStatus[] = ["Failing", "Degraded", "Paused", "Healthy"]
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("")
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7)
const extra = ["carts", "payment_attempts", "refunds", "customers", "events", "payouts", "disputes", "sessions"]

/** Every dataset of a source: the shown one plus `more` siblings. */
export function datasetsOf(s: Source) {
  const h = hash(s.name)
  return [s.datasets, ...Array.from({ length: Math.max(s.more, s.linked[1] - 1) }, (_, i) => s.datasets.replace(/[^.:/]+$/, extra[(h + i) % extra.length]))].map((name, i) => ({
    name, linked: i < s.linked[0], rows: `${((h * (i + 3)) % 900) / 10 + 1}K`,
  }))
}

const syncConfig = {
  succeeded: { label: "Succeeded", color: "var(--success)" },
  slow: { label: "Slow", color: "var(--warning)" },
  failed: { label: "Failed", color: "var(--destructive)" },
} satisfies ChartConfig

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  )
}

/** Detail sheet for one source: Sync Now / Pause, Overview, Datasets, Preview and Settings tabs. */
export function SourceSheet({ source: s, open, onOpenChange, list, onNavigate, onSync, onTogglePause, syncing, tab, onTabChange }: {
  source: Source | undefined; open: boolean; onOpenChange: (o: boolean) => void; list?: Source[]; onNavigate?: (s: Source) => void
  onSync?: (s: Source) => void; onTogglePause?: (s: Source) => void; syncing?: boolean; tab: string; onTabChange: (t: string) => void
}) {
  if (!s) return null
  const idx = list?.findIndex((x) => x.name === s.name) ?? -1
  const h = hash(s.name)
  const ds = datasetsOf(s)
  const day = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String((i + 14) % 24).padStart(2, "0")}:00`,
    succeeded: s.status === "Failing" && i > 19 ? 0 : 20 + ((h + i * 7) % 30),
    slow: (h + i) % 9 === 0 ? 8 : 0,
    failed: s.status === "Failing" && i > 19 ? 4 : (h + i) % 13 === 0 ? 2 : 0,
  }))
  const runs = Array.from({ length: 6 }, (_, i) => ({
    at: `${Math.floor((830 - i * 15) / 60)}:${String((830 - i * 15) % 60).padStart(2, "0")}`,
    id: `RUN-${60096 - i - (h % 50)}`,
    failed: s.status === "Failing" && i < 4,
    rows: `${(((h + i * 31) % 200) / 10 + 12).toFixed(1)}K`,
    took: `${40 + ((h + i * 3) % 20)}s`,
  }))
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg" showCloseButton={false}>
        <SheetHeader className="gap-2 border-b">
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs text-muted-foreground">SRC-{100 + (h % 900)}</span>
            {list && idx >= 0 && (
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                {idx + 1} of {list.length}
                <Button variant="ghost" size="icon-xs" aria-label="Previous source" disabled={idx === 0} onClick={() => onNavigate?.(list[idx - 1])}><ChevronUpIcon /></Button>
                <Button variant="ghost" size="icon-xs" aria-label="Next source" disabled={idx === list.length - 1} onClick={() => onNavigate?.(list[idx + 1])}><ChevronDownIcon /></Button>
              </span>
            )}
            <SheetClose render={<Button variant="ghost" size="icon-xs" className={cn(!(list && idx >= 0) && "ml-auto")} aria-label="Close" />}><XIcon /></SheetClose>
          </div>
          <SheetTitle className="flex items-center gap-2">{s.name}<Badge variant={variant[s.status]}>{s.status}</Badge></SheetTitle>
          <SheetDescription className="text-xs">{s.kind} · <span className="font-mono">{s.endpoint}</span> · {s.linked[0]} of {s.linked[1]} datasets linked</SheetDescription>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={syncing || s.status === "Paused"} onClick={() => onSync?.(s)}><RefreshCwIcon className={cn(syncing && "animate-spin")} /> {syncing ? "Syncing…" : "Sync Now"}</Button>
            <Button variant="outline" size="sm" onClick={() => onTogglePause?.(s)}>{s.status === "Paused" ? <><PlayIcon /> Resume</> : <><PauseIcon /> Pause</>}</Button>
            <Button variant="outline" size="sm" onClick={() => onTabChange("preview")}><EyeIcon /> Preview</Button>
          </div>
        </SheetHeader>
        <Tabs value={tab} onValueChange={(v) => onTabChange(String(v))} className="gap-0">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto px-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="datasets">Datasets <Badge variant="outline" size="sm" radius="full">{ds.length}</Badge></TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="flex flex-col gap-4 p-4">
            {(s.status === "Failing" || s.status === "Degraded") && (
              <div className={cn("flex gap-2 rounded-lg border p-3 text-xs", s.status === "Failing" ? "border-destructive/20 bg-destructive/5" : "border-warning/20 bg-warning/5")}>
                <CircleAlertIcon className={cn("size-4 shrink-0", s.status === "Failing" ? "text-destructive" : "text-warning")} />
                <div>
                  <div className="font-medium">{s.status === "Failing" ? "Authentication Failing" : "Syncs Running Slow"}</div>
                  <div className="text-muted-foreground">{s.status === "Failing" ? "Password authentication failed for user strata_sync since 13:05 UTC. Linked datasets hold their last good sync." : "Recent runs take over twice their usual time. Data is landing late."}</div>
                </div>
              </div>
            )}
            <Frame>
              <FramePanel className="p-0">
                <FrameHeader><FrameTitle>Last 24 Hours</FrameTitle><FrameDescription>Rows synced per hour</FrameDescription></FrameHeader>
                <ChartContainer config={syncConfig} className="aspect-auto h-36 w-full px-2 pb-2">
                  <BarChart data={day} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} interval={5} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="succeeded" stackId="a" fill="var(--color-succeeded)" fillOpacity={0.6} isAnimationActive={false} />
                    <Bar dataKey="slow" stackId="a" fill="var(--color-slow)" isAnimationActive={false} />
                    <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ChartContainer>
              </FramePanel>
            </Frame>
            <div className="divide-y">
              <div className="pb-1 text-xs font-medium text-muted-foreground">Sync</div>
              <Fact label="Frequency">{s.cadence}</Fact>
              <Fact label="Last sync">{s.lastSync}</Fact>
              <Fact label="Datasets">{s.linked[0]} of {s.linked[1]} linked</Fact>
              <Fact label="Endpoint"><span className="font-mono text-xs">{s.endpoint}</span></Fact>
              <Fact label="Owner"><span className="flex items-center gap-1.5"><Avatar className="size-5"><AvatarFallback className="text-[9px]">{initials(s.owner)}</AvatarFallback></Avatar>{s.owner}</span></Fact>
            </div>
            <div className="flex flex-col">
              <div className="pb-1 text-xs font-medium text-muted-foreground">Recent Runs</div>
              {runs.map((r) => (
                <div key={r.id} className="flex items-center gap-3 border-t py-1.5 text-xs">
                  <span className="tabular-nums text-muted-foreground">{r.at}</span>
                  <span className="font-mono">{r.id}</span>
                  <span className={cn("flex-1 truncate", r.failed ? "text-destructive-foreground" : "text-muted-foreground")}>{r.failed ? "password authentication failed" : `${r.rows} rows`}</span>
                  <span className="tabular-nums text-muted-foreground">{r.took}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="datasets" className="p-4">
            <Table>
              <TableHeader><TableRow><TableHead>Dataset</TableHead><TableHead>Rows</TableHead><TableHead>State</TableHead></TableRow></TableHeader>
              <TableBody>
                {ds.map((d) => (
                  <TableRow key={d.name}>
                    <TableCell className="font-mono text-xs">{d.name}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{d.rows}</TableCell>
                    <TableCell>{d.linked ? <Badge variant="success-light">Linked</Badge> : <Badge variant="outline">Unlinked</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="preview" className="p-4">
            <div className="mb-2 font-mono text-xs text-muted-foreground">{s.datasets} · first 5 rows</div>
            <Table>
              <TableHeader><TableRow><TableHead>id</TableHead><TableHead>created_at</TableHead><TableHead>value</TableHead></TableRow></TableHeader>
              <TableBody>
                {Array.from({ length: 5 }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{(h * (i + 7)).toString(16).slice(0, 8)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">2026-10-22 13:{String(50 - i * 7).padStart(2, "0")}</TableCell>
                    <TableCell className="tabular-nums">{((h * (i + 1)) % 9000) / 100}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="settings" className="p-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Frequency</FieldLabel>
                <Select defaultValue={s.cadence} items={["Streaming", "Every 15m", "Hourly", "Every 6h", "Daily"].map((v) => ({ value: v, label: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Streaming", "Every 15m", "Hourly", "Every 6h", "Daily"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="src-alerts">Failure alerts to #sre-oncall</FieldLabel>
                <Switch id="src-alerts" defaultChecked />
              </Field>
            </FieldGroup>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

const kinds = { Databases: ["Postgres", "Supabase", "Neon", "PlanetScale", "Redis"], Warehouses: ["BigQuery", "Snowflake"], Apps: ["GitHub", "Slack", "Stripe", "Linear"], Files: ["Dropbox", "Google Drive", "S3"] } as const
const owners = ["Kenji Tan", "Mira Stone", "Michael Rodriguez", "Sarah Chen", "Emma Wilson", "Omar Haddad", "Priya Patel", "Leo Grant", "Sofia Romero"]

/** "New Source" form in a Sheet. `onCreate` gets the category and the new source; the sheet closes after submit. */
export function NewSourceSheet({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (group: string, s: Source) => void }) {
  const [group, setGroup] = React.useState<keyof typeof kinds>("Databases")
  const [kind, setKind] = React.useState<string>("Postgres")
  const [owner, setOwner] = React.useState(owners[0])
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get("name") || "").trim() || `${kind.toLowerCase().replace(/\s+/g, "-")}-source`
    onCreate(group, {
      name, kind, endpoint: String(f.get("endpoint") || "").trim() || "pending", status: "Healthy", datasets: String(f.get("dataset") || "").trim() || "default",
      more: 0, linked: [0, 1], lastSync: "Never", cadence: String(f.get("cadence") || "Hourly"), owner,
    })
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b">
            <SheetTitle>New Source</SheetTitle>
            <SheetDescription>Connect a database, warehouse, app or file store.</SheetDescription>
          </SheetHeader>
          <FieldGroup className="flex-1 overflow-y-auto p-4">
            <Field>
              <FieldLabel htmlFor="src-name">Name</FieldLabel>
              <Input id="src-name" name="name" placeholder="orders-db" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select value={group} onValueChange={(v) => { if (!v) return; setGroup(v as keyof typeof kinds); setKind(kinds[v as keyof typeof kinds][0]) }} items={Object.keys(kinds).map((k) => ({ value: k, label: k }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.keys(kinds).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Select value={kind} onValueChange={(v) => v && setKind(v)} items={kinds[group].map((k) => ({ value: k, label: k }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{kinds[group].map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="src-endpoint">Endpoint</FieldLabel>
              <Input id="src-endpoint" name="endpoint" placeholder="db.example.com:5432" className="font-mono" />
            </Field>
            <Field>
              <FieldLabel htmlFor="src-dataset">First dataset</FieldLabel>
              <Input id="src-dataset" name="dataset" placeholder="public.orders" className="font-mono" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Frequency</FieldLabel>
                <Select name="cadence" defaultValue="Hourly" items={["Streaming", "Every 15m", "Hourly", "Daily"].map((v) => ({ value: v, label: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Streaming", "Every 15m", "Hourly", "Daily"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Owner</FieldLabel>
                <Select value={owner} onValueChange={(v) => v && setOwner(v)} items={owners.map((o) => ({ value: o, label: o }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
          <SheetFooter className="flex-row justify-end border-t">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="submit">Add Source</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

type Group = (typeof demoGroups)[number]
const columns = ["Status", "Datasets", "Linked", "Last Sync", "Owner"] as const

/** Pass `groups` + `onGroupsChange` to control the sources (e.g. to add one from a "New Source" sheet). Rows open a detail Sheet. */
export function AllSources({ groups: controlled, onGroupsChange }: { groups?: Group[]; onGroupsChange?: (g: Group[]) => void }) {
  const [own, setOwn] = React.useState(demoGroups)
  const groups = controlled ?? own
  const setGroups = (next: Group[]) => (onGroupsChange ? onGroupsChange(next) : setOwn(next))
  const [q, setQ] = React.useState("")
  const [open, setOpen] = React.useState<Record<string, boolean>>({})
  const [shownGroups, setShownGroups] = React.useState<string[]>(groups.map((g) => g.name))
  const [only, setOnly] = React.useState<SourceStatus[]>([])
  const [hidden, setHidden] = React.useState<string[]>([])
  const [syncing, setSyncing] = React.useState<string[]>([])
  const [openName, setOpenName] = React.useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [sheetTab, setSheetTab] = React.useState("overview")
  const n = q.trim().toLowerCase()
  const all = groups.flatMap((g) => g.sources)
  const unhealthy = all.filter((s) => s.status === "Failing" || s.status === "Degraded").length
  const show = (c: string) => !hidden.includes(c)
  const match = (s: Source) => (!only.length || only.includes(s.status)) && (!n || s.name.toLowerCase().includes(n) || s.kind.toLowerCase().includes(n) || s.datasets.toLowerCase().includes(n))
  const visible = groups.filter((g) => shownGroups.includes(g.name)).flatMap((g) => g.sources.filter(match))

  const latest = React.useRef(groups)
  latest.current = groups
  const update = (name: string, patch: Partial<Source>) => setGroups(latest.current.map((g) => ({ ...g, sources: g.sources.map((s) => (s.name === name ? { ...s, ...patch } : s)) })))
  const sync = (s: Source) => {
    setSyncing((x) => [...x, s.name])
    setTimeout(() => {
      setSyncing((x) => x.filter((v) => v !== s.name))
      update(s.name, s.status === "Failing" ? { lastSync: "Failed just now" } : { lastSync: "Just now", status: "Healthy" })
    }, 1200)
  }
  const togglePause = (s: Source) => update(s.name, { status: s.status === "Paused" ? "Healthy" : "Paused" })
  const remove = (s: Source) => setGroups(groups.map((g) => ({ ...g, sources: g.sources.filter((x) => x.name !== s.name) })))
  const duplicate = (s: Source) => setGroups(groups.map((g) => (g.sources.includes(s) ? { ...g, sources: [...g.sources, { ...s, name: `${s.name}-copy`, lastSync: "Never" }] } : g)))
  const openSource = (s: Source, tab = "overview") => { setOpenName(s.name); setSheetTab(tab); setSheetOpen(true) }
  const opened = all.find((s) => s.name === openName)

  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>All Sources</FrameTitle>
            <FrameDescription>Grouped by category, worst first</FrameDescription>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Sources <b className="font-medium text-foreground">{all.length}</b></span>
            <span>Unhealthy <b className="font-medium text-foreground">{unhealthy}</b></span>
          </div>
        </FrameHeader>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <InputGroup className="max-w-60">
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
            <InputGroupInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sources or datasets…" />
          </InputGroup>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="muted" size="sm" />}><LayersIcon /> Categories</DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Shown categories</DropdownMenuLabel>
                  {groups.map((g) => (
                    <DropdownMenuCheckboxItem key={g.name} checked={shownGroups.includes(g.name)} onCheckedChange={(c) => setShownGroups((x) => (c ? [...x, g.name] : x.filter((v) => v !== g.name)))}>
                      {g.name}<span className="ml-auto text-xs text-muted-foreground">{g.sources.length}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShownGroups(groups.map((g) => g.name))}>Show All</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover>
              <PopoverTrigger render={<Button variant="muted" size="sm" />}><FilterIcon /> Filter{only.length > 0 && <Badge size="sm" radius="full">{only.length}</Badge>}</PopoverTrigger>
              <PopoverContent align="end" className="w-52">
                <PopoverHeader><PopoverTitle>Status</PopoverTitle></PopoverHeader>
                <FieldGroup className="gap-2">
                  {statuses.map((s) => (
                    <Field key={s} orientation="horizontal">
                      <Checkbox id={`src-st-${s}`} checked={only.includes(s)} onCheckedChange={(c) => setOnly((o) => (c ? [...o, s] : o.filter((x) => x !== s)))} />
                      <FieldLabel htmlFor={`src-st-${s}`} className="font-normal">{s}</FieldLabel>
                      <span className="ml-auto text-xs tabular-nums text-muted-foreground">{all.filter((x) => x.status === s).length}</span>
                    </Field>
                  ))}
                </FieldGroup>
                {only.length > 0 && <Button variant="ghost" size="sm" onClick={() => setOnly([])}>Clear filters</Button>}
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger render={<Button variant="muted" size="sm" />}><SlidersHorizontalIcon /> Display</PopoverTrigger>
              <PopoverContent align="end" className="w-52">
                <PopoverHeader><PopoverTitle>Columns</PopoverTitle></PopoverHeader>
                <FieldGroup className="gap-2">
                  {columns.map((c) => (
                    <Field key={c} orientation="horizontal">
                      <FieldLabel htmlFor={`src-col-${c}`} className="font-normal">{c}</FieldLabel>
                      <Switch id={`src-col-${c}`} size="sm" checked={show(c)} onCheckedChange={(v) => setHidden((h) => (v ? h.filter((x) => x !== c) : [...h, c]))} />
                    </Field>
                  ))}
                </FieldGroup>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {groups.filter((g) => shownGroups.includes(g.name)).map((g) => {
          const sources = g.sources.filter(match)
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
                      {["Source", ...columns.filter(show)].map((h) => <TableHead key={h}>{h}</TableHead>)}
                      <TableHead className="w-0"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources.map((s) => {
                      const busy = syncing.includes(s.name)
                      return (
                        <TableRow key={s.name} onClick={() => openSource(s)} data-state={sheetOpen && openName === s.name ? "selected" : undefined} className="cursor-pointer">
                          <TableCell>
                            <button type="button" aria-label={`Open ${s.name}`} onClick={(e) => { e.stopPropagation(); openSource(s) }} className="text-left font-medium outline-none focus-visible:underline">
                              {s.name} <span className="text-xs font-normal text-muted-foreground">{s.kind}</span>
                            </button>
                            <div className="max-w-56 truncate font-mono text-[11px] text-muted-foreground">{s.endpoint}</div>
                          </TableCell>
                          {show("Status") && <TableCell><Badge variant={variant[s.status]}>{s.status}</Badge></TableCell>}
                          {show("Datasets") && (
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <span className="font-mono text-xs">{s.datasets}</span>
                              {s.more > 0 && (
                                <HoverCard>
                                  <HoverCardTrigger delay={150} render={<button type="button" className="ml-1.5 align-middle" aria-label={`${s.more} more datasets`} />}><Badge variant="outline" size="sm">+{s.more}</Badge></HoverCardTrigger>
                                  <HoverCardContent align="start" className="w-60">
                                    <div className="mb-1.5 text-xs text-muted-foreground">{s.linked[0]} of {s.linked[1]} datasets linked</div>
                                    {datasetsOf(s).map((d) => (
                                      <div key={d.name} className="flex items-center gap-2 py-0.5 text-xs">
                                        <span className={cn("size-1.5 rounded-full", d.linked ? "bg-success" : "bg-muted-foreground/40")} />
                                        <span className="truncate font-mono">{d.name}</span>
                                        <span className="ml-auto tabular-nums text-muted-foreground">{d.rows}</span>
                                      </div>
                                    ))}
                                  </HoverCardContent>
                                </HoverCard>
                              )}
                            </TableCell>
                          )}
                          {show("Linked") && (
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger render={<span className="flex items-center gap-2" />}>
                                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary/70" style={{ width: `${(s.linked[0] / s.linked[1]) * 100}%` }} /></span>
                                  <span className="text-[11px] tabular-nums text-muted-foreground">{s.linked[0]}/{s.linked[1]}</span>
                                </TooltipTrigger>
                                <TooltipContent>{s.linked[0]} of {s.linked[1]} datasets linked</TooltipContent>
                              </Tooltip>
                            </TableCell>
                          )}
                          {show("Last Sync") && (
                            <TableCell>
                              <div className={cn(s.status === "Failing" && "text-destructive-foreground")}>{busy ? "Syncing…" : s.lastSync}</div>
                              <div className="text-[11px] text-muted-foreground">{s.cadence}</div>
                            </TableCell>
                          )}
                          {show("Owner") && (
                            <TableCell>
                              <span className="flex items-center gap-1.5">
                                <Avatar className="size-5"><AvatarFallback className="text-[9px]">{initials(s.owner)}</AvatarFallback></Avatar>
                                {s.owner}
                              </span>
                            </TableCell>
                          )}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <span className="flex items-center">
                              <Tooltip>
                                <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Sync ${s.name}`} disabled={busy || s.status === "Paused"} onClick={() => sync(s)} />}>
                                  <RefreshCwIcon className={cn(busy && "animate-spin")} />
                                </TooltipTrigger>
                                <TooltipContent>{s.status === "Paused" ? "Paused" : "Sync now"}</TooltipContent>
                              </Tooltip>
                              <DropdownMenu>
                                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${s.name}`} />}><EllipsisIcon /></DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem onClick={() => openSource(s)}>View Details</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openSource(s, "preview")}><EyeIcon /> Preview Data</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem disabled={s.status === "Paused"} onClick={() => sync(s)}><RefreshCwIcon /> Sync Now</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => togglePause(s)}>{s.status === "Paused" ? <><PlayIcon /> Resume Syncs</> : <><PauseIcon /> Pause Syncs</>}</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => duplicate(s)}><CopyIcon /> Duplicate</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem variant="destructive" onClick={() => remove(s)}><Trash2Icon /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </section>
          )
        })}
        {visible.length === 0 && <div className="border-t py-10 text-center text-sm text-muted-foreground">No sources match.</div>}
      </FramePanel>
      <SourceSheet
        source={opened} open={sheetOpen} onOpenChange={setSheetOpen} list={visible} onNavigate={(s) => setOpenName(s.name)}
        onSync={sync} onTogglePause={togglePause} syncing={!!opened && syncing.includes(opened.name)} tab={sheetTab} onTabChange={setSheetTab}
      />
    </Frame>
  )
}
