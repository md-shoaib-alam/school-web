"use client";

import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Loader2, Send } from "lucide-react";
import type { AssignmentInfo } from "@/lib/types";

export type AssignmentStatus = "active" | "submitted" | "overdue" | "graded";

export interface EnrichedAssignment extends AssignmentInfo {
  status: AssignmentStatus;
  countdown: string;
  daysLeft: number;
  submitted: boolean;
  submissionId: string | null;
  grade: string | null;
  feedback: string | null;
}

interface DailyDiaryPlannerProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  homeworkDays: Date[];
  selectedDateAssignments: EnrichedAssignment[];
  dueSelectedDateAssignments: EnrichedAssignment[];
  getStatusBadge: (status: AssignmentStatus) => React.ReactNode;
  getProgressValue: (status: AssignmentStatus) => number;
  getProgressColor: (status: AssignmentStatus) => string;
  onSubmit?: (assignment: EnrichedAssignment) => void;
  submittingId?: string | null;
  emptyMessage?: string;
}

export function DailyDiaryPlanner({
  selectedDate,
  setSelectedDate,
  homeworkDays,
  selectedDateAssignments,
  dueSelectedDateAssignments,
  getStatusBadge,
  getProgressValue,
  getProgressColor,
  onSubmit,
  submittingId = null,
  emptyMessage = "No homework or assignments were given or due on this date.",
}: DailyDiaryPlannerProps) {
  return (
    <div className="relative p-2 md:p-4 bg-gradient-to-br from-[#4a3622] via-[#2c2014] to-[#1a130c] dark:from-zinc-950 dark:to-stone-900 rounded-[28px] shadow-2xl border-4 border-[#3a2a1b] dark:border-zinc-800/80 mt-2">
      {/* Outer book cover leather shine overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-white/5 to-black/45 rounded-[24px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative bg-[#f7f5f0] dark:bg-[#1a1917] rounded-2xl overflow-hidden shadow-inner border border-amber-900/10 dark:border-zinc-800">
        
        {/* LEFT PAGE: Calendar Agenda (Warm Ivory Graph/Grid Paper) */}
        <div className="p-4 md:p-6 lg:col-span-4 lg:border-r border-amber-900/15 dark:border-[#2f271f] relative bg-[#FAF8F4] dark:bg-[#1a1917] shadow-[inset_-10px_0_15px_-5px_rgba(0,0,0,0.06)] min-h-fit lg:min-h-[580px] pb-6 lg:pb-4">
          {/* Bullet/Grid paper background for Left Page */}
          <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.12] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #5c4e37 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />

          {/* Page binder holes on right side of left page */}
          <div className="absolute right-0.5 top-0 bottom-0 w-4 flex flex-col justify-around items-center py-8 pointer-events-none hidden lg:flex">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="size-2 rounded-full bg-stone-950 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)] border border-stone-800/20" />
            ))}
          </div>

          <div className="space-y-4 pr-0 lg:pr-6 relative z-10">
            <div className="flex items-center justify-between border-b border-amber-900/15 dark:border-[#2f271f] pb-2">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest">Monthly Planner</span>
              <span className="text-[10px] bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
                {homeworkDays.length} active
              </span>
            </div>

            <div className="flex justify-center bg-white/70 dark:bg-stone-900/40 rounded-xl p-2 border border-amber-900/10 dark:border-[#2f271f] shadow-inner">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0 bg-transparent w-full dark:text-stone-300"
                modifiers={{ hasHomework: homeworkDays }}
                modifiersClassNames={{
                  hasHomework: "relative after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:size-1.5 after:bg-amber-700 dark:after:bg-amber-500 after:rounded-full font-bold text-amber-900 dark:text-amber-400"
                }}
              />
            </div>
          </div>
        </div>

        {/* BRASS/GOLD SPIRAL BINDER RINGS (Only visible on desktop, positioned at 1/3 divide) */}
        <div className="absolute left-[33.33%] top-0 bottom-0 w-8 -translate-x-1/2 flex flex-col justify-around items-center py-6 z-30 pointer-events-none hidden lg:flex">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="relative w-full h-8 flex items-center justify-center">
              {/* Ring drop shadow on the paper */}
              <div 
                className="absolute w-9 h-4 bg-stone-950/25 dark:bg-black/60 rounded-full blur-[1px] translate-y-[3px] -rotate-[12deg]" 
              />
              {/* Gold ring loop curved from left page to right page */}
              <div 
                className="absolute w-9 h-4 border-[2.5px] border-amber-600/90 dark:border-amber-500/80 bg-gradient-to-b from-amber-100 via-amber-300 to-amber-700 dark:from-amber-200 dark:via-amber-400 dark:to-amber-800 rounded-full" 
                style={{ transform: 'rotate(-12deg)' }} 
              />
            </div>
          ))}
        </div>

        {/* RIGHT PAGE: Diary Entries (Lined Ivory Paper) */}
        <div className="p-4 md:p-6 lg:col-span-8 relative bg-[#FCFAF6] dark:bg-[#171614] border-t lg:border-t-0 border-amber-900/10 dark:border-[#2f271f] min-h-[400px] lg:min-h-[580px] shadow-[inset_20px_0_25px_-10px_rgba(0,0,0,0.15)]">
          
          {/* Subtle notebook lines background (adjusted for dark mode visibility) */}
          <div className="absolute inset-0 bg-linear-gradient-[#dedad0] dark:bg-linear-gradient-[#38332a] opacity-25 dark:opacity-35 pointer-events-none" style={{ backgroundImage: 'linear-gradient(transparent, transparent 31px, currentColor 31px, currentColor 32px)', backgroundSize: '100% 32px' }} />

          {/* Page binder holes on left side of right page */}
          <div className="absolute left-0.5 top-0 bottom-0 w-4 flex flex-col justify-around items-center py-8 pointer-events-none hidden lg:flex">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="size-2 rounded-full bg-stone-950 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)] border border-stone-800/20" />
            ))}
          </div>

          {/* Lined Notebook Red Margin Line */}
          <div className="absolute left-6 md:left-10 top-0 bottom-0 w-[1.5px] bg-red-500/40 dark:bg-red-800/40" />

          <div className="pl-6 md:pl-12 relative z-10">
            {/* Header: Exactly h-16 (64px, 2 background lines of 32px) */}
            <div className="h-16 border-b border-amber-900/10 dark:border-[#2f271f] flex items-center justify-between gap-4 pb-0 mb-0">
              <div className="text-left flex flex-col justify-center h-full">
                <h3 className="text-base font-bold tracking-tight text-amber-950 dark:text-stone-100 leading-none">
                  {selectedDate?.toLocaleDateString(undefined, { weekday: 'long' })}
                </h3>
                <p className="text-[10px] text-amber-800 dark:text-amber-500 font-bold uppercase tracking-wider mt-1 leading-none">
                  {selectedDate?.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-100/40 dark:bg-stone-900/80 px-2.5 py-1 rounded-lg border border-amber-900/15 dark:border-[#2f271f] shadow-xs">
                <CalendarDays className="size-3.5 text-amber-800 dark:text-amber-500" />
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-400">
                  {selectedDateAssignments.length + dueSelectedDateAssignments.length} Entries
                </span>
              </div>
            </div>

            <ScrollArea className="max-h-[512px] pr-2">
              {selectedDateAssignments.length === 0 && dueSelectedDateAssignments.length === 0 ? (
                <div className="text-center py-20 text-stone-400 dark:text-stone-500 border border-dashed border-amber-900/15 dark:border-[#2f271f] rounded-xl bg-amber-50/10 dark:bg-stone-900/5">
                  <CalendarDays className="size-10 mx-auto mb-3 opacity-30 text-amber-700 dark:text-amber-500" />
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-200">Empty Diary Entry</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 px-6 leading-relaxed">
                    {emptyMessage}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col pt-0">
                  {selectedDateAssignments.length > 0 && (
                    <div className="text-left flex flex-col">
                      {/* Section Header: Exactly h-8 (32px, 1 line) with items-end pb-1.5 to align text baseline with the ruled line */}
                      <h4 className="h-8 flex items-end pb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-900 dark:text-amber-500 gap-1.5">
                        <span className="size-1.5 rounded-full bg-amber-700 mb-1" />
                        Assigned Today
                      </h4>
                      <div className="flex flex-col">
                        {selectedDateAssignments.map((a) => (
                          <DiaryTaskCard
                            key={a.id}
                            a={a}
                            getStatusBadge={getStatusBadge}
                            getProgressValue={getProgressValue}
                            getProgressColor={getProgressColor}
                            onSubmit={onSubmit}
                            submittingId={submittingId}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDateAssignments.length > 0 && dueSelectedDateAssignments.length > 0 && (
                    /* Spacer Line: Exactly h-8 (32px, 1 blank ruled line) */
                    <div className="h-8" />
                  )}

                  {dueSelectedDateAssignments.length > 0 && (
                    <div className="text-left flex flex-col">
                      {/* Section Header: Exactly h-8 (32px, 1 line) */}
                      <h4 className="h-8 flex items-end pb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-rose-900 dark:text-rose-400 gap-1.5">
                        <span className="size-1.5 rounded-full bg-rose-600 mb-1" />
                        Due Today
                      </h4>
                      <div className="flex flex-col">
                        {dueSelectedDateAssignments.map((a) => (
                          <DiaryTaskCard
                            key={a.id}
                            a={a}
                            getStatusBadge={getStatusBadge}
                            getProgressValue={getProgressValue}
                            getProgressColor={getProgressColor}
                            onSubmit={onSubmit}
                            submittingId={submittingId}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Helper Card for Daily Diary Tasks ─── */
interface DiaryTaskCardProps {
  a: EnrichedAssignment;
  getStatusBadge: (s: AssignmentStatus) => React.ReactNode;
  getProgressValue: (s: AssignmentStatus) => number;
  getProgressColor: (s: AssignmentStatus) => string;
  onSubmit?: (assignment: EnrichedAssignment) => void;
  submittingId?: string | null;
}

function DiaryTaskCard({
  a,
  getStatusBadge,
  getProgressValue,
  getProgressColor,
  onSubmit,
  submittingId = null,
}: DiaryTaskCardProps) {
  const isOverdue = a.status === "overdue";
  const borderClr = isOverdue ? "border-l-rose-500" :
                    a.status === "graded" ? "border-l-amber-600" :
                    a.status === "submitted" ? "border-l-emerald-500" : "border-l-amber-500";

  // Cozy progress bar color themes to match warm leather and brass/gold binder styling
  const getCozyProgressColor = (status: AssignmentStatus) => {
    switch (status) {
      case "graded": return "bg-amber-600 dark:bg-amber-500";
      case "submitted": return "bg-emerald-600 dark:bg-emerald-500";
      case "active": return "bg-amber-500/70 dark:bg-amber-500/60";
      case "overdue": return "bg-rose-600 dark:bg-rose-500";
      default: return "";
    }
  };

  // Cozy status badge to look like a handwritten/highlighted stamp on paper (enhanced contrast for dark/light)
  const getCozyStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case "graded":
        return (
          <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-0 text-[10px] shadow-none rounded-sm px-2 font-extrabold uppercase tracking-wider">
            Graded
          </Badge>
        );
      case "submitted":
        return (
          <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-0 text-[10px] shadow-none rounded-sm px-2 font-extrabold uppercase tracking-wider">
            Submitted
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-0 text-[10px] shadow-none rounded-sm px-2 font-extrabold uppercase tracking-wider">
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-rose-100 hover:bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border-0 text-[10px] shadow-none rounded-sm px-2 font-extrabold uppercase tracking-wider">
            Overdue
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative bg-transparent text-left border-b border-dashed border-amber-900/15 dark:border-amber-950/20 overflow-visible group">
      {/* Row 1: Title, Subject and Status Badge (Exactly h-8/32px) */}
      <div className="h-8 flex items-end justify-between gap-3 pb-1">
        <h5 className="font-extrabold text-sm text-stone-950 dark:text-stone-50 tracking-wide flex items-center gap-2 leading-none">
          <span className="text-amber-800 dark:text-amber-400 leading-none">•</span>
          {a.title}
        </h5>
        <div className="flex items-center gap-2 h-full pt-1.5">
          <span className="font-extrabold text-[10px] text-amber-900 dark:text-amber-400 bg-amber-100 hover:bg-amber-100 dark:bg-amber-950/60 border border-amber-200/50 dark:border-amber-900/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wider leading-none">
            {a.subjectName}
          </span>
          {getCozyStatusBadge(a.status)}
        </div>
      </div>

      {/* Row 2: Description (Exactly h-8/32px if present, enhanced text contrast) */}
      {a.description && (
        <div className="h-8 flex items-end pb-1 pl-3 border-l-2 border-amber-600/50 dark:border-amber-500/40">
          <p className="text-[12px] text-stone-900 dark:text-stone-100 font-semibold leading-none truncate w-full">
            {a.description}
          </p>
        </div>
      )}

      {/* Row 3: Submit Button (Exactly h-8/32px, conditional row) */}
      {onSubmit && a.status !== "submitted" && a.status !== "graded" && (
        <div className="h-8 flex items-end justify-end pb-1.5">
          <Button
            onClick={() => onSubmit(a)}
            disabled={submittingId === a.id}
            className={`h-5 text-[9px] px-2.5 flex items-center gap-1 rounded-sm transition-all shadow-none border border-amber-700/20 leading-none ${
              a.status === "overdue"
                ? "bg-rose-600/90 hover:bg-rose-700 text-white"
                : "bg-amber-700/90 hover:bg-amber-800 text-white dark:bg-amber-600/80 dark:hover:bg-amber-600"
            }`}
          >
            {submittingId === a.id ? (
              <Loader2 className="size-2 animate-spin" />
            ) : (
              <Send className="size-2" />
            )}
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}
