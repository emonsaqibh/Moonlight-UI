export type Alert = "Quiet" | "Paging" | "Muted";
export type Slo = { name: string; service: string; target: string; window: string; owner: string; budget: number; runsOut: string; alert: Alert };

const s = (name: string, service: string, target: string, window: string, owner: string, budget: number, runsOut: string, alert: Alert = "Quiet"): Slo =>
  ({ name, service, target, window, owner, budget, runsOut, alert });

export const slos: Slo[] = [
  s("Search index freshness", "search-indexer", "99%", "7d", "KT", -37.2, "Spent"),
  s("Webhook delivery success", "webhooks-dispatcher", "99.9%", "28d", "PP", -25.0, "Spent"),
  s("Ingest collector availability", "otel-collector", "99.9%", "30d", "OH", -8.8, "Spent"),
  s("Checkout availability", "checkout-api", "99.9%", "28d", "MS", 6.1, "1 day", "Paging"),
  s("Checkout p95 latency", "checkout-api", "99%", "28d", "MS", 11.6, "4 days"),
  s("Payment authorization success", "payments", "99.95%", "30d", "LG", 18.0, "6 days"),
  s("Status page render latency", "status-renderer", "99%", "28d", "SR", 22.3, "7 days"),
  s("Email sender success", "email-sender", "99.5%", "28d", "OH", 36.4, "15 days", "Muted"),
  s("Search query latency", "search-api", "99%", "28d", "KT", 47.2, "29 days"),
  s("Billing worker freshness", "billing-worker", "99%", "7d", "LG", 52.7, "8 days"),
  s("Analytics pipeline freshness", "analytics-pipeline", "98%", "7d", "EW", 54.0, "8 days", "Muted"),
  s("Notifications delivery", "notifications", "99.5%", "28d", "PP", 56.2, "49 days"),
  s("Log query latency", "query-api", "99%", "28d", "EW", 60.6, "38 days"),
  s("Auth login success", "auth-service", "99.99%", "30d", "SC", 64.5, "53 days"),
  s("Edge gateway availability", "edge-gateway", "99.99%", "28d", "MR", 70.5, "82 days"),
  s("CDN cache availability", "cdn-edge", "99.95%", "30d", "MR", 77.6, "108 days"),
  s("User API availability", "user-api", "99.9%", "30d", "SC", 83.2, "166 days"),
  s("Check scheduler freshness", "check-scheduler", "99.9%", "7d", "SR", 90.1, "63 days"),
];

export const sloState = (b: number) => (b < 0 ? "Exhausted" : b < 25 ? "At Risk" : "Healthy");
