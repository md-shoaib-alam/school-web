import React from "react";
import type { ChartConfig } from "@/components/ui/chart";

export interface DashboardData {
  tenants: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
  };
  users: {
    total: number;
    students: number;
    teachers: number;
    parents: number;
    admins: number;
  };
  revenue: {
    total: number;
    mrr: number;
  };
  subscriptions: {
    active: number;
  };
  classes: number;
  monthlyData: {
    month: string;
    newTenants: number;
    newUsers: number;
    revenue: number;
  }[];
  topTenants: {
    id: string;
    name: string;
    plan: string;
    totalRevenue: number;
    studentCount: number;
    _count: {
      users: number;
      classes: number;
    };
  }[];
  planDistribution: {
    plan: string;
    count: number;
  }[];
  activityLogs: {
    id: string;
    action: string;
    metadata: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
    tenant: {
      name: string;
    } | null;
  }[];
}

export const userChartConfig: ChartConfig = {
  students: { label: "Students", color: "#059669" },
  teachers: { label: "Teachers", color: "#10b981" },
  parents: { label: "Parents", color: "#34d399" },
  admins: { label: "Admins", color: "#6ee7b7" },
};

export const growthChartConfig: ChartConfig = {
  newTenants: { label: "New Schools", color: "#059669" },
  newUsers: { label: "New Users", color: "#10b981" },
  revenue: { label: "Revenue ($)", color: "#047857" },
};

export const planChartConfig: ChartConfig = {
  count: { label: "Schools", color: "#059669" },
};

export const USER_CHART_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7"];

export const PLAN_COLORS: Record<string, string> = {
  basic: "#94a3b8",
  standard: "#059669",
  premium: "#f59e0b",
  enterprise: "#7c3aed",
};

export function formatAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
