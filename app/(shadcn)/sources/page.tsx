import { PlusIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { AllSources } from "@/components/sources/all-sources"
import { SourcesOverview } from "@/components/sources/overview"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SourcesPage() {
  return (
    <>
      <PageHeader crumbs={["Workspace", "Sources"]}>
        <Select defaultValue="all" items={[{ value: "all", label: "All Environments" }, { value: "prod", label: "Production" }, { value: "staging", label: "Staging" }]}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="prod">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
          </SelectContent>
        </Select>
        <Button><PlusIcon /> New Source</Button>
      </PageHeader>
      <PageBody>
        <SourcesOverview />
        <AllSources />
      </PageBody>
    </>
  )
}
