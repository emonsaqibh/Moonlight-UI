"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { AllSources, NewSourceSheet } from "@/components/sources/all-sources"
import { SourcesOverview } from "@/components/sources/overview"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { groups as demoGroups } from "@/lib/data/sources-data"

/** Sources screen: header with the environment picker and "New Source" (opens the form sheet; submit adds the source to its category). */
export function SourcesPage() {
  const [groups, setGroups] = React.useState(demoGroups)
  const [creating, setCreating] = React.useState(false)
  return (
    <>
      <PageHeader crumbs={["Workspace", "Sources"]}>
        <Select defaultValue="all" items={[{ value: "all", label: "All Environments" }, { value: "prod", label: "Production" }, { value: "staging", label: "Staging" }]}>
          <SelectTrigger className="w-44" aria-label="Environment"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="prod">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setCreating(true)}><PlusIcon /> New Source</Button>
      </PageHeader>
      <PageBody>
        <SourcesOverview />
        <AllSources groups={groups} onGroupsChange={setGroups} />
      </PageBody>
      <NewSourceSheet open={creating} onOpenChange={setCreating} onCreate={(name, s) => setGroups((gs) => gs.map((g) => (g.name === name ? { ...g, sources: [...g.sources, s] } : g)))} />
    </>
  )
}
