import { CalendarClockIcon, CircleXIcon, LayersIcon, TimerIcon, TrendingUpIcon } from "lucide-react"

import { RunStrip } from "@/components/app/run-strip"
import { Badge } from "@/components/ui/badge"
import { Frame, FrameFooter, FramePanel, FrameTitle } from "@/components/ui/frame"
import { IconTile } from "@/components/ui/icon-tile"
import { Progress } from "@/components/ui/progress"
import { jobs } from "@/lib/data/jobs-data"
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

export function StatCards() {
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
          <span className="truncate font-medium text-foreground">Load test fraud scorer</span>
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
            <Legend tone="bg-destructive">6 below</Legend>
          </>
        }
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold tabular-nums">99.1%</span>
          <Badge variant="warning-light">Below SLO</Badge>
        </div>
        <svg viewBox="0 0 160 40" className="h-10 w-full" preserveAspectRatio="none">
          <line x1="0" y1="28" x2="160" y2="28" stroke="var(--border)" strokeDasharray="3 3" />
          <polyline fill="none" stroke="var(--success)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" points="0,8 20,10 35,9 50,9 62,18 72,10 90,9 108,9 118,14 130,9 142,22 156,34" />
        </svg>
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
          <span className="truncate font-medium text-foreground">Import bank settlement files</span>
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
          <span className="truncate font-medium text-foreground">Drain webhook retry queue</span>
          <Badge variant="destructive-light" className="ml-auto">Failing</Badge>
        </div>
        <Progress value={52} />
      </Stat>
    </div>
  )
}
