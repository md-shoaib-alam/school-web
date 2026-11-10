'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceRecordItem } from './types';
import { MONTH_NAMES, generateCalendarGrid } from './utils';

interface AttendanceCalendarProps {
  calYear: number;
  calMonth: number;
  todayStr: string;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToday: () => void;
  calendarRecords: AttendanceRecordItem[];
  className?: string;
}

export function AttendanceCalendar({
  calYear,
  calMonth,
  todayStr,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToday,
  calendarRecords,
  className,
}: AttendanceCalendarProps) {
  const calendarDays = useMemo(() => {
    return generateCalendarGrid(calYear, calMonth, calendarRecords);
  }, [calYear, calMonth, calendarRecords]);

  return (
    <Card className={cn('lg:col-span-5 rounded-2xl border  bg-card p-3.5 sm:p-5 flex flex-col justify-between', className)}>
      <div>
        {/* Calendar Controls */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b ">
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            {MONTH_NAMES[calMonth]} {calYear}
          </h3>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={onPrevMonth}
              className="size-7 sm:size-8 rounded-lg sm:rounded-xl cursor-pointer hover:bg-accent"
            >
              <ChevronLeft className="size-3.5 sm:size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onNextMonth}
              className="size-7 sm:size-8 rounded-lg sm:rounded-xl cursor-pointer hover:bg-accent"
            >
              <ChevronRight className="size-3.5 sm:size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onGoToday}
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold cursor-pointer hover:bg-accent"
            >
              Today
            </Button>
          </div>
        </div>

        {/* Weekday Header */}
        <div className="grid grid-cols-7 gap-1 pt-2.5 pb-1.5 sm:pt-3 sm:pb-2 text-center text-[10px] sm:text-xs font-semibold text-muted-foreground">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, idx) => {
            const isToday = item.dateStr === todayStr;
            const isSelected = item.dateStr === selectedDate;

            return (
              <button
                key={`${item.dateStr}-${idx}`}
                type="button"
                onClick={() => onSelectDate(item.dateStr)}
                className={cn(
                  'h-9 sm:h-11 md:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer',
                  !item.isCurrentMonth && 'opacity-25 hover:opacity-40',
                  item.isCurrentMonth && 'hover:bg-accent',
                  isSelected && !isToday && 'ring-2 ring-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20'
                )}
              >
                <span
                  className={cn(
                    'text-xs sm:text-sm font-medium',
                    isToday &&
                      'size-6 sm:size-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs text-xs',
                    !isToday && item.isCurrentMonth && 'text-foreground',
                    !isToday && !item.isCurrentMonth && 'text-muted-foreground'
                  )}
                >
                  {item.dayNumber}
                </span>

                {/* Indicator Dot (Shown for all recorded days, including today) */}
                {item.isCurrentMonth && item.status && (
                  <span
                    className={cn(
                      'size-1.5 sm:size-2 rounded-full mt-0.5 shrink-0 ring-1 ring-white/50 dark:ring-border',
                      item.status === 'present' && 'bg-emerald-500',
                      item.status === 'absent' && 'bg-rose-500',
                      item.status === 'leave' && 'bg-amber-500',
                      item.status === 'holiday' && 'bg-purple-500'
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-3 sm:pt-4 border-t  flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-medium text-muted-foreground mt-2 sm:mt-0">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="size-2 rounded-full bg-rose-500" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="size-2 rounded-full bg-amber-500" />
          <span>Leave</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="size-2 rounded-full bg-purple-500" />
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="size-2 rounded-full bg-blue-600" />
          <span>Today</span>
        </div>
      </div>
    </Card>
  );
}
