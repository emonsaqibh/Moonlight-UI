import { PinIcon, PlusIcon } from "lucide-react"

import { PageHeader } from "@/components/app/page-header"
import { WeekView } from "@/components/calendar/week-view"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
  return (
    <>
      <PageHeader crumbs={["Ship", "Calendar"]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <Button><PlusIcon /> New event</Button>
      </PageHeader>
      <WeekView />
    </>
  )
}
