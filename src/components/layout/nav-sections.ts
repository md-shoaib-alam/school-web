import type { NavItem } from "./nav-config";
import type { UserRole } from "@/store/use-app-store";

/**
 * How the sidebar groups each role's tabs. Keys are listed in the order they should appear;
 * anything nav-config adds that is not named here falls into "More" at the end, so a new tab can
 * never disappear from the navigation.
 */
const SECTIONS: Partial<Record<UserRole, { label: string; keys: string[] }[]>> = {
  super_admin: [
    { label: "Overview", keys: ["dashboard"] },
    { label: "Schools", keys: ["tenants", "deleted-tenants", "bulk-attendance-import"] },
    { label: "People", keys: ["users", "staff"] },
    { label: "Billing", keys: ["billing", "school-subscriptions", "subscriptions"] },
    {
      label: "Platform",
      keys: ["feature-control", "roles", "manage-admins", "platform-notices", "send-notification"],
    },
    { label: "Reliability", keys: ["platform-analytics", "queue-status", "audit-logs"] },
    { label: "Reports & Settings", keys: ["reports", "settings"] },
  ],
  admin: [
    { label: "Overview", keys: ["dashboard"] },
    { label: "People", keys: ["students", "teachers", "parents", "staff"] },
    { label: "Academics", keys: ["academic-years", "classes", "subjects", "timetable", "calendar"] },
    {
      label: "Attendance & Exams",
      keys: ["attendance-group", "exam-management", "promotions-group", "leave-management", "certificates"],
    },
    { label: "Finance", keys: ["fees-group", "expenses"] },
    { label: "Communication", keys: ["notices", "tickets"] },
    { label: "Reports & Settings", keys: ["reports", "roles"] },
  ],
  staff: [
    { label: "Overview", keys: ["dashboard"] },
    { label: "People", keys: ["students", "teachers"] },
    {
      label: "Academics",
      keys: [
        "academic-years",
        "classes",
        "subjects",
        "timetable",
        "calendar",
        "attendance-group",
        "exam-management",
        "promotions-group",
        "leave-management",
        "certificates",
      ],
    },
    { label: "Finance", keys: ["fees-group", "expenses"] },
    { label: "Reports & Support", keys: ["reports", "notices", "tickets"] },
  ],
  teacher: [
    { label: "Overview", keys: ["dashboard"] },
    { label: "Teaching", keys: ["my-classes", "my-subjects", "attendance-group", "grades-group", "homework-group"] },
    { label: "Schedule", keys: ["timetable", "calendar", "leaves"] },
    { label: "Support", keys: ["notices", "tickets"] },
  ],
  student: [
    { label: "Overview", keys: ["dashboard"] },
    { label: "My Classes", keys: ["my-classes", "grades-group", "assessments", "homework"] },
    { label: "Attendance", keys: ["my-attendance", "leaves"] },
    { label: "Schedule", keys: ["timetable", "calendar"] },
    { label: "Fees & Support", keys: ["fees", "notices", "tickets"] },
  ],
  parent: [
    { label: "Overview", keys: ["dashboard"] },
    { label: "Children", keys: ["children", "homework", "grades-group", "attendance"] },
    { label: "Schedule", keys: ["timetable", "calendar"] },
    { label: "Fees & Support", keys: ["fees", "subscription", "notices", "tickets"] },
  ],
};

/** The items in their sections, keeping the order the caller already filtered by permission. */
export function groupNavItems(
  role: UserRole | undefined,
  items: NavItem[],
): { label: string; items: NavItem[] }[] {
  const sections = SECTIONS[role ?? "admin"] ?? [];
  const claimed = new Set<string>();
  const groups = sections
    .map(({ label, keys }) => ({
      label,
      items: keys
        .map((key) => items.find((item) => item.key === key))
        .filter((item): item is NavItem => {
          if (!item) return false;
          claimed.add(item.key);
          return true;
        }),
    }))
    .filter((group) => group.items.length > 0);

  const rest = items.filter((item) => !claimed.has(item.key));
  if (rest.length) groups.push({ label: "More", items: rest });

  // No map for this role: one unnamed block, so the sidebar still lists everything.
  return groups.length ? groups : [{ label: "", items }];
}
