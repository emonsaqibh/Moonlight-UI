"use client"

import * as React from "react"
import { PinIcon, PinOffIcon, PlusIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { DeployHistory, NewDeploySheet } from "@/components/releases/deploy-history"
import { Environments } from "@/components/releases/environments"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { releases as demoReleases } from "@/lib/data/releases-data"

/** Releases screen: header with Pin and "New Deploy" (opens the form sheet; submit adds a running deploy to the history). */
export function ReleasesPage() {
  const [releases, setReleases] = React.useState(demoReleases)
  const [creating, setCreating] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  const nextId = `DEP-${Math.max(...releases.map((r) => Number(r.id.slice(4)))) + 1}`
  return (
    <>
      <PageHeader crumbs={["Ship", "Releases"]}>
        <Toggle variant="outline" pressed={pinned} onPressedChange={setPinned} aria-label={pinned ? "Unpin view" : "Pin view"}>
          {pinned ? <PinOffIcon /> : <PinIcon />} {pinned ? "Pinned" : "Pin"}
        </Toggle>
        <Button onClick={() => setCreating(true)}><PlusIcon /> New Deploy</Button>
      </PageHeader>
      <PageBody>
        <Environments />
        <DeployHistory releases={releases} onReleasesChange={setReleases} />
      </PageBody>
      <NewDeploySheet open={creating} onOpenChange={setCreating} nextId={nextId} onCreate={(r) => setReleases((l) => [r, ...l])} />
    </>
  )
}
