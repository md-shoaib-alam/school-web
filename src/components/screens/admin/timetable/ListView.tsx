"use client";

import { useMemo, useState } from "react";
import { Clock, Coffee, Calendar, Utensils, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DAY_LABELS, DAY_FULL_LABELS } from "./constants";
import { formatTime, isCurrentPeriod, getBreakIcon } from "./helpers";
import type { TimetableSlot } from "./types";

interface ListViewProps {
  slotsByDay: Map<string, TimetableSlot[]>;
  uniqueSubjects: string[];
  workingDays: string[];
  currentDayIndex: number;
  onDeleteSlot: (id: string) => void;
  onEditSlot: (slot: TimetableSlot) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function ListView({
  slotsByDay,
  workingDays,
  currentDayIndex,
}: ListViewProps) {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("all");

  const daysWithSlots = useMemo(() => {
    return workingDays.filter((day) => {
      const list = slotsByDay.get(day);
      return list && list.length > 0;
    });
  }, [workingDays, slotsByDay]);

  const filteredDays = useMemo(() => {
    if (selectedDayFilter === "all") return daysWithSlots;
    return daysWithSlots.filter(
      (d) => d.toLowerCase() === selectedDayFilter.toLowerCase()
    );
  }, [daysWithSlots, selectedDayFilter]);

  if (daysWithSlots.length === 0) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-12 text-center text-muted-foreground shadow-xs">
        <Coffee className="size-10 mx-auto mb-2 opacity-30" />
        <p className="font-semibold text-base text-foreground">No timetable records found</p>
        <p className="text-xs mt-1 text-muted-foreground">No periods are currently scheduled for this class.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Day Selector Pills in ListView */}
      <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-1">
        <Button
          size="sm"
          variant={selectedDayFilter === "all" ? "default" : "outline"}
          className={`rounded-full px-4 text-xs font-medium shrink-0 transition-colors ${
            selectedDayFilter === "all"
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
          onClick={() => setSelectedDayFilter("all")}
        >
          All
        </Button>
        {workingDays.map((day, idx) => {
          const dayLower = day.toLowerCase();
          const isActive = selectedDayFilter.toLowerCase() === dayLower;
          const isCurrentDay = idx === currentDayIndex;

          return (
            <Button
              key={day}
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={`rounded-full px-4 text-xs font-medium shrink-0 transition-colors ${
                isActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  : isCurrentDay
                    ? "border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-100/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              onClick={() => setSelectedDayFilter(isActive ? "all" : day)}
            >
              <span>{DAY_LABELS[dayLower] || day}</span>
              {isCurrentDay && !isActive && (
                <span className="ml-1.5 size-1.5 rounded-full bg-blue-500 inline-block" />
              )}
            </Button>
          );
        })}
      </div>

      {filteredDays.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card p-8 text-center text-muted-foreground shadow-xs">
          <p className="font-medium text-foreground">No periods scheduled for this day</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={() => setSelectedDayFilter("all")}
          >
            Show All Days
          </Button>
        </div>
      ) : (
        filteredDays.map((day) => {
        const dayIdx = workingDays.indexOf(day);
        const isToday = dayIdx === currentDayIndex;
        const daySlots = slotsByDay.get(day) || [];

        // Sort slots by startTime
        const sortedSlots = [...daySlots].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );

        // Build timeline items with break detection and period numbering
        const items: (
          | { type: "break"; id: string; time: string; name: string }
          | {
              type: "period";
              slot: TimetableSlot;
              periodNumber: number;
              isCurrent: boolean;
            }
        )[] = [];

        let periodIndex = 0;
        let slotCounter = 1;

        for (let i = 0; i < sortedSlots.length; i++) {
          const slot = sortedSlots[i];
          const prevSlot = i > 0 ? sortedSlots[i - 1] : null;

          if (prevSlot) {
            const [prevEndH, prevEndM] = prevSlot.endTime.split(":").map(Number);
            const [currStartH, currStartM] = slot.startTime.split(":").map(Number);
            const gap = currStartH * 60 + currStartM - (prevEndH * 60 + prevEndM);

            if (gap >= 10) {
              const breakName =
                gap >= 25 || prevEndH * 60 + prevEndM >= 660
                  ? "Lunch Break"
                  : "Short Break";
              items.push({
                type: "break",
                id: `break-gap-${day}-${prevSlot.id}-${slot.id}`,
                time: formatTime(prevSlot.endTime),
                name: breakName,
              });
              slotCounter += 1;
            }
          }

          const isNamedBreak =
            (slot.label &&
              (slot.label.toLowerCase().includes("break") ||
                slot.label.toLowerCase().includes("lunch"))) ||
            (slot.subjectName &&
              (slot.subjectName.toLowerCase().includes("break") ||
                slot.subjectName.toLowerCase().includes("lunch")));

          if (isNamedBreak) {
            items.push({
              type: "break",
              id: slot.id,
              time: formatTime(slot.startTime),
              name: slot.label || slot.subjectName || "Break",
            });
            slotCounter += 1;
            continue;
          }

          periodIndex += 1;
          const isCurrent =
            isToday && isCurrentPeriod(slot.startTime, slot.endTime);

          items.push({
            type: "period",
            slot,
            periodNumber: slotCounter,
            isCurrent,
          });
          slotCounter += 1;
        }

        return (
          <div
            key={day}
            className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs"
          >
            {/* Card Header matching DayView */}
            <div className="flex items-center justify-between pb-6 border-b border-border/50">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center shrink-0">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                    {DAY_FULL_LABELS[day]}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {periodIndex} periods scheduled
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isToday && (
                  <Badge className="bg-blue-600 text-white text-[10px] h-5 px-2">
                    Today
                  </Badge>
                )}
                <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                  {DAY_LABELS[day]}
                </span>
              </div>
            </div>

            {/* Schedule List matching DayView */}
            <div className="mt-6 space-y-6 sm:space-y-7">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Coffee className="size-8 mx-auto mb-1.5 opacity-30" />
                  <p className="font-medium text-xs sm:text-sm">No classes scheduled</p>
                  <p className="text-[11px] mt-0.5 text-muted-foreground/70">
                    This day is completely free.
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  if (item.type === "break") {
                    const BreakIcon = item.name.toLowerCase().includes("lunch")
                      ? Utensils
                      : Coffee;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 sm:gap-6 py-1"
                      >
                        <div className="w-16 sm:w-20 shrink-0 text-left">
                          <p className="text-xs sm:text-sm text-muted-foreground font-normal">
                            {item.time}
                          </p>
                        </div>

                        <div className="flex-1 relative flex items-center justify-center">
                          <div className="w-full border-t border-dashed border-border/80 absolute inset-x-0" />
                          <div className="relative z-10 bg-card px-3 py-0.5 text-xs text-muted-foreground flex items-center gap-1.5 select-none">
                            <BreakIcon className="size-3.5 text-muted-foreground/80" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </div>

                        <div className="w-7 sm:w-8 shrink-0" />
                      </div>
                    );
                  }

                  const { slot, periodNumber, isCurrent } = item;

                  return (
                    <div
                      key={slot.id}
                      className="flex items-center gap-4 sm:gap-6 group"
                    >
                      {/* Time column */}
                      <div className="w-16 sm:w-20 shrink-0 text-left">
                        <p className="text-xs sm:text-sm font-semibold text-foreground/85 leading-tight">
                          {formatTime(slot.startTime)}
                        </p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                          {formatTime(slot.endTime)}
                        </p>
                      </div>

                      {/* Vertical accent bar + content */}
                      <div className="flex-1 min-w-0 border-l-2 border-blue-200 dark:border-blue-800/80 pl-4 sm:pl-5 py-0.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className={`text-sm sm:text-base font-semibold leading-snug ${
                                  slot.label
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-foreground"
                                }`}
                              >
                                {slot.label || slot.subjectName}
                              </h4>
                              {isCurrent && (
                                <Badge className="bg-blue-600 hover:bg-blue-600 text-white text-[10px] font-bold h-4 px-1.5 shadow-xs animate-pulse">
                                  Live
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-auto">
                            {!slot.label && slot.teacherName && (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                                <User className="size-3.5 text-muted-foreground/70" />
                                <span>{slot.teacherName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Period circular badge */}
                      <div className="shrink-0">
                        <div className="size-7 sm:size-8 rounded-full bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground text-xs font-semibold flex items-center justify-center">
                          {periodNumber}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })
      )}
    </div>
  );
}
