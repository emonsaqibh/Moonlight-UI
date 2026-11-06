"use client"

import * as React from "react"
import {
  CalendarClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CopyIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  ServerIcon,
  TerminalIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { RunStrip } from "@/components/app/run-strip"
import { JobsTable } from "@/components/overview/jobs-table"
import { RunTimeChart } from "@/components/overview/run-time-chart"
import { StatCards } from "@/components/overview/stat-cards"
import { UpNext } from "@/components/overview/up-next"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { jobs as demoJobs, upNext, type Job } from "@/lib/data/jobs-data"

const presets = [
  { value: "5m", label: "Every 5 min", cron: "*/5 * * * *", schedule: "Every 5 minutes", next: ["in 5m", "in 10m", "in 15m"] },
  { value: "hourly", label: "Hourly", cron: "0 * * * *", schedule: "Hourly at :00", next: ["in 1h", "in 2h", "in 3h"] },
  { value: "daily", label: "Daily", cron: "0 3 * * *", schedule: "Daily at 03:00", next: ["in 13h", "in 1d 13h", "in 2d 13h"] },
  { value: "weekdays", label: "Weekdays", cron: "0 9 * * 1-5", schedule: "Weekdays at 09:00", next: ["in 19h", "in 1d 19h", "in 4d 19h"] },
  { value: "weekly", label: "Weekly", cron: "0 2 * * 1", schedule: "Weekly on Monday", next: ["in 4d 12h", "in 11d 12h", "in 18d 12h"] },
  { value: "monthly", label: "Monthly", cron: "0 0 1 * *", schedule: "Monthly on the 1st", next: ["in 9d 10h", "in 39d 10h", "in 70d 10h"] },
]
const options = (values: string[]) => values.map((v) => ({ value: v, label: v }))
const services = options(["payments", "billing-worker", "webhooks-dispatcher", "search-indexer", "notifications", "fraud-scorer"])
const clusters = options(["prod-us-east-1", "prod-eu-central-1", "staging-us-east-1"])
const environments = options(["Production", "Staging", "Sandbox"])
const timezones = options(["UTC", "Europe/Berlin", "America/New_York", "Asia/Singapore"])
const owners = options([...new Set(demoJobs.map((j) => j.owner))])
const initials = (name: string) => name.split(" ").map((p) => p[0]).join("")

function OptionSelect({ id, items, value, onValueChange, mono }: { id?: string; items: { value: string; label: string }[]; value: string; onValueChange: (v: string) => void; mono?: boolean }) {
  return (
    <Select items={items} value={value} onValueChange={(v) => v && onValueChange(v)}>
      <SelectTrigger id={id} className={mono ? "w-full font-mono" : "w-full"}><SelectValue /></SelectTrigger>
      <SelectContent>
        {items.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

function NewJobForm({ jobs, onCreate }: { jobs: Job[]; onCreate: (job: Job) => void }) {
  const [form, setForm] = React.useState({ name: "", command: "", preset: "hourly", cron: "0 * * * *", timezone: "UTC", service: "payments", cluster: "prod-us-east-1", environment: "Production", owner: "Shadcn", enabled: true })
  const [submitted, setSubmitted] = React.useState(false)
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))
  const preset = presets.find((p) => p.value === form.preset)
  const errors = {
    name: !form.name.trim() ? "Give the job a name." : jobs.some((j) => j.name.toLowerCase() === form.name.trim().toLowerCase()) ? "A job with this name already exists." : undefined,
    command: !form.command.trim() ? "Enter the command to run." : undefined,
    cron: form.cron.trim().split(/\s+/).length !== 5 ? "Use 5 fields: minute hour day month weekday." : undefined,
  }
  const show = (k: keyof typeof errors) => (submitted ? errors[k] : undefined)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
    if (Object.values(errors).some(Boolean)) {
      e.currentTarget.querySelector<HTMLElement>("[aria-invalid=true]")?.focus()
      return
    }
    onCreate({
      id: `JOB-${310 + jobs.length}`,
      name: form.name.trim(),
      command: form.command.trim(),
      schedule: preset?.schedule ?? "Custom",
      cron: form.cron.trim().replace(/\s+/g, " "),
      enabled: form.enabled,
      status: "Succeeded",
      ago: "Never",
      duration: "",
      target: form.service,
      region: form.cluster,
      owner: form.owner,
      runs: [],
      environment: form.environment,
      team: jobs.find((j) => j.owner === form.owner)?.team ?? "Platform",
    })
  }

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <SheetHeader className="border-b">
        <SheetTitle>New Job</SheetTitle>
        <SheetDescription>Schedule a command on Acme Core.</SheetDescription>
      </SheetHeader>
      <FieldGroup className="min-h-0 flex-1 gap-5 overflow-y-auto p-4">
        <Field data-invalid={!!show("name") || undefined}>
          <FieldLabel htmlFor="job-name">Name</FieldLabel>
          <Input id="job-name" autoFocus value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nightly ledger reconciliation" aria-invalid={!!show("name")} />
          <FieldError>{show("name")}</FieldError>
        </Field>
        <Field data-invalid={!!show("command") || undefined}>
          <FieldLabel htmlFor="job-command">Command</FieldLabel>
          <InputGroup>
            <InputGroupAddon><TerminalIcon /></InputGroupAddon>
            <InputGroupInput id="job-command" className="font-mono" value={form.command} onChange={(e) => set("command", e.target.value)} placeholder="acme run payments -- jobs:sync" aria-invalid={!!show("command")} />
          </InputGroup>
          <FieldError>{show("command")}</FieldError>
        </Field>
        <Field>
          <FieldLabel>Schedule</FieldLabel>
          <ToggleGroup variant="outline" size="sm" spacing={0} className="w-full" value={preset ? [preset.value] : []} onValueChange={(v) => {
            const p = presets.find((x) => x.value === v[0])
            if (p) setForm((f) => ({ ...f, preset: p.value, cron: p.cron }))
          }}>
            {presets.map((p) => <ToggleGroupItem key={p.value} value={p.value} className="flex-1">{p.label}</ToggleGroupItem>)}
          </ToggleGroup>
        </Field>
        <Field data-invalid={!!show("cron") || undefined}>
          <FieldLabel htmlFor="job-cron">Cron Expression</FieldLabel>
          <InputGroup>
            <InputGroupAddon><CalendarClockIcon /></InputGroupAddon>
            <InputGroupInput id="job-cron" className="font-mono" value={form.cron} aria-invalid={!!show("cron")} onChange={(e) => {
              const cron = e.target.value
              setForm((f) => ({ ...f, cron, preset: presets.find((p) => p.cron === cron.trim())?.value ?? "" }))
            }} />
          </InputGroup>
          {show("cron") ? <FieldError>{show("cron")}</FieldError> : <FieldDescription>{preset ? `${preset.schedule} ${form.timezone}` : `Custom schedule, ${form.timezone}`}</FieldDescription>}
        </Field>
        <Field>
          <FieldLabel htmlFor="job-tz">Timezone</FieldLabel>
          <OptionSelect id="job-tz" items={timezones} value={form.timezone} onValueChange={(v) => set("timezone", v)} />
        </Field>
        {preset && (
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="text-xs font-medium text-muted-foreground">Next 3 Runs</span>
            {preset.next.map((n, i) => (
              <div key={n} className="flex justify-between">
                <span>Run {i + 1}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{n}</span>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="job-service">Service</FieldLabel>
            <OptionSelect id="job-service" items={services} value={form.service} onValueChange={(v) => set("service", v)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="job-cluster">Cluster</FieldLabel>
            <OptionSelect id="job-cluster" items={clusters} value={form.cluster} onValueChange={(v) => set("cluster", v)} mono />
          </Field>
          <Field>
            <FieldLabel htmlFor="job-env">Environment</FieldLabel>
            <OptionSelect id="job-env" items={environments} value={form.environment} onValueChange={(v) => set("environment", v)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="job-owner">Owner</FieldLabel>
            <OptionSelect id="job-owner" items={owners} value={form.owner} onValueChange={(v) => set("owner", v)} />
          </Field>
        </div>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="job-enabled">Start enabled</FieldLabel>
            <FieldDescription>Runs on schedule once created.</FieldDescription>
          </FieldContent>
          <Switch id="job-enabled" checked={form.enabled} onCheckedChange={(v) => set("enabled", v)} />
        </Field>
      </FieldGroup>
      <SheetFooter className="flex-row items-center border-t">
        <span className="mr-auto text-xs text-muted-foreground">{form.enabled ? (preset ? `First run ${preset.next[0]}` : "Custom schedule") : "Starts paused"}</span>
        <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
        <Button type="submit"><PlusIcon /> Create Job</Button>
      </SheetFooter>
    </form>
  )
}

/** Sheet with the New Job form. Validates name, command and cron, then hands the job to `onCreate`. */
export function NewJobSheet({ open, onOpenChange, jobs, onCreate }: { open: boolean; onOpenChange: (open: boolean) => void; jobs: Job[]; onCreate: (job: Job) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <NewJobForm jobs={jobs} onCreate={onCreate} />
      </SheetContent>
    </Sheet>
  )
}

const statusBadge = (j: Job) =>
  !j.enabled ? <Badge variant="info-light">Paused</Badge>
  : j.status === "Failed" ? <Badge variant="destructive-light">Failing</Badge>
  : j.status === "Timed Out" ? <Badge variant="warning-light">Timed Out</Badge>
  : <Badge variant="success-light">Healthy</Badge>

const runBadge = { Failed: "destructive-light", "Timed Out": "warning-light", Succeeded: "success-light" } as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center gap-1.5">{children}</dd>
    </div>
  )
}

const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => {})

/**
 * Job detail Sheet: status, schedule, details, recent runs and settings, with Run Now / Pause and
 * previous/next navigation through `jobs`.
 */
export function JobSheet({ job, jobs, open, onOpenChange, onNavigate, onJobChange, onDelete }: {
  job?: Job
  jobs: Job[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (job: Job) => void
  onJobChange: (job: Job) => void
  onDelete: (job: Job) => void
}) {
  const [tab, setTab] = React.useState<string>("overview")
  const [running, setRunning] = React.useState(false)
  React.useEffect(() => setTab("overview"), [job?.name])
  if (!job) return null
  const i = jobs.findIndex((j) => j.name === job.name)
  const cron = job.cron.split(" ")
  const failing = job.enabled && job.status !== "Succeeded" && job.error
  const next = upNext.find((u) => u.name === job.name)?.in
  const command = `acme run ${job.target} -- ${job.command}`
  const runNow = () => {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      onJobChange({ ...job, status: "Succeeded", ago: "just now", duration: job.duration || "14s", runs: [...job.runs, "Succeeded" as const].slice(-20) })
    }, 1200)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent showCloseButton={false} className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        <SheetHeader className="gap-2 border-b">
          <div className="flex items-center gap-1">
            <code className="font-mono text-xs text-muted-foreground">{job.id}</code>
            <Button variant="ghost" size="icon-xs" aria-label="Copy job ID" onClick={() => copy(job.id)}><CopyIcon /></Button>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" aria-label="Previous job" disabled={i <= 0} onClick={() => onNavigate(jobs[i - 1])}><ChevronUpIcon /></Button>
              <span className="text-xs tabular-nums text-muted-foreground">{i + 1} of {jobs.length}</span>
              <Button variant="ghost" size="icon-sm" aria-label="Next job" disabled={i >= jobs.length - 1} onClick={() => onNavigate(jobs[i + 1])}><ChevronDownIcon /></Button>
              <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}><XIcon /></SheetClose>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SheetTitle className="text-lg">{job.name}</SheetTitle>
            {statusBadge(job)}
          </div>
          <SheetDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <code className="font-mono text-foreground">{job.cron}</code>
            <span>·</span>
            <span>{job.schedule} UTC</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><ServerIcon className="size-3.5" />{job.target}</span>
          </SheetDescription>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={runNow} disabled={running}>{running ? <Spinner /> : <PlayIcon />} {running ? "Running…" : "Run Now"}</Button>
            <Button size="sm" variant="outline" onClick={() => onJobChange({ ...job, enabled: !job.enabled })}>
              {job.enabled ? <><PauseIcon /> Pause</> : <><PlayIcon /> Resume</>}
            </Button>
          </div>
        </SheetHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="min-h-0 flex-1 gap-0">
          <TabsList variant="line" className="px-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="runs">Runs <Badge variant="outline" size="sm" radius="full">{job.runs.length}</Badge></TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="flex min-h-0 flex-col gap-5 overflow-y-auto p-4">
            {failing && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <code className="font-mono text-sm font-medium">Exit {job.error!.exit}</code>
                  <p className="text-muted-foreground">{job.error!.message}</p>
                </div>
                <Button size="xs" variant="outline" onClick={() => setTab("runs")}>View Log</Button>
              </div>
            )}
            <Section title="Schedule">
              <div className="grid grid-cols-5 gap-2">
                {["Minute", "Hour", "Day", "Month", "Weekday"].map((l, k) => (
                  <div key={l} className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{l}</span>
                    <code className="font-mono">{cron[k]}</code>
                  </div>
                ))}
              </div>
            </Section>
            <Separator />
            <Section title="Details">
              <dl>
                <Detail label="Runs">{job.schedule} <span className="text-muted-foreground">UTC</span></Detail>
                <Detail label="Next Run">{!job.enabled ? <span className="text-muted-foreground">Paused</span> : next ? `in ${next}` : job.schedule}</Detail>
                <Detail label="Concurrency">Forbid <span className="text-muted-foreground">skip if still running</span></Detail>
                <Detail label="Timeout">{job.status === "Timed Out" ? "1 h" : "15 min"}</Detail>
                <Detail label="Retries">{job.status === "Succeeded" ? 0 : 1}</Detail>
                <Detail label="Alerts">{job.environment === "Production" ? "Pages #sre-oncall" : "None"}</Detail>
                <Detail label="Target"><ServerIcon className="size-3.5 text-muted-foreground" />{job.target}<code className="font-mono text-xs text-muted-foreground">{job.region}</code></Detail>
                <Detail label="Environment"><Badge variant="outline">{job.environment}</Badge></Detail>
                <Detail label="Owner">
                  <Avatar className="size-5"><AvatarFallback className="text-[9px]">{initials(job.owner)}</AvatarFallback></Avatar>
                  {job.owner} <span className="text-muted-foreground">{job.team}</span>
                </Detail>
              </dl>
            </Section>
            <Separator />
            <Section title="Command">
              <InputGroup>
                <InputGroupAddon><TerminalIcon /></InputGroupAddon>
                <InputGroupInput readOnly value={command} className="font-mono text-xs" aria-label="Command" />
                <InputGroupAddon align="inline-end"><InputGroupButton size="icon-xs" aria-label="Copy command" onClick={() => copy(command)}><CopyIcon /></InputGroupButton></InputGroupAddon>
              </InputGroup>
            </Section>
          </TabsContent>
          <TabsContent value="runs" className="flex min-h-0 flex-col gap-3 overflow-y-auto p-4">
            {job.runs.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">No runs yet.</p>
            ) : (
              <>
                <RunStrip runs={job.runs} tall />
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Run</TableHead><TableHead>Status</TableHead><TableHead>Exit</TableHead><TableHead className="text-right">Duration</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {job.runs.map((r, k) => ({ r, n: k + 1 })).reverse().map(({ r, n }) => (
                      <TableRow key={n}>
                        <TableCell className="font-mono text-xs">#{n}</TableCell>
                        <TableCell><Badge variant={runBadge[r]}>{r}</Badge></TableCell>
                        <TableCell className="font-mono text-xs">{r === "Succeeded" ? 0 : r === "Timed Out" ? 124 : (job.error?.exit ?? 1)}</TableCell>
                        <TableCell className="text-right tabular-nums">{job.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </TabsContent>
          <TabsContent value="settings" className="flex min-h-0 flex-col gap-5 overflow-y-auto p-4">
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="job-sheet-enabled">Enabled</FieldLabel>
                  <FieldDescription>Paused jobs keep their schedule but don't run.</FieldDescription>
                </FieldContent>
                <Switch id="job-sheet-enabled" checked={job.enabled} onCheckedChange={(v) => onJobChange({ ...job, enabled: v })} />
              </Field>
              <Field>
                <FieldLabel htmlFor="job-sheet-schedule">Schedule</FieldLabel>
                <OptionSelect
                  id="job-sheet-schedule"
                  items={[...presets.filter((p) => p.cron !== job.cron), job].map((p) => ({ value: p.cron, label: p.schedule }))}
                  value={job.cron}
                  onValueChange={(cron) => onJobChange({ ...job, cron, schedule: presets.find((p) => p.cron === cron)?.schedule ?? job.schedule })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="job-sheet-owner">Owner</FieldLabel>
                <OptionSelect id="job-sheet-owner" items={owners} value={job.owner} onValueChange={(owner) => onJobChange({ ...job, owner })} />
              </Field>
              <Separator />
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Delete job</FieldTitle>
                  <FieldDescription>Removes the job and its run history.</FieldDescription>
                </FieldContent>
                <Button variant="destructive" size="sm" onClick={() => onDelete(job)}><Trash2Icon /> Delete</Button>
              </Field>
            </FieldGroup>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

/** The Overview page: header with New Job, stat cards, jobs table, run time chart and Up Next, sharing one job list and job sheet. */
export function OverviewView() {
  const [jobs, setJobs] = React.useState(demoJobs)
  const [creating, setCreating] = React.useState(false)
  const [active, setActive] = React.useState<string>()
  const [open, setOpen] = React.useState(false)
  const job = jobs.find((j) => j.name === active)
  const openJob = (name: string) => {
    if (!jobs.some((j) => j.name === name)) return
    setActive(name)
    setOpen(true)
  }

  return (
    <>
      <PageHeader crumbs={["Workspace", "Overview"]}>
        <Select defaultValue="all" items={[{ value: "all", label: "All Environments" }, { value: "prod", label: "Production" }, { value: "staging", label: "Staging" }]}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="prod">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setCreating(true)}><PlusIcon /> New Job</Button>
      </PageHeader>
      <PageBody>
        <StatCards onOpenJob={openJob} />
        <JobsTable jobs={jobs} onJobsChange={setJobs} onOpenJob={(j) => openJob(j.name)} activeJob={open ? active : undefined} />
        <div className="grid gap-4 @4xl:grid-cols-2">
          <RunTimeChart />
          <UpNext onOpenJob={openJob} />
        </div>
      </PageBody>
      <NewJobSheet
        open={creating}
        onOpenChange={setCreating}
        jobs={jobs}
        onCreate={(j) => {
          setJobs((all) => [j, ...all])
          setCreating(false)
        }}
      />
      <JobSheet
        job={job}
        jobs={jobs}
        open={open && !!job}
        onOpenChange={setOpen}
        onNavigate={(j) => setActive(j.name)}
        onJobChange={(j) => setJobs((all) => all.map((x) => (x.name === j.name ? j : x)))}
        onDelete={(j) => {
          setOpen(false)
          setJobs((all) => all.filter((x) => x.name !== j.name))
        }}
      />
    </>
  )
}
