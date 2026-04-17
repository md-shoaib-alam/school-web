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
  Server 
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
  { key: "tenants", label: "Schools / Tenants", icon: React.createElement(Building2, { className: "h-4 w-4" }) },
  { key: "users", label: "All Users", icon: React.createElement(Users, { className: "h-4 w-4" }) },
  { key: "billing", label: "Billing & Revenue", icon: React.createElement(Receipt, { className: "h-4 w-4" }) },
  { key: "audit-logs", label: "Audit Logs", icon: React.createElement(ScrollText, { className: "h-4 w-4" }) },
  { key: "analytics", label: "Analytics", icon: React.createElement(PieChart, { className: "h-4 w-4" }) },
  { key: "feature-flags", label: "Feature Flags", icon: React.createElement(Blocks, { className: "h-4 w-4" }) },
  { key: "settings", label: "Settings", icon: React.createElement(Settings, { className: "h-4 w-4" }) },
  { key: "api", label: "API & Integrations", icon: React.createElement(Globe, { className: "h-4 w-4" }) },
  { key: "security", label: "Security", icon: React.createElement(Lock, { className: "h-4 w-4" }) },
  { key: "reports", label: "Reports & Export", icon: React.createElement(Eye, { className: "h-4 w-4" }) },
  { key: "support", label: "Support Tickets", icon: React.createElement(Server, { className: "h-4 w-4" }) },
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
