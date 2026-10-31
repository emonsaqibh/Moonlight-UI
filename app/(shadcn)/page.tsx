import { PlusIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { JobsTable } from "@/components/overview/jobs-table"
import { RunTimeChart } from "@/components/overview/run-time-chart"
import { StatCards } from "@/components/overview/stat-cards"
import { UpNext } from "@/components/overview/up-next"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OverviewPage() {
  return (
    <>
      <PageHeader crumbs={["Workspace", "Overview"]}>
        <Select defaultValue="all" items={[{ value: "all", label: "All Environments" }, { value: "prod", label: "Production" }, { value: "staging", label: "Staging" }]}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="prod">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
          </SelectContent>
        </Select>
        <Button><PlusIcon /> New Job</Button>
      </PageHeader>
      <PageBody>
        <StatCards />
        <JobsTable />
        <div className="grid gap-4 @4xl:grid-cols-2">
          <RunTimeChart />
          <UpNext />
        </div>
      </PageBody>
    </>
  )
}
