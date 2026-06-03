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
      <div className="text-center py-20 text-muted-foreground bg-muted/5 animate-in fade-in-50 duration-300">
        <div className="size-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="size-8 opacity-25" />
        </div>
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">No Class Selected</p>
        <p className="text-sm max-w-sm mx-auto mt-1 opacity-70">
          Select a class from the list below to view its timetable.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl mx-auto px-4">
          {classes.map((c: any) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onClassSelect?.(c.id)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-500/80 dark:hover:text-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              {c.name} - {c.section}
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
