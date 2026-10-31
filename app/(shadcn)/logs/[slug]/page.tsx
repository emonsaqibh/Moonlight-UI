import { DownloadIcon, PinIcon } from "lucide-react"
import { notFound } from "next/navigation"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { RangeToggle } from "@/components/app/range-toggle"
import { EventVolume } from "@/components/logs/event-volume"
import { EventsTable } from "@/components/logs/events-table"
import { WarningsPanel } from "@/components/logs/warnings-panel"
import { Button } from "@/components/ui/button"
import { events, volume } from "@/lib/data/logs-data"

/** Saved log views: a name plus the filter it applies to the full event list. */
const views = {
  "errors-payments": {
    name: "Errors · payments",
    filters: ["Level is Error", "Owner any of Mira Stone +1"],
    match: (e: (typeof events)[number]) => e.level === "Error" && ["Mira Stone", "Leo Grant"].includes(e.owner),
  },
} as const

export function generateStaticParams() {
  return Object.keys(views).map((slug) => ({ slug }))
}

export default async function LogViewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const view = views[slug as keyof typeof views]
  if (!view) notFound()
  const matched = events.filter(view.match)
  const chart = volume.map((b, i) => ({ ...b, info: 0, warn: 0, error: i >= volume.length - 3 && i < volume.length - 1 ? 1 : 0 }))
  return (
    <>
      <PageHeader crumbs={["Observe", "Logs", view.name]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <RangeToggle options={["1h", "24h", "7d", "30d"]} defaultValue="7d" />
        <Button><DownloadIcon /> Export</Button>
      </PageHeader>
      <PageBody>
        <div className="grid gap-4 @4xl:grid-cols-2">
          <EventVolume totals={{ info: 0, warn: 0, error: matched.length }} data={chart} note="No prior 7d to compare · 0% warn" />
          <WarningsPanel />
        </div>
        <EventsTable events={matched} view={view.name} filters={[...view.filters]} />
      </PageBody>
    </>
  )
}
