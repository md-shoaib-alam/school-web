"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { useParentDashboard } from "@/lib/graphql/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, TrendingUp } from "lucide-react";
import type { StudentInfo, GradeRecord } from "@/lib/types";

// Sub-components
import { GradesSummary } from "./grades/GradesSummary";
import { PerformanceChart } from "./grades/PerformanceChart";
import { GradesTable } from "./grades/GradesTable";
import { GradesSkeleton } from "./grades/GradesSkeleton";

// Utils
import { getGradesForStudent, getSubjectChartData, getOverallStats } from "./grades/utils";

export function ParentGrades() {
  const { currentUser } = useAppStore();
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [activeTab, setActiveTab] = useState("");

  const { data, isPending } = useParentDashboard(currentUser?.name || "");
  const students = (data?.children || []) as StudentInfo[];

  useEffect(() => {
    if (students.length > 0 && !activeTab) {
      setActiveTab(students[0].id);
    }
  }, [students, activeTab]);

  useEffect(() => {
    async function fetchGrades() {
      if (students.length === 0) return;
      try {
        const res = await apiFetch("/api/grades");
        const raw = await res.json();
        setGrades(Array.isArray(raw) ? raw : (raw.items || []));
      } catch (e) {
        console.error("Failed to fetch grades", e);
      }
    }
    fetchGrades();
  }, [students.length]);

  if (isPending) return <GradesSkeleton />;

  if (students.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">No data available</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
          Children&apos;s Grades
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
          const studentGrades = getGradesForStudent(student.id, grades);
          const chartData = getSubjectChartData(student.id, grades);
          const stats = getOverallStats(student.id, grades);

          return (
            <TabsContent
              key={student.id}
              value={student.id}
              className="space-y-6 mt-6 animate-in fade-in duration-300"
            >
              <GradesSummary 
                avg={stats.avg}
                grade={stats.grade}
                highestSubject={stats.highest.subject}
                highestPct={stats.highest.pct}
                totalExams={stats.totalExams}
              />

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <PerformanceChart data={chartData} />
                </div>
                <div className="lg:col-span-3">
                  <GradesTable studentName={student.name} grades={studentGrades} />
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
