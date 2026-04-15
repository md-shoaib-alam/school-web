"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { StudentInfo, AttendanceRecord } from "@/lib/types";

const statusColors: Record<string, { bg: string; border: string }> = {
  present: { bg: "bg-emerald-500", border: "border-emerald-300" },
  absent: { bg: "bg-red-500", border: "border-red-300" },
  late: { bg: "bg-amber-500", border: "border-amber-300" },
};

function getAttendanceStats(records: AttendanceRecord[]) {
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const percentage =
    total > 0 ? Math.round(((present + late) / total) * 100) : 0;
  return { total, present, absent, late, percentage };
}

function getMonthlyData(records: AttendanceRecord[]) {
  const now = new Date();
  const months: {
    month: string;
    present: number;
    absent: number;
    late: number;
  }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString("en-US", { month: "short" });
    const monthRecords = records.filter((r) => {
      const rd = new Date(r.date);
      return (
        rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
      );
    });
    months.push({
      month: monthLabel,
      present: monthRecords.filter((r) => r.status === "present").length,
      absent: monthRecords.filter((r) => r.status === "absent").length,
      late: monthRecords.filter((r) => r.status === "late").length,
    });
  }
  return months;
}

function getCalendarData(records: AttendanceRecord[]) {
  const today = new Date();
  const days: { date: number; day: string; status: string | null }[] = [];
  const statusMap = new Map<string, string>();
  records.forEach((r) => statusMap.set(r.date, r.status));

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    days.push({
      date: d.getDate(),
      day: d.toLocaleString("en-US", { weekday: "narrow" }),
      status:
        dayOfWeek === 0 || dayOfWeek === 6
          ? null
          : statusMap.get(dateStr) || null,
    });
  }
  return days;
}

function getCalendarCellColor(status: string | null) {
  if (!status)
    return "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500";
  switch (status) {
    case "present":
      return "bg-emerald-500 text-white";
    case "absent":
      return "bg-red-500 text-white";
    case "late":
      return "bg-amber-500 text-white";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500";
  }
}

export function ParentAttendance() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          apiFetch("/api/students"),
          apiFetch("/api/attendance"),
        ]);
        const studentsData = await studentsRes.json();
        const attendanceData = await attendanceRes.json();

        const parentStudents = studentsData.filter(
          (s: StudentInfo) => s.parentName === currentUser?.name,
        );
        const studentIds = parentStudents.map((s: StudentInfo) => s.id);

        setStudents(parentStudents);
        setAllAttendance(
          attendanceData.filter((a: AttendanceRecord) =>
            studentIds.includes(a.studentId),
          ),
        );
        if (parentStudents.length > 0) {
          setActiveTab(parentStudents[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser?.name]);

  const studentAttendance = useMemo(() => {
    if (!activeTab) return [];
    return allAttendance.filter((a) => a.studentId === activeTab);
  }, [activeTab, allAttendance]);

  const stats = useMemo(
    () => getAttendanceStats(studentAttendance),
    [studentAttendance],
  );
  const monthlyData = useMemo(
    () => getMonthlyData(studentAttendance),
    [studentAttendance],
  );
  const calendarDays = useMemo(
    () => getCalendarData(studentAttendance),
    [studentAttendance],
  );

  if (loading) return <AttendanceSkeleton />;

  if (students.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-12 text-center">
          <UserCheck className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">
            No children found
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            No students are linked to your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Attendance Overview
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-amber-50 dark:bg-amber-900/30 p-1">
          {students.map((student) => (
            <TabsTrigger
              key={student.id}
              value={student.id}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm px-4"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {student.name}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {students.map((student) => {
          const currentAttendance = allAttendance.filter(
            (a) => a.studentId === student.id,
          );
          const currentStats = getAttendanceStats(currentAttendance);
          const currentMonthly = getMonthlyData(currentAttendance);
          const currentCalendar = getCalendarData(currentAttendance);

          return (
            <TabsContent
              key={student.id}
              value={student.id}
              className="space-y-6 mt-6"
            >
              {/* Big percentage + stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Percentage circle */}
                <Card className="rounded-xl shadow-sm col-span-2 md:col-span-1">
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg
                        className="w-32 h-32 -rotate-90"
                        viewBox="0 0 128 128"
                      >
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="#f3f4f6"
                          strokeWidth="10"
                          className="dark:stroke-gray-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke={
                            currentStats.percentage >= 80
                              ? "#10b981"
                              : currentStats.percentage >= 60
                                ? "#f59e0b"
                                : "#ef4444"
                          }
                          strokeWidth="10"
                          strokeDasharray={`${(currentStats.percentage / 100) * 352} 352`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                          className={`text-3xl font-bold ${currentStats.percentage >= 80 ? "text-emerald-600 dark:text-emerald-400" : currentStats.percentage >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {currentStats.percentage}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Attendance
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stat cards */}
                <Card className="rounded-xl shadow-sm border-emerald-200 dark:border-emerald-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Present Days
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {currentStats.present}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border-red-200 dark:border-red-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Absent Days
                        </p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {currentStats.absent}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Late Days
                        </p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {currentStats.late}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly bar chart */}
              <Card className="rounded-xl shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-sm font-semibold">
                      Monthly Attendance (Last 6 Months)
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Present, Absent, and Late breakdown by month
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={currentMonthly}
                        barGap={2}
                        barCategoryGap="20%"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f3f4f6"
                          className="dark:stroke-gray-700"
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12, fill: "#9ca3af" }}
                          axisLine={{ stroke: "#e5e7eb" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          }}
                        />
                        <Bar
                          dataKey="present"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          name="Present"
                        />
                        <Bar
                          dataKey="absent"
                          fill="#ef4444"
                          radius={[4, 4, 0, 0]}
                          name="Absent"
                        />
                        <Bar
                          dataKey="late"
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                          name="Late"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* 30-day calendar grid */}
              <Card className="rounded-xl shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-sm font-semibold">
                      30-Day Attendance Calendar
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Last 30 days attendance overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {[
                      { label: "Present", color: "bg-emerald-500" },
                      { label: "Absent", color: "bg-red-500" },
                      { label: "Late", color: "bg-amber-500" },
                      {
                        label: "Weekend / No Data",
                        color: "bg-gray-200 dark:bg-gray-700",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <div className={`w-3 h-3 rounded ${item.color}`} />
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {currentCalendar.map((day, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center rounded-lg p-1.5 min-h-[48px] ${getCalendarCellColor(day.status)}`}
                        title={
                          day.status
                            ? day.status.charAt(0).toUpperCase() +
                              day.status.slice(1)
                            : day.day === "S" || day.day === "S"
                              ? "Weekend"
                              : "No data"
                        }
                      >
                        <span className="text-[10px] font-medium opacity-70">
                          {day.day}
                        </span>
                        <span className="text-sm font-semibold">
                          {day.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function AttendanceSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
