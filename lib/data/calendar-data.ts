export type Category = "Release" | "Task" | "Maintenance" | "Meeting" | "On-call" | "Comms";

export const categoryStyle: Record<Category, { chip: string; card: string }> = {
  Release: { chip: "bg-amber-700 text-white", card: "bg-amber-50 border-amber-200" },
  Task: { chip: "bg-zinc-700 text-white", card: "bg-zinc-100 border-zinc-200" },
  Maintenance: { chip: "bg-indigo-700 text-white", card: "bg-indigo-50 border-indigo-200" },
  Meeting: { chip: "bg-purple-600 text-white", card: "bg-purple-50 border-purple-200" },
  "On-call": { chip: "bg-sky-700 text-white", card: "bg-sky-50 border-sky-200" },
  Comms: { chip: "bg-emerald-700 text-white", card: "bg-emerald-50 border-emerald-200" },
};

export type CalEvent = { day: number; category: Category; title: string; start?: number; end?: number; meta?: string; progress?: string };

/** day: 0 = Mon 19 … 6 = Sun 25. start/end are hours on a 24h clock; no start means all-day. */
export const calEvents: CalEvent[] = [
  { day: 0, category: "Release", title: "search-api v1.14.0 Rollout", progress: "Tasks 7/8" },
  { day: 2, category: "Task", title: "Rotate auth-service signing keys", progress: "Pipeline 1/5" },
  { day: 3, category: "Maintenance", title: "edge-gateway certificate renewal", progress: "Deliverables 4/9" },
  { day: 0, category: "Maintenance", title: "Pre-rollout Checks", start: 9, end: 11, progress: "Deliverables 5/6" },
  { day: 0, category: "Meeting", title: "Weekly Ops Review", start: 13, end: 14.5 },
  { day: 1, category: "On-call", title: "Payments On-call Handoff", start: 10, end: 11 },
  { day: 1, category: "On-call", title: "Edge Failover Drill", start: 10.5, end: 12, meta: "edge-gateway" },
  { day: 2, category: "Comms", title: "Certificate Notice", start: 9, end: 10 },
  { day: 2, category: "On-call", title: "Search Capacity Call", start: 15, end: 17, meta: "search-api" },
  { day: 3, category: "Release", title: "checkout-api v3.5.0 Release", start: 12.5, end: 14, progress: "Pipeline 5/6" },
  { day: 3, category: "On-call", title: "High error rate on checkout-api", start: 14, end: 16, meta: "checkout-api" },
  { day: 4, category: "Meeting", title: "INC-2209 Postmortem", start: 9, end: 10.5, meta: "checkout-api" },
  { day: 4, category: "Comms", title: "Customer Incident Summary", start: 11.5, end: 13, meta: "checkout-api" },
  { day: 4, category: "Maintenance", title: "Payments DB Failover Test", start: 15, end: 17, progress: "Deliverables 2/4" },
];
