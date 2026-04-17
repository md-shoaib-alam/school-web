import React from "react";
import { Building2, Sparkles, Zap, Crown } from "lucide-react";

export interface PlanConfig {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  maxStudents: number;
  maxTeachers: number;
  maxClasses: number;
  features: string[];
  color: string;
  icon: React.ReactNode;
}

export const defaultPlans: PlanConfig[] = [
  {
    name: "Basic",
    monthlyPrice: "$29",
    yearlyPrice: "$290",
    maxStudents: 100,
    maxTeachers: 10,
    maxClasses: 10,
    features: [
      "Student Management",
      "Basic Reports",
      "Email Support",
      "1 GB Storage",
    ],
    color: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800",
    icon: React.createElement(Building2, { className: "h-4 w-4" }),
  },
  {
    name: "Standard",
    monthlyPrice: "$79",
    yearlyPrice: "$790",
    maxStudents: 500,
    maxTeachers: 30,
    maxClasses: 30,
    features: [
      "Everything in Basic",
      "Grade Management",
      "Attendance Tracking",
      "Fee Management",
      "5 GB Storage",
      "Priority Support",
    ],
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    icon: React.createElement(Sparkles, { className: "h-4 w-4" }),
  },
  {
    name: "Premium",
    monthlyPrice: "$149",
    yearlyPrice: "$1,490",
    maxStudents: 2000,
    maxTeachers: 100,
    maxClasses: 100,
    features: [
      "Everything in Standard",
      "Advanced Analytics",
      "Timetable System",
      "Parent Portal",
      "API Access",
      "20 GB Storage",
      "Dedicated Support",
    ],
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    icon: React.createElement(Zap, { className: "h-4 w-4" }),
  },
  {
    name: "Enterprise",
    monthlyPrice: "$299",
    yearlyPrice: "$2,990",
    maxStudents: -1,
    maxTeachers: -1,
    maxClasses: -1,
    features: [
      "Everything in Premium",
      "Custom Integrations",
      "White-label",
      "SLA Guarantee",
      "Unlimited Storage",
      "On-premise Option",
      "24/7 Phone Support",
      "Dedicated Account Manager",
    ],
    color: "text-teal-600 bg-teal-100 dark:bg-teal-900/30",
    icon: React.createElement(Crown, { className: "h-4 w-4" }),
  },
];

export interface PerformanceData {
  status: string;
  timestamp: string;
  uptime: number;
  database: {
    status: string;
    latency: string;
    totalQueries: number;
    slowestQuery: string;
    poolWarmed: boolean;
    records: {
      users: number;
      classes: number;
      attendance: number;
      fees: number;
    };
  };
  server: {
    totalLatency: string;
    memory: {
      rss: string;
      heapUsed: string;
      heapTotal: string;
      external: string;
    } | null;
    nodeVersion: string;
    platform: string;
  };
  concurrency: {
    estimatedCapacity: string;
    connectionPool: string;
    cacheLayer: string;
    requestDeduplication: string;
  };
  optimizations: Record<string, boolean>;
}
