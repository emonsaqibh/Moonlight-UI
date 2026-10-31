import { PinIcon, PlusIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { ServicesView } from "@/components/services/services-view"
import { Button } from "@/components/ui/button"

export default function ServicesPage() {
  return (
    <>
      <PageHeader crumbs={["Observe", "Services"]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <Button><PlusIcon /> New SLO</Button>
      </PageHeader>
      <PageBody>
        <ServicesView />
      </PageBody>
    </>
  )
}
