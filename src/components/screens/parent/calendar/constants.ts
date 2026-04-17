export const ROLE_FILTER = ["all", "parent"] as const;
export const ROLE_FILTER_SET = new Set<string>(ROLE_FILTER);

export const EVENT_TYPE_COLORS: Record<string, string> = {
  exam: "#ef4444",
  holiday: "#10b981",
  event: "#3b82f6",
  meeting: "#f97316",
  sports: "#8b5cf6",
  cultural: "#ec4899",
  deadline: "#f59e0b",
  other: "#6b7280",
  general: "#10b981",
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  exam: "Exam",
  holiday: "Holiday",
  event: "Event",
  meeting: "Meeting",
  sports: "Sports",
  cultural: "Cultural",
  deadline: "Deadline",
  other: "Other",
  general: "General",
};

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
