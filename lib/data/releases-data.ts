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
  env: Env
  commits: number
}

export type Env = "Production" | "Staging" | "Sandbox"

const r = (service: string, version: string, id: string, sha: string, message: string, status: DeployStatus, pipeline: number, duration: string, author: string, started: string, ago: string, env: Env = "Production", commits = 1): Release =>
  ({ service, version, id, sha, message, status, pipeline, duration, author, started, ago, env, commits })

export const releases: Release[] = [
  r("search-api", "v1.14.0", "DEP-2292", "d4a7c19", "Serve results from the edge n-gram analyzer", "Running", 4, "7:20", "Kenji Tan", "Oct 22, 13:52", "7m ago", "Production", 5),
  r("checkout-api", "v3.5.0", "DEP-2291", "d6a5ade", "Turn on checkout v2 in every region", "Succeeded", 6, "5:32", "Mira Stone", "Oct 22, 13:40", "19m ago", "Production", 3),
  r("payments", "v2.8.1", "DEP-2290", "f2a6c84", "Retry Stripe captures on 502 with the same key", "Succeeded", 6, "10:26", "Leo Grant", "Oct 22, 12:10", "1h ago"),
  r("webhooks-dispatcher", "v1.27.0", "DEP-2289", "7c3e8b1", "Sign deliveries with the rotated whsec key", "Succeeded", 6, "4:57", "Priya Patel", "Oct 22, 11:52", "2h ago", "Staging", 2),
  r("billing-worker", "v1.18.4", "DEP-2288", "1d9e6b7", "Preload open invoice balances at startup", "Failed", 3, "6:14", "Leo Grant", "Oct 22, 09:42", "4h ago", "Staging", 2),
  r("payments", "v2.8.1", "DEP-2287", "f2a6c84", "Retry Stripe captures on 502 with the same key", "Succeeded", 6, "4:33", "Leo Grant", "Oct 22, 09:20", "4h ago", "Sandbox"),
  r("payments", "v2.8.0", "DEP-2286", "e5b19a3", "Match Stripe payouts by balance transaction", "Succeeded", 6, "27:44", "Leo Grant", "Oct 22, 08:31", "5h ago", "Production", 3),
  r("payments", "v2.8.1", "DEP-2285", "f2a6c84", "Retry Stripe captures on 502 with the same key", "Succeeded", 6, "4:25", "Leo Grant", "Oct 22, 07:25", "6h ago", "Staging"),
  r("payments", "v2.8.0", "DEP-2284", "e5b19a3", "Match Stripe payouts by balance transaction", "Succeeded", 6, "10:26", "Leo Grant", "Oct 22, 05:49", "8h ago", "Staging", 3),
  r("search-api", "v1.14.0", "DEP-2283", "d4a7c19", "Serve results from the edge n-gram analyzer", "Succeeded", 6, "4:33", "Kenji Tan", "Oct 22, 05:11", "8h ago", "Staging", 5),
  r("check-scheduler", "v2.7.1", "DEP-2282", "b81f0e2", "Spread probe starts across the minute", "Rolled back", 5, "9:02", "Sofia Romero", "Oct 22, 03:40", "10h ago", "Production", 2),
  r("auth-service", "v4.2.0", "DEP-2281", "4c0d7aa", "Shorten refresh token lifetime to 12h", "Succeeded", 6, "6:48", "Sarah Chen", "Oct 21, 22:15", "16h ago", "Production", 4),
  r("notifications", "v2.13.0", "DEP-2280", "93e2b51", "Batch push sends per tenant", "Succeeded", 6, "5:11", "Priya Patel", "Oct 21, 19:02", "19h ago", "Production", 2),
  r("search-indexer", "v2.3.2", "DEP-2279", "aa71c3d", "Throttle reindex to 400 docs per second", "Failed", 2, "3:27", "Kenji Tan", "Oct 21, 17:44", "20h ago", "Production", 1),
  r("checkout-api", "v3.4.2", "DEP-2278", "71bd2e9", "Drop the legacy cart cookie", "Succeeded", 6, "5:40", "Mira Stone", "Oct 21, 16:30", "21h ago", "Production", 2),
  r("edge-gateway", "v5.1.3", "DEP-2277", "0e9f4c6", "Raise idle timeout for websocket upgrades", "Succeeded", 6, "8:19", "Michael Rodriguez", "Oct 21, 14:05", "1d ago", "Production", 1),
  r("billing-worker", "v1.18.3", "DEP-2276", "6f2a0b8", "Retry invoice finalization with backoff", "Succeeded", 6, "6:02", "Leo Grant", "Oct 21, 11:20", "1d ago", "Production", 2),
  r("user-api", "v3.9.0", "DEP-2275", "c4e81d0", "Add SCIM group sync endpoint", "Succeeded", 6, "7:33", "Sarah Chen", "Oct 21, 09:48", "1d ago", "Production", 6),
  r("query-api", "v2.0.4", "DEP-2274", "5d3b7f1", "Cap log query fan-out at 32 shards", "Rolled back", 5, "11:56", "Emma Wilson", "Oct 21, 08:12", "1d ago", "Production", 3),
  r("webhooks-dispatcher", "v1.26.2", "DEP-2273", "2b6e9c4", "Log signature failures with the endpoint id", "Succeeded", 6, "4:41", "Priya Patel", "Oct 20, 21:30", "2d ago", "Production", 1),
  r("cdn-edge", "v1.4.0", "DEP-2272", "e07a5d2", "Purge by surrogate key", "Succeeded", 6, "3:58", "Michael Rodriguez", "Oct 20, 18:10", "2d ago", "Production", 2),
  r("analytics-pipeline", "v1.18.3", "DEP-2271", "f9c2e60", "Compact daily rollups before export", "Succeeded", 6, "14:20", "Emma Wilson", "Oct 20, 15:44", "2d ago", "Staging", 2),
  r("status-renderer", "v0.9.2", "DEP-2270", "8a4d1b3", "Cache incident pages for 30 seconds", "Succeeded", 6, "2:51", "Sofia Romero", "Oct 20, 12:02", "2d ago", "Production", 1),
]

export const environments = [
  { name: "Staging", id: "DEP-2289", health: "2 failed", tone: "destructive-light", regions: ["staging-us-east-1"], note: "On merge", service: "webhooks-dispatcher", status: "Succeeded", version: "v1.27.0", from: "v1.26.2", sha: "7c3e8b1", message: "Sign deliveries with the rotated whsec key", progress: "6/6", author: "Priya Patel", when: "2h ago" },
  { name: "Sandbox", id: "DEP-2287", health: "Healthy", tone: "success-light", regions: ["staging-us-east-1"], note: "Partner testing", service: "payments", status: "Succeeded", version: "v2.8.1", from: "v2.8.0", sha: "f2a6c84", message: "Retry Stripe captures on 502 with the same key", progress: "6/6", author: "Leo Grant", when: "4h ago" },
  { name: "Production", id: "DEP-2292", health: "Healthy", tone: "success-light", regions: ["prod-us-east-1", "prod-eu-central-1"], note: "", service: "search-api", status: "Running", version: "v1.14.0", from: "v1.13.2", sha: "d4a7c19", message: "Serve results from the edge n-gram analyzer", progress: "Canary 50%", author: "Kenji Tan", when: "Running 7:20" },
] as const
