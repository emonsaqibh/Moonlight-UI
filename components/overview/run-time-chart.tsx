"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { runTimeByHour } from "@/lib/data/jobs-data"

const config = {
  succeeded: { label: "Succeeded", color: "var(--success)" },
  timedOut: { label: "Timed Out", color: "var(--warning)" },
  failed: { label: "Failed", color: "var(--destructive)" },
} satisfies ChartConfig

const totals = [
  ["succeeded", "14h 13m"],
  ["timedOut", "1h 20m"],
  ["failed", "20m 12s"],
] as const

export function RunTimeChart() {
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader>
          <FrameTitle>Run Time</FrameTitle>
          <FrameDescription>Runner time by start hour, UTC</FrameDescription>
        </FrameHeader>
        <div className="flex flex-wrap gap-x-6 gap-y-1 px-4">
          {totals.map(([k, v]) => (
            <div key={k} className="text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-[2px]" style={{ background: config[k].color }} />
                {config[k].label}
              </span>
              <span className="text-sm font-medium tabular-nums">{v}</span>
            </div>
          ))}
        </div>
        <ChartContainer config={config} className="h-44 w-full px-2 pt-3">
          <BarChart data={runTimeByHour} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} interval={5} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="succeeded" stackId="a" fill="var(--color-succeeded)" radius={[0, 0, 2, 2]} />
            <Bar dataKey="timedOut" stackId="a" fill="var(--color-timedOut)" />
            <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ChartContainer>
        <FrameFooter className="flex-row justify-between border-t text-xs text-muted-foreground">
          <span><span className="font-medium text-foreground">15h 53m</span> runner time</span>
          <span>-6% vs prior 24h</span>
          <span>10.5% on failed or timed out runs</span>
        </FrameFooter>
      </FramePanel>
    </Frame>
  )
}
