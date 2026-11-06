"use client"

import * as React from "react"
import { ReceiptIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { SettingsView } from "@/components/settings/settings-view"
import { Button } from "@/components/ui/button"

/** Settings screen: "Manage Billing" in the header jumps to the Billing section. */
export function SettingsPage() {
  const [tab, setTab] = React.useState("general")
  return (
    <>
      <PageHeader crumbs={["Workspace", "Settings"]}>
        <Button onClick={() => setTab("billing")}><ReceiptIcon /> Manage Billing</Button>
      </PageHeader>
      <PageBody>
        <SettingsView tab={tab} onTabChange={setTab} />
      </PageBody>
    </>
  )
}
