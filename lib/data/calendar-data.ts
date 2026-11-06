export type Category = "Release" | "Task" | "Maintenance" | "Meeting" | "On-call" | "Comms";

export const categories: Category[] = ["Release", "Task", "Maintenance", "Meeting", "On-call", "Comms"];

export const categoryStyle: Record<Category, { chip: string; card: string }> = {
  Release: { chip: "bg-amber-700 text-white", card: "bg-amber-50 border-amber-200" },
  Task: { chip: "bg-zinc-700 text-white", card: "bg-zinc-100 border-zinc-200" },
  Maintenance: { chip: "bg-indigo-700 text-white", card: "bg-indigo-50 border-indigo-200" },
  Meeting: { chip: "bg-purple-600 text-white", card: "bg-purple-50 border-purple-200" },
  "On-call": { chip: "bg-sky-700 text-white", card: "bg-sky-50 border-sky-200" },
  Comms: { chip: "bg-emerald-700 text-white", card: "bg-emerald-50 border-emerald-200" },
};

/** Owners and attendees; avatar is optional, initials show when it's missing. */
export const calPeople: Record<string, { avatar?: string }> = {
  "Mira Stone": { avatar: "/avatars/mira-stone.jpg" },
  "Leo Grant": { avatar: "/avatars/leo-grant.jpg" },
  "Priya Patel": { avatar: "/avatars/priya-patel.jpg" },
  "Kenji Tan": { avatar: "/avatars/kenji-tan.jpg" },
  "Sarah Chen": { avatar: "/avatars/sarah-chen.jpg" },
  "Sofia Romero": { avatar: "/avatars/sofia-romero.jpg" },
  "Emma Wilson": { avatar: "/avatars/emma-wilson.jpg" },
  "Omar Haddad": { avatar: "/avatars/omar-haddad.jpg" },
  "Michael Rodriguez": { avatar: "/avatars/michael-rodriguez.jpg" },
};
export const calOwners = ["Mira Stone", "Leo Grant", "Priya Patel", "Kenji Tan", "Sarah Chen", "Sofia Romero"];
export const calServices = ["All services", "checkout-api", "search-api", "auth-service", "edge-gateway", "payments"];
export const calPriorities = ["None", "Low", "Medium", "High"];

/** Monday of the demo's current week (UTC, so day maths never trips on DST). */
export const calWeekStart = Date.UTC(2026, 9, 19);

export type CalEvent = {
  day: number; category: Category; title: string; start?: number; end?: number; meta?: string; progress?: string;
  service?: string; owner?: string; status?: string; priority?: string; room?: string; attendees?: string[]; note?: string;
};

/** day: days from Mon Oct 19 (0 = Mon 19, 7 = next Mon). start/end are hours on a 24h clock; no start means all-day. */
export const calEvents: CalEvent[] = [
  { day: 0, category: "Release", title: "search-api v1.14.0 Rollout", progress: "Tasks 7/8", service: "search-api", owner: "Kenji Tan", status: "Rolling Out", priority: "High", room: "#releases", attendees: ["Kenji Tan", "Emma Wilson", "Omar Haddad"] },
  { day: 2, category: "Task", title: "Rotate auth-service signing keys", progress: "Pipeline 1/5", service: "auth-service", owner: "Sarah Chen", status: "Initiated", priority: "Low", room: "#identity", attendees: ["Sarah Chen", "Priya Patel"] },
  { day: 3, category: "Maintenance", title: "edge-gateway certificate renewal", progress: "Deliverables 4/9", service: "edge-gateway", owner: "Sofia Romero", status: "At Risk", priority: "High", room: "#edge-ops", attendees: ["Sofia Romero", "Michael Rodriguez"] },
  { day: 0, category: "Maintenance", title: "Pre-rollout Checks", start: 9, end: 11, progress: "Deliverables 5/6", service: "search-api", owner: "Kenji Tan", status: "Rolling Out", priority: "High", room: "Room 2", attendees: ["Kenji Tan", "Emma Wilson", "Omar Haddad"] },
  { day: 0, category: "Meeting", title: "Weekly Ops Review", start: 13, end: 14.5, service: "All services", owner: "Priya Patel", status: "Confirmed", priority: "Medium", room: "Video call", attendees: ["Priya Patel", "Omar Haddad", "Michael Rodriguez", "Mira Stone", "Leo Grant", "Kenji Tan", "Sarah Chen", "Sofia Romero", "Emma Wilson"] },
  { day: 1, category: "On-call", title: "Payments On-call Handoff", start: 10, end: 11, service: "payments", owner: "Leo Grant", status: "Confirmed", priority: "Medium", room: "Video call", attendees: ["Leo Grant", "Mira Stone", "Priya Patel", "Omar Haddad", "Emma Wilson"] },
  { day: 1, category: "On-call", title: "Edge Failover Drill", start: 10.5, end: 12, meta: "edge-gateway", service: "edge-gateway", owner: "Sofia Romero", status: "Confirmed", priority: "High", room: "War room", attendees: ["Sofia Romero", "Michael Rodriguez"] },
  { day: 2, category: "Comms", title: "Certificate Notice", start: 9, end: 10, service: "edge-gateway", owner: "Sofia Romero", status: "At Risk", priority: "High", room: "Email", attendees: ["Sofia Romero", "Priya Patel", "Leo Grant", "Mira Stone"] },
  { day: 2, category: "On-call", title: "Search Capacity Call", start: 15, end: 17, meta: "search-api", service: "search-api", owner: "Kenji Tan", status: "Confirmed", priority: "Medium", room: "Room 4", attendees: ["Kenji Tan", "Omar Haddad"] },
  { day: 3, category: "Release", title: "checkout-api v3.5.0 Release", start: 12.5, end: 14, progress: "Pipeline 5/6", service: "checkout-api", owner: "Mira Stone", status: "Degraded", priority: "Medium", room: "#releases", attendees: ["Mira Stone", "Emma Wilson"] },
  { day: 3, category: "On-call", title: "High error rate on checkout-api", start: 14, end: 16, meta: "checkout-api", service: "checkout-api", owner: "Leo Grant", status: "Sev 2", priority: "High", room: "Video call", attendees: ["Leo Grant", "Mira Stone", "Priya Patel", "Kenji Tan", "Emma Wilson", "Omar Haddad"] },
  { day: 4, category: "Meeting", title: "INC-2209 Postmortem", start: 9, end: 10.5, meta: "checkout-api", service: "checkout-api", owner: "Mira Stone", status: "Draft Ready", priority: "High", room: "Video call", attendees: ["Mira Stone", "Leo Grant", "Priya Patel", "Kenji Tan", "Emma Wilson", "Omar Haddad"] },
  { day: 4, category: "Comms", title: "Customer Incident Summary", start: 11.5, end: 13, meta: "checkout-api", service: "checkout-api", owner: "Priya Patel", status: "Waiting On Review", priority: "Medium", room: "Status page", attendees: ["Priya Patel", "Leo Grant", "Mira Stone", "Omar Haddad", "Emma Wilson", "Kenji Tan", "Sarah Chen"] },
  { day: 4, category: "Maintenance", title: "Payments DB Failover Test", start: 15, end: 17, progress: "Deliverables 2/4", service: "payments", owner: "Leo Grant", status: "Approved", priority: "Medium", room: "Room 4", attendees: ["Leo Grant", "Omar Haddad", "Emma Wilson"] },
];
