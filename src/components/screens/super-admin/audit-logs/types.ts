export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string | null;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    email: string | null;
  } | null;
  user: {
    name: string;
    email: string;
  } | null;
}

export type LogCategory =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "EXPORT"
  | "SUSPEND"
  | "VIEW";

export interface ActionTypeCount {
  action: string;
  count: number;
}

export function getActionCategory(action: string): LogCategory {
  if (action.startsWith("CREATE")) return "CREATE";
  if (action.startsWith("UPDATE")) return "UPDATE";
  if (action.startsWith("DELETE")) return "DELETE";
  if (action.includes("LOGIN") || action.includes("LOGOUT")) return "LOGIN";
  if (
    action.includes("VIEW") ||
    action.includes("LIST") ||
    action.includes("GET")
  )
    return "VIEW";
  if (action.includes("EXPORT")) return "EXPORT";
  if (action.includes("SUSPEND") || action.includes("DISABLE"))
    return "SUSPEND";
  return "VIEW";
}

export const categoryColors: Record<string, string> = {
  CREATE: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700",
  UPDATE: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700",
  DELETE: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700",
  LOGIN: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700",
  VIEW: "bg-muted text-foreground ",
  EXPORT: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700",
  SUSPEND: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 border-orange-200",
};

export const CATEGORIES: LogCategory[] = [
  "DELETE",
  "CREATE",
  "UPDATE",
  "LOGIN",
  "EXPORT",
  "SUSPEND",
  "VIEW",
];

/** The solid colour each category takes in the legend's dots and the breakdown's bars. */
export const categoryAccent: Record<LogCategory, string> = {
  CREATE: "bg-emerald-500",
  UPDATE: "bg-blue-500",
  DELETE: "bg-red-500",
  LOGIN: "bg-purple-500",
  EXPORT: "bg-amber-500",
  SUSPEND: "bg-orange-500",
  VIEW: "bg-sky-500",
};

/** `action:login` and the legend's chip label. */
export const categoryLabel: Record<LogCategory, string> = {
  CREATE: "Create",
  UPDATE: "Update",
  DELETE: "Delete",
  LOGIN: "Login",
  EXPORT: "Export",
  SUSPEND: "Suspend",
  VIEW: "View",
};

/** "CREATE_STUDENT" reads as "create student" in the message column. */
export function humanizeAction(action: string): string {
  return action.replace(/_/g, " ").toLowerCase();
}
