"use client"

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { calEvents, type CalEvent, type Category } from "@/lib/data/calendar-data"
import { cn } from "@/lib/utils"

const days = ["Mon 19", "Tue 20", "Wed 21", "Thu 22", "Fri 23", "Sat 24", "Sun 25"]
const START = 8
const END = 20
const ROW = 50
const hour = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`

// One tint per category: a soft card and a solid chip, kept in a single map so the calendar reads at a glance.
const tone: Record<Category, { card: string; chip: string }> = {
  Release: { card: "border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10", chip: "bg-amber-700 text-white" },
  Task: { card: "border-zinc-200 bg-zinc-100 dark:border-zinc-500/25 dark:bg-zinc-500/10", chip: "bg-zinc-700 text-white" },
  Maintenance: { card: "border-indigo-200 bg-indigo-50 dark:border-indigo-500/25 dark:bg-indigo-500/10", chip: "bg-indigo-700 text-white" },
  Meeting: { card: "border-purple-200 bg-purple-50 dark:border-purple-500/25 dark:bg-purple-500/10", chip: "bg-purple-600 text-white" },
  "On-call": { card: "border-sky-200 bg-sky-50 dark:border-sky-500/25 dark:bg-sky-500/10", chip: "bg-sky-700 text-white" },
  Comms: { card: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10", chip: "bg-emerald-700 text-white" },
}

function EventCard({ e, className, style }: { e: CalEvent; className?: string; style?: React.CSSProperties }) {
  return (
    <div style={style} className={cn("flex flex-col gap-0.5 overflow-hidden rounded-lg border p-1.5 text-xs", tone[e.category].card, className)}>
      <Badge size="sm" className={cn("border-transparent", tone[e.category].chip)}>{e.category}</Badge>
      <span className="line-clamp-2 font-medium leading-tight">{e.title}</span>
      {e.meta && <span className="truncate text-[11px] text-muted-foreground">{e.meta}</span>}
      {e.progress && <span className="truncate text-[11px] text-muted-foreground">{e.progress}</span>}
    </div>
  )
}

type WeekViewProps = {
  events?: CalEvent[]
  /** Saved-view name, shown beside the date. */
  title?: string
  categories?: number
  owners?: number
}

export function WeekView({ events = calEvents, title, categories = 6, owners = 6 }: WeekViewProps) {
  const allDay = events.filter((e) => e.start === undefined)
  const timed = events.filter((e) => e.start !== undefined)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <Button variant="muted" size="sm">Today</Button>
        <Button variant="muted" size="sm">Week <ChevronDownIcon /></Button>
        <Button variant="ghost" size="icon-sm" aria-label="Previous week"><ChevronLeftIcon /></Button>
        <Button variant="ghost" size="icon-sm" aria-label="Next week"><ChevronRightIcon /></Button>
        <span className="text-sm font-semibold">October 19 - 25, 2026</span>
        {title && <Badge variant="outline" size="lg" className="ml-1">{title}</Badge>}
        <div className="ml-auto flex gap-2">
          <Button variant="muted" size="sm">Category <Badge variant="outline" size="sm">{categories}</Badge><ChevronDownIcon /></Button>
          <Button variant="muted" size="sm">Ownership <Badge variant="outline" size="sm">{owners}</Badge><ChevronDownIcon /></Button>
        </div>
      </div>
      <div className="overflow-auto">
        <div className="grid min-w-[760px] grid-cols-[56px_repeat(7,minmax(0,1fr))]">
          <div className="sticky top-0 z-[1] border-b bg-background" />
          {days.map((d) => (
            <div key={d} className="sticky top-0 z-[1] border-b border-s bg-background px-2 py-2 text-[13px] font-medium">{d}</div>
          ))}

          <div className="flex items-center justify-center border-b text-[11px] text-muted-foreground">All day</div>
          {days.map((_, i) => (
            <div key={i} className="flex min-h-24 flex-col gap-1 border-b border-s p-1">
              {allDay.filter((e) => e.day === i).map((e) => <EventCard key={e.title} e={e} />)}
            </div>
          ))}

          <div>
            {Array.from({ length: END - START }, (_, i) => (
              <div key={i} style={{ height: ROW }} className="pe-2 text-right text-[11px] text-muted-foreground">{hour(START + i)}</div>
            ))}
          </div>
          {days.map((_, di) => (
            <div key={di} className="relative border-s" style={{ height: (END - START) * ROW }}>
              {Array.from({ length: END - START }, (_, i) => <div key={i} style={{ height: ROW }} className="border-b border-dashed" />)}
              {timed.filter((e) => e.day === di).map((e) => (
                <EventCard
                  key={e.title}
                  e={e}
                  className="absolute inset-x-1"
                  style={{ top: (e.start! - START) * ROW + 1, height: (e.end! - e.start!) * ROW - 2 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
