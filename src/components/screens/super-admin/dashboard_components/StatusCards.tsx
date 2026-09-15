"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Users,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  IndianRupee,
  FileDown,
  UserCog,
  ClipboardList,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardData, userChartConfig } from "./types";

interface StatusCardsProps {
  loading: boolean;
  data: DashboardData | undefined;
  onNavigate: (screen: string) => void;
}

// Visual colors matching reference image
const ROLE_COLORS: Record<string, string> = {
  Students: "#3B82F6", // bright blue
  Teachers: "#10B981", // emerald
  Parents: "#F59E0B",  // amber
  Admins: "#8B5CF6",   // purple
};

export function StatusCards({ loading, data, onNavigate }: StatusCardsProps) {
  const [recharts, setRecharts] = useState<typeof import("recharts") | null>(null);

  useEffect(() => {
    import("recharts").then(setRecharts);
  }, []);

  const totalUsers = data?.users.total || 0;
  const userDistributionData = data
    ? [
        { name: "Students", value: data.users.students, fill: ROLE_COLORS.Students },
        { name: "Teachers", value: data.users.teachers, fill: ROLE_COLORS.Teachers },
        { name: "Parents", value: data.users.parents, fill: ROLE_COLORS.Parents },
        { name: "Admins", value: data.users.admins, fill: ROLE_COLORS.Admins },
      ]
    : [];

  const totalTenants = data?.tenants.total || 1;
  const activePct = Math.round(((data?.tenants.active ?? 0) / totalTenants) * 100);
  const trialPct = Math.round(((data?.tenants.trial ?? 0) / totalTenants) * 100);
  const suspendedPct = Math.round(((data?.tenants.suspended ?? 0) / totalTenants) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Tenant Status (3.5 cols on desktop) */}
      <Card className="lg:col-span-4 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 rounded-2xl shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <div className="size-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Building2 className="size-3.5" />
              </div>
              Tenant Status
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Active, trial, and suspended schools
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("tenants")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 h-7 px-2"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
            </div>
          ) : (
            <>
              {/* Active */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-white dark:bg-emerald-900/50 shadow-xs flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Active</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Operational</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {data?.tenants.active ?? 0}
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">{activePct}%</p>
                </div>
              </div>

              {/* Trial */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-white dark:bg-purple-900/50 shadow-xs flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Trial</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Evaluation</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {data?.tenants.trial ?? 0}
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">{trialPct}%</p>
                </div>
              </div>

              {/* Suspended */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-white dark:bg-rose-900/50 shadow-xs flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Suspended</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Attention Required</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {data?.tenants.suspended ?? 0}
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">{suspendedPct}%</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 2. User Distribution (5 cols on desktop) */}
      <Card className="lg:col-span-5 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 rounded-2xl shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <div className="size-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Users className="size-3.5" />
              </div>
              User Distribution
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Breakdown by role across all schools
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
            All Schools <ChevronDown className="size-3 text-slate-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {loading || !recharts ? (
            <Skeleton className="h-[200px] w-full rounded-2xl" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
              {/* Left Donut with center total */}
              <div className="sm:col-span-6 relative flex items-center justify-center">
                <ChartContainer config={userChartConfig} className="h-[190px] w-[190px]">
                  {(() => {
                    const { PieChart, Pie, Cell } = recharts;
                    return (
                      <PieChart>
                        <Pie
                          data={userDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                          stroke="none"
                        >
                          {userDistributionData.map((item) => (
                            <Cell key={item.name} fill={item.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    );
                  })()}
                </ChartContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {totalUsers.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Total Users
                  </span>
                </div>
              </div>

              {/* Right Role List Breakdown */}
              <div className="sm:col-span-6 space-y-2.5">
                {userDistributionData.map((item) => {
                  const pct = totalUsers > 0 ? Math.round((item.value / totalUsers) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {item.value.toLocaleString()}
                        </span>
                        <span className="text-slate-500 font-medium text-[11px] w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Quick Actions (3 cols on desktop) */}
      <Card className="lg:col-span-3 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Zap className="size-4 text-emerald-500" /> Quick Actions
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Frequent administrative operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-1">
          <ActionButton
            icon={<Plus className="size-4 text-white" />}
            label="Add New School"
            sub="Register a new tenant"
            gradient="from-emerald-500 to-teal-600"
            onClick={() => onNavigate("tenants")}
          />
          <ActionButton
            icon={<IndianRupee className="size-4 text-white" />}
            label="View Billing"
            sub="Revenue & invoices"
            gradient="from-purple-500 to-indigo-600"
            onClick={() => onNavigate("billing")}
          />
          <ActionButton
            icon={<FileDown className="size-4 text-white" />}
            label="Export Report"
            sub="Download analytics"
            gradient="from-amber-500 to-orange-600"
            onClick={() => onNavigate("platform-analytics")}
          />
          <ActionButton
            icon={<UserCog className="size-4 text-white" />}
            label="Manage Users"
            sub="Platform staff"
            gradient="from-teal-500 to-cyan-600"
            onClick={() => onNavigate("users")}
          />
          <ActionButton
            icon={<ClipboardList className="size-4 text-white" />}
            label="Audit Logs"
            sub="Security & activity"
            gradient="from-slate-600 to-slate-800"
            onClick={() => onNavigate("audit-logs")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  sub,
  gradient,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full group flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-900/40 dark:hover:bg-slate-800/60 transition-all text-left"
    >
      <div className="flex items-center gap-3">
        <div
          className={`size-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-xs`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight">
            {label}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            {sub}
          </p>
        </div>
      </div>
      <ChevronRight className="size-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}
