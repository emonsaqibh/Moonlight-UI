import { PinIcon } from "lucide-react"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/page-header"
import { CalendarProvider, NewEventButton, WeekView } from "@/components/calendar/week-view"
import { Button } from "@/components/ui/button"
import { calEvents } from "@/lib/data/calendar-data"

const views = {
  "on-call-payments": {
    name: "On-call · payments",
    titles: ["Payments On-call Handoff", "High error rate on checkout-api"],
  },
} as const

export function generateStaticParams() {
  return Object.keys(views).map((slug) => ({ slug }))
}

export default async function CalendarViewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const view = views[slug as keyof typeof views]
  if (!view) notFound()
  const events = calEvents.filter((e) => (view.titles as readonly string[]).includes(e.title))
  return (
    <CalendarProvider events={events}>
      <PageHeader crumbs={["Ship", "Calendar", view.name]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <NewEventButton />
      </PageHeader>
      <WeekView title={view.name} />
    </CalendarProvider>
  )
}
