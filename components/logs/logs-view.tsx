"use client"

import * as React from "react"
import { ChevronDownIcon, DownloadIcon, FileBracesIcon, FileSpreadsheetIcon, PinIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { RangeToggle } from "@/components/app/range-toggle"
import { EventVolume } from "@/components/logs/event-volume"
import { EventsTable } from "@/components/logs/events-table"
import { WarningsPanel } from "@/components/logs/warnings-panel"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { events as allEvents, type LogEvent } from "@/lib/data/logs-data"

const columns = ["id", "time", "owner", "event", "level", "resource", "ref", "source", "ip", "cluster", "correlation", "summary"] as const

function download(name: string, type: string, body: string) {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob([body], { type }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 0)
}

const csv = (rows: LogEvent[]) =>
  [columns.join(","), ...rows.map((e) => columns.map((c) => `"${String(e[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n")

type LogsViewProps = {
  crumbs: string[]
  /** Events, saved-view name and filter chips passed to the events table. */
  events?: LogEvent[]
  view?: string
  filters?: string[]
  /** Props for the event volume chart; set `split` to place it beside the warnings panel. */
  volume?: React.ComponentProps<typeof EventVolume>
  split?: boolean
}

/** Logs page: header with Pin and a working Export menu (filtered or all events, CSV or JSON), the volume chart, warnings and events table. */
export function LogsView({ crumbs, events = allEvents, view, filters, volume, split }: LogsViewProps) {
  const [pinned, setPinned] = React.useState(false)
  const [scope, setScope] = React.useState("filtered")
  const [filtered, setFiltered] = React.useState(events)
  const rows = scope === "filtered" ? filtered : events
  const name = `logs-${(view ?? "all-events").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
  const chart = <EventVolume {...volume} />
  return (
    <>
      <PageHeader crumbs={crumbs}>
        <Button variant="muted" aria-pressed={pinned} onClick={() => setPinned((p) => !p)}><PinIcon className={pinned ? "fill-current" : undefined} /> {pinned ? "Pinned" : "Pin"}</Button>
        <RangeToggle options={["1h", "24h", "7d", "30d"]} defaultValue="7d" />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button />}><DownloadIcon /> Export <ChevronDownIcon /></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Scope</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={scope} onValueChange={setScope}>
                <DropdownMenuRadioItem value="filtered" closeOnClick={false}>Filtered events<span className="ml-auto text-xs text-muted-foreground tabular-nums">{filtered.length}</span></DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="all" closeOnClick={false}>All events<span className="ml-auto text-xs text-muted-foreground tabular-nums">{events.length}</span></DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Format</DropdownMenuLabel>
              <DropdownMenuItem disabled={!rows.length} onClick={() => download(`${name}.csv`, "text/csv", csv(rows))}><FileSpreadsheetIcon /> Download CSV</DropdownMenuItem>
              <DropdownMenuItem disabled={!rows.length} onClick={() => download(`${name}.json`, "application/json", JSON.stringify(rows, null, 2))}><FileBracesIcon /> Download JSON</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>
      <PageBody>
        {split ? <div className="grid gap-4 @4xl:grid-cols-2">{chart}<WarningsPanel /></div> : <>{chart}<WarningsPanel /></>}
        <EventsTable events={events} view={view} filters={filters} onFilteredChange={setFiltered} />
      </PageBody>
    </>
  )
}
