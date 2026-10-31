"use client"

import * as React from "react"
import { BellIcon, ChevronUpIcon, CreditCardIcon, KeyRoundIcon, ShieldIcon, SlidersHorizontalIcon, UserIcon } from "lucide-react"

import { type Theme, useTheme } from "@/components/app/theme"
import { Badge } from "@/components/ui/badge"
import { Frame, FramePanel } from "@/components/ui/frame"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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

export function SettingsView() {
  const [tab, setTab] = React.useState<string>("general")
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
