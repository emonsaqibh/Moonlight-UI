"use client"

import * as React from "react"
import { CopyIcon, DownloadIcon, FileBracesIcon, FilterIcon, MoreHorizontalIcon, PauseIcon, PlayIcon, RefreshCwIcon, Settings2Icon } from "lucide-react"
import { Bar, BarChart, Cell, ReferenceLine, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { checkRuns, type CheckRun, type RunStatus } from "@/lib/data/monitors-data"
import { cn } from "@/lib/utils"

const metrics = [
  { label: "Success Rate", value: "85.0%", delta: "-10.0 pts", bad: true, spark: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.9, 0.8, 0.6, 0.3, 0.2] },
  { label: "p50 response", value: "8s", delta: "0s", bad: false, spark: [8, 7, 8, 7, 8, 8, 7, 8, 8, 8, 8, 7, 8, 8, 7, 8, 11, 12, 15, 15] },
  { label: "p95 response", value: "15s", delta: "+7s", bad: true, spark: [8, 7, 8, 7, 8, 8, 7, 8, 8, 8, 8, 7, 8, 8, 7, 8, 11, 12, 15, 15] },
  { label: "Timeout Budget", value: "100.0%", delta: "+44.6 pts", bad: true, spark: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
]

function Spark({ data, bad }: { data: number[]; bad: boolean }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 80},${22 - ((v - min) / (max - min || 1)) * 18}`).join(" ")
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-20 shrink-0">
      <polyline fill="none" stroke={bad ? "var(--destructive)" : "var(--success)"} strokeWidth="1.5" points={pts} />
    </svg>
  )
}

const statuses: RunStatus[] = ["Succeeded", "Failed", "Timed Out"]
const tone = { Succeeded: "var(--success)", Failed: "var(--destructive)", "Timed Out": "var(--warning)" } as const
const badge = { Succeeded: "success-light", Failed: "destructive-light", "Timed Out": "warning-light" } as const
const config = { duration: { label: "Duration", color: "var(--success)" } } satisfies ChartConfig
const DEPLOY = "CHK-48207"

function download(name: string, type: string, body: string) {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob([body], { type }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

function IconAction({ label, children, ...props }: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="muted" size="icon-sm" aria-label={label} {...props} />}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function CheckoutFlow() {
  const [runs, setRuns] = React.useState<CheckRun[]>(checkRuns)
  const [active, setActive] = React.useState<number | null>(null)
  const [shown, setShown] = React.useState<RunStatus[]>(statuses)
  const [layers, setLayers] = React.useState({ outliers: true, deploys: true, timeout: true })
  const [paused, setPaused] = React.useState(false)
  const [auto, setAuto] = React.useState("off")
  const [spin, setSpin] = React.useState(false)
  const run = runs[active ?? runs.length - 1]
  const all = shown.length === statuses.length
  const refresh = () => { setSpin(true); setTimeout(() => setSpin(false), 600) }
  const runNow = () => setRuns((r) => {
    const n = Number(r[r.length - 1].id.slice(4)) + 1
    return [...r.slice(1), { id: `CHK-${n}`, started: "Just now", status: "Succeeded", duration: 8, load: 1, steps: 6, confirm: 1, outlier: false }]
  })
  const csv = () => ["id,started,status,duration_s,load_s,steps_s,confirm_s", ...runs.map((r) => [r.id, r.started, r.status, r.duration, r.load, r.steps, r.confirm].join(","))].join("\n")

  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle className="flex items-center gap-2">Checkout flow{paused && <Badge variant="secondary">Paused</Badge>}</FrameTitle>
            <FrameDescription>api.acme.com/checkout · Every 5 min from 6 regions</FrameDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="muted" size="sm" aria-label={`Statuses shown: ${all ? "All Statuses" : shown.join(", ")}`} />}>
                <FilterIcon /> {all ? "All Statuses" : shown.length ? `${shown.length} statuses` : "None"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  {statuses.map((s) => (
                    <DropdownMenuCheckboxItem key={s} checked={shown.includes(s)} onCheckedChange={(c) => setShown((x) => (c ? [...x, s] : x.filter((y) => y !== s)))}>
                      <span className="size-2 rounded-full" style={{ background: tone[s] }} />{s}
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums">{runs.filter((r) => r.status === s).length}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={all} onClick={() => setShown(statuses)}>Show all</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="muted" size="icon-sm" aria-label="Display options" />}><Settings2Icon /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Layers</DropdownMenuLabel>
                  {([["outliers", "Outliers"], ["deploys", "Deploys"], ["timeout", "Timeout line"]] as const).map(([k, l]) => (
                    <DropdownMenuCheckboxItem key={k} checked={layers[k]} onCheckedChange={(c) => setLayers((s) => ({ ...s, [k]: c }))}>{l}</DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="muted" size="icon-sm" aria-label="Refresh" />}><RefreshCwIcon className={cn(spin && "animate-spin")} /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={refresh}><RefreshCwIcon /> Refresh now</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Auto Refresh</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={auto} onValueChange={setAuto}>
                    {[["off", "Off"], ["30s", "Every 30 seconds"], ["1m", "Every minute"], ["5m", "Every 5 minutes"]].map(([v, l]) => <DropdownMenuRadioItem key={v} value={v}>{l}</DropdownMenuRadioItem>)}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <IconAction label={paused ? "Resume schedule" : "Pause schedule"} onClick={() => setPaused((p) => !p)}>{paused ? <PlayIcon /> : <PauseIcon />}</IconAction>
            <IconAction label="Run now" onClick={runNow}><PlayIcon /></IconAction>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="muted" size="icon-sm" aria-label="More actions" />}><MoreHorizontalIcon /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Schedule</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setPaused((p) => !p)}>{paused ? <PlayIcon /> : <PauseIcon />} {paused ? "Resume schedule" : "Pause schedule"}</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Runs</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(runs[runs.length - 1].id).catch(() => {})}><CopyIcon /> Copy last run ID</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Export</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => download("checkout-flow.csv", "text/csv", csv())}><DownloadIcon /> Export CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => download("checkout-flow.json", "application/json", JSON.stringify(runs, null, 2))}><FileBracesIcon /> Export JSON</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </FrameHeader>
        <div className="grid grid-cols-2 border-y @3xl:grid-cols-4 [&>*:not(:last-child)]:border-e">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between gap-2 p-3 px-4">
              <div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
                <div className="text-xl font-semibold tabular-nums">{m.value}</div>
                <div className={m.bad ? "text-[11px] text-destructive-foreground" : "text-[11px] text-muted-foreground"}>{m.delta}</div>
              </div>
              <Spark data={m.spark} bad={m.bad} />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2 text-sm">
          <Badge variant={badge[run.status]}>{run.status}</Badge>
          <span className="font-mono text-xs">{run.id}</span>
          <span className="text-xs text-muted-foreground">{run.started}</span>
          {run.outlier && <Badge variant="outline">Outlier</Badge>}
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">Load {run.load}s · Checkout steps {run.steps}s{run.confirm ? ` · Confirm ${run.confirm}s` : ""}</span>
          <span className="text-sm font-medium tabular-nums">{run.duration}s</span>
        </div>
        <ChartContainer config={config} className="h-24 w-full px-4 pt-3">
          <BarChart data={runs} barCategoryGap={3} onMouseMove={(s) => setActive(s.activeTooltipIndex == null ? null : Number(s.activeTooltipIndex))} onMouseLeave={() => setActive(null)}>
            <XAxis dataKey="id" hide />
            <YAxis hide domain={[0, 16]} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator
                  labelFormatter={(_, p) => <span className="flex items-center gap-2">{p[0]?.payload.id}<span className="font-normal text-muted-foreground">{p[0]?.payload.started}</span></span>}
                  formatter={(_, __, item) => {
                    const r = item.payload as CheckRun
                    return (
                      <div className="grid w-full gap-1">
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: tone[r.status] }} />{r.status}{r.outlier && <span className="text-muted-foreground">· Outlier</span>}<span className="ml-auto font-mono font-medium tabular-nums">{r.duration}s</span></span>
                        <span className="text-muted-foreground tabular-nums">Load {r.load}s · Steps {r.steps}s · Confirm {r.confirm}s</span>
                      </div>
                    )
                  }}
                />
              }
            />
            {layers.timeout && <ReferenceLine y={15} stroke="var(--warning)" strokeDasharray="3 3" />}
            {layers.deploys && <ReferenceLine x={DEPLOY} stroke="var(--muted-foreground)" strokeDasharray="2 2" label={{ value: "v3.5.0", position: "insideTopRight", fontSize: 10, fill: "var(--muted-foreground)" }} />}
            <Bar dataKey="duration" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {runs.map((r, i) => (
                <Cell
                  key={r.id}
                  fill={tone[r.status]}
                  fillOpacity={!shown.includes(r.status) ? 0.12 : active !== null && active !== i ? 0.35 : 1}
                  stroke={layers.outliers && r.outlier ? "var(--foreground)" : undefined}
                  strokeDasharray={layers.outliers && r.outlier ? "2 2" : undefined}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <FrameFooter className="flex-row justify-between border-t text-xs text-muted-foreground">
          <span className="flex gap-3"><span>Load</span><span>Checkout steps</span><span>Confirm</span></span>
          <span className="flex gap-3"><span>p50 to p95</span><span>Outlier</span><span>Deploy</span><span>Timeout</span></span>
        </FrameFooter>
      </FramePanel>
    </Frame>
  )
}
