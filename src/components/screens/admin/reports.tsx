"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  BarChart3,
  GraduationCap,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Eye,
} from "lucide-react";
import type {
  ClassInfo,
  AttendanceRecord,
  GradeRecord,
  FeeRecord,
} from "@/lib/types";
import { useModulePermissions } from "@/hooks/use-permissions";

// ─── Chart Configs ──────────────────────────────────────────────────────────

const attendanceChartConfig = {
  present: { label: "Present", color: "#10b981" },
  absent: { label: "Absent", color: "#ef4444" },
  late: { label: "Late", color: "#f59e0b" },
} satisfies ChartConfig;

const gradeChartConfig = {
  count: { label: "Students", color: "#8b5cf6" },
} satisfies ChartConfig;

const feeBreakdownConfig = {
  collected: { label: "Collected", color: "#10b981" },
  pending: { label: "Pending", color: "#f59e0b" },
} satisfies ChartConfig;

// ─── Skeleton Components ────────────────────────────────────────────────────

function SummaryCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-[300px] w-full" />;
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-4 space-y-3">
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

// ─── Attendance Report ──────────────────────────────────────────────────────

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  presentPct: string;
  absentPct: string;
  latePct: string;
}

interface DailyAttendance {
  date: string;
  present: number;
  absent: number;
  late: number;
}

