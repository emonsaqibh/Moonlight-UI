"use client"

import { ClockIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { IconTile } from "@/components/ui/icon-tile"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { upNext } from "@/lib/data/jobs-data"

export function UpNext({ onOpenJob }: { onOpenJob?: (name: string) => void }) {
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader>
          <FrameTitle>Up Next</FrameTitle>
          <FrameDescription>Next 30 minutes</FrameDescription>
        </FrameHeader>
        <div className="flex flex-col gap-0.5 px-2 pb-2">
          {upNext.map((u) => (
            <Item
              key={u.name}
              size="sm"
              render={<button type="button" onClick={() => onOpenJob?.(u.name)} />}
              className="cursor-pointer text-left hover:bg-muted"
            >
              <ItemMedia><IconTile size="xs" variant="outline"><ClockIcon /></IconTile></ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {u.name}
                  {u.failing && <Badge variant="destructive-light">Failing</Badge>}
                </ItemTitle>
              </ItemContent>
              <ItemActions><span className="text-xs tabular-nums text-muted-foreground">in {u.in}</span></ItemActions>
            </Item>
          ))}
        </div>
      </FramePanel>
    </Frame>
  )
}
