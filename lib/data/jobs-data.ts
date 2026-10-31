export type JobStatus = "Failed" | "Timed Out" | "Succeeded";

export type Job = {
  name: string;
  command: string;
  schedule: string;
  cron: string;
  enabled: boolean;
  status: JobStatus;
  ago: string;
  duration: string;
  target: string;
  region: string;
  owner: string;
  runs: JobStatus[];
};

const ok = (n: number): JobStatus[] => Array(n).fill("Succeeded");
const withTail = (n: number, tail: JobStatus[]): JobStatus[] => [...ok(n - tail.length), ...tail];

export const jobs: Job[] = [
  { name: "Drain webhook retry queue", command: "retries:drain --max=5000", schedule: "Every 5 minutes", cron: "*/5 * * * *", enabled: true, status: "Failed", ago: "5m ago", duration: "52s", target: "webhooks-dispatcher", region: "prod-eu-central-1", owner: "Omar Haddad", runs: withTail(20, ["Failed", "Succeeded", "Failed", "Failed"]) },
  { name: "Import bank settlement files", command: "settlements:import --banks=all", schedule: "Hourly at :30", cron: "30 * * * *", enabled: true, status: "Failed", ago: "30m ago", duration: "4m 12s", target: "billing-worker", region: "prod-us-east-1", owner: "Leo Grant", runs: withTail(20, ["Failed", "Timed Out", "Failed"]) },
  { name: "Rebuild merchant search index", command: "reindex merchants --shards=12", schedule: "Daily at 03:30", cron: "30 3 * * *", enabled: true, status: "Timed Out", ago: "10h 30m ago", duration: "1h 00m", target: "search-indexer", region: "prod-eu-central-1", owner: "Kenji Tan", runs: withTail(20, ["Timed Out"]) },
  { name: "Send failed charge alerts", command: "alerts:failed-charges --batch=500", schedule: "Every 5 minutes", cron: "*/5 * * * *", enabled: true, status: "Succeeded", ago: "5m ago", duration: "12s", target: "notifications", region: "prod-us-east-1", owner: "Michael Rodriguez", runs: ok(20) },
  { name: "Sync FX reference rates", command: "fx:sync --source=central-banks", schedule: "Every 10 minutes", cron: "*/10 * * * *", enabled: true, status: "Succeeded", ago: "10m ago", duration: "11s", target: "payments", region: "prod-us-east-1", owner: "Mira Stone", runs: ok(20) },
  { name: "Expire stale payout holds", command: "holds:expire --older-than=72h", schedule: "Every 15 minutes", cron: "*/15 * * * *", enabled: true, status: "Succeeded", ago: "15m ago", duration: "20s", target: "payouts-scheduler", region: "prod-us-east-1", owner: "Priya Patel", runs: ok(20) },
  { name: "Warm merchant search cache", command: "cache:warm merchants", schedule: "Every 20 minutes", cron: "*/20 * * * *", enabled: true, status: "Succeeded", ago: "20m ago", duration: "38s", target: "search-indexer", region: "prod-eu-central-1", owner: "Kenji Tan", runs: ok(20) },
  { name: "Purge expired idempotency keys", command: "idempotency:purge --ttl=24h", schedule: "Hourly at :25", cron: "25 * * * *", enabled: true, status: "Succeeded", ago: "35m ago", duration: "1m 55s", target: "payments", region: "prod-us-east-1", owner: "Shadcn", runs: ok(20) },
  { name: "Retry failed payouts", command: "payouts:retry --max-attempts=3", schedule: "Every 30 minutes", cron: "*/30 * * * *", enabled: true, status: "Succeeded", ago: "30m ago", duration: "1m 57s", target: "payouts-scheduler", region: "prod-eu-central-1", owner: "Priya Patel", runs: ok(20) },
  { name: "Refresh fraud model features", command: "features:refresh --model=fs-v7", schedule: "Hourly at :00", cron: "0 * * * *", enabled: true, status: "Succeeded", ago: "1h ago", duration: "5m 48s", target: "fraud-scorer", region: "prod-us-east-1", owner: "Sarah Chen", runs: ok(20) },
];

export const upNext = [
  { name: "Drain webhook retry queue", in: "5m", failing: true },
  { name: "Send failed charge alerts", in: "5m" },
  { name: "Sync FX reference rates", in: "10m" },
  { name: "Expire stale payout holds", in: "15m" },
  { name: "Warm merchant search cache", in: "20m" },
  { name: "Purge expired idempotency keys", in: "25m" },
  { name: "Import bank settlement files", in: "30m", failing: true },
  { name: "Retry failed payouts", in: "30m" },
];

export const runTimeByHour = Array.from({ length: 24 }, (_, i) => {
  const wobble = (i * 37) % 11;
  return {
    hour: `${String(i).padStart(2, "0")}:00`,
    succeeded: 35 + wobble * 3 + (i % 5) * 4,
    timedOut: i === 3 ? 60 : i % 9 === 0 ? 4 : 0,
    failed: i % 6 === 2 ? 14 : i % 4 === 1 ? 3 : 1,
  };
});