function AttendanceReport() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");
        setClasses(await res.json());
      } catch {
        console.error("Error fetching classes");
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedClass !== "all") params.set("classId", selectedClass);
        const res = await fetch(`/api/attendance?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch attendance");
        setRecords(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, [selectedClass]);

  const summary: AttendanceSummary = useMemo(() => {
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const total = records.length || 1;
    return {
      present,
      absent,
      late,
      total: records.length,
      presentPct: ((present / total) * 100).toFixed(1),
      absentPct: ((absent / total) * 100).toFixed(1),
      latePct: ((late / total) * 100).toFixed(1),
    };
  }, [records]);

  const dailyData: DailyAttendance[] = useMemo(() => {
    const dateMap = new Map<
      string,
      { present: number; absent: number; late: number }
    >();
    for (const r of records) {
      const d = new Date(r.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const entry = dateMap.get(d) || { present: 0, absent: 0, late: 0 };
      if (r.status === "present") entry.present++;
      else if (r.status === "absent") entry.absent++;
      else if (r.status === "late") entry.late++;
      dateMap.set(d, entry);
    }
    return Array.from(dateMap.entries())
      .slice(-7)
      .map(([date, data]) => ({ date, ...data }));
  }, [records]);

  const summaryCards = [
    {
      label: "Present",
      value: summary.present,
      pct: summary.presentPct,
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      color:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    {
      label: "Absent",
      value: summary.absent,
      pct: summary.absentPct,
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
    },
    {
      label: "Late",
      value: summary.late,
      pct: summary.latePct,
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      color:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
    },
  ];

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
        <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load attendance report</p>
          <p className="text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class selector */}
      <div className="flex items-center gap-3">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}-{c.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {records.length} records
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          summaryCards.map((card) => (
            <Card key={card.label} className={`border ${card.border}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {card.pct}%
                    </p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.color}`}
                  >
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Daily attendance bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Daily Attendance (Last 7 Days)
          </CardTitle>
          <CardDescription>
            Present, absent, and late counts per day
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : dailyData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                No attendance data available for the selected period
              </p>
            </div>
          ) : (
            <ChartContainer
              config={attendanceChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="present"
                  fill="var(--color-present)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="absent"
                  fill="var(--color-absent)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="late"
                  fill="var(--color-late)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Academic Report ────────────────────────────────────────────────────────

interface SubjectAverage {
  subject: string;
  averageMarks: number;
  maxMarks: number;
  studentCount: number;
  highestGrade: string;
}

function AcademicReport() {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch("/api/grades");
        if (!res.ok) throw new Error("Failed to fetch grades");
        setGrades(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, []);

  const gradeDistribution = useMemo(() => {
    const order = ["A+", "A", "B+", "B", "C", "D"];
    const counts: Record<string, number> = {};
    for (const g of order) counts[g] = 0;
    for (const r of grades) {
      if (r.grade in counts) counts[r.grade]++;
    }
    return order.map((grade) => ({ grade, count: counts[grade] }));
  }, [grades]);

  const subjectAverages = useMemo((): SubjectAverage[] => {
    const subjectMap = new Map<
      string,
      { totalMarks: number; totalMax: number; count: number; grades: string[] }
    >();
    for (const r of grades) {
      const entry = subjectMap.get(r.subjectName) || {
        totalMarks: 0,
        totalMax: 0,
        count: 0,
        grades: [],
      };
      entry.totalMarks += r.marks;
      entry.totalMax += r.maxMarks;
      entry.count++;
      entry.grades.push(r.grade);
      subjectMap.set(r.subjectName, entry);
    }
    const gradeRank: Record<string, number> = {
      "A+": 6,
      A: 5,
      "B+": 4,
      B: 3,
      C: 2,
      D: 1,
    };
    return Array.from(subjectMap.entries())
      .map(([subject, data]) => ({
        subject,
        averageMarks: Math.round(data.totalMarks / data.count),
        maxMarks: Math.round(data.totalMax / data.count),
        studentCount: data.count,
        highestGrade:
          data.grades.sort(
            (a, b) => (gradeRank[b] ?? 0) - (gradeRank[a] ?? 0),
          )[0] || "N/A",
      }))
      .sort((a, b) => b.averageMarks - a.averageMarks);
  }, [grades]);

  const getPerformanceColor = (avg: number, max: number) => {
    const pct = (avg / max) * 100;
    if (pct >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPerformanceBadge = (avg: number, max: number) => {
    const pct = (avg / max) * 100;
    if (pct >= 80)
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
    if (pct >= 60)
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
  };

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
        <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
          <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load academic report</p>
          <p className="text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grade Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grade Distribution</CardTitle>
          <CardDescription>
            Number of students by grade across all subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : grades.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No grade data available</p>
            </div>
          ) : (
            <ChartContainer
              config={gradeChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="grade"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={52}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Subject-wise Average Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Subject-wise Average Performance
          </CardTitle>
          <CardDescription>
            Average marks, student count, and highest grade per subject
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={6} />
          ) : subjectAverages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No subject data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">
                      Students
                    </TableHead>
                    <TableHead className="text-center">Avg. Marks</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">
                      Max Marks
                    </TableHead>
                    <TableHead className="text-center">Highest Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectAverages.map((row) => (
                    <TableRow key={row.subject}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                            <GraduationCap className="h-3.5 w-3.5" />
                          </div>
                          {row.subject}
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        {row.studentCount}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-semibold ${getPerformanceColor(row.averageMarks, row.maxMarks)}`}
                        >
                          {row.averageMarks}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {" "}
                          / {row.maxMarks}
                        </span>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        {row.maxMarks}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`font-medium ${getPerformanceBadge(row.averageMarks, row.maxMarks)}`}
                        >
                          {row.highestGrade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Fee Report ─────────────────────────────────────────────────────────────

interface FeeSummary {
  totalFees: number;
  collected: number;
  pending: number;
}

interface FeeTypeBreakdown {
  type: string;
  collected: number;
  pending: number;
}

function FeeReport() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFees() {
      try {
        const res = await fetch("/api/fees");
        if (!res.ok) throw new Error("Failed to fetch fees");
        setFees(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchFees();
  }, []);

  const summary: FeeSummary = useMemo(() => {
    let total = 0;
    let collected = 0;
    for (const f of fees) {
      total += f.amount;
      collected += f.paidAmount;
    }
    return { totalFees: total, collected, pending: total - collected };
  }, [fees]);

  const typeBreakdown: FeeTypeBreakdown[] = useMemo(() => {
    const typeMap = new Map<string, { collected: number; pending: number }>();
    for (const f of fees) {
      const entry = typeMap.get(f.type) || { collected: 0, pending: 0 };
      entry.collected += f.paidAmount;
      entry.pending += f.amount - f.paidAmount;
      typeMap.set(f.type, entry);
    }
    return Array.from(typeMap.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.collected + b.pending - (a.collected + a.pending));
  }, [fees]);

  const overdueStudents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return fees
      .filter((f) => f.status !== "paid" && f.dueDate < today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [fees]);

  const collectionPct =
    summary.totalFees > 0
      ? ((summary.collected / summary.totalFees) * 100).toFixed(1)
      : "0";

  const summaryCards = [
    {
      label: "Total Fees",
      value: `$${summary.totalFees.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5 text-violet-600" />,
      color:
        "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
      border: "border-violet-200 dark:border-violet-800",
      sub: `${fees.length} records`,
    },
    {
      label: "Collected",
      value: `$${summary.collected.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
      color:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      sub: `${collectionPct}% collection rate`,
    },
    {
      label: "Pending",
      value: `$${summary.pending.toLocaleString()}`,
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      color:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      sub: `${overdueStudents.length} overdue`,
    },
  ];

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
        <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
          <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load fee report</p>
          <p className="text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          summaryCards.map((card) => (
            <Card key={card.label} className={`border ${card.border}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {card.sub}
                    </p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.color}`}
                  >
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Fee by Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fee Breakdown by Type</CardTitle>
          <CardDescription>
            Collected vs pending amounts grouped by fee type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : typeBreakdown.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No fee data available</p>
            </div>
          ) : (
            <ChartContainer
              config={feeBreakdownConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={typeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="type"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: string) =>
                    v.charAt(0).toUpperCase() + v.slice(1)
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="collected"
                  fill="var(--color-collected)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="pending"
                  fill="var(--color-pending)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Overdue Students */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Overdue Payments
          </CardTitle>
          <CardDescription>
            Students with fees past their due date
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : overdueStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No overdue payments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Fee Type
                    </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Paid
                    </TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Due Date
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueStudents.map((fee) => {
                    const balance = fee.amount - fee.paidAmount;
                    const isOverdue =
                      fee.dueDate < new Date().toISOString().split("T")[0];

                    return (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-semibold">
                              {fee.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            {fee.studentName}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell capitalize">
                          {fee.type}
                        </TableCell>
                        <TableCell className="text-right">
                          ${fee.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          ${fee.paidAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">
                          ${balance.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {new Date(fee.dueDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {isOverdue ? (
                            <Badge
                              variant="outline"
                              className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                            >
                              Overdue
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            >
                              {fee.status}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────

export function AdminReports() {
  const { canCreate, canEdit, canDelete } = useModulePermissions("reports");
  return (
    <div className="space-y-6">
      {/* Read-only banner */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-3 py-2">
          <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            Read-only mode — you have view permission only for this module.
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">
            View attendance, academic, and financial reports
          </p>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="attendance" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="academic" className="gap-1.5">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Academic</span>
          </TabsTrigger>
          <TabsTrigger value="fee" className="gap-1.5">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Fee</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceReport />
        </TabsContent>
        <TabsContent value="academic" className="mt-6">
          <AcademicReport />
        </TabsContent>
        <TabsContent value="fee" className="mt-6">
          <FeeReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
