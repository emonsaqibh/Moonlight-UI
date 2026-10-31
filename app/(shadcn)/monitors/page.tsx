import { PinIcon, PlusIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { CheckHistory } from "@/components/monitors/check-history"
import { CheckoutFlow } from "@/components/monitors/checkout-flow"
import { Button } from "@/components/ui/button"

export default function MonitorsPage() {
  return (
    <>
      <PageHeader crumbs={["Observe", "Monitors"]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <Button><PlusIcon /> New Monitor</Button>
      </PageHeader>
      <PageBody>
        <CheckoutFlow />
        <CheckHistory />
      </PageBody>
    </>
  )
}
