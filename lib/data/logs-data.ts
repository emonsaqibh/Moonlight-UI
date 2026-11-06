export type Level = "Info" | "Warn" | "Error";
export type LogEvent = {
  id: string; time: string; owner: string; event: string; level: Level; resource: string; ref?: string; source: string; ip: string;
  /** Detail sheet fields */
  summary: string; note?: string; role: string; auth: string; session: string; agent: string; ipNote?: string;
  resourceId: string; cluster: string; correlation: string; trace: string; ago: string; review: boolean;
};

const otlp = "opentelemetry-go/1.31.0 (otlp/grpc)";
const browser = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 Chrome/129.0.0.0 Safari/537.36";
const mira = { owner: "Mira Stone", role: "Payments engineer, Payments", session: "wl_checkout_api" };

export const events: LogEvent[] = [
  { id: "EVT-7c3e9a", time: "Oct 22, 13:58:40", owner: "Priya Patel", event: "statuspage.update.published", level: "Info", resource: "status.acme.com", source: "Console", ip: "10.4.9.18",
    summary: "Published \"Degraded performance: Checkout\" on status.acme.com and notified 1,284 subscribers.", role: "Platform engineering manager, Platform", auth: "SSO with WebAuthn", session: "ses_3Pp8Vx", agent: browser, resourceId: "page_status_acme", cluster: "None", correlation: "req_01J8ZQB4R8", trace: "a81c4f7e…8d2b60", ago: "1m ago", review: false },
  { id: "EVT-3a81f4", time: "Oct 22, 13:51:20", owner: "synthetics", event: "monitor.check.failed", level: "Error", resource: "api.acme.com/checkout", source: "Synthetics", ip: "10.8.1.5",
    summary: "GET https://api.acme.com/checkout returned 503 from EU (Frankfurt) on runner synthetics-eu-6c9d7-q2lmx.", note: "HTTP 503 from EU (Frankfurt); 2 of 6 regions failing. screenshot-eu-frankfurt.png attached.", role: "Synthetic checks, Platform", auth: "Service account key", session: "wl_synthetics", agent: "acme-synthetics/2.4.0 (playwright)", resourceId: "api-acme-com", cluster: "prod-eu-central-1", correlation: "req_01J8ZQ9F1T", trace: "3f6d0e9a…9f7a24", ago: "8m ago", review: true },
  { id: "EVT-5d2b70", time: "Oct 22, 13:49:03", owner: "Leo Grant", event: "incident.acknowledged", level: "Info", resource: "checkout-api", ref: "INC-2209", source: "Console", ip: "10.4.9.18",
    summary: "Acknowledged INC-2209, \"High error rate on checkout-api\" (Sev 2), 3 minutes after it opened.", role: "Payments SRE, Payments", auth: "SSO with WebAuthn", session: "ses_7Lg2Qd", agent: browser, resourceId: "INC-2209", cluster: "None", correlation: "req_01J8ZQ7M3C", trace: "e5a03b7c…a9e365", ago: "10m ago", review: false },
  { id: "EVT-1f9c42", time: "Oct 22, 13:46:12", owner: "acme-alerts", event: "alert.fired", level: "Error", resource: "error_rate > 5%", ref: "ALR-142", source: "OTLP", ip: "10.4.0.27",
    summary: "ALR-142 fired on checkout-api: error_rate 8.4% against a 5% threshold.", note: "error_rate 8.4% > 5% on checkout-api for 2 checks in a row; opened INC-2209 (Sev 2).", role: "Alert evaluator, Platform", auth: "OIDC workload identity", session: "wl_acme_alerts", agent: otlp, resourceId: "ALR-142", cluster: "prod-eu-central-1", correlation: "req_01J8ZQ7M3C", trace: "7d1c9a4e…0f3c52", ago: "13m ago", review: true },
  { id: "EVT-4f9ac2", time: "Oct 22, 13:46:05", ...mira, event: "http.request.failed", level: "Error", resource: "POST /v1/checkout", source: "OTLP", ip: "10.4.2.17",
    summary: "POST /v1/checkout returned 503 in 2.4 s on pod checkout-api-7d9f8b6c4-x2kqp, span 1f6b2d9e4a7c3b05.", note: "HTTP 503 UpstreamTimeout: stripe did not answer after 3 retries on v3.5.0.", auth: "OIDC workload identity", agent: otlp, resourceId: "4f9ac21e", cluster: "prod-eu-central-1", correlation: "req_01J8ZQ7M3C", trace: "4f9ac21e…5b8a73", ago: "13m ago", review: true },
  { id: "EVT-9c27b1", time: "Oct 22, 13:45:31", ...mira, event: "http.request.failed", level: "Error", resource: "POST /v1/checkout", source: "OTLP", ip: "10.4.2.31",
    summary: "POST /v1/checkout returned 503 in 2.1 s on pod checkout-api-7d9f8b6c4-m8tzr, span 6a0c4e2b9d1f7385.", note: "HTTP 503 UpstreamTimeout: payments gave up on stripe after 3 retries.", auth: "OIDC workload identity", agent: otlp, resourceId: "9c27b1d0", cluster: "prod-eu-central-1", correlation: "req_01J8ZQ5K2W", trace: "9c27b1d0…a4b6c8", ago: "14m ago", review: true },
  { id: "EVT-2e6d18", time: "Oct 22, 13:45:10", owner: "Leo Grant", event: "stripe.charge.retry", level: "Warn", resource: "stripe.charge", source: "OTLP", ip: "203.0.113.57",
    summary: "Retried stripe.charge 3 times for checkout trace 9c27b1d0 on pod payments-5b7c8d9f6-k4wpn.", note: "Stripe timed out on 3 charge attempts in a row; the call gave up after the third retry.", role: "Payments SRE, Payments", auth: "OIDC workload identity", session: "wl_payments", agent: otlp, ipNote: "Flagged after v3.5.0 deploy", resourceId: "9c27b1d0", cluster: "prod-us-east-1", correlation: "req_01J8ZQ5K2W", trace: "9c27b1d0…a4b6c8", ago: "14m ago", review: true },
  { id: "EVT-6b40e3", time: "Oct 22, 13:44:51", ...mira, event: "db.pool.saturated", level: "Warn", resource: "postgres-primary", source: "OTLP", ip: "203.0.113.57",
    summary: "postgres-primary pool hit 20/20 on pod checkout-api-7d9f8b6c4-x2kqp, 4 minutes after v3.5.0 rolled out.", note: "Pool at 20 of 20 connections; 46 requests waited up to 1.8 s for one.", auth: "OIDC workload identity", agent: otlp, ipNote: "Flagged after v3.5.0 deploy", resourceId: "db_postgres_primary", cluster: "prod-eu-central-1", correlation: "req_01J8ZQ7M3C", trace: "2b8e6f14…e2a047", ago: "15m ago", review: true },
  { id: "EVT-8a5c1d", time: "Oct 22, 13:40:30", ...mira, event: "rollout.step", level: "Info", resource: "checkout-api", ref: "DEP-2291", source: "Kubernetes", ip: "10.4.2.17",
    summary: "Rolled checkout-api to v3.5.0: 6 of 6 pods ready in prod-eu-central-1.", auth: "Service account key", agent: "kubernetes-event-exporter/1.7.0", resourceId: "DEP-2291", cluster: "prod-eu-central-1", correlation: "req_01J8ZQ6V8B", trace: "c3e7a1f9…e7b048", ago: "19m ago", review: false },
  { id: "EVT-0d6a5a", time: "Oct 22, 13:40:02", ...mira, event: "deployment.create", level: "Info", resource: "checkout-api", ref: "DEP-2291", source: "GitHub Actions", ip: "10.4.9.63",
    summary: "Deployed checkout-api v3.5.0 from main at d6a5ade, 3 commits.", auth: "OIDC workload identity", session: "wl_gha_checkout_api", agent: "actions-runner/2.319.1", resourceId: "DEP-2291", cluster: "prod-eu-central-1", correlation: "req_01J8ZQ7M3C", trace: "d6a5ade0…6b2a41", ago: "19m ago", review: false },
];

