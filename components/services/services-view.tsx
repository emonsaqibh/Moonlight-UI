"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, BellOffIcon, ChevronsUpDownIcon, CircleAlertIcon, PanelRightIcon, SearchIcon, SirenIcon, XIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { owners, slos as demoSlos, sloState, type Slo } from "@/lib/data/services-data"
import { cn } from "@/lib/utils"

const stateColor = { Healthy: "var(--success)", "At Risk": "var(--warning)", Exhausted: "var(--destructive)" } as const
const stateVariant = { Healthy: "success-light", "At Risk": "warning-light", Exhausted: "destructive-light" } as const
const pct = (b: number) => `${b > 0 ? "+" : ""}${b.toFixed(1)}%`
const indicatorOf = (s: Slo) => (/latency/i.test(s.name) ? "Latency" : /freshness/i.test(s.name) ? "Freshness" : "Availability")
const windowDays = (w: string) => parseInt(w) || 28
const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${Math.round(m)}m`)

function BudgetRing({ budget }: { budget: number }) {
  const p = Math.max(0, Math.min(100, budget))
  const r = 7
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 20 20" className="size-5 -rotate-90">
      <circle cx="10" cy="10" r={r} fill="none" stroke="var(--muted)" strokeWidth="3" />
      <circle cx="10" cy="10" r={r} fill="none" stroke={stateColor[sloState(budget)]} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} />
    </svg>
  )
}

type SortKey = "name" | "budget" | "runsOut" | "alert"
const runsOutDays = (s: Slo) => (s.runsOut === "Spent" ? -1 : parseInt(s.runsOut) || 9999)
const alertRank = { Paging: 0, Quiet: 1, Muted: 2 } as const
const sorters: Record<SortKey, (a: Slo, b: Slo) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  budget: (a, b) => a.budget - b.budget,
  runsOut: (a, b) => runsOutDays(a) - runsOutDays(b),
  alert: (a, b) => alertRank[a.alert] - alertRank[b.alert],
}

function SortHead({ k, sort, onSort, children }: { k: SortKey; sort: [SortKey, 1 | -1]; onSort: (k: SortKey) => void; children: React.ReactNode }) {
  const Icon = sort[0] !== k ? ChevronsUpDownIcon : sort[1] === 1 ? ArrowUpIcon : ArrowDownIcon
  return (
    <TableHead aria-sort={sort[0] === k ? (sort[1] === 1 ? "ascending" : "descending") : undefined}>
      <button type="button" onClick={() => onSort(k)} className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 hover:text-foreground">
        {children}<Icon className={cn("size-3.5", sort[0] !== k && "text-muted-foreground/60")} />
      </button>
    </TableHead>
  )
}

type SloPanelProps = {
  rows: Slo[]
  total: number
  counts: { all: number; exhausted: number; atrisk: number; healthy: number }
  q: string
  onQuery: (q: string) => void
  tab: string
  onTab: (t: string) => void
  sort: [SortKey, 1 | -1]
  onSort: (k: SortKey) => void
  selected: Slo | undefined
  onOpen: (s: Slo) => void
}

function SloPanel({ rows, total, counts, q, onQuery, tab, onTab, sort, onSort, selected, onOpen }: SloPanelProps) {
  const [win, setWin] = React.useState(["own"])
  return (
    <Frame className="min-w-0">
      <FramePanel className="p-0">
        <FrameHeader>
          <FrameTitle>Service reliability</FrameTitle>
          <FrameDescription>{total} SLOs · {counts.exhausted} exhausted · {rows.filter((s) => s.alert === "Paging").length} paging</FrameDescription>
        </FrameHeader>
        <Tabs value={tab} onValueChange={(v) => onTab(String(v))}>
          <TabsList variant="line">
            {([["all", "All"], ["exhausted", "Exhausted"], ["atrisk", "At Risk"], ["healthy", "Healthy"]] as const).map(([v, l]) => (
              <TabsTrigger key={v} value={v}>{l} <Badge variant="outline" size="sm" radius="full">{counts[v]}</Badge></TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <InputGroup className="max-w-52">
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
            <InputGroupInput value={q} onChange={(e) => onQuery(e.target.value)} placeholder="Search services or SLOs…" />
            {q && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => onQuery("")}><XIcon /></InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          {q && <Button variant="muted" size="sm" onClick={() => onQuery("")}>Reset</Button>}
          <Select defaultValue="own" items={[{ value: "own", label: "Own objective" }, { value: "common", label: "Common window" }]}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="own">Own objective</SelectItem>
              <SelectItem value="common">Common window</SelectItem>
            </SelectContent>
          </Select>
          <ToggleGroup value={win} onValueChange={(v) => v.length && setWin(v)} variant="outline" size="sm">
            {["Own", "7D", "28D", "30D"].map((w) => <ToggleGroupItem key={w} value={w.toLowerCase()}>{w}</ToggleGroupItem>)}
          </ToggleGroup>
          <Select defaultValue="all" items={[{ value: "all", label: "All teams" }, { value: "payments", label: "Payments" }]}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              <SelectItem value="payments">Payments</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead k="name" sort={sort} onSort={onSort}>SLO</SortHead>
              <TableHead>Owner</TableHead>
              <TableHead>90 Days</TableHead>
              <SortHead k="budget" sort={sort} onSort={onSort}>Budget Left</SortHead>
              <SortHead k="runsOut" sort={sort} onSort={onSort}>Runs Out</SortHead>
              <SortHead k="alert" sort={sort} onSort={onSort}>Alert</SortHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.name} onClick={() => onOpen(s)} data-state={selected?.name === s.name ? "selected" : undefined} className="cursor-pointer">
                <TableCell>
                  <button type="button" className="text-left font-medium outline-none focus-visible:underline" onClick={(e) => { e.stopPropagation(); onOpen(s) }}>{s.name}</button>
                  <div className="text-[11px] text-muted-foreground">{s.service} · {s.target} · {s.window}</div>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger render={<span className="inline-flex" />}><Avatar className="size-5"><AvatarFallback className="text-[9px]">{s.owner}</AvatarFallback></Avatar></TooltipTrigger>
                    <TooltipContent>{owners[s.owner] ?? s.owner}</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell><BudgetRing budget={s.budget} /></TableCell>
                <TableCell>
                  <span className={cn("font-medium tabular-nums", s.budget < 0 ? "text-destructive-foreground" : s.budget < 25 ? "text-warning-foreground" : "text-success-foreground")}>{pct(s.budget)}</span>
                </TableCell>
                <TableCell>{s.runsOut === "Spent" ? <Badge variant="destructive-light">Spent</Badge> : <span className="text-muted-foreground">{s.runsOut}</span>}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger render={<span className="inline-flex" />}>
                      {s.alert === "Paging" ? <Badge variant="destructive-light"><SirenIcon />Paging</Badge>
                        : s.alert === "Muted" ? <Badge variant="secondary"><BellOffIcon />Muted</Badge>
                        : <span className="text-muted-foreground">Quiet</span>}
                    </TooltipTrigger>
                    <TooltipContent>
                      {s.alert === "Paging" ? "Fast burn, paging #sre-oncall" : s.alert === "Muted" ? "Burn alerts muted" : "No burn alert firing"}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No SLOs match.</TableCell></TableRow>}
          </TableBody>
        </Table>
        <FrameFooter className="flex-row justify-between border-t text-xs text-muted-foreground">
          <span>Showing {rows.length} of {total} SLOs · {rows.filter((s) => s.alert === "Muted").length} muted</span>
          <span>Measured at own objective · Evaluated Oct 22, 14:00 UTC</span>
        </FrameFooter>
      </FramePanel>
    </Frame>
  )
}

const indexConfig = { budget: { label: "Budget left", color: "var(--success)" } } satisfies ChartConfig

type LollipopProps = { x?: number; y?: number; width?: number; height?: number; payload?: { budget: number; active: boolean } }
function Lollipop({ x = 0, y = 0, width = 0, height = 0, payload }: LollipopProps) {
  if (!payload) return null
  const cx = x + width / 2
  const tip = payload.budget >= 0 ? Math.min(y, y + height) : Math.max(y, y + height)
  const base = payload.budget >= 0 ? Math.max(y, y + height) : Math.min(y, y + height)
  const c = stateColor[sloState(payload.budget)]
  return (
    <g>
      <line x1={cx} x2={cx} y1={base} y2={tip} stroke={c} strokeOpacity={0.35} />
      <circle cx={cx} cy={tip} r={payload.active ? 5 : 3} fill={c} stroke={payload.active ? "var(--background)" : "none"} strokeWidth={2} />
    </g>
  )
}

/** Lollipop chart of every SLO's remaining budget, worst to best. Hover for the value, click a point to select it. */
function BudgetIndex({ list, selected, onPick, onDetails }: { list: Slo[]; selected: Slo | undefined; onPick: (s: Slo) => void; onDetails: () => void }) {
  const ordered = [...list].sort((a, b) => a.budget - b.budget)
  const data = ordered.map((s) => ({ name: s.name, budget: Math.max(-100, Math.min(100, s.budget)), active: s.name === selected?.name }))
  const counts = {
    Healthy: list.filter((s) => sloState(s.budget) === "Healthy").length,
    "At Risk": list.filter((s) => sloState(s.budget) === "At Risk").length,
    Exhausted: list.filter((s) => sloState(s.budget) === "Exhausted").length,
  } as const
  return (
    <Frame className="min-w-0">
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Budget Index</FrameTitle>
            <FrameDescription>{selected ? `${selected.name} · ${pct(selected.budget)} · ${selected.target} over ${selected.window}` : "No SLO selected"}</FrameDescription>
          </div>
          <Button variant="muted" size="sm" onClick={onDetails} disabled={!selected}><PanelRightIcon /> Details</Button>
        </FrameHeader>
        <ChartContainer config={indexConfig} className="aspect-auto h-72 w-full px-2 pb-2">
          <BarChart data={data} margin={{ left: 0, right: 8, top: 14, bottom: 6 }} onClick={(e) => { const s = ordered[Number(e?.activeTooltipIndex)]; if (s) onPick(s) }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis domain={[-100, 100]} ticks={[100, 50, 0, -50, -100]} tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`} tickLine={false} axisLine={false} width={44} />
            <ReferenceLine y={0} stroke="var(--border)" />
            <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<ChartTooltipContent hideIndicator formatter={(v) => <span className="font-medium tabular-nums">{pct(Number(v))} budget left</span>} />} />
            <Bar dataKey="budget" shape={(p: unknown) => <Lollipop {...(p as LollipopProps)} />} isAnimationActive={false} className="cursor-pointer" />
          </BarChart>
        </ChartContainer>
        <div className="flex items-center gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
          {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: stateColor[k] }} />
              {k} <b className="font-medium text-foreground">{counts[k]}</b>
            </span>
          ))}
        </div>
      </FramePanel>
    </Frame>
  )
}

