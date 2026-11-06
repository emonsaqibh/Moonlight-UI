"use client"

import * as React from "react"
import { BellIcon, CheckIcon, ChevronUpIcon, CreditCardIcon, DownloadIcon, ExternalLinkIcon, FileDownIcon, KeyRoundIcon, RefreshCwIcon, ShieldIcon, SlidersHorizontalIcon, UserIcon } from "lucide-react"

import { type Theme, useTheme } from "@/components/app/theme"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const nav = [
  ["profile", "Profile", UserIcon],
  ["general", "General", SlidersHorizontalIcon],
  ["api", "API keys", KeyRoundIcon],
  ["security", "Security", ShieldIcon],
  ["billing", "Billing", CreditCardIcon],
] as const

type Opt = { value: string; label: string }

function Row({ title, hint, badge, children }: { title: string; hint: string; badge?: [string, React.ComponentProps<typeof Badge>["variant"]]; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium">
          {title}
          {badge && <Badge variant={badge[1]} size="sm">{badge[0]}</Badge>}
        </div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      {children}
    </div>
  )
}

function Choice({ options, value, onValueChange, defaultValue }: { options: Opt[]; value?: string; defaultValue?: string; onValueChange?: (v: string) => void }) {
  return (
    <Select items={options} value={value} defaultValue={defaultValue} onValueChange={(v) => v && onValueChange?.(v)}>
      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true)
  return (
    <Frame>
      <FramePanel className="p-0">
        <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold">
          {title}
          <ChevronUpIcon className={cn("size-4 text-muted-foreground transition-transform", !open && "rotate-180")} />
        </button>
        {open && <div className="divide-y border-t">{children}</div>}
      </FramePanel>
    </Frame>
  )
}

const plans = [
  { name: "Starter", blurb: "One team watching a few services", price: 49, features: ["5 seats", "10 monitors", "100K API calls a month", "10 GB log storage"] },
  { name: "Growth", blurb: "Several teams sharing on-call", price: 199, features: ["25 seats", "50 monitors", "1M API calls a month", "100 GB log storage"] },
  { name: "Scale", blurb: "Many services and audit needs", price: 599, features: ["100 seats", "200 monitors", "5M API calls a month", "500 GB log storage"] },
]
const usage = [["Seats", 18, 25, "18 of 25"], ["Monitors", 41, 50, "41 of 50"], ["API Calls", 773.5, 1000, "773.5K of 1M"], ["Log Storage", 38.2, 100, "38.2 GB of 100 GB"]] as const
const invoiceStatus = { Open: "warning-light", Paid: "success-light", Void: "secondary" } as const
const demoInvoices: { id: string; status: keyof typeof invoiceStatus; date: string; what: string; amount: string }[] = [
  { id: "INV-20431", status: "Open", date: "Due Oct 31", what: "Log backfill import, one time", amount: "$162.38" },
  { id: "INV-20418", status: "Paid", date: "Oct 1, 2026", what: "Growth, monthly", amount: "$215.42" },
  { id: "INV-20397", status: "Paid", date: "Sep 1, 2026", what: "Growth, monthly", amount: "$215.42" },
  { id: "INV-20384", status: "Paid", date: "Aug 12, 2026", what: "Upgrade to Growth, prorated", amount: "$104.75" },
  { id: "INV-20371", status: "Paid", date: "Aug 1, 2026", what: "Starter, monthly", amount: "$53.04" },
  { id: "INV-20358", status: "Void", date: "Jul 1, 2026", what: "Starter, monthly, reissued", amount: "$53.04" },
]

