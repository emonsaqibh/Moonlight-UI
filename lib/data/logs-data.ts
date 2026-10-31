export type Level = "Info" | "Warn" | "Error";
export type LogEvent = { time: string; owner: string; event: string; level: Level; resource: string; ref?: string; source: string; ip: string };

export const events: LogEvent[] = [
  { time: "Oct 22, 13:58:40", owner: "Priya Patel", event: "statuspage.update.published", level: "Info", resource: "status.acme.com", source: "Console", ip: "10.4.9.18" },
  { time: "Oct 22, 13:51:20", owner: "synthetics", event: "monitor.check.failed", level: "Error", resource: "api.acme.com/checkout", source: "Synthetics", ip: "10.8.1.5" },
  { time: "Oct 22, 13:49:03", owner: "Leo Grant", event: "incident.acknowledged", level: "Info", resource: "checkout-api", ref: "INC-2209", source: "Console", ip: "10.4.9.18" },
  { time: "Oct 22, 13:46:12", owner: "strata-alerts", event: "alert.fired", level: "Error", resource: "error_rate > 5%", ref: "ALR-142", source: "OTLP", ip: "10.4.0.27" },
  { time: "Oct 22, 13:46:05", owner: "Mira Stone", event: "http.request.failed", level: "Error", resource: "POST /v1/checkout", source: "OTLP", ip: "10.4.2.17" },
  { time: "Oct 22, 13:45:31", owner: "Mira Stone", event: "http.request.failed", level: "Error", resource: "POST /v1/checkout", source: "OTLP", ip: "10.4.2.31" },
  { time: "Oct 22, 13:45:10", owner: "Leo Grant", event: "stripe.charge.retry", level: "Warn", resource: "stripe.charge", source: "OTLP", ip: "203.0.113.57" },
  { time: "Oct 22, 13:44:51", owner: "Mira Stone", event: "db.pool.saturated", level: "Warn", resource: "postgres-primary", source: "OTLP", ip: "203.0.113.57" },
  { time: "Oct 22, 13:40:30", owner: "Mira Stone", event: "rollout.step", level: "Info", resource: "checkout-api", ref: "DEP-2291", source: "Kubernetes", ip: "10.4.2.17" },
  { time: "Oct 22, 13:40:02", owner: "Mira Stone", event: "deployment.create", level: "Info", resource: "checkout-api", ref: "DEP-2291", source: "GitHub Actions", ip: "10.4.9.63" },
];

export const warnings = [
  { owner: "Leo Grant", note: "After v3.5.0 deploy", event: "stripe.charge.retry", resource: "stripe.charge", ago: "14m ago" },
  { owner: "Mira Stone", note: "After v3.5.0 deploy", event: "db.pool.saturated", resource: "postgres-primary", ago: "15m ago" },
  { owner: "Kenji Tan", event: "cache.miss.high", resource: "redis-search", ago: "4h ago" },
  { owner: "Priya Patel", event: "queue.lag.high", resource: "webhook-deliveries", ago: "16h ago" },
];

export const volume = Array.from({ length: 28 }, (_, i) => ({
  bucket: i,
  info: [2, 1, 0, 3, 2, 1, 0, 2, 1, 1, 3, 2, 0, 1, 2, 4, 2, 1, 2, 3, 2, 1, 3, 5, 6, 8, 7, 4][i],
  warn: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0][i],
  error: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1][i],
}));
