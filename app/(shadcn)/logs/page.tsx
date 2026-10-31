import { DownloadIcon, PinIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { RangeToggle } from "@/components/app/range-toggle"
import { EventVolume } from "@/components/logs/event-volume"
import { EventsTable } from "@/components/logs/events-table"
import { WarningsPanel } from "@/components/logs/warnings-panel"
import { Button } from "@/components/ui/button"

export default function LogsPage() {
  return (
    <>
      <PageHeader crumbs={["Observe", "Logs"]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <RangeToggle options={["1h", "24h", "7d", "30d"]} defaultValue="7d" />
        <Button><DownloadIcon /> Export</Button>
      </PageHeader>
      <PageBody>
        <EventVolume />
        <WarningsPanel />
        <EventsTable />
      </PageBody>
    </>
  )
}
