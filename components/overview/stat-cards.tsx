"use client"

import { Area, AreaChart, Dot, ReferenceLine, YAxis } from "recharts"
import { CalendarClockIcon, CircleXIcon, LayersIcon, TimerIcon, TrendingUpIcon } from "lucide-react"

import { RunStrip } from "@/components/app/run-strip"
import { Badge } from "@/components/ui/badge"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Frame, FrameFooter, FramePanel, FrameTitle } from "@/components/ui/frame"
import { IconTile } from "@/components/ui/icon-tile"
import { Progress } from "@/components/ui/progress"
import { jobs, successRateByHour } from "@/lib/data/jobs-data"
import { cn } from "@/lib/utils"

function Stat({ title, icon, children, footer }: { title: string; icon: React.ReactNode; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <Frame className="min-w-0">
      <FramePanel className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <IconTile size="xs" variant="outline">{icon}</IconTile>
          <FrameTitle className="truncate">{title}</FrameTitle>
        </div>
        {children}
      </FramePanel>
      <FrameFooter className="flex-row items-center gap-3 whitespace-nowrap text-xs text-muted-foreground">{footer}</FrameFooter>
    </Frame>
  )
}

function Legend({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-3 w-[3px] rounded-[1px]", tone)} />
      {children}
    </span>
  )
}

function Value({ children, unit }: { children: React.ReactNode; unit?: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-semibold tabular-nums">{children}</span>
      {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
    </div>
  )
}

const SLO = 99.5
const rateConfig = { rate: { label: "Success", color: "var(--success)" } } satisfies ChartConfig

/** A job name that opens the job when `onOpenJob` is given. */
function JobLink({ name, onOpenJob }: { name: string; onOpenJob?: (name: string) => void }) {
  if (!onOpenJob) return <span className="truncate font-medium text-foreground">{name}</span>
  return (
    <button type="button" onClick={() => onOpenJob(name)} className="cursor-pointer truncate text-left font-medium text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline">
      {name}
    </button>
  )
}

export function StatCards({ onOpenJob }: { onOpenJob?: (name: string) => void }) {
  const strip = jobs.flatMap((j) => j.runs).slice(0, 36)
  return (
    <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
      <Stat
        title="Active Jobs"
        icon={<LayersIcon />}
        footer={
          <>
            <Legend tone="bg-success">24 Healthy</Legend>
            <Legend tone="bg-destructive">3 Failing</Legend>
            <Legend tone="bg-info">5 Paused</Legend>
          </>
        }
      >
        <Value unit="of 32">27</Value>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Paused</span>
          <JobLink name="Load test fraud scorer" onOpenJob={onOpenJob} />
          <span className="ml-auto shrink-0">7d ago</span>
        </div>
        <RunStrip runs={strip} className="gap-[3px]" tall />
      </Stat>

      <Stat
        title="Success Rate"
        icon={<TrendingUpIcon />}
        footer={
          <>
            <span>17 of 23 hours in SLO</span>
            <Legend tone="bg-warning">6 below</Legend>
          </>
        }
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold tabular-nums">99.1%</span>
          <Badge variant="warning-light">Below SLO</Badge>
        </div>
        <ChartContainer config={rateConfig} className="aspect-auto h-10 w-full" role="img" aria-label="Success rate by hour: 17 of 23 hours in SLO, lowest 93.2% at 13:00 UTC">
          <AreaChart data={successRateByHour} margin={{ top: 3, right: 3, bottom: 3, left: 3 }}>
            <defs>
              <linearGradient id="success-rate-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-rate)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-rate)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={[92, 100]} />
            <ReferenceLine y={SLO} stroke="var(--border)" strokeDasharray="3 3" />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideIndicator labelKey="hour" labelFormatter={(_, p) => `${p?.[0]?.payload.hour} UTC`} formatter={(v) => <span className="ml-auto font-mono font-medium tabular-nums">{Number(v).toFixed(1)}%</span>} />}
            />
            <Area
              dataKey="rate"
              type="monotone"
              stroke="var(--color-rate)"
              strokeWidth={1.5}
              fill="url(#success-rate-fill)"
              isAnimationActive={false}
              dot={(p) => (p.payload.rate < SLO ? <Dot key={p.index} cx={p.cx} cy={p.cy} r={2} fill="var(--warning)" stroke="none" /> : <g key={p.index} />)}
              activeDot={{ r: 3, fill: "var(--color-rate)", stroke: "var(--background)", strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ChartContainer>
      </Stat>

      <Stat
        title="Failed Runs"
        icon={<CircleXIcon />}
        footer={
          <>
            <Legend tone="bg-destructive">7 Failed</Legend>
            <Legend tone="bg-warning">2 Timed Out</Legend>
          </>
        }
      >
        <Value unit="across 5 jobs">9</Value>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Worst</span>
          <JobLink name="Import bank settlement files" onOpenJob={onOpenJob} />
          <span className="ml-auto shrink-0">4 of 9</span>
        </div>
        <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
          <span className="bg-destructive" style={{ flex: 7 }} />
          <span className="bg-warning" style={{ flex: 2 }} />
        </div>
      </Stat>

      <Stat
        title="Next Run"
        icon={<CalendarClockIcon />}
        footer={
          <>
            <span className="flex items-center gap-1 text-destructive-foreground"><CircleXIcon className="size-3" />13:55 Failed</span>
            <span className="ml-auto">14:05</span>
          </>
        }
      >
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums">in 5m</span>
          <span className="text-xs text-muted-foreground">14:05 UTC</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TimerIcon className="size-3.5" />
          <JobLink name="Drain webhook retry queue" onOpenJob={onOpenJob} />
          <Badge variant="destructive-light" className="ml-auto">Failing</Badge>
        </div>
        <Progress value={52} />
      </Stat>
    </div>
  )
}
