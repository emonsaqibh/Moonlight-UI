"use client"

import * as React from "react"
import { PinIcon, PlusIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { CheckHistory } from "@/components/monitors/check-history"
import { CheckoutFlow } from "@/components/monitors/checkout-flow"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { type Monitor, monitorOwners, monitors as initialMonitors, monitorServices, nextChecks } from "@/lib/data/monitors-data"

const presets = [
  { value: "5m", label: "Every 5 min", cron: "*/5 * * * *", every: "Every 5 minutes", interval: 5, nextIn: 5 },
  { value: "hourly", label: "Hourly", cron: "0 * * * *", every: "Hourly at :00", interval: 60, nextIn: 60 },
  { value: "daily", label: "Daily", cron: "0 2 * * *", every: "Daily at 02:00", interval: 1440, nextIn: 720 },
  { value: "weekdays", label: "Weekdays", cron: "0 9 * * 1-5", every: "Weekdays at 09:00", interval: 1440, nextIn: 1140 },
  { value: "weekly", label: "Weekly", cron: "0 9 * * 1", every: "Mondays at 09:00", interval: 10080, nextIn: 5640 },
  { value: "monthly", label: "Monthly", cron: "0 9 1 * *", every: "Monthly on the 1st", interval: 43200, nextIn: 13500 },
]
const regions = [{ value: "global", label: "All 6 regions" }, { value: "US East", label: "US East" }, { value: "EU (Frankfurt)", label: "EU (Frankfurt)" }]

function NewMonitorSheet({ onCreate }: { onCreate: (m: Monitor) => void }) {
  const [open, setOpen] = React.useState(false)
  const [preset, setPreset] = React.useState(presets[0])
  const [cron, setCron] = React.useState(preset.cron)
  const upcoming = nextChecks({ ...preset, paused: false }, 3)
  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const f = new FormData(ev.currentTarget)
    const get = (k: string) => String(f.get(k) ?? "").trim()
    const target = get("command") || "api.acme.com/health"
    const http = /^[\w.-]+\.\w+(\/|$)/.test(target)
    const region = regions.find((r) => r.value === get("cluster"))?.label ?? "All 6 regions"
    const paused = f.get("enabled") !== "on"
    onCreate({
      id: `MON-${Math.floor(Math.random() * 900) + 109}`, name: get("name") || target, target: `${target} · ${preset.label.toLowerCase()}`, kind: http ? "http" : "job", status: "Up",
      ago: "Never", duration: "—", uptime: 100, p95: "—", paused, cron, every: preset.every, interval: preset.interval, nextIn: preset.nextIn, service: get("service") || "checkout-api",
      region, owner: get("ownerId") === "shadcn" ? "Shadcn" : get("ownerId"), team: "Platform", timeout: "15s", retries: 1, next: paused ? "Paused" : upcoming[0][0],
      request: http ? `GET https://${target}` : target, checks: [],
    })
    setOpen(false)
    setPreset(presets[0])
    setCron(presets[0].cron)
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}><PlusIcon /> New Monitor</SheetTrigger>
      <SheetContent className="gap-0 data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>New Monitor</SheetTitle>
          <SheetDescription>Check a URL or watch a scheduled command in Acme Core.</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>
              <Field><FieldLabel htmlFor="nm-name">Name</FieldLabel><Input id="nm-name" name="name" placeholder="Checkout flow" required autoFocus /></Field>
              <Field><FieldLabel htmlFor="nm-target">Target</FieldLabel><Input id="nm-target" name="command" placeholder="api.acme.com/health" required className="font-mono" /></Field>
              <FieldSet>
                <FieldLegend>Schedule</FieldLegend>
                <ToggleGroup aria-label="Schedule presets" variant="outline" size="sm" spacing={1} className="flex-wrap" value={[preset.value]} onValueChange={(v) => { const p = presets.find((x) => x.value === v[0]); if (p) { setPreset(p); setCron(p.cron) } }}>
                  {presets.map((p) => <ToggleGroupItem key={p.value} value={p.value}>{p.label}</ToggleGroupItem>)}
                </ToggleGroup>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="nm-cron">Cron Expression</FieldLabel>
                    <Input id="nm-cron" name="schedule" placeholder="0 2 * * *" value={cron} onChange={(e) => setCron(e.target.value)} className="font-mono" />
                    <FieldDescription>{cron === preset.cron ? `${preset.every} UTC` : "Custom schedule"}</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel>Timezone</FieldLabel>
                    <Select name="timezone" defaultValue="UTC">
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>{["UTC", "New York (UTC-4)", "Dublin (UTC+1)"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="rounded-lg border p-3 text-sm">
                  <div className="mb-1 text-xs font-medium text-muted-foreground">Next 3 Checks</div>
                  {upcoming.map(([at, rel]) => <div key={at} className="flex justify-between py-0.5"><span>{at}</span><span className="text-muted-foreground">{rel}</span></div>)}
                </div>
              </FieldSet>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Service</FieldLabel>
                  <Select name="service" defaultValue="checkout-api">
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{monitorServices.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Region</FieldLabel>
                  <Select name="cluster" defaultValue="global" items={regions}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{regions.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Environment</FieldLabel>
                  <Select name="environment" defaultValue="Production">
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Production", "Staging", "Sandbox"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Owner</FieldLabel>
                  <Select name="ownerId" defaultValue="shadcn" items={[{ value: "shadcn", label: "Shadcn" }, ...monitorOwners.map((o) => ({ value: o, label: o }))]}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shadcn">Shadcn</SelectItem>
                      {monitorOwners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field orientation="horizontal">
                <Checkbox id="nm-enabled" name="enabled" defaultChecked />
                <FieldContent>
                  <FieldLabel htmlFor="nm-enabled">Start enabled</FieldLabel>
                  <FieldDescription>Checks on schedule once created. First check {upcoming[0][1]}.</FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </div>
          <SheetFooter className="flex-row justify-end border-t">
            <SheetClose render={<Button type="button" variant="muted" />}>Cancel</SheetClose>
            <Button type="submit">Create Monitor</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/** Monitors page: header with a working "New Monitor" sheet, the checkout-flow chart and the check history it adds to. */
export function MonitorsView({ crumbs }: { crumbs: string[] }) {
  const [monitors, setMonitors] = React.useState(initialMonitors)
  const [pinned, setPinned] = React.useState(false)
  return (
    <>
      <PageHeader crumbs={crumbs}>
        <Button variant="muted" aria-pressed={pinned} onClick={() => setPinned((p) => !p)}><PinIcon className={pinned ? "fill-current" : undefined} /> {pinned ? "Pinned" : "Pin"}</Button>
        <NewMonitorSheet onCreate={(m) => setMonitors((l) => [m, ...l])} />
      </PageHeader>
      <PageBody>
        <CheckoutFlow />
        <CheckHistory monitors={monitors} onMonitorsChange={setMonitors} />
      </PageBody>
    </>
  )
}
