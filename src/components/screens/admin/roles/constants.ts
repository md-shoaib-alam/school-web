import type { PermissionModule } from "./types";

export const PERMISSION_MODULES: PermissionModule[] = [
  { key: "students", label: "Students", icon: "👨‍🎓" },
  { key: "teachers", label: "Teachers", icon: "👨‍🏫" },
  { key: "parents", label: "Parents", icon: "👨‍👦" },
  { key: "classes", label: "Classes", icon: "🏫" },
  { key: "subjects", label: "Subjects", icon: "📚" },
  { key: "attendance", label: "Attendance", icon: "📋" },
  { key: "fees", label: "Fees", icon: "💰" },
  { key: "grades", label: "Grades", icon: "📝" },
  { key: "certificates", label: "Certificates", icon: "📜" },
  { key: "notices", label: "Notices", icon: "📢" },
  { key: "timetable", label: "Timetable", icon: "📅" },
  { key: "calendar", label: "Calendar", icon: "📆" },
  { key: "reports", label: "Reports", icon: "📊" },
  { key: "leaves", label: "Leaves", icon: "📅" },
];

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const;

export const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

export const COLOR_PRESETS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];
