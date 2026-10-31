export type RunStatus = "Succeeded" | "Failed" | "Timed Out";
export type CheckRun = { id: string; started: string; status: RunStatus; duration: number; load: number; steps: number; confirm: number; outlier: boolean };

const base = (i: number) => (i % 3 === 1 ? 5 : 6);
export const checkRuns: CheckRun[] = Array.from({ length: 20 }, (_, i) => {
  const n = 48191 + i;
  const mins = 12 * 60 + 25 + i * 5;
  const started = `Oct 22, ${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")} UTC`;
  if (i === 16) return { id: `CHK-${n}`, started, status: "Succeeded", duration: 11, load: 4, steps: 6, confirm: 1, outlier: true };
  if (i === 17) return { id: `CHK-${n}`, started, status: "Failed", duration: 12, load: 1, steps: 11, confirm: 0, outlier: true };
  if (i >= 18) return { id: `CHK-${n}`, started, status: "Timed Out", duration: 15, load: 1, steps: 14, confirm: 0, outlier: true };
  return { id: `CHK-${n}`, started, status: "Succeeded", duration: base(i) + 2, load: 1, steps: base(i), confirm: 1, outlier: false };
});

export type Monitor = { name: string; target: string; kind: "http" | "job"; status: "Up" | "Down"; ago: string; duration: string; uptime: number; p95: string; paused?: boolean };
export const monitors: Monitor[] = [
  { name: "Checkout flow", target: "api.acme.com/checkout · 6 regions", kind: "http", status: "Down", ago: "1m ago", duration: "2s", uptime: 75, p95: "15s" },
  { name: "Payments API", target: "api.acme.com/v1/payments/health", kind: "http", status: "Up", ago: "2m ago", duration: "1s", uptime: 95, p95: "1s" },
  { name: "Login flow", target: "app.acme.com/login", kind: "http", status: "Up", ago: "2m ago", duration: "3s", uptime: 100, p95: "3s" },
  { name: "Search API", target: "api.acme.com/v1/search", kind: "http", status: "Up", ago: "3m ago", duration: "1s", uptime: 100, p95: "1s" },
  { name: "Status page", target: "status.acme.com", kind: "http", status: "Up", ago: "1m ago", duration: "2s", uptime: 100, p95: "2s" },
  { name: "Nightly database backup", target: "pg_dump --all · 0 2 * * *", kind: "job", status: "Up", ago: "12h ago", duration: "18m 54s", uptime: 100, p95: "19m 05s" },
  { name: "Search reindex", target: "reindex search --shards=12 · */30 * * * *", kind: "job", status: "Up", ago: "14m ago", duration: "6m 56s", uptime: 95, p95: "7m 25s" },
  { name: "Invoice export", target: "invoices:export --format=pdf · 0 * * * *", kind: "job", status: "Up", ago: "3d ago", duration: "4m 14s", uptime: 100, p95: "4m 14s", paused: true },
];
