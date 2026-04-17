import { CheckCircle2, Activity, Ban, XCircle } from "lucide-react";
import React from "react";

export interface TenantCount {
  users: number;
  classes: number;
  notices: number;
  events: number;
  subscriptions: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  plan: string;
  status: string;
  maxStudents: number;
  maxTeachers: number;
  maxParents: number;
  maxClasses: number;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  studentCount: number;
  teacherCount: number;
  parentCount: number;
  adminCount: number;
  activeSubscriptions: number;
  totalRevenue: number;
  _count: TenantCount;
}

export interface TenantFormData {
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  plan: string;
  maxStudents: number;
  maxTeachers: number;
  maxParents: number;
  maxClasses: number;
  status: string;
}

export type ViewMode = "grid" | "table";

export const ITEMS_PER_PAGE = 8;

export const planColors: Record<string, { bg: string; text: string; border: string }> = {
  basic: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-700",
  },
  standard: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-700",
  },
  premium: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-700",
  },
  enterprise: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-700",
  },
};

export const statusColors: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  active: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: React.createElement(CheckCircle2, { className: "h-3 w-3" }),
  },
  trial: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: React.createElement(Activity, { className: "h-3 w-3" }),
  },
  suspended: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    icon: React.createElement(Ban, { className: "h-3 w-3" }),
  },
  inactive: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    icon: React.createElement(XCircle, { className: "h-3 w-3" }),
  },
};

export const emptyFormData: TenantFormData = {
  name: "",
  slug: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  plan: "basic",
  maxStudents: 100,
  maxTeachers: 20,
  maxParents: 100,
  maxClasses: 10,
  status: "active",
};
