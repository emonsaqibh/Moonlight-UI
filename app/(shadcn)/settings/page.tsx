import { ReceiptIcon } from "lucide-react"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { SettingsView } from "@/components/settings/settings-view"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <>
      <PageHeader crumbs={["Workspace", "Settings"]}>
        <Button><ReceiptIcon /> Manage Billing</Button>
      </PageHeader>
      <PageBody>
        <SettingsView />
      </PageBody>
    </>
  )
}