function Billing() {
  const [interval, setPeriod] = React.useState("monthly")
  const [current, setCurrent] = React.useState("Growth")
  const [invoices, setInvoices] = React.useState(demoInvoices)
  const [syncing, setSyncing] = React.useState(false)
  const plan = plans.find((p) => p.name === current)!
  const price = (p: number) => (interval === "yearly" ? Math.round(p * 10) : p)
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Frame>
        <FramePanel className="p-0">
          <FrameHeader className="flex-row items-start justify-between">
            <div>
              <FrameTitle className="flex items-center gap-2">Subscription <Badge variant="success-light">Active</Badge></FrameTitle>
              <FrameDescription>SUB-4821, billed by Stripe</FrameDescription>
            </div>
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Sync from Stripe" onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 1200) }} />}>
                <RefreshCwIcon className={cn(syncing && "animate-spin")} />
              </TooltipTrigger>
              <TooltipContent>Sync from Stripe</TooltipContent>
            </Tooltip>
          </FrameHeader>
          <div className="grid gap-4 px-4 pb-4 @xl:grid-cols-3">
            <div><div className="text-xs text-muted-foreground">{current}, {interval}</div><div className="text-2xl font-semibold tabular-nums">${price(plan.price)}</div><div className="text-xs text-muted-foreground">per {interval === "yearly" ? "year" : "month"}</div></div>
            <div><div className="text-xs text-muted-foreground">Renews</div><div className="text-sm font-medium">Nov 1, 2026</div><div className="text-xs text-muted-foreground">In 9 days</div></div>
            <Progress value={71}><ProgressLabel className="text-xs font-normal text-muted-foreground">Oct 1 to Nov 1, 2026</ProgressLabel><ProgressValue className="text-xs">{() => "Day 22 of 31"}</ProgressValue></Progress>
          </div>
        </FramePanel>
      </Frame>
      <Frame>
        <FramePanel className="p-0">
          <FrameHeader className="flex-row items-start justify-between">
            <div><FrameTitle>Plans</FrameTitle><FrameDescription>Fixed prices, tax added at checkout</FrameDescription></div>
            <ToggleGroup value={[interval]} onValueChange={(v) => v.length && setPeriod(v[0])} variant="outline" size="sm" spacing={0} aria-label="Billing interval">
              <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
              <ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
            </ToggleGroup>
          </FrameHeader>
          <div className="grid gap-3 px-4 pb-4 @2xl:grid-cols-3">
            {plans.map((p, i) => {
              const at = plans.findIndex((x) => x.name === current)
              return (
                <div key={p.name} className={cn("flex flex-col gap-3 rounded-lg border p-3", p.name === current && "ring-2 ring-primary/30")}>
                  <div className="flex items-center gap-2 text-sm font-medium">{p.name}{p.name === current && <Badge variant="primary-light">Current</Badge>}</div>
                  <div className="text-xs text-muted-foreground">{p.blurb}</div>
                  <div><span className="text-xl font-semibold tabular-nums">${price(p.price)}</span><span className="text-xs text-muted-foreground"> / {interval === "yearly" ? "year" : "month"}</span></div>
                  <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                    {p.features.map((f) => <li key={f} className="flex items-center gap-1.5"><CheckIcon className="size-3.5" />{f}</li>)}
                  </ul>
                  <Button variant={p.name === current ? "secondary" : i > at ? "default" : "outline"} size="sm" disabled={p.name === current} onClick={() => setCurrent(p.name)} className="mt-auto">
                    {p.name === current ? "Current Plan" : i > at ? "Upgrade" : "Downgrade"}
                  </Button>
                </div>
              )
            })}
          </div>
        </FramePanel>
      </Frame>
      <div className="grid gap-4 @3xl:grid-cols-2">
        <Frame>
          <FramePanel className="p-0">
            <FrameHeader><FrameTitle>Usage</FrameTitle><FrameDescription>Since Oct 1, against {current} limits</FrameDescription></FrameHeader>
            <div className="flex flex-col gap-4 px-4 pb-4">
              {usage.map(([label, v, max, text]) => (
                <Progress key={label} value={(v / max) * 100} aria-label={`${label}: ${text}`}>
                  <ProgressLabel className="flex items-center gap-2 text-xs">{label}{v / max > 0.8 && <Badge variant="warning-light" size="sm">Near Limit</Badge>}</ProgressLabel>
                  <ProgressValue className="text-xs">{() => text}</ProgressValue>
                </Progress>
              ))}
            </div>
            <FrameFooter className="flex-row items-center justify-between border-t text-xs text-muted-foreground">
              <span>Counts update hourly</span>
              <Button variant="ghost" size="sm"><DownloadIcon /> Export CSV</Button>
            </FrameFooter>
          </FramePanel>
        </Frame>
        <Frame>
          <FramePanel className="p-0">
            <FrameHeader><FrameTitle>Payment</FrameTitle><FrameDescription>Card, receipts and the next charge</FrameDescription></FrameHeader>
            <div className="divide-y px-4 pb-2 text-sm">
              {[["Card", "Visa ending 4242", "Default, expires 12/28"], ["Billing Email", "billing@acme.com", "Gets every receipt"], ["Next Invoice", "$190.42", "Due Nov 1, 2026, after $25.00 credit"], ["Last Payment", "$215.42", "Oct 1, 2026, INV-20418"]].map(([k, v, hint]) => (
                <div key={k} className="flex items-center justify-between gap-3 py-2">
                  <div><div>{k}</div><div className="text-xs text-muted-foreground">{hint}</div></div>
                  <span className="font-medium tabular-nums">{v}</span>
                </div>
              ))}
            </div>
            <FrameFooter className="flex-row items-center justify-between border-t text-xs text-muted-foreground">
              <span>Secured by Stripe</span>
              <Button variant="outline" size="sm"><CreditCardIcon /> Update Card</Button>
            </FrameFooter>
          </FramePanel>
        </Frame>
      </div>
      <Frame>
        <FramePanel className="p-0">
          <FrameHeader><FrameTitle>Invoices</FrameTitle><FrameDescription>Latest {invoices.length} from Stripe</FrameDescription></FrameHeader>
          <Table aria-label="Invoices">
            <TableHeader><TableRow>{["Invoice", "Status", "Date", "Description", "Amount", ""].map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {invoices.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">{v.id}</TableCell>
                  <TableCell><Badge variant={invoiceStatus[v.status]}>{v.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{v.date}</TableCell>
                  <TableCell className="max-w-56 truncate">{v.what}</TableCell>
                  <TableCell className="tabular-nums">{v.amount}</TableCell>
                  <TableCell>
                    <span className="flex items-center justify-end gap-1">
                      {v.status === "Open" && <Button size="xs" onClick={() => setInvoices((l) => l.map((x) => (x.id === v.id ? { ...x, status: "Paid", date: "Oct 22, 2026" } : x)))}>Pay</Button>}
                      <Tooltip>
                        <TooltipTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`View ${v.id} on Stripe`} />}><ExternalLinkIcon /></TooltipTrigger>
                        <TooltipContent>View on Stripe</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`Download ${v.id} PDF`} />}><FileDownIcon /></TooltipTrigger>
                        <TooltipContent>Download PDF</TooltipContent>
                      </Tooltip>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <FrameFooter className="flex-row items-center justify-between border-t text-xs text-muted-foreground">
            <span>Older invoices are in the billing portal</span>
          </FrameFooter>
        </FramePanel>
      </Frame>
    </div>
  )
}

