import { ROLE_CONFIG } from "./types";
import type { PlatformUser, TenantInfo } from "./types";

/** Tabs of the user detail sheet navigation bar. */
export type UserDetailTab = "overview" | "activity" | "relations" | "settings";

/** Badge styling entry for a role, exactly as ROLE_CONFIG declares it. */
export type RoleConfigEntry = (typeof ROLE_CONFIG)[string];

/** School assignment awaiting confirmation in the alert dialog. */
export interface PendingSchoolChange {
  tenantId: string | null;
  schoolName: string;
}

export interface UserDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PlatformUser | null;
  onToggleStatus: (userId: string) => void;
  onUserUpdated?: (updatedUser: PlatformUser) => void;
  toggling: boolean;
  formatDateTime: (val: string) => string;
  tenants?: TenantInfo[];
}

/** Avatar monogram: first letter of up to two name parts, uppercased. */
export function getUserInitials(name: string) {
  return (name || "U")
    .split(" ")
    .map((n) => n[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Role badge configuration lookup, keeping the student entry as fallback. */
export function getRoleConfig(role: string): RoleConfigEntry {
  return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.student;
}

/** The relations tab is labelled per role. */
export function getRoleRelationsLabel(role: string) {
  return (
    role === "parent" ? "Children" :
    role === "teacher" ? "Students" :
    role === "student" ? "Classes" : "Team"
  );
}

/** "Jan 05, 2026" style date; en dash for missing or unparseable values. */
export function formatDateShort(dateStr: string) {
  if (!dateStr) return "–";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "–";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
