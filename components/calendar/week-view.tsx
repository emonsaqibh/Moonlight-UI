"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, FlagIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { calEvents, calOwners, calPeople, calPriorities, calServices, calWeekStart, categories, type CalEvent, type Category } from "@/lib/data/calendar-data"
import { cn } from "@/lib/utils"

const START = 8
const END = 20
const ROW = 50
const DAY = 864e5
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const hour = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`
const time = (h: number) => `${Math.floor(h) % 12 === 0 ? 12 : Math.floor(h) % 12}:${h % 1 ? "30" : "00"} ${h < 12 || h === 24 ? "AM" : "PM"}`
const date = (d: number) => new Date(calWeekStart + d * DAY)
const dayLabel = (d: number) => `${weekdays[date(d).getUTCDay()].slice(0, 3)} ${date(d).getUTCDate()}`
const longDate = (d: number) => `${months[date(d).getUTCMonth()]} ${date(d).getUTCDate()}, ${date(d).getUTCFullYear()}`
const toISO = (d: number) => date(d).toISOString().slice(0, 10)
const weekOf = (d: number) => Math.floor(d / 7) * 7
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2)
const times = Array.from({ length: (END - START) * 2 + 1 }, (_, i) => START + i / 2)

function rangeTitle(days: number[]) {
  const a = date(days[0]), b = date(days[days.length - 1])
  if (days.length === 1) return `${weekdays[a.getUTCDay()]}, ${longDate(days[0])}`
  const tail = a.getUTCMonth() === b.getUTCMonth() ? `${b.getUTCDate()}` : `${months[b.getUTCMonth()]} ${b.getUTCDate()}`
  return `${months[a.getUTCMonth()]} ${a.getUTCDate()} - ${tail}, ${b.getUTCFullYear()}`
}

// One tint per category: a soft card and a solid chip, kept in a single map so the calendar reads at a glance.
const tone: Record<Category, { card: string; chip: string }> = {
  Release: { card: "border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10", chip: "bg-amber-700 text-white" },
  Task: { card: "border-zinc-200 bg-zinc-100 dark:border-zinc-500/25 dark:bg-zinc-500/10", chip: "bg-zinc-700 text-white" },
  Maintenance: { card: "border-indigo-200 bg-indigo-50 dark:border-indigo-500/25 dark:bg-indigo-500/10", chip: "bg-indigo-700 text-white" },
  Meeting: { card: "border-purple-200 bg-purple-50 dark:border-purple-500/25 dark:bg-purple-500/10", chip: "bg-purple-600 text-white" },
  "On-call": { card: "border-sky-200 bg-sky-50 dark:border-sky-500/25 dark:bg-sky-500/10", chip: "bg-sky-700 text-white" },
  Comms: { card: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10", chip: "bg-emerald-700 text-white" },
}

type Ev = CalEvent & { id: number }
type Draft = { id?: number; title: string; category: Category; owner: string; service: string; allDay: boolean; day: number; start: number; end: number; status: string; priority: string; room: string; note: string }
type View = "week" | "day"

type CalendarState = {
  events: Ev[]
  days: number[]
  view: View
  setView: (v: View) => void
  focus: number
  setFocus: (d: number) => void
  cats: Category[]
  setCats: (c: Category[]) => void
  owners: string[]
  setOwners: (o: string[]) => void
  openNew: (day: number, start?: number, allDay?: boolean) => void
  openNext: () => void
  openEdit: (e: Ev) => void
  remove: (id: number) => void
}

const CalendarContext = React.createContext<CalendarState | null>(null)

function useCalendar() {
  const ctx = React.useContext(CalendarContext)
  if (!ctx) throw new Error("Calendar parts must be used inside <CalendarProvider>.")
  return ctx
}

/** Holds the calendar's events, visible range, filters and the event sheet, so a header button and the grid share them. */
export function CalendarProvider({ events = calEvents, children }: { events?: CalEvent[]; children: React.ReactNode }) {
  const [items, setItems] = React.useState<Ev[]>(() => events.map((e, id) => ({ ...e, id })))
  const [view, setView] = React.useState<View>("week")
  const [focus, setFocus] = React.useState(0)
  const [cats, setCats] = React.useState<Category[]>(() => categories.filter((c) => events.some((e) => e.category === c)))
  const [owners, setOwners] = React.useState<string[]>(() => calOwners.filter((o) => events.some((e) => e.owner === o)))
  const [draft, setDraft] = React.useState<Draft | null>(null)
  const [open, setOpen] = React.useState(false)
  const nonce = React.useRef(0)

  const days = view === "week" ? Array.from({ length: 7 }, (_, i) => weekOf(focus) + i) : [focus]
  const show = (d: Draft) => { nonce.current++; setDraft(d); setOpen(true) }
  const blank = { title: "", category: "Task" as Category, owner: calOwners[0], service: calServices[0], status: "", priority: "None", room: "", note: "" }

  const openNew = (day: number, start = 9, allDay = false) => show({ ...blank, day, start, end: Math.min(start + 1, END), allDay })
  const openNext = () => {
    for (const d of days)
      for (let h = 9; h + 1 <= 18; h += 0.5)
        if (!items.some((e) => e.day === d && e.start !== undefined && e.start < h + 1 && e.end! > h)) return openNew(d, h)
    openNew(days[0])
  }
  const openEdit = (e: Ev) =>
    show({
      id: e.id, title: e.title, category: e.category, owner: e.owner ?? calOwners[0], service: e.service ?? calServices[0], allDay: e.start === undefined,
      day: e.day, start: e.start ?? 9, end: e.end ?? 10, status: e.status ?? "", priority: e.priority ?? "None", room: e.room ?? "", note: e.note ?? "",
    })
  const save = (d: Draft) => {
    const prev = items.find((e) => e.id === d.id)
    const next: Ev = {
      ...prev, id: d.id ?? Math.max(-1, ...items.map((e) => e.id)) + 1, title: d.title.trim(), category: d.category, owner: d.owner, service: d.service, day: d.day,
      start: d.allDay ? undefined : d.start, end: d.allDay ? undefined : d.end, status: d.status || undefined, priority: d.priority, room: d.room || undefined, note: d.note || undefined,
      meta: prev?.progress ? prev.meta : d.service !== calServices[0] ? d.service : undefined, attendees: prev?.attendees ?? [d.owner],
    }
    setItems(prev ? items.map((e) => (e.id === next.id ? next : e)) : [...items, next])
    if (!cats.includes(d.category)) setCats([...cats, d.category])
    if (!owners.includes(d.owner)) setOwners([...owners, d.owner])
    if (!days.includes(d.day)) setFocus(d.day)
    setOpen(false)
  }
  const remove = (id: number) => setItems(items.filter((e) => e.id !== id))

  return (
    <CalendarContext value={{ events: items, days, view, setView, focus, setFocus, cats, setCats, owners, setOwners, openNew, openNext, openEdit, remove }}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="inset-y-4 right-4 left-auto h-[calc(100svh-2rem)] w-[min(32rem,calc(100vw-2rem))] max-w-none gap-0 overflow-hidden rounded-xl border p-0 data-[side=right]:inset-y-4 data-[side=right]:right-4 data-[side=right]:h-[calc(100svh-2rem)] data-[side=right]:w-[min(32rem,calc(100vw-2rem))] data-[side=right]:sm:max-w-none">
          {draft && <EventForm key={nonce.current} draft={draft} onSave={save} />}
        </SheetContent>
      </Sheet>
    </CalendarContext>
  )
}

/** Header button that opens the event sheet on the next free hour in view. */
export function NewEventButton(props: React.ComponentProps<typeof Button>) {
  const { openNext } = useCalendar()
  return <Button onClick={openNext} {...props}><PlusIcon /> New event</Button>
}

function Pick({ label, value, options, onChange, className }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; className?: string }) {
  return (
    <Field className={className}>
      <FieldLabel>{label}</FieldLabel>
      <Select items={options} value={value} onValueChange={(v) => v !== null && onChange(v)}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </Field>
  )
}

const opts = (xs: string[]) => xs.map((x) => ({ value: x, label: x }))
const timeOpts = (xs: number[]) => xs.map((h) => ({ value: String(h), label: time(h) }))

function EventForm({ draft, onSave }: { draft: Draft; onSave: (d: Draft) => void }) {
  const [d, setD] = React.useState(draft)
  const set = (patch: Partial<Draft>) => setD((p) => ({ ...p, ...patch }))
  const setStart = (start: number) => set({ start, end: d.end > start ? d.end : Math.min(start + 1, END) })
  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={(e) => { e.preventDefault(); onSave(d) }}>
      <div className="flex shrink-0 flex-col gap-0.5 border-b px-5 py-3 pe-12">
        <SheetTitle>{d.id === undefined ? "New Event" : "Edit Event"}</SheetTitle>
        <SheetDescription>{d.id === undefined ? "Add an event to the calendar." : "Update this event."}</SheetDescription>
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-x-3 gap-y-4 overflow-y-auto px-5 py-4">
        <Field className="col-span-2">
          <FieldLabel htmlFor="ev-title">Title</FieldLabel>
          <Input id="ev-title" required autoFocus placeholder="On-call Handoff" value={d.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Pick label="Category" value={d.category} options={opts(categories)} onChange={(v) => set({ category: v as Category })} />
        <Pick label="Owner" value={d.owner} options={opts(calOwners)} onChange={(v) => set({ owner: v })} />
        <Pick label="Service" className="col-span-2" value={d.service} options={opts(calServices)} onChange={(v) => set({ service: v })} />
        <Field orientation="horizontal" className="col-span-2 justify-between">
          <FieldLabel htmlFor="ev-all-day">All day</FieldLabel>
          <Switch id="ev-all-day" checked={d.allDay} onCheckedChange={(allDay) => set({ allDay })} />
        </Field>
        <Field className="col-span-2">
          <FieldLabel htmlFor="ev-date">Date</FieldLabel>
          <Input
            id="ev-date"
            type="date"
            required
            value={toISO(d.day)}
            onChange={(e) => { const t = Date.parse(e.target.value); if (!Number.isNaN(t)) set({ day: Math.round((t - calWeekStart) / DAY) }) }}
          />
        </Field>
        {!d.allDay && (
          <>
            <Pick label="From" value={String(d.start)} options={timeOpts(times.slice(0, -1))} onChange={(v) => setStart(Number(v))} />
            <Pick label="To" value={String(d.end)} options={timeOpts(times.filter((h) => h > d.start))} onChange={(v) => set({ end: Number(v) })} />
          </>
        )}
        <Separator className="col-span-2" />
        <Field>
          <FieldLabel htmlFor="ev-status">Status</FieldLabel>
          <Input id="ev-status" placeholder="Initiated" value={d.status} onChange={(e) => set({ status: e.target.value })} />
        </Field>
        <Pick label="Priority" value={d.priority} options={opts(calPriorities)} onChange={(v) => set({ priority: v })} />
        <Field className="col-span-2">
          <FieldLabel htmlFor="ev-room">Room</FieldLabel>
          <Input id="ev-room" placeholder="Video call" value={d.room} onChange={(e) => set({ room: e.target.value })} />
        </Field>
        <Field className="col-span-2">
          <FieldLabel htmlFor="ev-note">Note</FieldLabel>
          <Textarea id="ev-note" placeholder="Agenda, links, context" value={d.note} onChange={(e) => set({ note: e.target.value })} />
        </Field>
      </div>
      <div className="flex shrink-0 justify-end gap-2 border-t px-5 py-3">
        <SheetClose render={<Button type="button" variant="ghost" />}>Cancel</SheetClose>
        <Button type="submit">{d.id === undefined ? "Create event" : "Save changes"}</Button>
      </div>
    </form>
  )
}

function Person({ name }: { name: string }) {
  return (
    <Avatar size="sm" className="size-5">
      {calPeople[name]?.avatar && <AvatarImage src={calPeople[name].avatar} alt="" />}
      <AvatarFallback className="text-[9px]">{initials(name)}</AvatarFallback>
    </Avatar>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-5 items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-center justify-end gap-1.5 text-right">{children}</div>
    </div>
  )
}

function EventDetail({ e, onEdit, onDelete }: { e: Ev; onEdit: () => void; onDelete: () => void }) {
  const when = e.start === undefined ? `${dayLabel(e.day)} · All day` : `${dayLabel(e.day)} · ${time(e.start)} - ${time(e.end!)}`
  return (
    <PopoverContent align="start" className="w-80 gap-3 p-3 text-[13px]">
      <div className="flex items-start justify-between gap-2">
        <PopoverTitle className="text-sm leading-snug">{e.title}</PopoverTitle>
        <Badge size="sm" className={cn("shrink-0 border-transparent", tone[e.category].chip)}>{e.category}</Badge>
      </div>
      <div className="flex flex-col gap-2">
        <Row label="When">{when}</Row>
        {e.service && <Row label="Service">{e.service}</Row>}
        {e.owner && <Row label="Owner"><Person name={e.owner} /><span className="truncate">{e.owner}</span></Row>}
        {(e.status || (e.priority && e.priority !== "None")) && (
          <Row label="Status">
            {e.status && <Badge variant="outline">{e.status}</Badge>}
            {e.priority && e.priority !== "None" && <Badge variant="outline"><FlagIcon />{e.priority}</Badge>}
          </Row>
        )}
        {e.room && <Row label="Room">{e.room}</Row>}
        {e.attendees && e.attendees.length > 0 && (
          <Row label="Attendees">
            <AvatarGroup className="-space-x-1.5">{e.attendees.slice(0, 3).map((a) => <Person key={a} name={a} />)}</AvatarGroup>
            <span className="tabular-nums text-muted-foreground">{e.attendees.length}</span>
          </Row>
        )}
        {e.progress && <Row label="Progress">{e.progress}</Row>}
        {e.note && <p className="rounded-md bg-muted/50 px-2 py-1.5 text-muted-foreground">{e.note}</p>}
      </div>
      <Separator />
      <div className="flex gap-2">
        <Button size="sm" variant="muted" onClick={onEdit}><PencilIcon /> Edit</Button>
        <Button size="sm" variant="destructive" className="ml-auto" onClick={onDelete}><Trash2Icon /> Delete</Button>
      </div>
    </PopoverContent>
  )
}

function EventCard({ e, open, onOpenChange, className, style }: { e: Ev; open: boolean; onOpenChange: (o: boolean) => void; className?: string; style?: React.CSSProperties }) {
  const { openEdit, remove } = useCalendar()
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <button
            type="button"
            style={style}
            aria-label={e.title}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-0.5 overflow-hidden rounded-lg border p-1.5 text-left text-xs transition-[box-shadow,filter] outline-none hover:shadow-sm hover:brightness-[0.97] focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:shadow-sm data-popup-open:ring-2 data-popup-open:ring-ring/40 dark:hover:brightness-125",
              tone[e.category].card,
              className
            )}
          />
        }
      >
        <Badge size="sm" className={cn("border-transparent", tone[e.category].chip)}>{e.category}</Badge>
        <span className="line-clamp-2 font-medium leading-tight">{e.title}</span>
        {e.meta && <span className="max-w-full truncate text-[11px] text-muted-foreground">{e.meta}</span>}
        {e.progress && <span className="max-w-full truncate text-[11px] text-muted-foreground">{e.progress}</span>}
      </PopoverTrigger>
      <EventDetail e={e} onEdit={() => { onOpenChange(false); openEdit(e) }} onDelete={() => { onOpenChange(false); remove(e.id) }} />
    </Popover>
  )
}

/** Side-by-side lanes for overlapping timed events within a day. */
function lanes(evs: Ev[]) {
  const out = new Map<number, { lane: number; of: number }>()
  let cluster: Ev[] = [], ends: number[] = [], clusterEnd = -1
  const flush = () => { cluster.forEach((e) => (out.get(e.id)!.of = ends.length)); cluster = []; ends = [] }
  for (const e of [...evs].sort((a, b) => a.start! - b.start! || b.end! - a.end!)) {
    if (e.start! >= clusterEnd) flush()
    let lane = ends.findIndex((end) => end <= e.start!)
    if (lane < 0) lane = ends.length
    ends[lane] = e.end!
    out.set(e.id, { lane, of: 0 })
    cluster.push(e)
    clusterEnd = Math.max(clusterEnd, e.end!)
  }
  flush()
  return out
}

type WeekViewProps = {
  /** Initial events when the view isn't inside a CalendarProvider. */
  events?: CalEvent[]
  /** Saved-view name, shown beside the date. */
  title?: string
}

export function WeekView({ events, title }: WeekViewProps) {
  const ctx = React.useContext(CalendarContext)
  if (!ctx) return <CalendarProvider events={events}><WeekView title={title} /></CalendarProvider>
  return <Grid title={title} />
}

function Grid({ title }: { title?: string }) {
  const { events, days, view, setView, focus, setFocus, cats, setCats, owners, setOwners, openNew } = useCalendar()
  const [openId, setOpenId] = React.useState<number | null>(null)
  const shown = events.filter((e) => cats.includes(e.category) && (!e.owner || owners.includes(e.owner)))
  const allDay = shown.filter((e) => e.start === undefined)
  const timed = shown.filter((e) => e.start !== undefined)
  const step = view === "week" ? 7 : 1
  const cols = { gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }
  const card = (e: Ev, className?: string, style?: React.CSSProperties) => (
    <EventCard key={e.id} e={e} open={openId === e.id} onOpenChange={(o) => setOpenId(o ? e.id : null)} className={className} style={style} />
  )
  const toggle = <T,>(xs: T[], x: T, on: boolean) => (on ? [...xs, x] : xs.filter((y) => y !== x))
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <Button variant="muted" size="sm" onClick={() => setFocus(0)}>Today</Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="muted" size="sm" aria-label="Select view" />}>{view === "week" ? "Week" : "Day"} <ChevronDownIcon /></DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            <DropdownMenuRadioGroup value={view} onValueChange={(v) => setView(v as View)}>
              <DropdownMenuRadioItem value="day">Day</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="week">Week</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon-sm" aria-label={`Previous ${view}`} onClick={() => setFocus(focus - step)}><ChevronLeftIcon /></Button>
        <Button variant="ghost" size="icon-sm" aria-label={`Next ${view}`} onClick={() => setFocus(focus + step)}><ChevronRightIcon /></Button>
        <span className="text-sm font-semibold" aria-live="polite">{rangeTitle(days)}</span>
        {title && <Badge variant="outline" size="lg" className="ml-1">{title}</Badge>}
        <div className="ml-auto flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="muted" size="sm" />}>Category <Badge variant="outline" size="sm">{cats.length}</Badge><ChevronDownIcon /></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                {categories.map((c) => (
                  <DropdownMenuCheckboxItem key={c} checked={cats.includes(c)} onCheckedChange={(on) => setCats(toggle(cats, c, on))}>
                    <span className={cn("size-2 rounded-full", tone[c].chip)} />{c}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="muted" size="sm" />}>Ownership <Badge variant="outline" size="sm">{owners.length}</Badge><ChevronDownIcon /></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Ownership</DropdownMenuLabel>
                {calOwners.map((o) => (
                  <DropdownMenuCheckboxItem key={o} checked={owners.includes(o)} onCheckedChange={(on) => setOwners(toggle(owners, o, on))}>
                    <Person name={o} />{o}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-auto">
        <div className={cn("grid", view === "week" && "min-w-[760px]")} style={cols}>
          <div className="sticky top-0 z-[2] border-b bg-background" />
          {days.map((d) => (
            <div key={d} className="sticky top-0 z-[2] border-b border-s bg-background px-2 py-2 text-[13px] font-medium">{dayLabel(d)}</div>
          ))}

          <div className="flex items-center justify-center border-b text-[11px] text-muted-foreground">All day</div>
          {days.map((d) => (
            <div key={d} className="relative flex min-h-24 flex-col gap-1 border-b border-s p-1">
              <button
                type="button"
                aria-label={`New all-day event, ${dayLabel(d)}`}
                onClick={() => openNew(d, 9, true)}
                className="absolute inset-0 cursor-pointer transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
              />
              {allDay.filter((e) => e.day === d).map((e) => card(e, "relative"))}
            </div>
          ))}

          <div>
            {Array.from({ length: END - START }, (_, i) => (
              <div key={i} style={{ height: ROW }} className="pe-2 text-right text-[11px] text-muted-foreground">{hour(START + i)}</div>
            ))}
          </div>
          {days.map((d) => {
            const dayEvents = timed.filter((e) => e.day === d)
            const layout = lanes(dayEvents)
            return (
              <div key={d} className="relative border-s" style={{ height: (END - START) * ROW }}>
                {Array.from({ length: (END - START) * 2 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`New event, ${dayLabel(d)} ${time(START + i / 2)}`}
                    onClick={() => openNew(d, START + i / 2)}
                    style={{ height: ROW / 2 }}
                    className={cn(
                      "group/slot flex w-full cursor-pointer items-start px-1.5 pt-0.5 text-[11px] text-muted-foreground transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60",
                      i % 2 === 1 && "border-b border-dashed"
                    )}
                  >
                    <span className="opacity-0 group-hover/slot:opacity-100 group-focus-visible/slot:opacity-100">+ {time(START + i / 2)}</span>
                  </button>
                ))}
                {dayEvents.map((e) => {
                  const { lane, of } = layout.get(e.id)!
                  return card(e, "absolute z-[1]", {
                    top: (e.start! - START) * ROW + 1,
                    height: (e.end! - e.start!) * ROW - 2,
                    left: `calc(${(lane * 100) / of}% + 4px)`,
                    width: `calc(${100 / of}% - 8px)`,
                  })
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