const burnConfig = { left: { label: "Budget left", color: "var(--primary)" }, forecast: { label: "Forecast", color: "var(--muted-foreground)" } } satisfies ChartConfig

function burnDown(s: Slo) {
  const days = ["Oct 16", "17", "18", "19", "20", "21", "22", "23", "24", "25"]
  const drop = 100 - s.budget
  return days.map((d, i) => {
    const v = i <= 6 ? 100 - drop * (i === 0 ? 0 : s.budget < 0 ? 0.7 + 0.3 * (i / 6) : (i / 6) ** 0.8) : undefined
    const f = i >= 6 ? s.budget - (drop / 6) * (i - 6) : undefined
    return { day: d, left: v === undefined ? undefined : +v.toFixed(1), forecast: f === undefined ? undefined : +f.toFixed(1) }
  })
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right"><span className="font-medium tabular-nums">{value}</span>{hint && <span className="ml-1.5 text-xs text-muted-foreground">{hint}</span>}</span>
    </div>
  )
}

/** Detail sheet for one SLO: Overview, Burn Rate, Events and Settings tabs. */
export function SloSheet({ slo, open, onOpenChange, onChange }: { slo: Slo | undefined; open: boolean; onOpenChange: (o: boolean) => void; onChange?: (s: Slo) => void }) {
  const [tab, setTab] = React.useState("overview")
  React.useEffect(() => { if (open) setTab("overview") }, [open, slo?.name])
  if (!slo) return null
  const state = sloState(slo.budget)
  const target = parseFloat(slo.target)
  const allowance = windowDays(slo.window) * 1440 * ((100 - target) / 100)
  const spent = 100 - slo.budget
  const attainment = 100 - (100 - target) * (spent / 100)
  const burn = [["1 hour", 14.4, spent / 100 * 3.1], ["6 hours", 6, spent / 100 * 1.9], ["3 days", 1, spent / 100 * 1.1]] as const
  const events = [
    slo.budget < 0 && { t: "Oct 22, 09:14", what: "Budget exhausted", tone: "destructive-light" as const, note: `${pct(slo.budget)} left, deploy freeze on ${slo.service}` },
    slo.budget < 25 && { t: "Oct 20, 18:40", what: "Crossed 25% warning", tone: "warning-light" as const, note: "Ticket opened for the owning team" },
    { t: "Oct 17, 03:22", what: "Incident spent budget", tone: "secondary" as const, note: `INC-${4100 + slo.name.length} used ${Math.max(4, Math.round(spent * 0.6))}% of the budget` },
    { t: "Oct 1, 00:00", what: "Window rolled over", tone: "outline" as const, note: `${slo.window} rolling window` },
  ].filter(Boolean) as { t: string; what: string; tone: React.ComponentProps<typeof Badge>["variant"]; note: string }[]
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 pr-8">{slo.name}<Badge variant={stateVariant[state]}>{state}</Badge></SheetTitle>
          <SheetDescription>{indicatorOf(slo)} · {slo.target} over {windowDays(slo.window)} days · {slo.service}</SheetDescription>
        </SheetHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="gap-0">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto px-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="burn">Burn Rate</TabsTrigger>
            <TabsTrigger value="events">Events <Badge variant="outline" size="sm" radius="full">{events.length}</Badge></TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="flex flex-col gap-4 p-4">
            {state === "Exhausted" && (
              <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs">
                <CircleAlertIcon className="size-4 shrink-0 text-destructive" />
                <div><div className="font-medium">Deploy Freeze</div><div className="text-muted-foreground">The budget is {Math.abs(slo.budget).toFixed(0)}% over. Releases to {slo.service} need SRE approval until it recovers.</div></div>
              </div>
            )}
            <Frame>
              <FramePanel className="p-0">
                <FrameHeader>
                  <FrameTitle>Burn-Down</FrameTitle>
                  <FrameDescription>Budget left, day by day</FrameDescription>
                </FrameHeader>
                <div className="px-4 text-xs text-muted-foreground">
                  <span className={cn("text-xl font-semibold tabular-nums", slo.budget < 0 ? "text-destructive-foreground" : "text-foreground")}>{Math.abs(slo.budget).toFixed(0)}%</span> {slo.budget < 0 ? "over budget" : "left"}
                </div>
                <ChartContainer config={burnConfig} className="aspect-auto h-44 w-full px-2 pb-2">
                  <LineChart data={burnDown(slo)} margin={{ left: 8, right: 12, top: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis hide domain={[Math.min(-50, Math.floor(slo.budget / 25) * 25 - 25), 110]} />
                    <ReferenceLine y={25} stroke="var(--warning)" strokeDasharray="3 3" />
                    <ReferenceLine y={0} stroke="var(--destructive)" strokeOpacity={0.5} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" formatter={(v, n) => <span className="flex w-full justify-between gap-3"><span className="text-muted-foreground">{burnConfig[n as keyof typeof burnConfig]?.label}</span><span className="font-medium tabular-nums">{pct(Number(v))}</span></span>} />} />
                    <Line dataKey="left" stroke={stateColor[state]} strokeWidth={2} dot={{ r: 2.5, fill: stateColor[state] }} isAnimationActive={false} connectNulls={false} />
                    <Line dataKey="forecast" stroke="var(--color-forecast)" strokeDasharray="4 3" dot={false} isAnimationActive={false} />
                  </LineChart>
                </ChartContainer>
              </FramePanel>
            </Frame>
            <div className="divide-y text-sm">
              <div className="pb-1 text-xs font-medium text-muted-foreground">Budget</div>
              <Stat label="Attainment" value={`${attainment.toFixed(3)}%`} hint={`target ${slo.target}`} />
              <Stat label="Allowance" value={fmtMin(allowance)} />
              <Stat label="Spent" value={`${spent.toFixed(0)}%`} hint={`${Math.round((allowance * spent) / 100)} bad minutes`} />
            </div>
            <div className="divide-y text-sm">
              <div className="pb-1 text-xs font-medium text-muted-foreground">Definition</div>
              <Stat label="Indicator" value={indicatorOf(slo)} />
              <Stat label="Owner" value={owners[slo.owner] ?? slo.owner} />
              <Stat label="Alert" value={slo.alert} />
            </div>
          </TabsContent>
          <TabsContent value="burn" className="p-4">
            <Table>
              <TableHeader><TableRow><TableHead>Window</TableHead><TableHead>Burn rate</TableHead><TableHead>Threshold</TableHead><TableHead>State</TableHead></TableRow></TableHeader>
              <TableBody>
                {burn.map(([w, th, rate]) => (
                  <TableRow key={w}>
                    <TableCell>{w}</TableCell>
                    <TableCell className="tabular-nums">{rate.toFixed(2)}×</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{th}×</TableCell>
                    <TableCell>{rate > th ? <Badge variant="destructive-light">Firing</Badge> : <Badge variant="success-light">OK</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="events" className="flex flex-col gap-3 p-4">
            {events.map((e) => (
              <div key={e.what} className="flex items-start gap-3 text-sm">
                <span className="w-24 shrink-0 text-xs tabular-nums text-muted-foreground">{e.t}</span>
                <div className="min-w-0"><Badge variant={e.tone}>{e.what}</Badge><div className="mt-1 text-xs text-muted-foreground">{e.note}</div></div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="settings" className="p-4">
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="slo-page">Page on fast burn</FieldLabel>
                <Switch id="slo-page" defaultChecked />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="slo-ticket">Ticket on slow burn</FieldLabel>
                <Switch id="slo-ticket" defaultChecked />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="slo-mute">Mute alerts</FieldLabel>
                <Switch id="slo-mute" checked={slo.alert === "Muted"} onCheckedChange={(c) => onChange?.({ ...slo, alert: c ? "Muted" : "Quiet" })} />
              </Field>
            </FieldGroup>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

const services = [...new Set(demoSlos.map((s) => s.service))].sort()
const objectives = ["99%", "99.5%", "99.9%", "99.95%", "99.99%"]

/** "New SLO" form in a Sheet. `onCreate` gets the new SLO; the sheet closes after submit. */
export function NewSloSheet({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (s: Slo) => void }) {
  const [service, setService] = React.useState("checkout-api")
  const [indicator, setIndicator] = React.useState("Availability")
  const [objective, setObjective] = React.useState("99.9%")
  const [win, setWin] = React.useState("28d")
  const [owner, setOwner] = React.useState("MS")
  const allowance = parseInt(win) * 1440 * ((100 - parseFloat(objective)) / 100)
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = String(new FormData(e.currentTarget).get("name") || "").trim() || `${service} ${indicator.toLowerCase()}`
    onCreate({ name, service, target: objective, window: win, owner, budget: 100, runsOut: "Never", alert: "Quiet" })
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b">
            <SheetTitle>New SLO</SheetTitle>
            <SheetDescription>Set an objective for a service.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Definition</FieldLegend>
                <Field>
                  <FieldLabel htmlFor="slo-name">Name</FieldLabel>
                  <Input id="slo-name" name="name" placeholder="Checkout API availability" autoFocus />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Service</FieldLabel>
                    <Select value={service} onValueChange={(v) => v && setService(v)} items={services.map((s) => ({ value: s, label: s }))}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>{services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Indicator</FieldLabel>
                    <Select value={indicator} onValueChange={(v) => v && setIndicator(v)} items={["Availability", "Latency", "Freshness"].map((s) => ({ value: s, label: s }))}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>{["Availability", "Latency", "Freshness"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="slo-good">Good event</FieldLabel>
                  <Textarea id="slo-good" name="good" placeholder="Share of requests answered without a 5xx" rows={2} />
                </Field>
              </FieldSet>
              <FieldSet>
                <FieldLegend>Target</FieldLegend>
                <Field>
                  <FieldLabel>Objective</FieldLabel>
                  <ToggleGroup value={[objective]} onValueChange={(v) => v.length && setObjective(v[0])} variant="outline" size="sm" spacing={0}>
                    {objectives.map((o) => <ToggleGroupItem key={o} value={o}>{o}</ToggleGroupItem>)}
                  </ToggleGroup>
                </Field>
                <Field>
                  <FieldLabel>Rolling window</FieldLabel>
                  <ToggleGroup value={[win]} onValueChange={(v) => v.length && setWin(v[0])} variant="outline" size="sm" spacing={0}>
                    {["7d", "28d", "30d"].map((w) => <ToggleGroupItem key={w} value={w}>{parseInt(w)} days</ToggleGroupItem>)}
                  </ToggleGroup>
                  <FieldDescription>Allows {fmtMin(allowance)} of full outage every {parseInt(win)} days.</FieldDescription>
                </Field>
              </FieldSet>
              <FieldSet>
                <FieldLegend>Alerting</FieldLegend>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="new-page">Page on fast burn</FieldLabel>
                  <Switch id="new-page" defaultChecked />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="new-ticket">Ticket on slow burn</FieldLabel>
                  <Switch id="new-ticket" defaultChecked />
                </Field>
              </FieldSet>
              <Field>
                <FieldLabel>Owner</FieldLabel>
                <Select value={owner} onValueChange={(v) => v && setOwner(v)} items={Object.entries(owners).map(([value, label]) => ({ value, label }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(owners).map(([k, n]) => <SelectItem key={k} value={k}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </div>
          <SheetFooter className="flex-row justify-end border-t">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="submit">Create SLO</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

const stateKey = (b: number) => sloState(b).toLowerCase().replace(" ", "") as "exhausted" | "atrisk" | "healthy"

/**
 * `initialQuery` lets a pinned view such as /services/checkout-api open pre-filtered. Pass `slos` + `onSlosChange` to control
 * the list (e.g. to add rows from a "New SLO" sheet). Rows and the Details button open the SLO in a Sheet.
 */
export function ServicesView({ initialQuery = "", slos: controlled, onSlosChange }: { initialQuery?: string; slos?: Slo[]; onSlosChange?: (s: Slo[]) => void }) {
  const [own, setOwn] = React.useState(demoSlos)
  const list = controlled ?? own
  const setList = (next: Slo[]) => (onSlosChange ? onSlosChange(next) : setOwn(next))
  const [q, setQ] = React.useState(initialQuery)
  const [tab, setTab] = React.useState("all")
  const [sort, setSort] = React.useState<[SortKey, 1 | -1]>(["budget", 1])
  const [picked, setPicked] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  const n = q.trim().toLowerCase()
  const scoped = list.filter((s) => !n || s.name.toLowerCase().includes(n) || s.service.toLowerCase().includes(n))
  const rows = scoped.filter((s) => tab === "all" || stateKey(s.budget) === tab).sort((a, b) => sorters[sort[0]](a, b) * sort[1])
  const counts = {
    all: scoped.length,
    exhausted: scoped.filter((s) => stateKey(s.budget) === "exhausted").length,
    atrisk: scoped.filter((s) => stateKey(s.budget) === "atrisk").length,
    healthy: scoped.filter((s) => stateKey(s.budget) === "healthy").length,
  }
  const selected = rows.find((s) => s.name === picked) ?? [...rows].sort((a, b) => a.budget - b.budget)[0]
  const detail = list.find((s) => s.name === picked) ?? selected
  const openSlo = (s: Slo) => { setPicked(s.name); setOpen(true) }

  return (
    <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <SloPanel
        rows={rows} total={list.length} counts={counts} q={q} onQuery={setQ} tab={tab} onTab={setTab}
        sort={sort} onSort={(k) => setSort(([sk, d]) => [k, sk === k ? (d === 1 ? -1 : 1) : 1])}
        selected={selected} onOpen={openSlo}
      />
      <BudgetIndex list={rows} selected={selected} onPick={(s) => setPicked(s.name)} onDetails={() => selected && openSlo(selected)} />
      <SloSheet slo={detail} open={open} onOpenChange={setOpen} onChange={(s) => setList(list.map((x) => (x.name === s.name ? s : x)))} />
    </div>
  )
}
