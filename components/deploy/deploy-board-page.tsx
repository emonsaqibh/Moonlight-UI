"use client"

import * as React from "react"
import { PinIcon, PinOffIcon, PlusIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { DeployBoard, NewBoardDeploySheet } from "@/components/deploy/deploy-board"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { deploys as demoDeploys } from "@/lib/data/deploy-data"

/** Deploy board screen: header with Pin and "New deploy" (opens the form sheet; submit schedules the deploy on the board). */
export function DeployBoardPage() {
  const [deploys, setDeploys] = React.useState(demoDeploys)
  const [creating, setCreating] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  const nextId = `DEP-${Math.max(...deploys.map((d) => Number(d.id.slice(4)))) + 1}`
  return (
    <>
      <PageHeader crumbs={["Ship", "Deploy board"]}>
        <Toggle variant="outline" pressed={pinned} onPressedChange={setPinned} aria-label={pinned ? "Unpin view" : "Pin view"}>
          {pinned ? <PinOffIcon /> : <PinIcon />} {pinned ? "Pinned" : "Pin"}
        </Toggle>
        <Button onClick={() => setCreating(true)}><PlusIcon /> New deploy</Button>
      </PageHeader>
      <PageBody>
        <DeployBoard deploys={deploys} onDeploysChange={setDeploys} />
      </PageBody>
      <NewBoardDeploySheet open={creating} onOpenChange={setCreating} nextId={nextId} onCreate={(d) => setDeploys((l) => [...l, d].sort((a, b) => a.time.localeCompare(b.time)))} />
    </>
  )
}
