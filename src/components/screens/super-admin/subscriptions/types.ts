import React from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export interface SubscriptionRecord {
  id: string;
  parentId: string;
  planName: string;
  planId: string;
  amount: number;
  period: string;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  addons: string;
  createdAt: string;
  updatedAt: string;
  parent: {
    id: string;
    userId: string;
    user: { name: string; email: string; phone: string | null };
    students: {
      id: string;
      user: { name: string };
      class: { name: string; section: string; grade: number } | null;
    }[];
  };
}

export const statusConfig: Record<
  string,
  { bg: string; icon: React.ReactNode; label: string }
> = {
  active: {
    bg: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    icon: React.createElement(CheckCircle2, { className: "h-3.5 w-3.5" }),
    label: "Active",
  },
  cancelled: {
    bg: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    icon: React.createElement(XCircle, { className: "h-3.5 w-3.5" }),
    label: "Cancelled",
  },
  expired: {
    bg: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    icon: React.createElement(Clock, { className: "h-3.5 w-3.5" }),
    label: "Expired",
  },
};
