"use client"

import { MoreHorizontalIcon, PauseIcon, PlayIcon, RefreshCwIcon } from "lucide-react"
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { checkRuns } from "@/lib/data/monitors-data"

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

const tone = { Succeeded: "var(--success)", Failed: "var(--destructive)", "Timed Out": "var(--warning)" } as const
const config = { duration: { label: "Duration", color: "var(--success)" } } satisfies ChartConfig

export function CheckoutFlow() {
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Checkout flow</FrameTitle>
            <FrameDescription>api.acme.com/checkout · Every 5 min from 6 regions</FrameDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="muted" size="sm">All Statuses</Button>
            <Button variant="muted" size="icon-sm" aria-label="Refresh"><RefreshCwIcon /></Button>
            <Button variant="muted" size="icon-sm" aria-label="Pause"><PauseIcon /></Button>
            <Button variant="muted" size="icon-sm" aria-label="Run now"><PlayIcon /></Button>
            <Button variant="muted" size="icon-sm" aria-label="More"><MoreHorizontalIcon /></Button>
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
          <Badge variant="warning-light">Timed Out</Badge>
          <span className="font-mono text-xs">CHK-48210</span>
          <span className="text-xs text-muted-foreground">Oct 22, 14:00 UTC</span>
          <Badge variant="outline">Outlier</Badge>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">Load 1s · Checkout steps 14s</span>
          <span className="text-sm font-medium tabular-nums">15s</span>
        </div>
        <ChartContainer config={config} className="h-24 w-full px-4 pt-3">
          <BarChart data={checkRuns} barCategoryGap={3}>
            <XAxis dataKey="id" hide />
            <YAxis hide domain={[0, "dataMax"]} />
            <Bar dataKey="duration" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {checkRuns.map((r) => <Cell key={r.id} fill={tone[r.status]} />)}
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
