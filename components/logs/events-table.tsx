"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, BookmarkIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CopyIcon, EyeIcon, FilterIcon, HashIcon, HistoryIcon, LinkIcon, ListChecksIcon, MoreHorizontalIcon, PlusIcon, SearchIcon, Settings2Icon, Trash2Icon, UserIcon, XIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { events as allEvents, type LogEvent, type Level } from "@/lib/data/logs-data"
import { cn } from "@/lib/utils"

const variant: Record<Level, "secondary" | "warning-light" | "destructive-light"> = {
  Info: "secondary",
  Warn: "warning-light",
  Error: "destructive-light",
}
const levels: Level[] = ["Info", "Warn", "Error"]
const initials = (n: string) => n.split(/[ -]/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()
const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => {})

const savedViews: { name: string; match: (e: LogEvent) => boolean }[] = [
  { name: "Needs review", match: (e) => e.review },
  { name: "Open warnings", match: (e) => e.level === "Warn" },
  { name: "Warnings and errors", match: (e) => e.level !== "Info" },
  { name: "Production deploys", match: (e) => /^(deployment|rollout)\./.test(e.event) },
]

type EventsTableProps = {
  events?: LogEvent[]
  /** Name of the saved view, shown as a button and used to describe the active filters. */
  view?: string
  /** Active filter chips, e.g. "Level is Error". */
  filters?: string[]
  /** Called with the rows left after the view, filters and search, e.g. for an Export menu outside the block. */
  onFilteredChange?: (rows: LogEvent[]) => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}

function Copyable({ value }: { value: string }) {
  return (
    <span className="flex items-center gap-1 font-mono text-xs">
      {value}
      <Button variant="ghost" size="icon-xs" aria-label={`Copy ${value}`} onClick={() => copy(value)}><CopyIcon /></Button>
    </span>
  )
}

