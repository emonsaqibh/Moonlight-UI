import { notFound } from "next/navigation"

import { LogsView } from "@/components/logs/logs-view"
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
    <LogsView
      crumbs={["Observe", "Logs", view.name]}
      events={matched}
      view={view.name}
      filters={[...view.filters]}
      volume={{ totals: { info: 0, warn: 0, error: matched.length }, data: chart, note: "No prior 7d to compare · 0% warn" }}
      split
    />
  )
}
