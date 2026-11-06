export type SourceStatus = "Healthy" | "Degraded" | "Failing" | "Paused"

export type Source = {
  name: string
  kind: string
  endpoint: string
  status: SourceStatus
  datasets: string
  more: number
  linked: [number, number]
  lastSync: string
  cadence: string
  owner: string
}

const s = (name: string, kind: string, endpoint: string, status: SourceStatus, datasets: string, more: number, linked: [number, number], lastSync: string, cadence: string, owner: string): Source =>
  ({ name, kind, endpoint, status, datasets, more, linked, lastSync, cadence, owner })

export const groups: { name: string; summary: string; sources: Source[] }[] = [
  {
    name: "Databases",
    summary: "1 failing, 14 of 20 datasets linked",
    sources: [
      s("search-db", "Supabase", "db.kqzrhvbt.supabase.co", "Failing", "public.query_stats", 2, [3, 4], "Failed 9m ago", "Every 15m", "Kenji Tan"),
      s("checkout-db", "Neon", "ep-quiet-meadow-41.eu-central-1.aws.neon.tech", "Healthy", "public.orders", 3, [4, 6], "9m ago", "Every 15m", "Mira Stone"),
      s("checkout-db-staging", "Neon", "ep-calm-tide-07.eu-central-1.aws.neon.tech", "Healthy", "public.orders", 1, [2, 3], "47m ago", "Hourly", "Mira Stone"),
      s("edge-rate-limits", "Redis", "redis-prod.acme.internal:6380", "Healthy", "ratelimit:*", 1, [2, 3], "4m ago", "Streaming", "Michael Rodriguez"),
      s("identity-db", "PlanetScale", "aws.connect.psdb.cloud/identity", "Healthy", "tenants", 2, [3, 4], "49m ago", "Hourly", "Sarah Chen"),
    ],
  },
  {
    name: "Warehouses",
    summary: "3 of 5 datasets linked",
    sources: [s("telemetry-warehouse", "BigQuery", "acme-telemetry", "Degraded", "acme.service_rollups_daily", 2, [3, 5], "2h 59m ago", "Every 6h", "Emma Wilson")],
  },
  {
    name: "Apps",
    summary: "12 of 18 datasets linked",
    sources: [
      s("sre-slack", "Slack", "acme.slack.com", "Paused", "channels", 1, [2, 2], "20h 9m ago", "Every 15m", "Omar Haddad"),
      s("acme-github", "GitHub", "github.com/acme", "Healthy", "deployments", 2, [3, 4], "9m ago", "Every 15m", "Priya Patel"),
      s("incident-tracker", "Linear", "linear.app/acme", "Healthy", "issues", 0, [1, 3], "44m ago", "Hourly", "Priya Patel"),
      s("stripe-live", "Stripe", "acct_1Q8xAcmeLive", "Healthy", "balance_transactions", 3, [4, 6], "54m ago", "Hourly", "Leo Grant"),
      s("stripe-sandbox", "Stripe", "acct_1Q8xAcmeLive (test mode)", "Healthy", "charges", 1, [2, 3], "51m ago", "Hourly", "Leo Grant"),
    ],
  },
  {
    name: "Files",
    summary: "4 of 6 datasets linked",
    sources: [
      s("cdn-log-exports", "Dropbox", "/Acme Edge/CDN logs", "Healthy", "/cdn-logs/frankfurt", 1, [2, 3], "57m ago", "Hourly", "Sofia Romero"),
      s("sre-planning-sheets", "Google Drive", "SRE Planning", "Healthy", "Capacity plan 2026-Q4", 1, [2, 3], "12h 59m ago", "Daily", "Emma Wilson"),
    ],
  },
]

export const attention = [
  { name: "search-db", tag: "Failing", tone: "destructive-light" },
  { name: "telemetry-warehouse", tag: "Degraded", tone: "warning-light" },
  { name: "incident-tracker", tag: "Token Expiring", tone: "warning-light" },
  { name: "sre-planning-sheets", tag: "Schema Drift", tone: "info-light" },
  { name: "sre-slack", tag: "Paused", tone: "secondary" },
] as const

export const syncActivity = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String((i + 17) % 24).padStart(2, "0")}:00`,
  succeeded: 38 + ((i * 7) % 9) * 2,
  slow: i % 7 === 3 ? 4 : 0,
  failed: i === 20 ? 6 : i % 11 === 5 ? 2 : 0,
}))

export const rowsSynced = [6, 6.4, 6.2, 7, 7.3, 7.1, 7.9, 8.2, 8.1, 8.7, 9, 9.4, 9, 9]
export const failedSyncs = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 3, 5, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 5]
