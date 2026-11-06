"use client"

import * as React from "react"
import { ChartColumnIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, FileTextIcon, FilterIcon, GlobeIcon, MoreHorizontalIcon, PauseIcon, PlayIcon, RotateCcwIcon, Settings2Icon, TimerIcon, XIcon } from "lucide-react"
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { IconTile } from "@/components/ui/icon-tile"
import { Input } from "@/components/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Check, type CheckStatus, durationSeconds, formatDuration, type Monitor, monitors as defaultMonitors, nextChecks } from "@/lib/data/monitors-data"
import { cn } from "@/lib/utils"

const checkBadge = { Up: "success-light", Down: "destructive-light", "Timed out": "warning-light" } as const
const checkColor = { Up: "var(--success)", Down: "var(--destructive)", "Timed out": "var(--warning)" } as const
const state = (m: Monitor) => (m.paused ? "Paused" : m.status === "Down" ? "Failing" : "Healthy")
const stateBadge = { Paused: "secondary", Failing: "destructive-light", Healthy: "success-light" } as const
const durConfig = { seconds: { label: "Duration", color: "var(--primary)" } } satisfies ChartConfig

function Summary({ label, value, note, bad }: { label: string; value: React.ReactNode; note: React.ReactNode; bad?: boolean }) {
  return (
    <div className="p-3 px-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      <div className={cn("text-[11px]", bad ? "text-destructive-foreground" : "text-muted-foreground")}>{note}</div>
    </div>
  )
}

