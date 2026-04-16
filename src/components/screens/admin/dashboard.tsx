"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  School,
  TrendingUp,
  DollarSign,
  Calendar,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  CreditCard,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { useAppStore } from "@/store/use-app-store";
import {
  useDashboardSummary,
  useDashboardAttendance,
  useDashboardAcademic,
  useDashboardFinancial,
  useDashboardNotices,
} from "@/lib/graphql/hooks";
import { goeyToast as toast } from "goey-toast";

const attendanceChartConfig = {
  rate: { label: "Attendance Rate (%)", color: "#10b981" },
} satisfies ChartConfig;

const feeChartConfig = {
  collected: { label: "Collected", color: "#10b981" },
  pending: { label: "Pending", color: "#f59e0b" },
} satisfies ChartConfig;

const pieChartConfig = {
  students: { label: "Students", color: "#10b981" },
} satisfies ChartConfig;

const COLORS = [
  "#10b981",
  "#059669",
  "#047857",
  "#065f46",
  "#34d399",
  "#6ee7b7",
  "#a7f3d0",
  "#d1fae5",
];

const priorityColors: Record<string, string> = {
  normal: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  important:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const priorityBorders: Record<string, string> = {
  normal: "border-l-gray-400 dark:border-l-gray-500",
  important: "border-l-orange-500",
  urgent: "border-l-red-500",
};

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { currentUser, currentTenantId } = useAppStore();
  const tenantId = currentTenantId || currentUser?.tenantId || "default";

  // Granular hooks for progressive loading
  const summary = useDashboardSummary(tenantId);
  const attendance = useDashboardAttendance(tenantId);
  const academic = useDashboardAcademic(tenantId);
  const financial = useDashboardFinancial(tenantId);
  const notices = useDashboardNotices(tenantId);

  useEffect(() => {
    const error = summary.error || attendance.error || academic.error || financial.error || notices.error;
    if (error) {
      toast.error("Some dashboard data failed to load", { description: error.message });
    }
  }, [summary.error, attendance.error, academic.error, financial.error, notices.error]);

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good Morning"
      : today.getHours() < 17
        ? "Good Afternoon"
        : "Good Evening";

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Progressive Summary Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <School className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {greeting}, {currentUser?.name || "Admin"}!
              </h2>
              <p className="text-teal-100 text-sm">
                Here&apos;s what&apos;s happening at Sigel School today
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {summary.isLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <Skeleton className="h-3 w-20 bg-white/20" />
                    <Skeleton className="h-7 w-12 bg-white/20 mt-1" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <p className="text-teal-100 text-xs font-medium">Total Students</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <GraduationCap className="h-5 w-5 text-teal-200" />
                    {summary.data?.totalStudents ?? 0}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <p className="text-teal-100 text-xs font-medium">Total Teachers</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <Users className="h-5 w-5 text-teal-200" />
                    {summary.data?.totalTeachers ?? 0}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <p className="text-teal-100 text-xs font-medium">Attendance Rate</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <Activity className="h-5 w-5 text-teal-200" />
                    {summary.data?.attendanceRate ?? 0}%
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <p className="text-teal-100 text-xs font-medium">Upcoming Events</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <Calendar className="h-5 w-5 text-teal-200" />
                    {summary.data?.upcomingEvents ?? 0}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overview Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Parents</p>
                    <p className="text-2xl font-bold">{summary.data?.totalParents ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <School className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Classes</p>
                    <p className="text-2xl font-bold">{summary.data?.totalClasses ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fee Revenue</p>
                    <p className="text-2xl font-bold">${(financial.data?.totalRevenue ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Attendance</p>
                    <p className="text-2xl font-bold">{summary.data?.attendanceRate ?? 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-600" />
              Monthly Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ChartContainer config={attendanceChartConfig} className="h-[280px] w-full">
                <BarChart data={attendance.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} unit="%" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="rate" fill="var(--color-rate)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-cyan-600" />
              Class Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {academic.isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={academic.data?.classDistribution ?? []}
                    cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={2}
                    dataKey="students" nameKey="name"
                    label={({ name, percent }) => `${name.split("-")[0]} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false} fontSize={10}
                  >
                    {(academic.data?.classDistribution ?? []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Fee Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financial.isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ChartContainer config={feeChartConfig} className="h-[280px] w-full">
                <BarChart data={financial.data?.feeByType ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="type" tickLine={false} axisLine={false} fontSize={12} width={70} tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="collected" fill="var(--color-collected)" radius={[0, 4, 4, 0]} maxBarSize={20} />
                  <Bar dataKey="pending" fill="var(--color-pending)" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-amber-500" />
              Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notices.isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {(notices.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No notices yet</p>
                ) : (
                  (notices.data ?? []).map((notice) => (
                    <div key={notice.id} className={`p-3 rounded-lg border border-l-4 ${priorityBorders[notice.priority] || priorityBorders.normal} bg-white dark:bg-gray-900 hover:shadow-sm transition-shadow`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{notice.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notice.content}</p>
                        </div>
                        <Badge className={`text-[10px] shrink-0 ${priorityColors[notice.priority] || priorityColors.normal}`}>{notice.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                        <span>{notice.authorName}</span>
                        <span>•</span>
                        <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