export const warnings: (LogEvent & { after?: string })[] = [
  { ...events[6], after: "After v3.5.0 deploy" },
  { ...events[7], after: "After v3.5.0 deploy" },
  { id: "EVT-3c47d9", time: "Oct 22, 09:12:44", owner: "Kenji Tan", event: "cache.miss.high", level: "Warn", resource: "redis-search", source: "OTLP", ip: "10.4.5.9",
    summary: "redis-search missed 39% of search-api lookups while a fresh index warmed.", note: "Hit rate fell to 61% against a 90% floor for 5 minutes.", role: "Search engineer, Search", auth: "OIDC workload identity", session: "wl_search_api", agent: otlp, resourceId: "cache_redis_search", cluster: "prod-eu-central-1", correlation: "req_01J8ZM4C9R", trace: "1a7f3c9e…d9e027", ago: "4h ago", review: true },
  { id: "EVT-6e15a2", time: "Oct 21, 21:37:09", owner: "Priya Patel", event: "queue.lag.high", level: "Warn", resource: "webhook-deliveries", source: "OTLP", ip: "10.4.7.40",
    summary: "webhooks-dispatcher fell behind on webhook-deliveries: a partner endpoint answered in 9 s.", note: "Consumer lag reached 4,812 messages, over the 1,000 threshold for 6 minutes.", role: "Platform engineering manager, Platform", auth: "OIDC workload identity", session: "wl_webhooks_dispatcher", agent: otlp, resourceId: "queue_webhook_deliveries", cluster: "prod-us-east-1", correlation: "req_01J8XW8D3P", trace: "8b4e1d6a…4f9a73", ago: "16h ago", review: true },
];

/** 28 six-hour buckets, Oct 16 00:00 to Oct 22 18:00 UTC. */
export const volume = Array.from({ length: 28 }, (_, i) => ({
  bucket: i,
  label: `Oct ${16 + Math.floor(i / 4)}, ${String((i % 4) * 6).padStart(2, "0")}:00 UTC`,
  info: [2, 1, 0, 3, 2, 1, 0, 2, 1, 1, 3, 2, 0, 1, 2, 4, 2, 1, 2, 3, 2, 1, 3, 5, 6, 8, 7, 4][i],
  warn: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0][i],
  error: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1][i],
}));
