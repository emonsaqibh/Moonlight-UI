"use client"

import * as React from "react"
import { TrendingUpIcon } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { volume as defaultVolume } from "@/lib/data/logs-data"

const config = {
  info: { label: "Info", color: "var(--color-sky-500)" },
  warn: { label: "Warn", color: "var(--warning)" },
  error: { label: "Error", color: "var(--destructive)" },
} satisfies ChartConfig

type Totals = { info: number; warn: number; error: number }

const defaultTotals: Totals = { info: 54, warn: 4, error: 4 }

type EventVolumeProps = {
  totals?: Totals
  data?: typeof defaultVolume
  note?: string
}

export function EventVolume({ totals = defaultTotals, data = defaultVolume, note = "+15% vs prior 7d · 6.5% warn" }: EventVolumeProps) {
  const total = totals.info + totals.warn + totals.error
  const [hidden, setHidden] = React.useState<(keyof Totals)[]>([])
  const toggle = (k: keyof Totals) => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]))
  const shown = (["info", "warn", "error"] as const).filter((k) => !hidden.includes(k))
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Event Volume</FrameTitle>
            <FrameDescription>6-hour buckets, UTC</FrameDescription>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground" role="group" aria-label="Levels in the chart">
            {(Object.keys(totals) as (keyof Totals)[]).map((k) => (
              <button key={k} type="button" aria-pressed={!hidden.includes(k)} onClick={() => toggle(k)} className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-opacity hover:bg-muted aria-[pressed=false]:opacity-50">
                <span className="size-2 rounded-full" style={{ background: config[k].color }} />
                {config[k].label} <b className="font-medium text-foreground">{totals[k]}</b>
              </button>
            ))}
          </div>
        </FrameHeader>
        <div className="flex items-baseline gap-3 px-4">
          <span className="text-3xl font-semibold tabular-nums">{total}</span>
          <span className="text-sm text-muted-foreground">events</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><TrendingUpIcon className="size-3.5" />{note}</span>
        </div>
        <ChartContainer config={config} className="h-36 w-full px-2 pt-2">
          <BarChart data={data} margin={{ left: 8, right: 8 }}>
            <XAxis dataKey="bucket" hide />
            <YAxis hide domain={[0, "dataMax + 2"]} />
            <ChartTooltip cursor={{ radius: 2 }} content={<ChartTooltipContent labelFormatter={(_, p) => p[0]?.payload.label} />} />
            {shown.map((k, i) => (
              <Bar key={k} dataKey={k} stackId="a" fill={`var(--color-${k})`} isAnimationActive={false} radius={i === shown.length - 1 ? [2, 2, 0, 0] : i === 0 ? [0, 0, 2, 2] : 0} />
            ))}
          </BarChart>
        </ChartContainer>
      </FramePanel>
    </Frame>
  )
}
