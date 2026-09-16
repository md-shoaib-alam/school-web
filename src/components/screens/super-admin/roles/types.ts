import React from "react";
import { 
  Building2, 
  Users, 
  Receipt, 
  ScrollText, 
  PieChart, 
  Blocks, 
  Settings, 
  Globe, 
  Lock, 
  Eye, 
  Server,
  UserPlus,
  Shield,
  UserCog,
  Bell,
  Send
} from "lucide-react";

export interface PlatformRoleRecord {
  id: string;
  name: string;
  description: string | null;
  color: string;
  permissions: string;
  createdAt: string;
  updatedAt: string;
  _count?: { users: number };
}

export interface AssignedUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
}

export interface AvailableUser extends AssignedUser {
  platformRoleId: string | null;
}

export const PLATFORM_MODULES = [
  { key: "tenants", label: "Schools / Tenants", icon: React.createElement(Building2, { className: "size-4" }) },
  { key: "users", label: "All Users", icon: React.createElement(Users, { className: "size-4" }) },
  { key: "billing", label: "Billing & Revenue", icon: React.createElement(Receipt, { className: "size-4" }) },
  { key: "audit-logs", label: "Audit Logs", icon: React.createElement(ScrollText, { className: "size-4" }) },
  { key: "analytics", label: "Analytics", icon: React.createElement(PieChart, { className: "size-4" }) },
  { key: "feature-flags", label: "Feature Flags", icon: React.createElement(Blocks, { className: "size-4" }) },
  { key: "settings", label: "Settings", icon: React.createElement(Settings, { className: "size-4" }) },
  { key: "api", label: "API & Integrations", icon: React.createElement(Globe, { className: "size-4" }) },
  { key: "security", label: "Security", icon: React.createElement(Lock, { className: "size-4" }) },
  { key: "reports", label: "Reports & Export", icon: React.createElement(Eye, { className: "size-4" }) },
  { key: "support", label: "Support Tickets", icon: React.createElement(Server, { className: "size-4" }) },
  { key: "staff", label: "Platform Staff", icon: React.createElement(UserPlus, { className: "size-4" }) },
  { key: "roles", label: "Role Configuration", icon: React.createElement(Shield, { className: "size-4" }) },
  { key: "manage-admins", label: "Admin Management", icon: React.createElement(UserCog, { className: "size-4" }) },
  { key: "notices", label: "Platform Notices", icon: React.createElement(Bell, { className: "size-4" }) },
  { key: "notifications", label: "Push Notifications", icon: React.createElement(Send, { className: "size-4" }) },
];

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const;

export const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

export const COLOR_PRESETS = [
  "#059669", "#10b981", "#f59e0b", "#06b6d4", "#8b5cf6", 
  "#ec4899", "#ef4444", "#6366f1", "#84cc16", "#64748b"
];

export const ROLE_TEMPLATES = [
  {
    name: "Support Agent",
    description: "Handle support tickets and view tenant data",
    color: "#06b6d4",
    permissions: {
      tenants: ["view"],
      users: ["view"],
      billing: ["view"],
      "audit-logs": ["view"],
      analytics: ["view"],
      support: ["view", "create", "edit"],
    },
  },
  {
    name: "Billing Manager",
    description: "Manage billing, invoices, and subscription plans",
    color: "#f59e0b",
    permissions: {
      billing: ["view", "create", "edit", "delete"],
      tenants: ["view"],
      users: ["view"],
      analytics: ["view"],
      reports: ["view", "create"],
    },
  },
  {
    name: "Content Moderator",
    description: "Manage platform content and feature flags",
    color: "#8b5cf6",
    permissions: {
      tenants: ["view"],
      "feature-flags": ["view", "edit"],
      settings: ["view"],
      api: ["view"],
    },
  },
  {
    name: "Security Analyst",
    description: "Monitor security, audit logs, and user activity",
    color: "#ef4444",
    permissions: {
      "audit-logs": ["view", "create"],
      users: ["view", "edit"],
      security: ["view", "edit"],
      settings: ["view"],
      reports: ["view", "create", "edit"],
    },
  },
  {
    name: "Read-Only Viewer",
    description: "View-only access to all platform data",
    color: "#64748b",
    permissions: Object.fromEntries(
      PLATFORM_MODULES.map((m) => [m.key, ["view"]])
    ),
  },
];

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function isSystemRole(role: PlatformRoleRecord): boolean {
  if ((role as any).isSystem !== undefined) {
    return Boolean((role as any).isSystem);
  }
  // In demo / default data, Security Analyst is custom while others are default system templates
  const lower = role.name.trim().toLowerCase();
  if (lower === "security analyst") return false;
  return ROLE_TEMPLATES.some((t) => t.name.toLowerCase() === lower);
}

export interface RoleThemeConfig {
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  borderHover: string;
}

export const ROLE_THEMES: Record<string, RoleThemeConfig> = {
  "support agent": {
    iconBg: "bg-blue-50 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-50 dark:bg-blue-950/60",
    badgeText: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    borderHover: "hover:border-blue-300",
  },
  "billing manager": {
    iconBg: "bg-amber-50 dark:bg-amber-950/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-950/60",
    badgeText: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    borderHover: "hover:border-amber-300",
  },
  "content moderator": {
    iconBg: "bg-purple-50 dark:bg-purple-950/50",
    iconColor: "text-purple-600 dark:text-purple-400",
    badgeBg: "bg-purple-50 dark:bg-purple-950/60",
    badgeText: "text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    borderHover: "hover:border-purple-300",
  },
  "security analyst": {
    iconBg: "bg-red-50 dark:bg-red-950/50",
    iconColor: "text-red-600 dark:text-red-400",
    badgeBg: "bg-red-50 dark:bg-red-950/60",
    badgeText: "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    borderHover: "hover:border-red-300",
  },
  "read-only viewer": {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
    badgeText: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    borderHover: "hover:border-emerald-300",
  },
};

export function getRoleTheme(name: string): RoleThemeConfig {
  const lower = name.trim().toLowerCase();
  return (
    ROLE_THEMES[lower] || {
      iconBg: "bg-slate-100 dark:bg-zinc-800",
      iconColor: "text-slate-700 dark:text-zinc-300",
      badgeBg: "bg-slate-100 dark:bg-zinc-800",
      badgeText: "text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700",
      borderHover: "hover:border-slate-300",
    }
  );
}

