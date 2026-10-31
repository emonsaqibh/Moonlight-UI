import { PinIcon, PlusIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { DeployHistory } from "@/components/releases/deploy-history"
import { Environments } from "@/components/releases/environments"

export default function ReleasesPage() {
  return (
    <>
      <PageHeader crumbs={["Ship", "Releases"]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <Button><PlusIcon /> New Deploy</Button>
      </PageHeader>
      <PageBody>
        <Environments />
        <DeployHistory />
      </PageBody>
    </>
  )
}
