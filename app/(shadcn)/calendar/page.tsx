import { PinIcon } from "lucide-react"

import { PageHeader } from "@/components/app/page-header"
import { CalendarProvider, NewEventButton, WeekView } from "@/components/calendar/week-view"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
  return (
    <CalendarProvider>
      <PageHeader crumbs={["Ship", "Calendar"]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <NewEventButton />
      </PageHeader>
      <WeekView />
    </CalendarProvider>
  )
}
