"use client"

import * as React from "react"
import { BellOffIcon, SearchIcon, SirenIcon, XIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { slos, sloState, type Slo } from "@/lib/data/services-data"
import { cn } from "@/lib/utils"

const stateColor = { Healthy: "var(--success)", "At Risk": "var(--warning)", Exhausted: "var(--destructive)" } as const

function BudgetRing({ budget }: { budget: number }) {
  const pct = Math.max(0, Math.min(100, budget))
  const r = 7
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 20 20" className="size-5 -rotate-90">
      <circle cx="10" cy="10" r={r} fill="none" stroke="var(--muted)" strokeWidth="3" />
      <circle cx="10" cy="10" r={r} fill="none" stroke={stateColor[sloState(budget)]} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
    </svg>
  )
}

type SloPanelProps = {
  rows: Slo[]
  counts: { all: number; exhausted: number; atrisk: number; healthy: number }
  q: string
  onQuery: (q: string) => void
  tab: string
  onTab: (t: string) => void
  selected: Slo | undefined
  onSelect: (s: Slo) => void
}

function SloPanel({ rows, counts, q, onQuery, tab, onTab, selected, onSelect }: SloPanelProps) {
  const [win, setWin] = React.useState(["own"])
  return (
    <Frame className="min-w-0">
      <FramePanel className="p-0">
        <FrameHeader>
          <FrameTitle>Service reliability</FrameTitle>
          <FrameDescription>18 SLOs · 3 exhausted · 1 paging</FrameDescription>
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
              {["SLO", "Owner", "90 Days", "Budget Left", "Runs Out", "Alert"].map((h) => <TableHead key={h}>{h}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.name} onClick={() => onSelect(s)} data-state={selected?.name === s.name ? "selected" : undefined} className="cursor-pointer">
                <TableCell>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">{s.service} · {s.target} · {s.window}</div>
                </TableCell>
                <TableCell><Avatar className="size-5"><AvatarFallback className="text-[9px]">{s.owner}</AvatarFallback></Avatar></TableCell>
                <TableCell><BudgetRing budget={s.budget} /></TableCell>
                <TableCell>
                  <span className={cn("font-medium tabular-nums", s.budget < 0 ? "text-destructive-foreground" : s.budget < 25 ? "text-warning-foreground" : "text-success-foreground")}>
                    {s.budget > 0 ? "+" : ""}{s.budget.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>{s.runsOut === "Spent" ? <Badge variant="destructive-light">Spent</Badge> : <span className="text-muted-foreground">{s.runsOut}</span>}</TableCell>
                <TableCell>
                  {s.alert === "Paging" ? <Badge variant="destructive-light"><SirenIcon />Paging</Badge>
                    : s.alert === "Muted" ? <Badge variant="secondary"><BellOffIcon />Muted</Badge>
                    : <span className="text-muted-foreground">Quiet</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <FrameFooter className="flex-row justify-between border-t text-xs text-muted-foreground">
          <span>Showing {rows.length} of {slos.length} SLOs · 2 muted</span>
          <span>Measured at own objective · Evaluated Oct 22, 14:00 UTC</span>
        </FrameFooter>
      </FramePanel>
    </Frame>
  )
}

/** Lollipop chart of every SLO's remaining budget, worst to best. */
function BudgetIndex({ list, selected }: { list: Slo[]; selected: Slo | undefined }) {
  const W = 320, H = 300, padL = 40, padR = 12, padT = 12, padB = 12
  const y = (v: number) => padT + ((100 - v) / 200) * (H - padT - padB)
  const x = (i: number) => padL + 10 + (list.length > 1 ? i / (list.length - 1) : 0.5) * (W - padL - padR - 20)
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
            <FrameDescription>{selected ? `${selected.name} · ${selected.budget > 0 ? "+" : ""}${selected.budget}% · ${selected.target} over ${selected.window}` : "No SLO selected"}</FrameDescription>
          </div>
          <Button variant="muted" size="sm">Details</Button>
        </FrameHeader>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full px-2">
          {[100, 50, 0, -50, -100].map((t) => (
            <g key={t}>
              <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeDasharray={t === 0 ? undefined : "3 3"} />
              <text x={padL - 6} y={y(t) + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">{t > 0 ? "+" : ""}{t}%</text>
            </g>
          ))}
          {list.map((s, i) => {
            const c = stateColor[sloState(s.budget)]
            const active = s.name === selected?.name
            return (
              <g key={s.name}>
                <line x1={x(i)} x2={x(i)} y1={y(0)} y2={y(Math.max(-100, Math.min(100, s.budget)))} stroke={c} strokeOpacity={0.35} />
                <circle cx={x(i)} cy={y(s.budget)} r={active ? 5 : 3} fill={c} stroke={active ? "var(--background)" : "none"} strokeWidth={2} />
              </g>
            )
          })}
        </svg>
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

const stateKey = (b: number) => sloState(b).toLowerCase().replace(" ", "") as "exhausted" | "atrisk" | "healthy"

/** `initialQuery` lets a pinned view such as /services/checkout-api open pre-filtered. */
export function ServicesView({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = React.useState(initialQuery)
  const [tab, setTab] = React.useState("all")
  const [picked, setPicked] = React.useState<string | null>(null)

  const n = q.trim().toLowerCase()
  const scoped = slos.filter((s) => !n || s.name.toLowerCase().includes(n) || s.service.toLowerCase().includes(n))
  const rows = scoped.filter((s) => tab === "all" || stateKey(s.budget) === tab)
  const counts = {
    all: scoped.length,
    exhausted: scoped.filter((s) => stateKey(s.budget) === "exhausted").length,
    atrisk: scoped.filter((s) => stateKey(s.budget) === "atrisk").length,
    healthy: scoped.filter((s) => stateKey(s.budget) === "healthy").length,
  }
  const selected = rows.find((s) => s.name === picked) ?? rows[0]

  return (
    <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <SloPanel rows={rows} counts={counts} q={q} onQuery={setQ} tab={tab} onTab={setTab} selected={selected} onSelect={(s) => setPicked(s.name)} />
      <BudgetIndex list={rows} selected={selected} />
    </div>
  )
}
