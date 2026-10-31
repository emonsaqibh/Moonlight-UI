"use client"

import { ArrowRightIcon, ArrowUpRightIcon, EyeIcon, MoreHorizontalIcon, PauseIcon, TrendingDownIcon, TrendingUpIcon, WrenchIcon } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { IconTile } from "@/components/ui/icon-tile"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { attention, failedSyncs, rowsSynced, syncActivity } from "@/lib/data/sources-data"
import { cn } from "@/lib/utils"

function Spark({ data, color, area }: { data: number[]; color: string; area?: boolean }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const pts = data.map((v, i) => [(i / (data.length - 1)) * 120, 34 - ((v - min) / (max - min || 1)) * 28] as const)
  const line = pts.map(([x, y]) => `${x},${y}`).join(" ")
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-full" preserveAspectRatio="none">
      {area && <polygon points={`0,40 ${line} 120,40`} fill={color} fillOpacity={0.12} />}
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Metric({ title, window, value, of, delta, up, note, link, children }: {
  title: string; window: string; value: string; of?: string; delta: string; up: boolean; note: string; link: string; children: React.ReactNode
}) {
  const Trend = up ? TrendingUpIcon : TrendingDownIcon
  return (
    <Frame className="min-w-0">
      <FramePanel className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <FrameTitle>{title}</FrameTitle>
          <span className="text-[11px] text-muted-foreground">{window}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          {of && <span className="text-sm text-muted-foreground">{of}</span>}
          <span className={cn("ml-auto flex items-center gap-1 text-xs", up ? "text-success-foreground" : "text-destructive-foreground")}>
            <Trend className="size-3.5" />{delta}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">{note}</div>
        {children}
      </FramePanel>
      <FrameFooter className="flex-row items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{link}</span>
        <ArrowRightIcon className="size-3.5 shrink-0" />
      </FrameFooter>
    </Frame>
  )
}

const dot = (c: string) => <span className={cn("size-1.5 rounded-full", c)} />

const config = {
  succeeded: { label: "Succeeded", color: "var(--success)" },
  slow: { label: "Slow", color: "var(--warning)" },
  failed: { label: "Failed", color: "var(--destructive)" },
} satisfies ChartConfig

const attentionIcon = { Failing: WrenchIcon, Degraded: EyeIcon, "Token Expiring": WrenchIcon, "Schema Drift": EyeIcon, Paused: PauseIcon } as const

export function SourcesOverview() {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
        <Metric title="Source Health" window="Now" value="10" of="/13" delta="16.7%" up={false} note="12 healthy yesterday" link="View search-db">
          <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
            <span className="bg-success" style={{ flex: 10 }} /><span className="bg-warning" style={{ flex: 1 }} />
            <span className="bg-destructive" style={{ flex: 1 }} /><span className="bg-info" style={{ flex: 1 }} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {dot("bg-success")}Healthy <b className="font-medium text-foreground">10</b>
            {dot("bg-warning")}Degraded <b className="font-medium text-foreground">1</b>
            {dot("bg-destructive")}Failing <b className="font-medium text-foreground">1</b>
            {dot("bg-info")}Paused <b className="font-medium text-foreground">1</b>
          </div>
        </Metric>
        <Metric title="Linked Datasets" window="Now" value="33" of="/49" delta="6.5%" up note="31 linked last week" link="Review schema drift">
          <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
            <span className="bg-success" style={{ flex: 32 }} /><span className="bg-warning" style={{ flex: 1 }} /><span className="bg-muted" style={{ flex: 16 }} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {dot("bg-success")}In sync <b className="font-medium text-foreground">32</b>
            {dot("bg-warning")}Drifted <b className="font-medium text-foreground">1</b>
            {dot("bg-muted-foreground/40")}Unlinked <b className="font-medium text-foreground">16</b>
          </div>
        </Metric>
        <Metric title="Rows Synced" window="14 days" value="9M" delta="12.1%" up note="8.1M yesterday" link="View telemetry-warehouse">
          <Spark data={rowsSynced} color="var(--success)" area />
        </Metric>
        <Metric title="Failed Syncs" window="14 days" value="5" delta="150%" up={false} note="2 yesterday, 17 in 14 days" link="View search-db">
          <div className="flex h-10 items-end gap-[3px]">
            {failedSyncs.map((v, i) => <span key={i} className="flex-1 rounded-[1px] bg-destructive/80" style={{ height: `${Math.max(v, 0.4) * 18}%`, opacity: v ? 1 : 0.25 }} />)}
          </div>
        </Metric>
      </div>

      <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Frame className="min-w-0">
          <FramePanel className="p-0">
            <FrameHeader className="flex-row items-start justify-between">
              <div>
                <FrameTitle>Sync Activity</FrameTitle>
                <FrameDescription>741 runs in 24 hours, 99.3% landed</FrameDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-3 text-xs text-muted-foreground @xl:flex">
                  {(["succeeded", "slow", "failed"] as const).map((k) => (
                    <span key={k} className="flex items-center gap-1.5"><span className="size-2 rounded-[2px]" style={{ background: config[k].color }} />{config[k].label}</span>
                  ))}
                </div>
                <ToggleGroup defaultValue={["Runs"]} variant="outline" size="sm" onValueChange={() => {}}>
                  <ToggleGroupItem value="Runs">Runs</ToggleGroupItem>
                  <ToggleGroupItem value="Rows">Rows</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </FrameHeader>
            <ChartContainer config={config} className="h-52 w-full px-2 pb-3">
              <BarChart data={syncActivity} margin={{ left: 8, right: 8 }}>
                <XAxis dataKey="hour" tickLine={false} axisLine={false} interval={5} />
                <YAxis hide domain={[0, 60]} />
                <Bar dataKey="succeeded" stackId="a" fill="var(--color-succeeded)" fillOpacity={0.6} isAnimationActive={false} />
                <Bar dataKey="slow" stackId="a" fill="var(--color-slow)" isAnimationActive={false} />
                <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
          </FramePanel>
        </Frame>

        <Frame className="min-w-0">
          <FramePanel className="p-0">
            <FrameHeader className="flex-row items-start justify-between">
              <div>
                <FrameTitle>Needs Attention</FrameTitle>
                <FrameDescription>5 items, worst first</FrameDescription>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="More"><MoreHorizontalIcon /></Button>
            </FrameHeader>
            <div className="flex flex-col px-2 pb-2">
              {attention.map((a) => {
                const Icon = attentionIcon[a.tag]
                return (
                  <Item key={a.name} size="sm">
                    <ItemMedia><IconTile size="xs" variant="outline"><ArrowUpRightIcon /></IconTile></ItemMedia>
                    <ItemContent><ItemTitle>{a.name}<Badge variant={a.tone}>{a.tag}</Badge></ItemTitle></ItemContent>
                    <ItemActions><Button variant="ghost" size="icon-sm" aria-label={`Open ${a.name}`}><Icon /></Button></ItemActions>
                  </Item>
                )
              })}
            </div>
          </FramePanel>
        </Frame>
      </div>
    </>
  )
}
