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

export type CheckStatus = "Up" | "Down" | "Timed out";
export type Check = { at: string; ago: string; status: CheckStatus; duration: string; exit: number; trigger: "Schedule" | "Manual" };
export type Monitor = {
  id: string; name: string; target: string; kind: "http" | "job"; status: "Up" | "Down"; ago: string; duration: string; uptime: number; p95: string; paused?: boolean;
  /** Detail sheet fields */
  cron: string; every: string; interval: number; nextIn: number; service: string; region: string; owner: string; team: string; timeout: string; retries: number; next: string; request: string; error?: string;
  checks: Check[];
};

const NOW = Date.UTC(2026, 9, 22, 14, 0);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (t: number) => { const d = new Date(t); return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC` };
const since = (t: number) => { const m = Math.round((NOW - t) / 60000); return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago` };
const secs = (s: string) => s.split(" ").reduce((a, p) => a + (parseInt(p) || 0) * (p.endsWith("m") ? 60 : 1), 0);
export const formatDuration = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${pad(s % 60)}s`);

/** Last 20 checks, oldest first; `bad` maps check index to a non-Up status. */
function history(intervalMin: number, lastAgoMin: number, duration: string, timeout: string, bad: Record<number, CheckStatus> = {}): Check[] {
  const d = secs(duration);
  return Array.from({ length: 20 }, (_, i) => {
    const t = NOW - (lastAgoMin + (19 - i) * intervalMin) * 60000;
    const status = bad[i] ?? "Up";
    const dur = status === "Timed out" ? secs(timeout) : status === "Down" ? d : Math.max(1, d + ((i * 7) % 5) - 2 * Number(d > 10));
    return { at: stamp(t), ago: since(t), status, duration: formatDuration(dur), exit: status === "Up" ? 0 : 1, trigger: "Schedule" };
  });
}

type Seed = Omit<Monitor, "checks" | "nextIn"> & { agoMin: number; bad?: Record<number, CheckStatus> };
const seeds: Seed[] = [
  { id: "MON-101", name: "Checkout flow", target: "api.acme.com/checkout · 6 regions", kind: "http", status: "Down", ago: "1m ago", duration: "2s", uptime: 75, p95: "15s", cron: "*/5 * * * *", every: "Every 5 minutes", interval: 5, service: "checkout-api", region: "All 6 regions", owner: "Mira Stone", team: "Payments", timeout: "15s", retries: 1, next: "Thu, Oct 22, 14:05 UTC", request: "GET https://api.acme.com/checkout", error: "HTTP 503 from EU (Frankfurt), 2 of 6 regions failing since ALR-142. 5 failed checks in a row since 13:43 UTC.", agoMin: 1, bad: { 15: "Down", 16: "Timed out", 17: "Down", 18: "Timed out", 19: "Down" } },
  { id: "MON-102", name: "Payments API", target: "api.acme.com/v1/payments/health", kind: "http", status: "Up", ago: "2m ago", duration: "1s", uptime: 95, p95: "1s", cron: "*/5 * * * *", every: "Every 5 minutes", interval: 5, service: "payments", region: "US East", owner: "Leo Grant", team: "Payments", timeout: "9s", retries: 1, next: "Thu, Oct 22, 14:05 UTC", request: "GET https://api.acme.com/v1/payments/health", agoMin: 2, bad: { 17: "Timed out" } },
  { id: "MON-103", name: "Login flow", target: "app.acme.com/login", kind: "http", status: "Up", ago: "2m ago", duration: "3s", uptime: 100, p95: "3s", cron: "*/5 * * * *", every: "Every 5 minutes", interval: 5, service: "auth-service", region: "US East", owner: "Sarah Chen", team: "Identity", timeout: "5s", retries: 1, next: "Thu, Oct 22, 14:05 UTC", request: "GET https://app.acme.com/login", agoMin: 2 },
  { id: "MON-104", name: "Search API", target: "api.acme.com/v1/search", kind: "http", status: "Up", ago: "3m ago", duration: "1s", uptime: 100, p95: "1s", cron: "*/5 * * * *", every: "Every 5 minutes", interval: 5, service: "search-api", region: "EU (Frankfurt)", owner: "Kenji Tan", team: "Search", timeout: "2s", retries: 1, next: "Thu, Oct 22, 14:05 UTC", request: "GET https://api.acme.com/v1/search", agoMin: 3 },
  { id: "MON-105", name: "Status page", target: "status.acme.com", kind: "http", status: "Up", ago: "1m ago", duration: "2s", uptime: 100, p95: "2s", cron: "*/5 * * * *", every: "Every 5 minutes", interval: 5, service: "status-renderer", region: "US East", owner: "Priya Patel", team: "Platform", timeout: "3s", retries: 1, next: "Thu, Oct 22, 14:05 UTC", request: "GET https://status.acme.com", agoMin: 1 },
  { id: "MON-106", name: "Nightly database backup", target: "pg_dump --all · 0 2 * * *", kind: "job", status: "Up", ago: "12h ago", duration: "18m 54s", uptime: 100, p95: "19m 05s", cron: "0 2 * * *", every: "Daily at 02:00", interval: 1440, service: "postgres", region: "US East", owner: "Omar Haddad", team: "Platform", timeout: "21m 00s", retries: 0, next: "Fri, Oct 23, 02:00 UTC", request: "pg_dump --all", agoMin: 720 },
  { id: "MON-107", name: "Search reindex", target: "reindex search --shards=12 · */30 * * * *", kind: "job", status: "Up", ago: "14m ago", duration: "6m 56s", uptime: 95, p95: "7m 25s", cron: "*/30 * * * *", every: "Every 30 minutes", interval: 30, service: "search-indexer", region: "EU (Frankfurt)", owner: "Kenji Tan", team: "Search", timeout: "12m 00s", retries: 0, next: "Thu, Oct 22, 14:30 UTC", request: "reindex search --shards=12", agoMin: 14, bad: { 9: "Timed out" } },
  { id: "MON-108", name: "Invoice export", target: "invoices:export --format=pdf · 0 * * * *", kind: "job", status: "Up", ago: "3d ago", duration: "4m 14s", uptime: 100, p95: "4m 14s", paused: true, cron: "0 * * * *", every: "Hourly at :00", interval: 60, service: "billing-worker", region: "US East", owner: "Emma Wilson", team: "Platform", timeout: "5m 00s", retries: 2, next: "Paused", request: "invoices:export --format=pdf", agoMin: 4320 },
];
export const monitors: Monitor[] = seeds.map(({ agoMin, bad, ...m }) => ({ ...m, nextIn: m.interval === 1440 ? 720 : m.interval, checks: history(m.interval, agoMin, m.duration, m.timeout, bad) }));

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const inLabel = (m: number) => (m < 60 ? `in ${m}m` : m < 1440 ? `in ${Math.round(m / 60)}h` : `in ${Math.round(m / 1440)}d`);
/** Upcoming check times for a monitor, e.g. ["Thu, Oct 22, 14:05 UTC", "in 5m"]. */
export const nextChecks = (m: Pick<Monitor, "interval" | "nextIn" | "paused">, n = 5): [string, string][] =>
  m.paused ? [] : Array.from({ length: n }, (_, k) => { const min = m.nextIn + k * m.interval; const t = NOW + min * 60000; return [`${days[new Date(t).getUTCDay()]}, ${stamp(t)}`, inLabel(min)] });
export const durationSeconds = secs;

export const monitorOwners = ["Mira Stone", "Leo Grant", "Priya Patel", "Omar Haddad", "Emma Wilson", "Kenji Tan", "Sarah Chen", "Sofia Romero", "Michael Rodriguez"];
export const monitorServices = ["checkout-api", "payments", "auth-service", "search-api", "status-renderer", "postgres", "search-indexer", "billing-worker"];
