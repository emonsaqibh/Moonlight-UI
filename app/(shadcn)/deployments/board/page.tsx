import { PinIcon, PlusIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { DeployBoard } from "@/components/deploy/deploy-board"
import { Button } from "@/components/ui/button"

export default function DeployBoardPage() {
  return (
    <>
      <PageHeader crumbs={["Ship", "Deploy board"]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <Button><PlusIcon /> New deploy</Button>
      </PageHeader>
      <PageBody>
        <DeployBoard />
      </PageBody>
    </>
  )
}
