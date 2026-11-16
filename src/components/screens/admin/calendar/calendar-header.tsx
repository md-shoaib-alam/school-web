"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { MONTH_NAMES, ALL_EVENT_TYPES, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "./types";

interface CalendarHeaderProps {
  currentYear?: number;
  currentMonth?: number;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  goToPrevMonth?: () => void;
  goToNextMonth?: () => void;
  goToToday?: () => void;
  canCreate: boolean;
  openCreateDialog: () => void;
  title?: string;
  description?: string;
  showNavigation?: boolean;
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
  title = "Calendar",
  description = "View school events and activities",
  showNavigation = false,
}: CalendarHeaderProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* Title & Actions Top Row */}
      <div className="p-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center w-full sm:w-auto mt-1 sm:mt-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs font-medium rounded-xl border-border bg-card">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                {ALL_EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: EVENT_TYPE_COLORS[t] }} />
                      <span>{EVENT_TYPE_LABELS[t]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {canCreate && (
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs rounded-xl h-9 px-4 text-xs font-semibold flex items-center transition-all duration-150 active:scale-95 ml-auto sm:ml-0 cursor-pointer" 
                onClick={openCreateDialog}
              >
                <Plus className="size-3.5 mr-1.5 stroke-[2.5]" />
                Add Event
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Optional Month navigation row (used only if navigation not handled inside calendar grid) */}
      {showNavigation && currentMonth !== undefined && currentYear !== undefined && goToPrevMonth && goToNextMonth && (
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between bg-muted border-t border-border">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 rounded-full text-foreground hover:bg-card flex items-center justify-center transition-colors" 
              onClick={goToPrevMonth}
            >
              <ChevronLeft className="size-4" />
            </Button>
            
            <h2 className="text-sm font-semibold text-foreground tracking-tight min-w-[120px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>

            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 rounded-full text-foreground hover:bg-card flex items-center justify-center transition-colors" 
              onClick={goToNextMonth}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {goToToday && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3.5 text-xs font-medium hover:bg-card rounded-xl text-foreground"
              onClick={goToToday}
            >
              Today
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
