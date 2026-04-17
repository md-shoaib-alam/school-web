import React from "react";
import { CreditCard, Wallet, Building2, Receipt } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";

export interface Subscription {
  id: string;
  tenantId?: string;
  parentId?: string;
  planName: string;
  planId?: string;
  amount: number;
  status: string;
  paymentMethod: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  parent?: { user: { name: string; email?: string } } | null;
  tenant?: { name: string; slug?: string } | null;
}

export interface TenantBilling {
  id: string;
  name: string;
  slug: string;
  plan: string;
  activeRevenue: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  _count?: { users: number; classes: number };
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  newSubscriptions: number;
  churned: number;
}

export interface BillingData {
  subscriptions: Subscription[];
  tenantBilling: TenantBilling[];
  planRevenue: Record<string, { count: number; revenue: number }>;
  methodRevenue: Record<string, { count: number; revenue: number }>;
  monthlyTrend: MonthlyTrend[];
  statusDistribution: Record<string, number>;
  totalActiveRevenue: number;
}

export type SortKey = "activeRevenue" | "totalRevenue" | "name" | "activeSubscriptions";
export type SortDir = "asc" | "desc";

export const revenueTrendConfig = {
  revenue: { label: "Revenue (₹)", color: "#10b981" },
  newSubscriptions: { label: "New Subscriptions", color: "#3b82f6" },
  churned: { label: "Churned", color: "#ef4444" },
} satisfies ChartConfig;

export const planRevenueConfig = {
  revenue: { label: "Revenue (₹)", color: "#10b981" },
} satisfies ChartConfig;

export const DONUT_COLORS: Record<string, string> = {
  card: "#10b981",
  upi: "#6366f1",
  netbanking: "#0ea5e9",
  wallet: "#f59e0b",
  free: "#94a3b8",
};

export const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  expired: "#94a3b8",
  cancelled: "#ef4444",
  trial: "#f59e0b",
};

export const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  active: {
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-700",
    dot: "bg-emerald-500",
    label: "Active",
  },
  expired: {
    bg: "bg-gray-50 dark:bg-gray-900",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
    dot: "bg-gray-400",
    label: "Expired",
  },
  cancelled: {
    bg: "bg-red-50 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-700",
    dot: "bg-red-500",
    label: "Cancelled",
  },
  trial: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-700",
    dot: "bg-amber-500",
    label: "Trial",
  },
};

export const paymentMethodConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  card: {
    icon: React.createElement(CreditCard, { className: "h-3.5 w-3.5" }),
    color: "text-emerald-600",
    label: "Card",
  },
  upi: {
    icon: React.createElement(Wallet, { className: "h-3.5 w-3.5" }),
    color: "text-indigo-600",
    label: "UPI",
  },
  netbanking: {
    icon: React.createElement(Building2, { className: "h-3.5 w-3.5" }),
    color: "text-sky-600",
    label: "Net Banking",
  },
  wallet: {
    icon: React.createElement(Wallet, { className: "h-3.5 w-3.5" }),
    color: "text-amber-600",
    label: "Wallet",
  },
  free: {
    icon: React.createElement(Receipt, { className: "h-3.5 w-3.5" }),
    color: "text-gray-500 dark:text-gray-400",
    label: "Free",
  },
};

export const planBadgeConfig: Record<string, { bg: string; text: string; border: string }> = {
  Basic: {
    bg: "bg-slate-50 dark:bg-slate-900/30",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
  },
  Standard: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-700",
  },
  Premium: {
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-700",
  },
};
