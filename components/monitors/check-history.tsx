import { GlobeIcon, TimerIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { IconTile } from "@/components/ui/icon-tile"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { monitors } from "@/lib/data/monitors-data"
import { cn } from "@/lib/utils"

function Summary({ label, value, note, bad }: { label: string; value: React.ReactNode; note: React.ReactNode; bad?: boolean }) {
  return (
    <div className="p-3 px-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      <div className={cn("text-[11px]", bad ? "text-destructive-foreground" : "text-muted-foreground")}>{note}</div>
    </div>
  )
}

export function CheckHistory() {
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Check history</FrameTitle>
            <FrameDescription>8 monitors · As of Oct 22, 14:00 UTC</FrameDescription>
          </div>
          <Button variant="muted" size="sm">All monitors</Button>
        </FrameHeader>
        <div className="grid grid-cols-2 border-y @3xl:grid-cols-4 [&>*:not(:last-child)]:border-e">
          <Summary label="Success Rate" value="95.6%" note="Down 8.8 pts vs older checks" bad />
          <div className="p-3 px-4">
            <div className="text-xs text-muted-foreground">Checks</div>
            <div className="text-xl font-semibold tabular-nums">160</div>
            <div className="mt-1 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
              <span className="bg-success" style={{ flex: 153 }} />
              <span className="bg-destructive" style={{ flex: 3 }} />
              <span className="bg-warning" style={{ flex: 4 }} />
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">153 Up, 3 Down, 4 Timed out, 0 Skipped · 7 failed</div>
          </div>
          <Summary label="Failing monitors" value={<>1 <span className="text-sm font-normal text-muted-foreground">of 8</span></>} note="Longest streak 5 checks" />
          <Summary label="Slowest p95" value="19m 05s" note="Nightly database backup" />
        </div>
        <div className="flex flex-col px-2 py-2">
          {monitors.map((m) => (
            <Item key={m.name} size="sm">
              <ItemMedia><IconTile size="xs" variant="outline">{m.kind === "http" ? <GlobeIcon /> : <TimerIcon />}</IconTile></ItemMedia>
              <ItemContent>
                <ItemTitle>{m.name}{m.paused && <Badge variant="secondary">Paused</Badge>}</ItemTitle>
                <ItemDescription className="font-mono text-[11px]">{m.target}</ItemDescription>
              </ItemContent>
              <ItemActions className="gap-4 text-xs">
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
        </div>
        <FrameFooter className="flex-row justify-between border-t text-xs text-muted-foreground">
          <span className="flex gap-3"><span>Up</span><span>Down</span><span>Timed out</span><span>Skipped</span></span>
          <span>Bar height is check duration</span>
        </FrameFooter>
      </FramePanel>
    </Frame>
  )
}
