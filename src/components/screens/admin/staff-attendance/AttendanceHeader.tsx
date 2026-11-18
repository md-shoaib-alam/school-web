"use client";

import { GraduationCap, Briefcase } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO } from "date-fns";

interface AttendanceHeaderProps {
  activeTab: string;
  selectedDate: string;
  onDateChange: (dateStr: string) => void;
  onOpenQR?: () => void;
}

export function AttendanceHeader({
  activeTab,
  selectedDate,
  onDateChange,
  onOpenQR,
}: AttendanceHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center justify-center md:justify-start gap-2">
          {activeTab === "teacher" ? (
            <GraduationCap className="size-6 sm:size-7 text-emerald-600" />
          ) : (
            <Briefcase className="size-6 sm:size-7 text-emerald-600" />
          )}
          {activeTab === "teacher"
            ? "Teacher Attendance"
            : "Staff Attendance"}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm hidden sm:block">
          {activeTab === "teacher"
            ? "Manage daily attendance logs for all teachers."
            : "Manage daily attendance logs for staff members."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
        {onOpenQR && (
          <button
            type="button"
            onClick={onOpenQR}
            className="w-full sm:w-auto rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 h-10 shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">Live QR Attendance</span>
          </button>
        )}

        <DatePicker
          date={selectedDate ? parseISO(selectedDate) : undefined}
          onChange={(d) => {
            if (d) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              const dd = String(d.getDate()).padStart(2, "0");
              onDateChange(`${yyyy}-${mm}-${dd}`);
            }
          }}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date > today;
          }}
          align="end"
          className="w-full sm:w-[165px] rounded-xl dark:[color-scheme:dark] bg-card hover:bg-accent"
        />
      </div>
    </div>
  );
}