function EventSheet({ event, rows, reviewed, onOpenChange, onSelect, onReview, onResource }: {
  event: LogEvent | null; rows: LogEvent[]; reviewed: Set<string>
  onOpenChange: (open: boolean) => void; onSelect: (e: LogEvent) => void; onReview: (id: string) => void; onResource: (resource: string) => void
}) {
  const i = event ? rows.indexOf(event) : -1
  const related = event ? rows.filter((r) => r !== event && (r.correlation === event.correlation || r.resource === event.resource)) : []
  const needsReview = event && event.review && !reviewed.has(event.id)
  return (
    <Sheet open={!!event} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 data-[side=right]:sm:max-w-lg" showCloseButton={false}>
        {event && (
          <>
            <SheetHeader className="gap-2 border-b">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="font-mono">{event.id}</span>
                <span className="ml-auto tabular-nums">{i + 1} of {rows.length}</span>
                <Button variant="ghost" size="icon-sm" aria-label="Previous event" disabled={i <= 0} onClick={() => onSelect(rows[i - 1])}><ChevronLeftIcon /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Next event" disabled={i >= rows.length - 1} onClick={() => onSelect(rows[i + 1])}><ChevronRightIcon /></Button>
                <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}><XIcon /></SheetClose>
              </div>
              <SheetTitle className="flex items-center gap-2 font-mono">{event.event}<Badge variant={variant[event.level]}>{event.level}</Badge></SheetTitle>
              <SheetDescription render={<div />} className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs">
                  <Avatar className="size-4"><AvatarFallback className="text-[8px]">{initials(event.owner)}</AvatarFallback></Avatar>
                  {event.owner} · {event.time.replace(/^(\w+ \d+),/, "$1, 2026,")} UTC
                </span>
                <span className="text-foreground">{event.summary}</span>
              </SheetDescription>
            </SheetHeader>
            <Tabs defaultValue="details" className="min-h-0 flex-1 gap-0">
              <TabsList variant="line" className="w-full justify-start border-b px-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="changes">Changes</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
                <TabsTrigger value="related">Related {related.length > 0 && <Badge variant="secondary" size="sm">{related.length}</Badge>}</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="overflow-y-auto p-4">
                {event.note && (
                  <div className={cn("mb-4 rounded-lg border p-3 text-sm", event.level === "Error" ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5")}>
                    <div className="font-medium">{event.level === "Error" ? "Error" : "Warning"}</div>
                    <div className="text-muted-foreground">{event.note}</div>
                  </div>
                )}
                {([
                  ["Actor", [["Name", event.owner], ["Role", event.role], ["Auth", event.auth], ["Session", <Copyable key="s" value={event.session} />], ["Pod IP", <span key="ip" className="font-mono text-xs">{event.ip} <span className="font-sans text-muted-foreground">{event.ipNote ?? "Pod network"}</span></span>], ["User agent", <span key="ua" className="text-xs">{event.agent}</span>]]],
                  ["Target", [["Resource", event.resource], ["Resource ID", <Copyable key="r" value={event.resourceId} />], ["Environment", <Badge key="env" variant="outline">Production</Badge>], ["Cluster", event.cluster], ["Source", event.source]]],
                  ["Request", [["Correlation ID", <Copyable key="c" value={event.correlation} />], ["Trace ID", <Copyable key="t" value={event.trace} />], ["Recorded", <>{event.time} UTC <span className="text-muted-foreground">{event.ago}</span></>], ["Review", needsReview ? <Badge variant="warning-light">Needs review</Badge> : reviewed.has(event.id) ? <Badge variant="success-light">Reviewed</Badge> : "Not required"]]],
                ] as const).map(([title, rows]) => (
                  <section key={title} className="border-b py-2 last:border-0">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase">{title}</h3>
                    <dl className="text-sm">{rows.map(([l, v]) => <Row key={l} label={l}>{v}</Row>)}</dl>
                  </section>
                ))}
              </TabsContent>
              <TabsContent value="changes" className="p-4 text-sm text-muted-foreground">
                {event.ref ? <>Linked to <span className="font-mono text-foreground">{event.ref}</span>. No field changes recorded on this event.</> : "This event records an action, not a change to a resource."}
              </TabsContent>
              <TabsContent value="raw" className="overflow-y-auto p-4">
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[11px] leading-relaxed">{JSON.stringify({ id: event.id, type: event.event, level: event.level.toLowerCase(), actor: event.owner, resource: { name: event.resource, id: event.resourceId }, source: event.source, pod_ip: event.ip, cluster: event.cluster, correlation_id: event.correlation, trace_id: event.trace, message: event.summary }, null, 2)}</pre>
              </TabsContent>
              <TabsContent value="related" className="flex flex-col gap-1 p-2">
                {related.length === 0 && <p className="p-2 text-sm text-muted-foreground">No other events share this request or resource.</p>}
                {related.map((r) => (
                  <button key={r.id} type="button" onClick={() => onSelect(r)} className="flex items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-muted">
                    <Badge variant={variant[r.level]}>{r.level}</Badge>
                    <span className="font-mono text-xs">{r.event}</span>
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums">{r.time}</span>
                  </button>
                ))}
              </TabsContent>
            </Tabs>
            <SheetFooter className="flex-row border-t">
              <Button variant={needsReview ? "default" : "muted"} size="sm" disabled={!needsReview} onClick={() => onReview(event.id)}><CheckIcon /> Mark reviewed</Button>
              <Button variant="muted" size="sm" onClick={() => copy(`${location.origin}${location.pathname}#${event.id}`)}><LinkIcon /> Copy link</Button>
              <Button variant="muted" size="sm" className="ml-auto" onClick={() => onResource(event.resource)}><HistoryIcon /> Resource history</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

const owners = ["Shadcn", "Mira Stone", "Leo Grant", "Priya Patel", "Kenji Tan"]
const sources = ["OTLP", "Console", "Kubernetes", "GitHub Actions", "Synthetics"]
const clusters = ["prod-eu-central-1", "prod-us-east-1"]

function AddEventSheet({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (e: LogEvent) => void }) {
  const [level, setLevel] = React.useState<Level>("Info")
  const [env, setEnv] = React.useState("Production")
  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const f = new FormData(ev.currentTarget)
    const get = (k: string) => String(f.get(k) ?? "").trim()
    const now = new Date()
    const time = now.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone: "UTC" })
    const name = get("resourceName") || "checkout-api"
    const id = get("resourceId")
    onAdd({
      id: `EVT-${Math.random().toString(16).slice(2, 8)}`, time, owner: get("owner") || "Shadcn", event: get("action") || "custom.event", level, resource: name, ref: id || undefined,
      source: get("source") || "OTLP", ip: get("ip") || "10.4.0.40", summary: get("summary") || `${get("action") || "custom.event"} on ${name}.`, role: "Member", auth: "SSO with WebAuthn",
      session: "ses_new", agent: "acme-console", resourceId: id || name.toLowerCase().replace(/[^a-z0-9]+/g, "_"), cluster: get("cluster") || "None", correlation: `req_${now.getTime().toString(36).toUpperCase()}`,
      trace: "—", ago: "just now", review: level !== "Info",
    })
    setLevel("Info")
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Add event</SheetTitle>
          <SheetDescription>Log an event for an Acme service, stamped now.</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Event</FieldLegend>
                <Field><FieldLabel htmlFor="ev-action">Event</FieldLabel><Input id="ev-action" name="action" placeholder="http.request.failed" required autoFocus /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Category</FieldLabel>
                    <Select name="category" defaultValue="infra" items={[{ value: "infra", label: "Infra" }, { value: "deploy", label: "Deploy" }, { value: "access", label: "Access" }]}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="infra">Infra</SelectItem><SelectItem value="deploy">Deploy</SelectItem><SelectItem value="access">Access</SelectItem></SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Level</FieldLabel>
                    <ToggleGroup variant="outline" size="sm" spacing={0} value={[level]} onValueChange={(v) => v[0] && setLevel(v[0] as Level)}>
                      {levels.map((l) => <ToggleGroupItem key={l} value={l}>{l}</ToggleGroupItem>)}
                    </ToggleGroup>
                  </Field>
                </div>
              </FieldSet>
              <FieldSet>
                <FieldLegend>Origin</FieldLegend>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Owner</FieldLabel>
                    <Select name="owner" defaultValue="Shadcn">
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>{owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Source</FieldLabel>
                    <Select name="source" defaultValue="OTLP">
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>{sources.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Environment</FieldLabel>
                  <ToggleGroup variant="outline" size="sm" spacing={0} value={[env]} onValueChange={(v) => v[0] && setEnv(v[0])}>
                    {["Production", "Staging", "Sandbox"].map((l) => <ToggleGroupItem key={l} value={l}>{l}</ToggleGroupItem>)}
                  </ToggleGroup>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Cluster</FieldLabel>
                    <Select name="cluster" defaultValue="prod-eu-central-1">
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>{clusters.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field><FieldLabel htmlFor="ev-ip">Pod IP</FieldLabel><Input id="ev-ip" name="ip" defaultValue="10.4.0.40" className="font-mono" /></Field>
                </div>
              </FieldSet>
              <FieldSet>
                <FieldLegend>Resource</FieldLegend>
                <div className="grid grid-cols-2 gap-3">
                  <Field><FieldLabel htmlFor="ev-res">Name</FieldLabel><Input id="ev-res" name="resourceName" placeholder="POST /v1/checkout" /></Field>
                  <Field><FieldLabel htmlFor="ev-rid">ID</FieldLabel><Input id="ev-rid" name="resourceId" placeholder="4f9ac21e" /></Field>
                </div>
                <FieldDescription>A handle like INC-2209 shows beside the name. Left empty, one is made from the name.</FieldDescription>
              </FieldSet>
              <FieldSet>
                <FieldLegend>Message</FieldLegend>
                <Field><FieldLabel htmlFor="ev-sum">Summary</FieldLabel><Textarea id="ev-sum" name="summary" placeholder="POST /v1/checkout returned 503 in 2.4 s." /></Field>
              </FieldSet>
            </FieldGroup>
          </div>
          <SheetFooter className="flex-row justify-end border-t">
            <SheetClose render={<Button type="button" variant="muted" />}>Cancel</SheetClose>
            <Button type="submit">Add event</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export function EventsTable({ events = allEvents, view, filters, onFilteredChange }: EventsTableProps) {
  const [rows, setRows] = React.useState(events)
  const [chips, setChips] = React.useState(filters ?? [])
  const [viewName, setViewName] = React.useState(view ?? "All events")
  const [q, setQ] = React.useState("")
  const [lv, setLv] = React.useState<Level[]>([])
  const [src, setSrc] = React.useState<string[]>([])
  const [asc, setAsc] = React.useState(false)
  const [dense, setDense] = React.useState("compact")
  const [cols, setCols] = React.useState({ source: true, ip: true })
  const [size, setSize] = React.useState(10)
  const [page, setPage] = React.useState(1)
  const [open, setOpen] = React.useState<LogEvent | null>(null)
  const [adding, setAdding] = React.useState(false)
  const [reviewed, setReviewed] = React.useState<Set<string>>(new Set())

  const views = [{ name: view ?? "All events", match: () => true }, ...savedViews]
  const viewMatch = views.find((v) => v.name === viewName)?.match ?? (() => true)
  const needle = q.trim().toLowerCase()
  const filtered = rows
    .filter((e) => viewMatch(e) && (!lv.length || lv.includes(e.level)) && (!src.length || src.includes(e.source)))
    .filter((e) => !needle || [e.event, e.owner, e.resource, e.ref, e.source, e.ip, e.id, e.correlation].some((v) => v?.toLowerCase().includes(needle)))
  const sorted = asc ? [...filtered].reverse() : filtered
  const filteredKey = sorted.map((e) => e.id).join()
  const report = React.useRef(onFilteredChange)
  report.current = onFilteredChange
  React.useEffect(() => report.current?.(sorted), [filteredKey])
  const pages = Math.max(1, Math.ceil(sorted.length / size))
  const current = Math.min(page, pages)
  const shown = sorted.slice((current - 1) * size, current * size)
  const ownerCount = new Set(filtered.map((e) => e.owner)).size
  const sourceList = [...new Set(rows.map((e) => e.source))]
  const active = lv.length + src.length
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const review = (id: string) => setReviewed((s) => new Set(s).add(id))
  const headers = ["Time", "Owner", "Event", "Level", "Resource", ...(cols.source ? ["Source"] : []), ...(cols.ip ? ["Pod IP"] : []), "Actions"]

  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Events</FrameTitle>
            <FrameDescription>{filtered.length} event{filtered.length === 1 ? "" : "s"} · {ownerCount} owner{ownerCount === 1 ? "" : "s"}</FrameDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="muted" size="sm" onClick={() => setAdding(true)}><PlusIcon /> Add event</Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="muted" size="sm" aria-label={`View, ${viewName}`} />}><BookmarkIcon /> {viewName} <ChevronDownIcon /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Saved views</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={viewName} onValueChange={(v) => { setViewName(v); setPage(1) }}>
                    {views.map((v) => (
                      <DropdownMenuRadioItem key={v.name} value={v.name}>
                        {v.name}<span className="ml-auto text-xs text-muted-foreground tabular-nums">{rows.filter(v.match).length}</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setViewName(views[0].name); setQ(""); setLv([]); setSrc([]) }}>Reset view</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover>
              <PopoverTrigger render={<Button variant="muted" size="sm" aria-label="Display settings" />}><Settings2Icon /> Settings</PopoverTrigger>
              <PopoverContent align="end" className="w-60">
                <Field orientation="horizontal" className="justify-between">
                  <FieldLabel>Density</FieldLabel>
                  <Select value={dense} onValueChange={(v) => setDense(v as string)} items={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }]}>
                    <SelectTrigger size="sm" className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="compact">Compact</SelectItem><SelectItem value="comfortable">Comfortable</SelectItem></SelectContent>
                  </Select>
                </Field>
                <div className="text-xs font-medium text-muted-foreground">Columns</div>
                {([["source", "Source"], ["ip", "Pod IP"]] as const).map(([k, l]) => (
                  <Label key={k} className="font-normal"><Checkbox checked={cols[k]} onCheckedChange={(c) => setCols((s) => ({ ...s, [k]: c }))} />{l}</Label>
                ))}
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger render={<Button variant="muted" size="sm" />}><FilterIcon /> Filter {active > 0 && <Badge variant="outline" size="sm" radius="full">{active}</Badge>}</PopoverTrigger>
              <PopoverContent align="end" className="w-56">
                <div className="text-xs font-medium text-muted-foreground">Level</div>
                {levels.map((l) => (
                  <Label key={l} className="font-normal"><Checkbox checked={lv.includes(l)} onCheckedChange={() => { setLv((s) => toggle(s, l)); setPage(1) }} />{l}<span className="ml-auto text-xs text-muted-foreground">{rows.filter((e) => e.level === l).length}</span></Label>
                ))}
                <div className="text-xs font-medium text-muted-foreground">Source</div>
                {sourceList.map((s) => (
                  <Label key={s} className="font-normal"><Checkbox checked={src.includes(s)} onCheckedChange={() => { setSrc((x) => toggle(x, s)); setPage(1) }} />{s}<span className="ml-auto text-xs text-muted-foreground">{rows.filter((e) => e.source === s).length}</span></Label>
                ))}
                {active > 0 && <Button variant="ghost" size="sm" onClick={() => { setLv([]); setSrc([]) }}>Clear filters</Button>}
              </PopoverContent>
            </Popover>
          </div>
        </FrameHeader>
        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2">
          <InputGroup className="h-7 w-64">
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
            <InputGroupInput placeholder="Search events, services, traces…" aria-label="Search events" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
          </InputGroup>
          {chips.map((f) => <Badge key={f} variant="outline" size="lg">{f}<button type="button" aria-label={`Remove ${f}`} onClick={() => setChips((c) => c.filter((x) => x !== f))}><XIcon /></button></Badge>)}
          {lv.map((l) => <Badge key={l} variant="outline" size="lg">Level is {l}<button type="button" aria-label={`Remove level ${l}`} onClick={() => setLv((s) => toggle(s, l))}><XIcon /></button></Badge>)}
          {src.map((s) => <Badge key={s} variant="outline" size="lg">Source is {s}<button type="button" aria-label={`Remove source ${s}`} onClick={() => setSrc((x) => toggle(x, s))}><XIcon /></button></Badge>)}
          {(chips.length > 0 || active > 0 || q) && <Button variant="ghost" size="sm" onClick={() => { setChips([]); setLv([]); setSrc([]); setQ("") }}>Clear</Button>}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h) => (
                <TableHead key={h}>
                  {h === "Time" ? <Button variant="ghost" size="xs" className="-ml-2" onClick={() => setAsc((a) => !a)}>Time {asc ? <ArrowUpIcon /> : <ArrowDownIcon />}</Button> : h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((e) => (
              <TableRow key={e.id} className={cn("cursor-pointer", dense === "comfortable" && "[&>td]:py-3")} onClick={() => setOpen(e)} data-state={open === e ? "selected" : undefined}>
                <TableCell className="tabular-nums text-muted-foreground">{e.time}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    <Avatar className="size-5"><AvatarFallback className="text-[9px]">{initials(e.owner)}</AvatarFallback></Avatar>
                    {e.owner}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">{e.event}</TableCell>
                <TableCell><Badge variant={variant[e.level]}>{e.level}</Badge></TableCell>
                <TableCell>
                  <div>{e.resource}</div>
                  {e.ref && <div className="text-[11px] text-muted-foreground">{e.ref}</div>}
                </TableCell>
                {cols.source && <TableCell><Badge variant="outline">{e.source}</Badge></TableCell>}
                {cols.ip && <TableCell className="font-mono text-xs text-muted-foreground">{e.ip}</TableCell>}
                <TableCell onClick={(ev) => ev.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${e.id}`} />}><MoreHorizontalIcon /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Event</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setOpen(e)}><EyeIcon /> View details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copy(e.id)}><CopyIcon /> Copy event ID</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copy(e.correlation)}><HashIcon /> Copy correlation ID</DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Narrow</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setQ(e.owner); setPage(1) }}><UserIcon /> Filter by owner</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setQ(e.resource); setPage(1) }}><HistoryIcon /> Resource history</DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled={!e.review || reviewed.has(e.id)} onClick={() => review(e.id)}><ListChecksIcon /> Mark reviewed</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => setRows((r) => r.filter((x) => x !== e))}><Trash2Icon /> Delete event</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {shown.length === 0 && (
              <TableRow><TableCell colSpan={headers.length} className="py-8 text-center text-muted-foreground">No events match these filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            Rows per page
            <Select value={String(size)} onValueChange={(v) => { setSize(Number(v)); setPage(1) }}>
              <SelectTrigger size="sm" aria-label="Rows per page"><SelectValue /></SelectTrigger>
              <SelectContent>{["10", "20", "50"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </span>
          <span>{sorted.length ? (current - 1) * size + 1 : 0} - {Math.min(current * size, sorted.length)} of {sorted.length} events</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Go to previous page" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeftIcon /></Button>
            {Array.from({ length: pages }, (_, k) => k + 1).map((p) => <Button key={p} variant={p === current ? "outline" : "ghost"} size="icon-sm" onClick={() => setPage(p)}>{p}</Button>)}
            <Button variant="ghost" size="icon-sm" aria-label="Go to next page" disabled={current === pages} onClick={() => setPage(current + 1)}><ChevronRightIcon /></Button>
          </div>
        </div>
      </FramePanel>
      <EventSheet event={open} rows={sorted} reviewed={reviewed} onOpenChange={(o) => !o && setOpen(null)} onSelect={setOpen} onReview={review} onResource={(r) => { setOpen(null); setQ(r); setPage(1) }} />
      <AddEventSheet open={adding} onOpenChange={setAdding} onAdd={(e) => { setRows((r) => [e, ...r]); setPage(1); setAsc(false) }} />
    </Frame>
  )
}
