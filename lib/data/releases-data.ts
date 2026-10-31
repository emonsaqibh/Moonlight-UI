export type DeployStatus = "Running" | "Succeeded" | "Failed" | "Rolled back"

export type Release = {
  service: string
  version: string
  id: string
  sha: string
  message: string
  status: DeployStatus
  pipeline: number
  duration: string
  author: string
  started: string
  ago: string
}

const r = (service: string, version: string, id: string, sha: string, message: string, status: DeployStatus, pipeline: number, duration: string, author: string, started: string, ago: string): Release =>
  ({ service, version, id, sha, message, status, pipeline, duration, author, started, ago })

export const releases: Release[] = [
  r("search-api", "v1.14.0", "DEP-2292", "d4a7c19", "Serve results from the edge n-gram analyzer", "Running", 4, "7:20", "Kenji Tan", "Oct 22, 13:52", "7m ago"),
  r("checkout-api", "v3.5.0", "DEP-2291", "d6a5ade", "Turn on checkout v2 in every region", "Succeeded", 6, "5:32", "Mira Stone", "Oct 22, 13:40", "19m ago"),
  r("payments", "v2.8.1", "DEP-2290", "f2a6c84", "Retry Stripe captures on 502 with the same key", "Succeeded", 6, "10:26", "Leo Grant", "Oct 22, 12:10", "1h ago"),
  r("webhooks-dispatcher", "v1.27.0", "DEP-2289", "7c3e8b1", "Sign deliveries with the rotated whsec key", "Succeeded", 6, "4:57", "Priya Patel", "Oct 22, 11:52", "2h ago"),
  r("billing-worker", "v1.18.4", "DEP-2288", "1d9e6b7", "Preload open invoice balances at startup", "Failed", 3, "6:14", "Leo Grant", "Oct 22, 09:42", "4h ago"),
  r("payments", "v2.8.1", "DEP-2287", "f2a6c84", "Retry Stripe captures on 502 with the same key", "Succeeded", 6, "4:33", "Leo Grant", "Oct 22, 09:20", "4h ago"),
  r("payments", "v2.8.0", "DEP-2286", "e5b19a3", "Match Stripe payouts by balance transaction", "Succeeded", 6, "27:44", "Leo Grant", "Oct 22, 08:31", "5h ago"),
  r("payments", "v2.8.1", "DEP-2285", "f2a6c84", "Retry Stripe captures on 502 with the same key", "Succeeded", 6, "4:25", "Leo Grant", "Oct 22, 07:25", "6h ago"),
  r("payments", "v2.8.0", "DEP-2284", "e5b19a3", "Match Stripe payouts by balance transaction", "Succeeded", 6, "10:26", "Leo Grant", "Oct 22, 05:49", "8h ago"),
  r("search-api", "v1.14.0", "DEP-2283", "d4a7c19", "Serve results from the edge n-gram analyzer", "Succeeded", 6, "4:33", "Kenji Tan", "Oct 22, 05:11", "8h ago"),
]

export const environments = [
  { name: "Staging", health: "2 failed", tone: "destructive-light", regions: ["staging-us-east-1"], note: "On merge", service: "webhooks-dispatcher", status: "Succeeded", version: "v1.27.0", from: "v1.26.2", sha: "7c3e8b1", message: "Sign deliveries with the rotated whsec key", progress: "6/6", author: "Priya Patel", when: "2h ago" },
  { name: "Sandbox", health: "Healthy", tone: "success-light", regions: ["staging-us-east-1"], note: "Partner testing", service: "payments", status: "Succeeded", version: "v2.8.1", from: "v2.8.0", sha: "f2a6c84", message: "Retry Stripe captures on 502 with the same key", progress: "6/6", author: "Leo Grant", when: "4h ago" },
  { name: "Production", health: "Healthy", tone: "success-light", regions: ["prod-us-east-1", "prod-eu-central-1"], note: "", service: "search-api", status: "Running", version: "v1.14.0", from: "v1.13.2", sha: "d4a7c19", message: "Serve results from the edge n-gram analyzer", progress: "Canary 50%", author: "Kenji Tan", when: "Running 7:20" },
] as const
