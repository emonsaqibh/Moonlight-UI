"use client"

import * as React from "react"
import { ArrowRightIcon, ArrowUpRightIcon, CopyIcon, EyeIcon, KeyRoundIcon, MoreHorizontalIcon, PauseIcon, PlayIcon, RefreshCwIcon, TrendingDownIcon, TrendingUpIcon, WrenchIcon } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { IconTile } from "@/components/ui/icon-tile"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { attention, failedSyncs, rowsSynced, syncActivity } from "@/lib/data/sources-data"
import { cn } from "@/lib/utils"

const days = (n: number) => Array.from({ length: n }, (_, i) => `Oct ${22 - n + 1 + i}`)
const sparkConfig = { rows: { label: "Rows synced", color: "var(--success)" }, failed: { label: "Failed syncs", color: "var(--destructive)" } } satisfies ChartConfig

/** 14-day area sparkline with a hover tooltip. */
function Spark({ data }: { data: number[] }) {
  const d = data.map((v, i) => ({ day: days(data.length)[i], rows: v }))
  return (
    <ChartContainer config={sparkConfig} className="aspect-auto h-10 w-full">
      <AreaChart data={d} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <XAxis dataKey="day" hide />
        <YAxis hide domain={["dataMin - 0.5", "dataMax"]} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" formatter={(v) => <span className="flex w-full justify-between gap-3"><span className="text-muted-foreground">Rows synced</span><span className="font-medium tabular-nums">{v}M</span></span>} />} />
        <Area dataKey="rows" stroke="var(--color-rows)" fill="var(--color-rows)" fillOpacity={0.12} strokeWidth={1.5} isAnimationActive={false} />
      </AreaChart>
    </ChartContainer>
  )
}

/** Daily failed-sync bars with a hover tooltip. */
function FailBars({ data }: { data: number[] }) {
  const d = data.map((v, i) => ({ day: days(data.length)[i], failed: v, floor: v ? 0 : 0.4 }))
  return (
    <ChartContainer config={sparkConfig} className="aspect-auto h-10 w-full">
      <BarChart data={d} margin={{ top: 2, bottom: 0, left: 0, right: 0 }} barCategoryGap={1.5}>
        <XAxis dataKey="day" hide />
        <YAxis hide domain={[0, 5]} />
        <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent hideIndicator formatter={(v, n) => n === "failed" && <span className="flex w-full justify-between gap-3"><span className="text-muted-foreground">Failed syncs</span><span className="font-medium tabular-nums">{v}</span></span>} />} />
        <Bar dataKey="floor" stackId="a" fill="var(--color-failed)" fillOpacity={0.25} isAnimationActive={false} />
        <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" fillOpacity={0.8} radius={[1, 1, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
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

const attentionAction = { Failing: "Rotate credential", Degraded: "View runs", "Token Expiring": "Renew token", "Schema Drift": "Review drift", Paused: "Resume syncs" } as const

export function SourcesOverview() {
  const [metric, setMetric] = React.useState("Runs")
  const activity = metric === "Runs" ? syncActivity : syncActivity.map((d) => ({ ...d, succeeded: d.succeeded * 1.2, slow: d.slow * 0.9, failed: d.failed * 0.3 }))
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
          <Spark data={rowsSynced} />
        </Metric>
        <Metric title="Failed Syncs" window="14 days" value="5" delta="150%" up={false} note="2 yesterday, 17 in 14 days" link="View search-db">
          <FailBars data={failedSyncs.slice(-14)} />
        </Metric>
      </div>

      <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Frame className="min-w-0">
          <FramePanel className="p-0">
            <FrameHeader className="flex-row items-start justify-between">
              <div>
                <FrameTitle>Sync Activity</FrameTitle>
                <FrameDescription>{metric === "Runs" ? "741 runs in 24 hours, 99.3% landed" : "1.1M rows (K) in 24 hours"}</FrameDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-3 text-xs text-muted-foreground @xl:flex">
                  {(["succeeded", "slow", "failed"] as const).map((k) => (
                    <span key={k} className="flex items-center gap-1.5"><span className="size-2 rounded-[2px]" style={{ background: config[k].color }} />{config[k].label}</span>
                  ))}
                </div>
                <ToggleGroup value={[metric]} variant="outline" size="sm" onValueChange={(v) => v.length && setMetric(v[0])} aria-label="Activity shown">
                  <ToggleGroupItem value="Runs">Runs</ToggleGroupItem>
                  <ToggleGroupItem value="Rows">Rows</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </FrameHeader>
            <ChartContainer config={config} className="h-52 w-full px-2 pb-3">
              <BarChart data={activity} margin={{ left: 8, right: 8 }}>
                <XAxis dataKey="hour" tickLine={false} axisLine={false} interval={5} />
                <YAxis hide domain={[0, 70]} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v, n) => <span className="flex w-full items-center gap-2"><span className="size-2 rounded-[2px]" style={{ background: config[n as keyof typeof config]?.color }} /><span className="text-muted-foreground">{config[n as keyof typeof config]?.label}</span><span className="ml-auto font-medium tabular-nums">{metric === "Runs" ? v : `${Number(v).toFixed(1)}K`}</span></span>} />} />
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
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Attention actions" />}><MoreHorizontalIcon /></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Fix in bulk</DropdownMenuLabel>
                    <DropdownMenuItem><PlayIcon /> Resume Paused</DropdownMenuItem>
                    <DropdownMenuItem><KeyRoundIcon /> Renew Expiring Tokens</DropdownMenuItem>
                    <DropdownMenuItem><RefreshCwIcon /> Sync Degraded Now</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(attention.map((a) => `${a.name}: ${a.tag}`).join("\n"))}><CopyIcon /> Copy Summary</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </FrameHeader>
            <div className="flex flex-col px-2 pb-2">
              {attention.map((a) => {
                const Icon = attentionIcon[a.tag]
                return (
                  <Item key={a.name} size="sm">
                    <ItemMedia><IconTile size="xs" variant="outline"><ArrowUpRightIcon /></IconTile></ItemMedia>
                    <ItemContent><ItemTitle>{a.name}<Badge variant={a.tone}>{a.tag}</Badge></ItemTitle></ItemContent>
                    <ItemActions>
                      <Tooltip>
                        <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`${attentionAction[a.tag]}, ${a.name}`} />}><Icon /></TooltipTrigger>
                        <TooltipContent>{attentionAction[a.tag]}</TooltipContent>
                      </Tooltip>
                    </ItemActions>
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
