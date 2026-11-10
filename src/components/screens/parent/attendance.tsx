import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useParentDashboard } from "@/lib/graphql/hooks";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { UserCheck, ChevronDown } from "lucide-react";

// Sub-components
import { AttendanceStats } from "./attendance/AttendanceStats";
import { AttendanceChart } from "./attendance/AttendanceChart";
import { AttendanceCalendar } from "./attendance/AttendanceCalendar";
import { TodayAttendanceCard } from "./attendance/TodayAttendanceCard";
import { AttendanceSkeleton } from "./attendance/AttendanceSkeleton";
import { ChildSelector } from "./ChildSelector";

// Utils
import { getAttendanceStats, getMonthlyData, getCalendarData } from "./attendance/utils";

export function ParentAttendance() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState("");
  const [calendarOffset, setCalendarOffset] = useState(0);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - calendarOffset);
    return d;
  }, [calendarOffset]);

  const periodLabel = useMemo(() => {
    try {
      return baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (e) {
      return "";
    }
  }, [baseDate]);

  const { data, isPending, refetch } = useParentDashboard(currentUser?.name || "");
  const students = (data?.children || []) as any[];
  const isPremium = data?.subscriptionPlan?.toLowerCase().includes('premium');

  // Persistence logic
  useEffect(() => {
    if (students.length > 0) {
      const savedTab = document.cookie
        .split("; ")
        .find((row) => row.startsWith("lastSelectedStudent="))
        ?.split("=")[1];
      
      if (savedTab && students.some(s => s.id === savedTab)) {
        setActiveTab(savedTab);
      } else if (!activeTab) {
        setActiveTab(students[0].id);
      }
    }
  }, [students, activeTab]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setCalendarOffset(0);
    document.cookie = `lastSelectedStudent=${val}; path=/; max-age=31536000`;
  };

  if (isPending) return <AttendanceSkeleton />;

  if (students.length === 0) {
    return (
      <Card className="rounded-3xl border  bg-card shadow-sm">
        <CardContent className="p-16 text-center">
          <div className="size-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <UserCheck className="size-8" />
          </div>
          <h3 className="text-xl font-extrabold text-foreground mt-6">
            No children found
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            No students are currently linked to your parental account.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedStudent = students.find((s) => s.id === activeTab) || students[0];
  const currentAttendance = selectedStudent?.attendance || [];
  const currentStats = getAttendanceStats(currentAttendance);
  const currentMonthly = getMonthlyData(currentAttendance);
  const currentCalendar = getCalendarData(currentAttendance, baseDate);

  return (
    <div className="space-y-6 pb-10 animate-fade-in select-none">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b  pb-5">
        <div className="space-y-3.5 text-left">
          <div className="flex items-center gap-2">
            <UserCheck className="size-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-foreground uppercase tracking-tight">
              Attendance Overview
            </h2>
          </div>
          {/* Children Switcher Dropdown */}
          <ChildSelector 
            students={students} 
            selectedStudentId={selectedStudent.id} 
            onSelect={handleTabChange} 
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => refetch()}
            className="text-xs font-semibold text-foreground bg-muted hover:bg-muted px-3.5 py-2 rounded-xl transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="space-y-6 mt-6 animate-in fade-in duration-300" suppressHydrationWarning>
        <AttendanceStats 
          percentage={currentStats.percentage}
          present={currentStats.present}
          absent={currentStats.absent}
        />

        <TodayAttendanceCard records={currentAttendance} />

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
      </div>
    </div>
  );
}
