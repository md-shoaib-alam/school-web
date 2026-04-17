"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface CalendarHeaderProps {
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({ onPrevMonth, onNextMonth, onToday }: CalendarHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-gray-900/40 p-1.5 rounded-2xl border border-white/20 dark:border-gray-800/20 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-3 px-3">
        <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20">
          <CalendarDays className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Parent Calendar</h2>
          <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Home Portal</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-3 pb-2 md:pb-0">
        <div className="flex items-center gap-1.5 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
          <Button variant="ghost" size="icon" onClick={onPrevMonth} className="h-8 w-8 rounded-lg outline-none focus-visible:ring-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToday} className="h-8 px-3 text-xs font-black rounded-lg outline-none focus-visible:ring-0 uppercase">
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={onNextMonth} className="h-8 w-8 rounded-lg outline-none focus-visible:ring-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
