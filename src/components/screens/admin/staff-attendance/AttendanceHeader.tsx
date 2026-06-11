"use client";

import { GraduationCap, Briefcase } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO } from "date-fns";

interface AttendanceHeaderProps {
  activeTab: string;
  selectedDate: string;
  onDateChange: (dateStr: string) => void;
}

export function AttendanceHeader({
  activeTab,
  selectedDate,
  onDateChange,
}: AttendanceHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          {activeTab === "teacher" ? (
            <GraduationCap className="size-7 text-emerald-600" />
          ) : (
            <Briefcase className="size-7 text-blue-600" />
          )}
          {activeTab === "teacher"
            ? "Teacher Attendance"
            : "Admin Staff Attendance"}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          {activeTab === "teacher"
            ? "Manage daily attendance logs for all teachers."
            : "Manage daily attendance logs for admin staff members."}
        </p>
      </div>
      <div className="flex items-center gap-3">
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
          className="rounded-xl dark:[color-scheme:dark] w-fit bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        />
      </div>
    </div>
  );
}
