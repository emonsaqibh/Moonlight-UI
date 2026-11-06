import { notFound } from "next/navigation"

import { ServicesPage } from "@/components/services/services-page"
import { slos } from "@/lib/data/services-data"

export function generateStaticParams() {
  return [...new Set(slos.map((s) => s.service))].map((slug) => ({ slug }))
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slos.some((s) => s.service === slug)) notFound()
  return <ServicesPage crumbs={["Observe", "Services", slug]} initialQuery={slug} />
}
