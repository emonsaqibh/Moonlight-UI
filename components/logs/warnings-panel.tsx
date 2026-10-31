import { ArrowRightIcon, GitCommitHorizontalIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { warnings } from "@/lib/data/logs-data"

export function WarningsPanel() {
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Warnings to review</FrameTitle>
            <FrameDescription>Newest first, oldest 16h ago</FrameDescription>
          </div>
          <Button variant="muted" size="sm">Review all <ArrowRightIcon /></Button>
        </FrameHeader>
        <div className="flex flex-wrap items-baseline gap-x-2 px-4 text-sm">
          <span className="text-2xl font-semibold tabular-nums">4</span>
          <span className="text-muted-foreground">to review · 4 owners ·</span>
          <span className="flex items-center gap-1 text-muted-foreground"><GitCommitHorizontalIcon className="size-3.5 text-warning" />2 after v3.5.0 deploy</span>
        </div>
        <div className="px-4 pt-3">
          <div className="h-1.5 rounded-full bg-[repeating-linear-gradient(135deg,var(--color-amber-400)_0_4px,var(--color-amber-300)_4px_8px)]" />
          <div className="mt-1 text-right text-[11px] text-muted-foreground">0 of 4 reviewed</div>
        </div>
        <div className="flex flex-col px-2 py-2">
          {warnings.map((w) => (
            <Item key={w.event} size="sm">
              <ItemMedia><Avatar className="size-5"><AvatarFallback className="text-[9px]">{w.owner.split(" ").map((p) => p[0]).join("")}</AvatarFallback></Avatar></ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {w.owner}
                  {w.note && <span className="flex items-center gap-1 text-xs font-normal text-warning-foreground"><GitCommitHorizontalIcon className="size-3" />{w.note}</span>}
                </ItemTitle>
                <ItemDescription className="font-mono text-[11px]">{w.event} · {w.resource}</ItemDescription>
              </ItemContent>
              <ItemActions><span className="text-xs text-muted-foreground">{w.ago}</span></ItemActions>
            </Item>
          ))}
        </div>
      </FramePanel>
    </Frame>
  )
}
