"use client";

import { Calendar } from "lucide-react";

interface EmptyTimetableStateProps {
  selectedClass?: string;
  classes?: any[];
  onClassSelect?: (id: string) => void;
}

export function EmptyTimetableState({
  selectedClass,
  classes = [],
  onClassSelect,
}: EmptyTimetableStateProps) {
  if (!selectedClass) {
    return (
      <div className="p-6 animate-in fade-in-50 duration-300 space-y-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/40">
            <Calendar className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Select a Class</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Choose a class below to view its timetable</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {classes.map((c: any) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onClassSelect?.(c.id)}
              className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 px-3 py-5 text-center shadow hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:border-emerald-500/60 transition-all duration-200 active:scale-95 cursor-pointer overflow-hidden"
            >
              <span className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 flex items-center justify-center transition-colors duration-200">
                <Calendar className="size-4 text-emerald-600 dark:text-emerald-400" />
              </span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 leading-tight">{c.name}</span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-full">{c.section}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-24 text-muted-foreground bg-muted/5">
      <div className="size-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="size-8 opacity-20" />
      </div>
      <p className="font-medium text-zinc-900 dark:text-zinc-100">No timetable records found</p>
      <p className="text-xs max-w-[200px] mx-auto mt-1 opacity-60">
        Please add periods using the &quot;Manage&quot; button above.
      </p>
    </div>
  );
}
