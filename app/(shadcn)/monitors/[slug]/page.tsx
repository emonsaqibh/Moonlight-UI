import { PinIcon, PlusIcon } from "lucide-react"
import { notFound } from "next/navigation"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { CheckHistory } from "@/components/monitors/check-history"
import { CheckoutFlow } from "@/components/monitors/checkout-flow"
import { Button } from "@/components/ui/button"

const hosts: Record<string, string> = { "api-acme-com": "api.acme.com" }

export function generateStaticParams() {
  return Object.keys(hosts).map((slug) => ({ slug }))
}

export default async function MonitorHostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const host = hosts[slug]
  if (!host) notFound()
  return (
    <>
      <PageHeader crumbs={["Observe", "Monitors", host]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <Button><PlusIcon /> New Monitor</Button>
      </PageHeader>
      <PageBody>
        <CheckoutFlow />
        <CheckHistory />
      </PageBody>
    </>
  )
}
