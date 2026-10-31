import { ChevronLeftIcon, BookmarkIcon, ChevronRightIcon, FilterIcon, MoreHorizontalIcon, PlusIcon, Settings2Icon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { events as allEvents, type LogEvent, type Level } from "@/lib/data/logs-data"

const variant: Record<Level, "secondary" | "warning-light" | "destructive-light"> = {
  Info: "secondary",
  Warn: "warning-light",
  Error: "destructive-light",
}

type EventsTableProps = {
  events?: LogEvent[]
  /** Name of the saved view, shown as a button and used to describe the active filters. */
  view?: string
  /** Active filter chips, e.g. "Level is Error". */
  filters?: string[]
}

export function EventsTable({ events = allEvents, view, filters }: EventsTableProps) {
  const owners = new Set(events.map((e) => e.owner)).size
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Events</FrameTitle>
            <FrameDescription>{view ? `${events.length} events · ${owners} owner${owners === 1 ? "" : "s"}` : "62 events · 9 owners"}</FrameDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="muted" size="sm"><PlusIcon /> Add event</Button>
            <Button variant="muted" size="sm">{view ? <><BookmarkIcon /> {view}</> : "All events"}</Button>
            <Button variant="muted" size="sm"><Settings2Icon /> Settings</Button>
            <Button variant="muted" size="sm"><FilterIcon /> Filter</Button>
          </div>
        </FrameHeader>
        {filters && (
          <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2">
            {filters.map((f) => <Badge key={f} variant="outline" size="lg">{f}</Badge>)}
            <Button variant="muted" size="sm"><FilterIcon /> Filter <Badge variant="outline" size="sm" radius="full">{filters.length}</Badge></Button>
            <Button variant="ghost" size="sm">Clear</Button>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              {["Time", "Owner", "Event", "Level", "Resource", "Source", "Pod IP", "Actions"].map((h) => <TableHead key={h}>{h}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((e, i) => (
              <TableRow key={i}>
                <TableCell className="tabular-nums text-muted-foreground">{e.time}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    <Avatar className="size-5"><AvatarFallback className="text-[9px]">{e.owner.split(/[ -]/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                    {e.owner}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">{e.event}</TableCell>
                <TableCell><Badge variant={variant[e.level]}>{e.level}</Badge></TableCell>
                <TableCell>
                  <div>{e.resource}</div>
                  {e.ref && <div className="text-[11px] text-muted-foreground">{e.ref}</div>}
                </TableCell>
                <TableCell><Badge variant="outline">{e.source}</Badge></TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{e.ip}</TableCell>
                <TableCell><Button variant="ghost" size="icon-sm" aria-label="Row actions"><MoreHorizontalIcon /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
          <span>Rows per page 10</span>
          <span>1 - {events.length} of {view ? events.length : 62} events</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Go to previous page"><ChevronLeftIcon /></Button>
            {Array.from({ length: view ? 1 : 7 }, (_, k) => k + 1).map((p) => <Button key={p} variant={p === 1 ? "outline" : "ghost"} size="icon-sm">{p}</Button>)}
            <Button variant="ghost" size="icon-sm" aria-label="Go to next page"><ChevronRightIcon /></Button>
          </div>
        </div>
      </FramePanel>
    </Frame>
  )
}
