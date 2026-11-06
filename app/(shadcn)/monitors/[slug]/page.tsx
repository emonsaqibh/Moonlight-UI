import { notFound } from "next/navigation"

import { MonitorsView } from "@/components/monitors/monitors-view"

const hosts: Record<string, string> = { "api-acme-com": "api.acme.com" }

export function generateStaticParams() {
  return Object.keys(hosts).map((slug) => ({ slug }))
}

export default async function MonitorHostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const host = hosts[slug]
  if (!host) notFound()
  return <MonitorsView crumbs={["Observe", "Monitors", host]} />
}
