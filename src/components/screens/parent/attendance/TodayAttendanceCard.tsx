"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AttendanceRecord } from "@/types";
import { toast } from "sonner";
import { Phone, CalendarPlus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay, isWeekend, isFuture } from "date-fns";

interface TodayAttendanceCardProps {
  records: AttendanceRecord[];
  selectedDate?: Date;
  studentName?: string;
  className?: string;
  teacherName?: string | null;
  teacherPhone?: string | null;
  avatar?: string | null;
  onApplyLeave?: () => void;
}

export function TodayAttendanceCard({
  records = [],
  selectedDate,
  studentName = "Student",
  className,
  teacherName,
  teacherPhone,
  avatar,
  onApplyLeave,
}: TodayAttendanceCardProps) {
  const [leaveApplied, setLeaveApplied] = useState(false);
  const [calling, setCalling] = useState(false);

  const dateToUse = selectedDate || new Date();
  const dateStr = format(dateToUse, "yyyy-MM-dd");
  const isToday = isSameDay(dateToUse, new Date());
  const isWeekendDay = isWeekend(dateToUse);
  const isFutureDay = isFuture(dateToUse);

  const record = records.find((r) => r.date && r.date.startsWith(dateStr));
  const isAbsent = record?.status?.toLowerCase() === "absent";

  // If marked absent TODAY, render the special rich absent card
  if (isToday && isAbsent) {
    const formattedTime = record?.createdAt
      ? new Date(record.createdAt).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "Today";

    const periodText = record?.remarks
      ? record.remarks.toLowerCase().includes("period")
        ? `Marked absent from ${record.remarks}`
        : `Marked absent · ${record.remarks}`
      : "Marked absent from Period 1";

    const initials = (studentName || "Student")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div className="w-full select-none">
        <p className="text-[13px] text-muted-foreground font-medium mb-3 ml-1.5">Absent today</p>
        <div className="relative pb-11 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Under card with lime gradient */}
          <div
            className="absolute inset-x-3.5 bottom-0 h-24 rounded-[28px] sm:rounded-[30px] flex items-end justify-center pb-3 text-[#0d1a05] text-xs sm:text-sm font-semibold gap-2 shadow-[0_18px_40px_-12px_rgba(124,240,58,0.45)]"
            style={{
              background: "linear-gradient(180deg, #7cf03a 0%, #a4f55f 100%)",
            }}
          >
            <Clock className="size-4 stroke-[1.8]" />
            <span>{periodText}</span>
          </div>

          {/* Top card with radial dark background */}
          <div
            className="relative rounded-[28px] sm:rounded-[30px] p-4 sm:p-5 text-[#f2f2f2] shadow-[0_22px_44px_-14px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.04)]"
            style={{
              background: "radial-gradient(120% 120% at 80% 0%, #2a2a2a, #151515 60%)",
            }}
          >
            {/* Top row */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-[#8a8a8a]">
              <span className="flex items-center gap-1.5 font-medium truncate pr-2">
                {className ? `Class ${className}` : "Class"}
                {teacherName ? ` · ${teacherName}` : ""}
              </span>
              <span className="flex items-center gap-1.5 shrink-0 text-xs sm:text-sm">
                <Clock className="size-3.5 sm:size-4 stroke-[1.8]" />
                {formattedTime}
              </span>
            </div>

            {/* Middle: Avatar + Student info */}
            <div className="flex items-center gap-3 sm:gap-3.5 my-3.5 sm:my-4.5">
              <div
                className="size-12 sm:size-[62px] rounded-full flex items-center justify-center font-semibold text-lg sm:text-[22px] text-[#4a3720] border-[3px] border-[#e8e8e8] shadow-[0_4px_12px_rgba(0,0,0,0.35)] shrink-0 overflow-hidden"
                style={{
                  background: avatar ? "transparent" : "linear-gradient(145deg, #f3e3c8, #d9b98a)",
                }}
              >
                {avatar ? (
                  <img src={avatar} alt={studentName} className="size-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-[22px] font-semibold tracking-tight text-[#f2f2f2] truncate">
                  {studentName}
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-[15px] text-[#9a9a9a] mt-0.5">
                  <span className="size-2 rounded-full bg-[#ff5a4d] shadow-[0_0_8px_#ff5a4d] shrink-0" />
                  <span>Not in school today</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setLeaveApplied(true);
                  onApplyLeave?.();
                  toast.success(`Leave request submitted for ${studentName}`);
                }}
                className={cn(
                  "h-11 sm:h-12 px-2 text-xs sm:text-[15px] font-medium rounded-xl sm:rounded-[14px] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-200 active:scale-[0.97]",
                  leaveApplied
                    ? "bg-[#7cf03a] text-[#0d1a05] border border-[#7cf03a]"
                    : "text-[#f2f2f2] border border-[#3a3a3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] bg-gradient-to-b from-[#575757] to-[#434343] hover:from-[#606060] hover:to-[#4a4a4a]"
                )}
              >
                <CalendarPlus className="size-4 sm:size-4.5 stroke-[1.8] shrink-0" />
                <span>{leaveApplied ? "Leave sent" : "Apply Leave"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (teacherPhone) {
                    setCalling(true);
                    toast.info(`Calling ${teacherName || "Teacher"} (${teacherPhone})...`);
                    if (typeof window !== "undefined") {
                      window.location.href = `tel:${teacherPhone}`;
                    }
                  } else {
                    toast.error(
                      teacherName
                        ? `Contact number for ${teacherName} is not available.`
                        : "Teacher contact number is not available."
                    );
                  }
                }}
                className={cn(
                  "h-11 sm:h-12 px-2 text-xs sm:text-[15px] font-medium rounded-xl sm:rounded-[14px] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-200 active:scale-[0.97] border border-[#3a3a3a]",
                  calling
                    ? "bg-[#7cf03a] text-[#0d1a05] border-[#7cf03a]"
                    : "bg-[#2b2b2b] hover:bg-[#343434] text-[#f2f2f2]"
                )}
              >
                <Phone className="size-4 sm:size-4.5 stroke-[1.8] shrink-0" />
                <span>
                  {calling
                    ? teacherName
                      ? `Calling ${teacherName}`
                      : "Calling…"
                    : "Call Teacher"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate status info matching test-app
  const getStatusInfo = () => {
    if (record) {
      const st = (record.status || "").toLowerCase();
      if (st === "present") {
        return {
          titleStatus: "Present",
          tagLabel: "Present",
          dotColor: "bg-[#3F9A6B]",
          tagColor: "text-[#2E7D52] dark:text-[#3F9A6B] bg-[#3F9A6B]/15 dark:bg-[#3F9A6B]/20 border-[#3F9A6B]/30 dark:border-[#3F9A6B]/40",
          remarks: record.remarks,
        };
      }
      if (st === "absent") {
        return {
          titleStatus: "Absent",
          tagLabel: "Absent",
          dotColor: "bg-[#D0666F]",
          tagColor: "text-[#B83842] dark:text-[#D0666F] bg-[#D0666F]/15 dark:bg-[#D0666F]/20 border-[#D0666F]/30 dark:border-[#D0666F]/40",
          remarks: record.remarks,
        };
      }
    }

    if (isFutureDay && !record) {
      return {
        titleStatus: "Upcoming",
        tagLabel: "Upcoming",
        dotColor: "bg-[#A0A0A6] dark:bg-[#76767C]",
        tagColor: "text-[#55555A] dark:text-[#C9C9CE] bg-neutral-200/60 dark:bg-[#2A2A2E] border-neutral-300 dark:border-[#38383D]",
        remarks: null,
      };
    }

    if (isWeekendDay) {
      return {
        titleStatus: "Weekend",
        tagLabel: "Off",
        dotColor: "bg-[#A0A0A6] dark:bg-[#76767C]",
        tagColor: "text-[#55555A] dark:text-[#C9C9CE] bg-neutral-200/60 dark:bg-[#2A2A2E] border-neutral-300 dark:border-[#38383D]",
        remarks: null,
      };
    }

    return {
      titleStatus: "Not marked yet",
      tagLabel: "Not Marked",
      dotColor: "bg-[#A0A0A6] dark:bg-[#76767C]",
      tagColor: "text-[#55555A] dark:text-[#C9C9CE] bg-neutral-200/60 dark:bg-[#2A2A2E] border-neutral-300 dark:border-[#38383D]",
      remarks: null,
    };
  };

  const statusInfo = getStatusInfo();
  const dateHeading = format(dateToUse, "EEEE, MMM d");

  return (
    <Card className="rounded-2xl border border-border bg-card p-3 sm:p-3.5 shadow-xs transition-colors select-none">
      {/* Row: Status dot, Title, and Pill badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cn("size-2.5 rounded-full shrink-0", statusInfo.dotColor)} />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {isToday ? "Today's Attendance" : dateHeading}
            </span>
            {isToday && (
              <span className="text-[11px] sm:text-xs text-muted-foreground font-medium hidden sm:inline">
                ({format(dateToUse, "MMM d")})
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide shrink-0",
            statusInfo.tagColor
          )}
        >
          {statusInfo.tagLabel}
        </div>
      </div>

      {/* Remarks Note if present */}
      {statusInfo.remarks ? (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Note: </span>
          {statusInfo.remarks}
        </p>
      ) : null}
    </Card>
  );
}
