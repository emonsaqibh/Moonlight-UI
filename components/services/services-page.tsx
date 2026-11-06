"use client"

import * as React from "react"
import { PinIcon, PinOffIcon, PlusIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { NewSloSheet, ServicesView } from "@/components/services/services-view"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { slos as demoSlos } from "@/lib/data/services-data"

/** Services screen: header with Pin and "New SLO" (opens the form sheet; submit adds the SLO to the table). */
export function ServicesPage({ crumbs = ["Observe", "Services"], initialQuery }: { crumbs?: string[]; initialQuery?: string }) {
  const [slos, setSlos] = React.useState(demoSlos)
  const [creating, setCreating] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  return (
    <>
      <PageHeader crumbs={crumbs}>
        <Toggle variant="outline" pressed={pinned} onPressedChange={setPinned} aria-label={pinned ? "Unpin view" : "Pin view"}>
          {pinned ? <PinOffIcon /> : <PinIcon />} {pinned ? "Pinned" : "Pin"}
        </Toggle>
        <Button onClick={() => setCreating(true)}><PlusIcon /> New SLO</Button>
      </PageHeader>
      <PageBody>
        <ServicesView key={initialQuery} initialQuery={initialQuery} slos={slos} onSlosChange={setSlos} />
      </PageBody>
      <NewSloSheet open={creating} onOpenChange={setCreating} onCreate={(s) => setSlos((l) => [...l, s])} />
    </>
  )
}
