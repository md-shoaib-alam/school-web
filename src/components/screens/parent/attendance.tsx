"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { useParentDashboard } from "@/lib/graphql/hooks";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserCheck } from "lucide-react";
import type { StudentInfo, AttendanceRecord } from "@/lib/types";

// Sub-components
import { AttendanceStats } from "./attendance/AttendanceStats";
import { AttendanceChart } from "./attendance/AttendanceChart";
import { AttendanceCalendar } from "./attendance/AttendanceCalendar";
import { AttendanceSkeleton } from "./attendance/AttendanceSkeleton";

// Utils
import { getAttendanceStats, getMonthlyData, getCalendarData } from "./attendance/utils";

export function ParentAttendance() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState("");

  const [calendarOffset, setCalendarOffset] = useState(0);

  const { data, isPending, refetch } = useParentDashboard(currentUser?.name || "");
  const students = (data?.children || []) as unknown as StudentInfo[];
  const isPremium = data?.subscriptionPlan?.toLowerCase() === 'premium';

  useEffect(() => {
    if (students.length > 0 && !activeTab) {
      setActiveTab(students[0].id);
    }
  }, [students, activeTab]);

  if (isPending) return <AttendanceSkeleton />;

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
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
            Attendance Overview
          </h2>
        </div>
        <button 
          onClick={() => refetch()}
          className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all"
        >
          Refresh Data
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setCalendarOffset(0); }}>
        <TabsList className="bg-amber-50 dark:bg-amber-900/30 p-1">
          {students.map((student: any) => (
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

        {students.map((student: any) => {
          const currentAttendance = student.attendance || [];
          const currentStats = getAttendanceStats(currentAttendance);
          const currentMonthly = getMonthlyData(currentAttendance);
          
          // Calculate calendar window (Full Month)
          const baseDate = new Date();
          baseDate.setMonth(baseDate.getMonth() - calendarOffset);
          const currentCalendar = getCalendarData(currentAttendance, baseDate);

          const periodLabel = baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

          return (
            <TabsContent
              key={student.id}
              value={student.id}
              className="space-y-6 mt-6 animate-in fade-in duration-300"
            >
              <AttendanceStats 
                percentage={currentStats.percentage}
                present={currentStats.present}
                absent={currentStats.absent}
                late={currentStats.late}
              />

              <AttendanceCalendar 
                data={currentCalendar} 
                isPremium={isPremium}
                currentPeriod={periodLabel}
                onPrev={() => isPremium && setCalendarOffset(prev => prev + 1)}
                onNext={() => isPremium && setCalendarOffset(prev => Math.max(0, prev - 1))}
              />
              
              <AttendanceChart 
                data={currentMonthly} 
                isPremium={isPremium} 
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