function CheckMark({ c, m }: { c: Check; m: Monitor }) {
  return (
    <HoverCard>
      <HoverCardTrigger delay={100} render={<span />} className="flex h-5 w-1.5 items-end justify-center" onClick={(e) => e.stopPropagation()}>
        <span className={cn("w-1.5", c.status === "Up" ? "mb-1.5 size-1.5 rounded-full opacity-60" : c.status === "Down" ? "h-3.5 rounded-sm" : "h-5 rounded-sm")} style={{ background: checkColor[c.status] }} />
      </HoverCardTrigger>
      <HoverCardContent side="top" className="w-56 p-0">
        <div className="flex items-start justify-between gap-2 border-b p-2.5">
          <div>
            <div className="font-medium">{c.at}</div>
            <div className="text-xs text-muted-foreground">{c.ago}</div>
          </div>
          <Badge variant={checkBadge[c.status]}>{c.status}</Badge>
        </div>
        <dl className="grid grid-cols-2 gap-y-1 p-2.5 text-xs">
          <dt className="text-muted-foreground">Duration</dt><dd className="text-right tabular-nums">{c.duration}</dd>
          <dt className="text-muted-foreground">Monitor p95</dt><dd className="text-right tabular-nums">{m.p95}</dd>
          <dt className="text-muted-foreground">Exit code</dt><dd className="text-right tabular-nums">{c.exit}</dd>
          <dt className="text-muted-foreground">Trigger</dt><dd className="text-right">{c.trigger}</dd>
        </dl>
      </HoverCardContent>
    </HoverCard>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

function MonitorSheet({ monitor, list, onOpenChange, onSelect, onRun, onPause, onSave }: {
  monitor: Monitor | null; list: Monitor[]; onOpenChange: (o: boolean) => void; onSelect: (m: Monitor) => void
  onRun: (m: Monitor) => void; onPause: (m: Monitor) => void; onSave: (m: Monitor, patch: Partial<Monitor>) => void
}) {
  const i = monitor ? list.indexOf(monitor) : -1
  const save = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (!monitor) return
    const f = new FormData(ev.currentTarget)
    onSave(monitor, { name: String(f.get("name")) || monitor.name, timeout: String(f.get("timeout")) || monitor.timeout, retries: Number(f.get("retries")) })
  }
  return (
    <Sheet open={!!monitor} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 data-[side=right]:sm:max-w-lg" showCloseButton={false}>
        {monitor && (
          <>
            <SheetHeader className="gap-2 border-b">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="font-mono">{monitor.id}</span>
                <span className="ml-auto tabular-nums">{i + 1} of {list.length}</span>
                <Button variant="ghost" size="icon-sm" aria-label="Previous monitor" disabled={i <= 0} onClick={() => onSelect(list[i - 1])}><ChevronLeftIcon /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Next monitor" disabled={i >= list.length - 1} onClick={() => onSelect(list[i + 1])}><ChevronRightIcon /></Button>
                <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}><XIcon /></SheetClose>
              </div>
              <SheetTitle className="flex items-center gap-2">{monitor.name}<Badge variant={stateBadge[state(monitor)]}>{state(monitor)}</Badge></SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-x-2 text-xs">
                <span className="font-mono">{monitor.cron}</span><span>{monitor.every} UTC</span><span>· {monitor.service}</span>
              </SheetDescription>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onRun(monitor)}><PlayIcon /> Run Now</Button>
                <Button size="sm" variant="muted" onClick={() => onPause(monitor)}>{monitor.paused ? <><PlayIcon /> Resume</> : <><PauseIcon /> Pause</>}</Button>
              </div>
            </SheetHeader>
            <Tabs defaultValue="overview" className="min-h-0 flex-1 gap-0">
              <TabsList variant="line" className="w-full justify-start border-b px-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="checks">Checks <Badge variant="secondary" size="sm">{monitor.checks.length}</Badge></TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="flex flex-col gap-4 overflow-y-auto p-4">
                {monitor.error && !monitor.paused && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <div className="font-medium">HTTP 503</div>
                    <div className="text-muted-foreground">{monitor.error}</div>
                  </div>
                )}
                <section>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">Schedule</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {["Minute", "Hour", "Day", "Month", "Weekday"].map((l, k) => (
                      <div key={l} className="rounded-lg border p-2 text-center">
                        <div className="font-mono text-sm">{monitor.cron.split(" ")[k]}</div>
                        <div className="text-[11px] text-muted-foreground">{l}</div>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase">Details</h3>
                  <dl className="text-sm">
                    <Detail label="Checks">{monitor.every} UTC</Detail>
                    <Detail label="Next Check">{monitor.paused ? "Paused" : <>{nextChecks(monitor, 1)[0][0]} <span className="text-muted-foreground">{nextChecks(monitor, 1)[0][1]}</span></>}</Detail>
                    <Detail label="Concurrency">Forbid <span className="text-muted-foreground">skip if still running</span></Detail>
                    <Detail label="Timeout">{monitor.timeout}</Detail>
                    <Detail label="Retries">{monitor.retries}</Detail>
                    <Detail label="Alerts">Pages #sre-oncall</Detail>
                    <Detail label="Target">{monitor.service} <span className="text-muted-foreground">{monitor.region}</span></Detail>
                    <Detail label="Environment"><Badge variant="outline">Production</Badge></Detail>
                    <Detail label="Owner">{monitor.owner} <span className="text-muted-foreground">{monitor.team}</span></Detail>
                  </dl>
                </section>
                {!monitor.paused && (
                  <section>
                    <h3 className="mb-1 text-xs font-medium text-muted-foreground uppercase">Next 5 Checks</h3>
                    {nextChecks(monitor).map(([at, rel]) => <div key={at} className="flex justify-between py-1 text-sm"><span>{at}</span><span className="text-muted-foreground">{rel}</span></div>)}
                  </section>
                )}
                <section>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase">Check Durations</h3>
                  <p className="text-xs text-muted-foreground">Last {monitor.checks.length} checks · p95 {monitor.p95} of {monitor.timeout} timeout</p>
                  <ChartContainer config={durConfig} className="mt-2 h-24 w-full">
                    <BarChart data={monitor.checks.map((c) => ({ ...c, seconds: durationSeconds(c.duration) }))} barCategoryGap={2}>
                      <XAxis dataKey="at" hide />
                      <YAxis hide domain={[0, "dataMax"]} />
                      <ChartTooltip content={<ChartTooltipContent hideIndicator labelFormatter={(_, p) => p[0]?.payload.at} formatter={(v, _, item) => <span className="flex w-full justify-between gap-4"><span className="text-muted-foreground">{item.payload.status}</span><span className="font-mono tabular-nums">{formatDuration(Number(v))}</span></span>} />} />
                      <Bar dataKey="seconds" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                        {monitor.checks.map((c, k) => <Cell key={k} fill={c.status === "Up" ? "var(--color-seconds)" : checkColor[c.status]} />)}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </section>
                <section>
                  <h3 className="mb-1 text-xs font-medium text-muted-foreground uppercase">{monitor.kind === "http" ? "Request" : "Command"}</h3>
                  <div className="rounded-lg border">
                    <div className="border-b px-3 py-1.5 font-mono text-[11px] text-muted-foreground">{monitor.kind === "http" ? "request.http" : "command.sh"}</div>
                    <pre className="overflow-x-auto p-3 font-mono text-xs">{monitor.request}</pre>
                  </div>
                </section>
              </TabsContent>
              <TabsContent value="checks" className="overflow-y-auto">
                <Table>
                  <TableHeader><TableRow>{["Time", "Status", "Duration", "Exit", "Trigger"].map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
                  <TableBody>
                    {[...monitor.checks].reverse().map((c, k) => (
                      <TableRow key={k}>
                        <TableCell className="tabular-nums">{c.at}<div className="text-[11px] text-muted-foreground">{c.ago}</div></TableCell>
                        <TableCell><Badge variant={checkBadge[c.status]}>{c.status}</Badge></TableCell>
                        <TableCell className="tabular-nums">{c.duration}</TableCell>
                        <TableCell className="tabular-nums">{c.exit}</TableCell>
                        <TableCell>{c.trigger}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="settings" className="overflow-y-auto p-4">
                <form key={monitor.id} onSubmit={save}>
                  <FieldGroup>
                    <Field><FieldLabel htmlFor="mon-name">Name</FieldLabel><Input id="mon-name" name="name" defaultValue={monitor.name} /></Field>
                    <Field><FieldLabel htmlFor="mon-target">Target</FieldLabel><Input id="mon-target" defaultValue={monitor.request} disabled className="font-mono" /></Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field><FieldLabel htmlFor="mon-timeout">Timeout</FieldLabel><Input id="mon-timeout" name="timeout" defaultValue={monitor.timeout} /></Field>
                      <Field><FieldLabel htmlFor="mon-retries">Retries</FieldLabel><Input id="mon-retries" name="retries" type="number" min={0} max={5} defaultValue={monitor.retries} /></Field>
                    </div>
                    <Button type="submit" size="sm" className="self-start">Save changes</Button>
                  </FieldGroup>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

type CheckHistoryProps = {
  /** Controlled list, e.g. when a "New Monitor" sheet elsewhere on the page adds to it. */
  monitors?: Monitor[]
  onMonitorsChange?: React.Dispatch<React.SetStateAction<Monitor[]>>
}

export function CheckHistory({ monitors: controlled, onMonitorsChange }: CheckHistoryProps) {
  const [own, setOwn] = React.useState(defaultMonitors)
  const list = controlled ?? own
  const setList = onMonitorsChange ?? setOwn
  const [show, setShow] = React.useState("all")
  const [windowSize, setWindowSize] = React.useState("20")
  const [sort, setSort] = React.useState("attention")
  const [openId, setOpenId] = React.useState<string | null>(null)

  const checks = list.flatMap((m) => m.checks)
  const count = (s: CheckStatus) => checks.filter((c) => c.status === s).length
  const up = count("Up")
  const failing = list.filter((m) => state(m) === "Failing").length
  const streak = Math.max(0, ...list.map((m) => { let n = 0; for (let k = m.checks.length - 1; k >= 0 && m.checks[k].status !== "Up"; k--) n++; return n }))
  const slowest = [...list].sort((a, b) => durationSeconds(b.p95) - durationSeconds(a.p95))[0]
  const counts = { all: list.length, Failing: failing, Healthy: list.filter((m) => state(m) === "Healthy").length, Paused: list.filter((m) => m.paused).length }
  const rate = (m: Monitor) => m.checks.filter((c) => c.status === "Up").length / (m.checks.length || 1)
  const sorters: Record<string, (a: Monitor, b: Monitor) => number> = {
    attention: (a, b) => Number(state(b) === "Failing") - Number(state(a) === "Failing"),
    rate: (a, b) => rate(a) - rate(b),
    name: (a, b) => a.name.localeCompare(b.name),
  }
  const shown = list.filter((m) => show === "all" || state(m) === show).sort(sorters[sort] ?? (() => 0))
  const open = list.find((m) => m.id === openId) ?? null
  const update = (m: Monitor, patch: Partial<Monitor>) => setList((l) => l.map((x) => (x.id === m.id ? { ...x, ...patch } : x)))
  const runNow = (m: Monitor) => update(m, { ago: "Just now", checks: [...m.checks.slice(1), { at: "Just now", ago: "Just now", status: "Up", duration: m.duration, exit: 0, trigger: "Manual" }] })
  const summary = `${list.length} monitors · ${(up / (checks.length || 1) * 100).toFixed(1)}% success · ${failing} failing`

  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Check history</FrameTitle>
            <FrameDescription>{list.length} monitors · As of Oct 22, 14:00 UTC</FrameDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <Select value={show} onValueChange={(v) => setShow(v as string)} items={[{ value: "all", label: "All monitors" }, { value: "Failing", label: "Failing" }, { value: "Healthy", label: "Healthy" }, { value: "Paused", label: "Paused" }]}>
              <SelectTrigger size="sm" aria-label="Show monitors"><FilterIcon /><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
                  <SelectItem key={k} value={k}>{k === "all" ? "All monitors" : k}<span className="ml-auto text-xs text-muted-foreground">{counts[k]}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="muted" size="icon-sm" aria-label="Display options" />}><Settings2Icon /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Check Window</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={windowSize} onValueChange={setWindowSize}>
                    <DropdownMenuRadioItem value="10"><ChartColumnIcon /> Last 10 Checks</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="20"><ChartColumnIcon /> Last 20 Checks</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                    <DropdownMenuRadioItem value="attention">Needs Attention</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="rate">Success Rate</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="muted" size="icon-sm" aria-label="More actions" />}><MoreHorizontalIcon /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Export</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => {
                    const a = document.createElement("a")
                    a.href = URL.createObjectURL(new Blob([["name,status,uptime,p95", ...list.map((m) => [m.name, state(m), m.uptime, m.p95].join(","))].join("\n")], { type: "text/csv" }))
                    a.download = "check-history.csv"
                    a.click()
                  }}><DownloadIcon /> Download CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(summary).catch(() => {})}><FileTextIcon /> Copy Summary</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setShow("all"); setWindowSize("20"); setSort("attention") }}><RotateCcwIcon /> Reset View</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </FrameHeader>
        <div className="grid grid-cols-2 border-y @3xl:grid-cols-4 [&>*:not(:last-child)]:border-e">
          <Summary label="Success Rate" value={`${(up / (checks.length || 1) * 100).toFixed(1)}%`} note="Down 8.8 pts vs older checks" bad />
          <div className="p-3 px-4">
            <div className="text-xs text-muted-foreground">Checks</div>
            <div className="text-xl font-semibold tabular-nums">{checks.length}</div>
            <div className="mt-1 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
              <span className="bg-success" style={{ flex: up }} />
              <span className="bg-destructive" style={{ flex: count("Down") }} />
              <span className="bg-warning" style={{ flex: count("Timed out") }} />
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">{up} Up, {count("Down")} Down, {count("Timed out")} Timed out, 0 Skipped · {checks.length - up} failed</div>
          </div>
          <Summary label="Failing monitors" value={<>{failing} <span className="text-sm font-normal text-muted-foreground">of {list.length}</span></>} note={`Longest streak ${streak} checks`} />
          <Summary label="Slowest p95" value={slowest?.p95} note={slowest?.name} />
        </div>
        <div className="flex flex-col px-2 py-2">
          {shown.map((m) => (
            <Item key={m.id} size="sm" className="cursor-pointer hover:bg-muted/50" onClick={() => setOpenId(m.id)}>
              <ItemMedia><IconTile size="xs" variant="outline">{m.kind === "http" ? <GlobeIcon /> : <TimerIcon />}</IconTile></ItemMedia>
              <ItemContent>
                <ItemTitle>{m.name}{m.paused && <Badge variant="secondary">Paused</Badge>}</ItemTitle>
                <ItemDescription className="font-mono text-[11px]">{m.target}</ItemDescription>
              </ItemContent>
              <ItemActions className="gap-4 text-xs">
                <span className="hidden items-end gap-1 @3xl:flex" aria-label={`Last ${windowSize} checks`}>
                  {m.checks.slice(-Number(windowSize)).map((c, k) => <CheckMark key={k} c={c} m={m} />)}
                </span>
                <span className={cn("flex items-center gap-1.5", m.status === "Down" ? "text-destructive-foreground" : "text-muted-foreground")}>
                  <span className={cn("size-1.5 rounded-full", m.status === "Down" ? "bg-destructive" : "bg-success")} />{m.status}
                </span>
                <span className="hidden w-16 text-right text-muted-foreground @xl:block">{m.ago}</span>
                <span className="hidden w-14 text-right tabular-nums @xl:block">{m.duration}</span>
                <span className="hidden w-10 text-right tabular-nums @xl:block">{m.uptime}%</span>
                <span className="hidden w-20 text-right tabular-nums text-muted-foreground @xl:block">p95 {m.p95}</span>
              </ItemActions>
            </Item>
          ))}
          {shown.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No monitors match this filter.</p>}
        </div>
        <FrameFooter className="flex-row justify-between border-t text-xs text-muted-foreground">
          <span className="flex gap-3">{(["Up", "Down", "Timed out"] as const).map((s) => <span key={s} className="flex items-center gap-1"><span className="size-1.5 rounded-full" style={{ background: checkColor[s] }} />{s}</span>)}<span>Skipped</span></span>
          <span>Bar height is check duration</span>
        </FrameFooter>
      </FramePanel>
      <MonitorSheet
        monitor={open}
        list={shown}
        onOpenChange={(o) => !o && setOpenId(null)}
        onSelect={(m) => setOpenId(m.id)}
        onRun={runNow}
        onPause={(m) => update(m, { paused: !m.paused })}
        onSave={update}
      />
    </Frame>
  )
}