/** Pass `tab` + `onTabChange` to control the section (e.g. a "Manage Billing" header button can open "billing"). */
export function SettingsView({ tab: controlled, onTabChange }: { tab?: string; onTabChange?: (t: string) => void } = {}) {
  const [own, setOwn] = React.useState<string>("general")
  const tab = controlled ?? own
  const setTab = (t: string) => (onTabChange ? onTabChange(t) : setOwn(t))
  const [theme, setTheme] = useTheme()
  return (
    <div className="grid gap-4 @3xl:grid-cols-[11rem_minmax(0,1fr)]">
      <nav className="flex gap-1 @3xl:flex-col" aria-label="Settings sections">
        {nav.map(([v, label, Icon]) => (
          <button
            key={v}
            type="button"
            onClick={() => setTab(v)}
            aria-current={tab === v ? "page" : undefined}
            className={cn(
              "flex h-8 items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              tab === v && "bg-muted text-foreground ring-1 ring-input/50 ring-inset"
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </nav>
      {tab === "general" ? (
        <div className="flex min-w-0 flex-col gap-4">
          <Section title="General">
            <Row title="Landing page" hint="Choose which page opens after sign-in.">
              <Choice defaultValue="overview" options={[{ value: "overview", label: "Overview" }, { value: "services", label: "Services" }, { value: "logs", label: "Logs" }]} />
            </Row>
            <Row title="Date format" hint="Set how dates appear across the app.">
              <Choice defaultValue="mdy" options={[{ value: "mdy", label: "MM/DD/YYYY" }, { value: "dmy", label: "DD/MM/YYYY" }, { value: "ymd", label: "YYYY-MM-DD" }]} />
            </Row>
            <Row title="First day of week" hint="Used for calendars and date pickers.">
              <Choice defaultValue="mon" options={[{ value: "mon", label: "Monday" }, { value: "sun", label: "Sunday" }]} />
            </Row>
            <Row title="Auto-refresh charts" hint="Reload live charts every 30 seconds." badge={["Recommended", "success-light"]}>
              <Switch defaultChecked />
            </Row>
            <Row title="Markdown notes" hint="Format incident notes and postmortems." badge={["Editor", "info-light"]}>
              <Switch defaultChecked />
            </Row>
          </Section>
          <Section title="Display">
            <Row title="Color theme" hint="Choose your preferred color scheme." badge={["Shared", "primary-light"]}>
              <Choice
                value={theme}
                onValueChange={(v) => setTheme(v as Theme)}
                options={[{ value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
              />
            </Row>
            <Row title="Timestamps" hint="Show times in UTC or your local zone.">
              <Choice defaultValue="utc" options={[{ value: "utc", label: "UTC" }, { value: "local", label: "Local" }]} />
            </Row>
            <Row title="Reduce animations" hint="Minimize motion for accessibility." badge={["Accessibility", "warning-light"]}>
              <Switch />
            </Row>
            <Row title="Show tooltips" hint="Display helpful hints on hover.">
              <Switch defaultChecked />
            </Row>
          </Section>
        </div>
      ) : tab === "billing" ? (
        <Billing />
      ) : (
        <Frame>
          <FramePanel className="flex flex-col items-center gap-2 py-16 text-center">
            <BellIcon className="size-5 text-muted-foreground" />
            <div className="text-sm font-medium">{nav.find(([v]) => v === tab)?.[1]}</div>
            <div className="text-xs text-muted-foreground">Nothing to configure here yet.</div>
          </FramePanel>
        </Frame>
      )}
    </div>
  )
}
