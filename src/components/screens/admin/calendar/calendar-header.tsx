"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { MONTH_NAMES, ALL_EVENT_TYPES, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "./types";

interface CalendarHeaderProps {
  currentYear: number;
  currentMonth: number;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  canCreate: boolean;
  openCreateDialog: () => void;
}

export function CalendarHeader({
  currentYear,
  currentMonth,
  typeFilter,
  setTypeFilter,
  goToPrevMonth,
  goToNextMonth,
  goToToday,
  canCreate,
  openCreateDialog,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 px-3 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-800">
          <Button variant="ghost" size="icon" className="h-8 w-8 border-r rounded-none" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold border-r rounded-none" onClick={goToToday}>
            TODAY
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
      </div>

      <div className="flex items-center gap-2 w-full lg:w-auto">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40 h-8 font-bold text-[10px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {ALL_EVENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: EVENT_TYPE_COLORS[t] }} />
                  <span className="text-[10px] uppercase font-bold">{EVENT_TYPE_LABELS[t]}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canCreate && (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md h-8 px-3 font-bold text-[10px] uppercase" onClick={openCreateDialog}>
            <Plus className="h-3 w-3 mr-1" />
            Add Event
          </Button>
        )}
      </div>
    </div>
  );
}
