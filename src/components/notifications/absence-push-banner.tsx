"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, CheckCircle2, Clock3, PlusCircle, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AbsenceNoticeItem {
  id: string;
  title: string;
  body: string;
  data: Record<string, any>;
}

interface AbsencePushBannerProps {
  notices: AbsenceNoticeItem[];
  onDismissNotice: (id: string) => void;
  onDismissAll: () => void;
  onApplyLeave: (data: Record<string, any>, id: string) => void;
  onViewAttendance: (data: Record<string, any>, id: string) => void;
}

const AUTO_DISMISS_MS = 10000;
const CIRCLE_SIZE = 28;
const STROKE_WIDTH = 2.2;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function AbsencePushCard({
  notice,
  index,
  total,
  onDismiss,
  onApplyLeave,
  onViewAttendance,
}: {
  notice: AbsenceNoticeItem;
  index: number;
  total: number;
  onDismiss: () => void;
  onApplyLeave: () => void;
  onViewAttendance: () => void;
}) {
  const { title, body, data } = notice;

  const studentName =
    data?.studentName ||
    (title ? (title.includes(" is absent") ? title.split(" is absent")[0] : title) : "Your Child");
  const periodText = data?.periodText || "Period 1";
  const className = data?.className || "";
  const teacherName = data?.teacherName || "Class Teacher";
  const avatar = data?.avatar || null;

  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [ringDrained, setRingDrained] = useState(false);
  const [leaveDone, setLeaveDone] = useState(false);
  const [attendanceDone, setAttendanceDone] = useState(false);

  // Callbacks change identity on every parent render; keep the timers stable.
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => dismissRef.current(), 180);
  }, []);

  useEffect(() => {
    const delay = index * 70;
    const enterTimer = setTimeout(() => setEntered(true), delay + 20);
    const ringTimer = setTimeout(() => setRingDrained(true), delay + 40);
    const autoTimer = setTimeout(() => dismiss(), delay + AUTO_DISMISS_MS);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(ringTimer);
      clearTimeout(autoTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        "w-full transition-all duration-200 ease-out",
        entered && !leaving ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
      )}
    >
      <div className="rounded-3xl border border-border bg-card p-4 shadow-xl dark:shadow-black/50">
        {/* Header: child badge / alert label + countdown close */}
        <div className="mb-2 flex items-center justify-between">
          {total > 1 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/35 bg-brand/10 px-2.5 py-1 text-[11.5px] font-bold text-foreground">
              <Users className="size-3.5 text-brand" />
              Child {index + 1} of {total}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-foreground">
              <Bell className="size-3.5 text-brand" />
              Attendance Alert
            </span>
          )}

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={dismiss}
            className="relative flex size-7 items-center justify-center rounded-full text-foreground cursor-pointer"
          >
            <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} className="absolute inset-0">
              <circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                className="fill-card stroke-border"
                strokeWidth={STROKE_WIDTH}
              />
              <circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                fill="transparent"
                className="stroke-brand"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={ringDrained ? CIRCUMFERENCE : 0}
                transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
                style={{ transition: `stroke-dashoffset ${AUTO_DISMISS_MS}ms linear` }}
              />
            </svg>
            <X className="relative size-3" />
          </button>
        </div>

        {/* Class · teacher + time */}
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="truncate text-[12.5px] font-semibold text-muted-foreground">
            {className || "Class"} · {teacherName}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-muted-foreground">
            <Clock3 className="size-3" /> now
          </span>
        </div>

        {/* Student row */}
        <div className="mb-3.5 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-secondary">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={studentName} className="size-full object-cover" />
            ) : (
              <span className="text-base font-bold text-foreground">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-bold text-foreground">{studentName}</div>
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground">
              <span className="size-1.5 shrink-0 rounded-full bg-destructive" />
              Not in school today ({periodText})
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => {
              setLeaveDone(true);
              onApplyLeave();
            }}
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 text-[13px] font-semibold transition-colors cursor-pointer",
              leaveDone
                ? "border-green-600 bg-green-600 text-white"
                : "border-border bg-secondary text-foreground hover:bg-muted"
            )}
          >
            {leaveDone ? <CheckCircle2 className="size-4" /> : <PlusCircle className="size-4" />}
            {leaveDone ? "Leave sent" : "Apply Leave"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAttendanceDone(true);
              onViewAttendance();
            }}
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold text-white transition-colors cursor-pointer",
              attendanceDone ? "bg-green-600" : "bg-brand hover:bg-brand/90"
            )}
          >
            {attendanceDone ? <CheckCircle2 className="size-4 shrink-0" /> : <CalendarDays className="size-4 shrink-0" />}
            <span className="truncate">{attendanceDone ? "Opening…" : "View Attendance"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function AbsencePushBanner({
  notices,
  onDismissNotice,
  onDismissAll,
  onApplyLeave,
  onViewAttendance,
}: AbsencePushBannerProps) {
  const [backdropIn, setBackdropIn] = useState(false);

  useEffect(() => {
    if (notices.length > 0) {
      const raf = requestAnimationFrame(() => setBackdropIn(true));
      return () => cancelAnimationFrame(raf);
    }
    setBackdropIn(false);
  }, [notices.length]);

  useEffect(() => {
    if (notices.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismissAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notices.length, onDismissAll]);

  if (notices.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Dismiss all notifications"
        onClick={onDismissAll}
        className={cn(
          "absolute inset-0 w-full bg-background/75 backdrop-blur-sm transition-opacity duration-200 cursor-default",
          backdropIn ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-y-auto pt-16 pb-10 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]">
        <div className="pointer-events-auto flex w-full max-w-md flex-col gap-3 px-4">
          {notices.map((item, idx) => (
            <AbsencePushCard
              key={item.id}
              notice={item}
              index={idx}
              total={notices.length}
              onDismiss={() => onDismissNotice(item.id)}
              onApplyLeave={() => onApplyLeave(item.data, item.id)}
              onViewAttendance={() => onViewAttendance(item.data, item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
