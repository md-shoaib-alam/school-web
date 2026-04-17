import React from "react";
import { 
  Building2, 
  Sparkles, 
  Zap, 
  Crown,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  UserCheck,
  Wifi,
  Clock
} from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";

export function generateTenantGrowth() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let cumulative = 12;
  return months.map((month) => {
    cumulative += Math.floor(Math.random() * 4) + 2;
    return { month, tenants: cumulative };
  });
}

export function generateUserGrowth() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let students = 1200, teachers = 180, parents = 900, admins = 45;
  return months.map((month) => {
    students += Math.floor(Math.random() * 200) + 80;
    teachers += Math.floor(Math.random() * 30) + 10;
    parents += Math.floor(Math.random() * 150) + 60;
    admins += Math.floor(Math.random() * 5) + 1;
    return { month, students, teachers, parents, admins };
  });
}

export function generateRevenueBreakdown() {
  const schools = ["Greenfield Academy", "Sunrise International", "Heritage School", "Modern Public School", "St. Mary's Convent", "Oakridge Academy", "Riverdale School", "Evergreen High", "Bluebell School", "Maple Grove"];
  return schools
    .map((name) => ({
      name,
      revenue: Math.floor(Math.random() * 15000) + 5000,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export const geographicData = [
  { country: "India", percentage: 85, color: "bg-teal-500" },
  { country: "USA", percentage: 10, color: "bg-blue-500" },
  { country: "UK", percentage: 5, color: "bg-amber-500" },
];

export const featureUsageData = [
  { feature: "Attendance", usage: 94 },
  { feature: "Grades", usage: 87 },
  { feature: "Fees", usage: 82 },
  { feature: "Subscriptions", usage: 76 },
  { feature: "Timetable", usage: 71 },
  { feature: "Assignments", usage: 65 },
  { feature: "Notices", usage: 58 },
  { feature: "Reports", usage: 52 },
  { feature: "Parent Portal", usage: 45 },
  { feature: "Bus Tracking", usage: 32 },
];

export const tenantGrowthConfig = {
  tenants: { label: "Total Tenants", color: "#10b981" },
} satisfies ChartConfig;

export const userGrowthConfig = {
  students: { label: "Students", color: "#10b981" },
  teachers: { label: "Teachers", color: "#3b82f6" },
  parents: { label: "Parents", color: "#f59e0b" },
  admins: { label: "Admins", color: "#8b5cf6" },
} satisfies ChartConfig;

export const revenueConfig = {
  revenue: { label: "Revenue ($)", color: "#10b981" },
} satisfies ChartConfig;

export const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#475569"];

export const featureUsageConfig = {
  usage: { label: "Usage (%)", color: "#10b981" },
} satisfies ChartConfig;
