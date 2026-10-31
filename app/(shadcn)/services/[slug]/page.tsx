import { PinIcon, PlusIcon } from "lucide-react"
import { notFound } from "next/navigation"

import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { ServicesView } from "@/components/services/services-view"
import { Button } from "@/components/ui/button"
import { slos } from "@/lib/data/services-data"

export function generateStaticParams() {
  return [...new Set(slos.map((s) => s.service))].map((slug) => ({ slug }))
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slos.some((s) => s.service === slug)) notFound()
  return (
    <>
      <PageHeader crumbs={["Observe", "Services", slug]}>
        <Button variant="muted"><PinIcon /> Pin</Button>
        <Button><PlusIcon /> New SLO</Button>
      </PageHeader>
      <PageBody>
        <ServicesView initialQuery={slug} />
      </PageBody>
    </>
  )
}
