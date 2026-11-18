import { useState, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useParentDashboard } from "@/lib/graphql/hooks";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { UserCheck } from "lucide-react";

// Sub-components
import { AttendanceStats } from "./attendance/AttendanceStats";
import { AttendanceChart } from "./attendance/AttendanceChart";
import { AttendanceCalendar } from "./attendance/AttendanceCalendar";
import { TodayAttendanceCard } from "./attendance/TodayAttendanceCard";
import { AttendanceSkeleton } from "./attendance/AttendanceSkeleton";
import { AbsencePushPreviewModal } from "@/temp/absence-push-preview-modal";
import { ChildSelector } from "./ChildSelector";

// Utils
import { getAttendanceStats, getMonthlyData, getCalendarData } from "./attendance/utils";

export function ParentAttendance() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState("");
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

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

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setCalendarOffset(0);
    setSelectedDate(new Date());
    document.cookie = `lastSelectedStudent=${val}; path=/; max-age=31536000`;
  };

  const handlePrevMonth = () => {
    if (isPremium) {
      setCalendarOffset((prev) => prev + 1);
    }
  };

  const handleNextMonth = () => {
    if (isPremium) {
      setCalendarOffset((prev) => Math.max(0, prev - 1));
    }
  };

  const handleGoToday = () => {
    setCalendarOffset(0);
    setSelectedDate(new Date());
  };

  if (isPending) return <AttendanceSkeleton />;

  if (students.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardContent className="p-16 text-center">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mx-auto text-foreground">
            <UserCheck className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mt-6">
            No children found
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            No students are currently linked to your parental account.
          </p>
        </CardContent>
      </Card>
    );
  }

  const effectiveActiveTab = activeTab || (typeof document !== "undefined" ? document.cookie
    .split("; ")
    .find((row) => row.startsWith("lastSelectedStudent="))
    ?.split("=")[1] : "") || students[0]?.id || "";

  const selectedStudent = students.find((s) => s.id === effectiveActiveTab) || students[0];
  const currentAttendance = selectedStudent?.attendance || [];
  const currentStats = getAttendanceStats(currentAttendance);
  const currentMonthly = getMonthlyData(currentAttendance);
  const currentCalendar = getCalendarData(currentAttendance, baseDate);

  return (
    <div className="space-y-6 pb-10 animate-fade-in select-none">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-3.5 text-left">
          <div className="flex items-center gap-2">
            <UserCheck className="size-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-foreground uppercase tracking-tight">
              Attendance Overview
            </h2>
          </div>
          {/* Children Switcher Dropdown */}
          <ChildSelector 
            students={students} 
            selectedStudentId={effectiveActiveTab} 
            onSelect={handleTabChange} 
          />
        </div>
        
        <div className="flex items-center gap-3">
          <AbsencePushPreviewModal
            studentName={selectedStudent.name}
            className={selectedStudent.className}
            teacherName={selectedStudent.teacherName}
            teacherPhone={selectedStudent.teacherPhone}
          />
          <button 
            type="button"
            onClick={() => refetch()}
            className="text-xs font-medium text-foreground bg-card border border-border hover:bg-muted px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="space-y-6 mt-6 animate-in fade-in duration-300" suppressHydrationWarning>
        {/* Tablet / Desktop 2-column layout: Calendar on left (7 cols), Stats & Cards on right (5 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Calendar Card */}
          <div className="order-2 md:order-1 md:col-span-7 xl:col-span-7 flex flex-col">
            <AttendanceCalendar 
              records={currentAttendance}
              data={currentCalendar} 
              isPremium={isPremium}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              viewDate={baseDate}
              currentPeriod={periodLabel}
              canGoNext={calendarOffset > 0}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
              onGoToday={handleGoToday}
              studentName={selectedStudent.name}
              className={selectedStudent.className}
            />
          </div>

          {/* Right Column: Stats Boxes + Selected Day Attendance Card + Monthly Trend Chart adjusted in that gap */}
          <div className="order-1 md:order-2 md:col-span-5 xl:col-span-5 flex flex-col gap-3.5 sm:gap-4 h-full">
            <AttendanceStats 
              percentage={currentStats.percentage}
              present={currentStats.present}
              absent={currentStats.absent}
            />

            <TodayAttendanceCard 
              records={currentAttendance} 
              selectedDate={selectedDate}
              studentName={selectedStudent.name}
              className={selectedStudent.className}
              teacherName={selectedStudent.teacherName}
              teacherPhone={selectedStudent.teacherPhone}
              avatar={selectedStudent.avatar}
            />

            <AttendanceChart 
              data={currentMonthly} 
              isPremium={isPremium} 
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
