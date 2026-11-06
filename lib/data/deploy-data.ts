export type DeployState = "failed" | "rolled-back" | "deployed" | "checks" | "rolling" | "queued" | "approval" | "scheduled";
export type Deploy = { id: string; time: string; service: string; version: string; from: string; env: "Staging" | "Production" | "Sandbox"; region: string; state: DeployState; label: string };

const d = (id: string, time: string, service: string, version: string, from: string, env: Deploy["env"], region: string, state: DeployState, label: string): Deploy =>
  ({ id, time, service, version, from, env, region, state, label });

export const deploys: Deploy[] = [
  d("DEP-4124", "09:42", "analytics-pipeline", "v1.18.4", "v1.18.3", "Staging", "us-east-1", "failed", "Failed"),
  d("DEP-4125", "10:20", "check-scheduler", "v2.7.1", "v2.7.0", "Production", "eu-central-1", "rolled-back", "Rolled back"),
  d("DEP-4127", "13:40", "billing-worker", "v2.41.0", "v2.40.3", "Production", "us-east-1", "deployed", "Deployed 13:54"),
  d("DEP-4131", "13:56", "webhooks-dispatcher", "v1.27.0", "v1.26.2", "Sandbox", "us-east-1", "checks", "Checks 6/9"),
  d("DEP-4134", "13:57", "search-indexer", "v2.3.3", "v2.3.2", "Staging", "us-east-1", "checks", "Checks 4/9"),
  d("DEP-4132", "13:58", "notifications", "v2.14.0", "v2.13.0", "Staging", "us-east-1", "checks", "Checks 2/9"),
  d("DEP-4128", "14:00", "auth-service", "v4.3.0", "v4.2.0", "Production", "us-east-1", "rolling", "Rolling out 5%"),
  d("DEP-4129", "14:00", "billing-worker", "v2.41.0", "v2.40.3", "Production", "ap-southeast-1", "rolling", "Rolling out 5%"),
  d("DEP-4133", "14:00", "webhooks-dispatcher", "v1.27.0", "v1.26.2", "Production", "us-east-1", "queued", "Queued 14:20"),
  d("DEP-4130", "14:20", "billing-worker", "v2.41.0", "v2.40.3", "Production", "eu-central-1", "approval", "Needs approval"),
  d("DEP-4135", "14:40", "search-indexer", "v2.3.1", "v2.2.9", "Production", "ap-southeast-1", "scheduled", "Scheduled"),
  d("DEP-4136", "14:40", "webhooks-dispatcher", "v1.27.0", "v1.26.2", "Production", "eu-central-1", "scheduled", "Scheduled"),
];

export type Merge = { pr: string; title: string; service: string; author: string; time: string; state: "merged" | "queued" | "checks" | "blocked" };

export const merges: Merge[] = [
  { pr: "#2841", title: "Cache open invoice balances per tenant", service: "billing-worker", author: "Mira Stone", time: "13:31", state: "merged" },
  { pr: "#2836", title: "Retry Stripe webhooks on 409", service: "billing-worker", author: "Leo Grant", time: "13:22", state: "merged" },
  { pr: "#2852", title: "Sign deliveries with the rotated whsec key", service: "webhooks-dispatcher", author: "Priya Patel", time: "13:48", state: "checks" },
  { pr: "#2849", title: "Split reindex into 400 doc batches", service: "search-indexer", author: "Kenji Tan", time: "13:50", state: "checks" },
  { pr: "#2855", title: "Short-circuit login when MFA is pending", service: "auth-service", author: "Sarah Chen", time: "13:54", state: "queued" },
  { pr: "#2857", title: "Group push sends by tenant", service: "notifications", author: "Priya Patel", time: "13:56", state: "queued" },
  { pr: "#2846", title: "Drop the deprecated v1 export endpoint", service: "analytics-pipeline", author: "Emma Wilson", time: "12:40", state: "blocked" },
];
