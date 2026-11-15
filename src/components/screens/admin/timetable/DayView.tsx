"use client";

import { useMemo } from "react";
import { Clock, Coffee, Calendar, Utensils, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DAY_LABELS, DAY_FULL_LABELS } from "./constants";
import { formatTime, getSubjectBadgeClass, isCurrentPeriod } from "./helpers";
import type { TimetableSlot } from "./types";

function getDisplayDate(dayKey: string): { formattedDate: string; fullDay: string } {
  const dayIndexMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  const targetDay = dayIndexMap[dayKey.toLowerCase()] ?? 1;
  const now = new Date();
  const currentDay = now.getDay();
  const diff = targetDay - currentDay;
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + diff);

  const weekday = targetDate.toLocaleDateString("en-US", { weekday: "short" });
  const day = targetDate.getDate();
  const month = targetDate.toLocaleDateString("en-US", { month: "short" });
  const year = targetDate.getFullYear();

  const formattedDate = `${weekday}, ${day} ${month}, ${year}`;
  const fullDay = targetDate.toLocaleDateString("en-US", { weekday: "long" });

  return { formattedDate, fullDay };
}

interface DayViewProps {
  selectedDay: string;
  selectedDaySlots: TimetableSlot[][];
  timeSlots: { start: string; end: string }[];
  uniqueSubjects: string[];
  workingDays: string[];
  currentDayIndex: number;
  onSelectDay: (day: string) => void;
  onDeleteSlot: (id: string) => void;
  onEditSlot: (slot: TimetableSlot) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function DayView({
  selectedDay,
  selectedDaySlots,
  timeSlots,
  uniqueSubjects,
  workingDays,
  currentDayIndex,
  onSelectDay,
  onDeleteSlot,
  onEditSlot,
  canEdit,
  canDelete,
}: DayViewProps) {
  const dayIndex = workingDays.indexOf(selectedDay);
  const isToday = dayIndex === currentDayIndex;

  const { formattedDate, fullDay } = useMemo(
    () => getDisplayDate(selectedDay),
    [selectedDay],
  );

  const { items, totalPeriods } = useMemo(() => {
    const list: (
      | { type: "break"; id: string; time: string; name: string }
      | {
          type: "period";
          timeSlot: { start: string; end: string };
          slots: TimetableSlot[];
          periodIndex: number;
          periodNumber: number;
          isFree: boolean;
        }
    )[] = [];

    let periodIndex = 0;
    let slotCounter = 1;

    for (let i = 0; i < timeSlots.length; i++) {
      const ts = timeSlots[i];
      const prevTs = i > 0 ? timeSlots[i - 1] : null;
      const group = selectedDaySlots[i] || [];

      // Check gap between previous slot and current slot
      if (prevTs) {
        const [prevEndH, prevEndM] = prevTs.end.split(":").map(Number);
        const [currStartH, currStartM] = ts.start.split(":").map(Number);
        const gap = (currStartH * 60 + currStartM) - (prevEndH * 60 + prevEndM);

        if (gap >= 10) {
          const breakName =
            gap >= 25 || (prevEndH * 60 + prevEndM) >= 660 ? "Lunch" : "Short Break";
          list.push({
            type: "break",
            id: `break-gap-${prevTs.end}-${ts.start}`,
            time: formatTime(prevTs.end),
            name: breakName,
          });
          slotCounter += 1;
        }
      }

      // Check if slot itself is named as a break
      const firstSlot = group[0];
      const isNamedBreak =
        firstSlot &&
        ((firstSlot.label &&
          (firstSlot.label.toLowerCase().includes("break") ||
            firstSlot.label.toLowerCase().includes("lunch"))) ||
          (firstSlot.subjectName &&
            (firstSlot.subjectName.toLowerCase().includes("break") ||
              firstSlot.subjectName.toLowerCase().includes("lunch"))));

      if (isNamedBreak) {
        list.push({
          type: "break",
          id: firstSlot.id,
          time: formatTime(firstSlot.startTime),
          name: firstSlot.label || firstSlot.subjectName || "Break",
        });
        slotCounter += 1;
        continue;
      }

      periodIndex += 1;
      const isFree = group.length === 0;

      list.push({
        type: "period",
        timeSlot: ts,
        slots: group,
        periodIndex,
        periodNumber: slotCounter,
        isFree,
      });

      slotCounter += 1;
    }

    return { items: list, totalPeriods: periodIndex };
  }, [timeSlots, selectedDaySlots]);

  const handlePrevDay = () => {
    const currentIndex = workingDays.indexOf(selectedDay);
    if (currentIndex > 0) {
      onSelectDay(workingDays[currentIndex - 1]);
    } else {
      onSelectDay(workingDays[workingDays.length - 1]);
    }
  };

  const handleNextDay = () => {
    const currentIndex = workingDays.indexOf(selectedDay);
    if (currentIndex >= 0 && currentIndex < workingDays.length - 1) {
      onSelectDay(workingDays[currentIndex + 1]);
    } else {
      onSelectDay(workingDays[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Day View Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border/50">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center shrink-0">
              <Calendar className="size-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                {formattedDate}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalPeriods} periods today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={handlePrevDay}
              title="Previous Day"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
              {isToday ? "Today" : fullDay}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={handleNextDay}
              title="Next Day"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Schedule List */}
        <div className="mt-6 space-y-6 sm:space-y-7">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Coffee className="size-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium text-sm">No classes scheduled</p>
              <p className="text-xs mt-1">
                This day is completely free for the selected class.
              </p>
            </div>
          ) : (
            items.map((item) => {
              if (item.type === "break") {
                return (
                  <div key={item.id} className="flex items-center gap-4 sm:gap-6 py-1">
                    <div className="w-16 sm:w-20 shrink-0 text-left">
                      <p className="text-xs sm:text-sm text-muted-foreground font-normal">
                        {item.time}
                      </p>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center">
                      <div className="w-full border-t border-dashed border-border/80 absolute inset-x-0" />
                      <div className="relative z-10 bg-card px-3 py-0.5 text-xs text-muted-foreground flex items-center gap-1.5 select-none">
                        {(() => {
                          const BreakIcon = item.name.toLowerCase().includes("lunch") ? Utensils : Coffee;
                          return <BreakIcon className="size-3.5 text-muted-foreground/80" />;
                        })()}
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </div>

                    <div className="w-7 sm:w-8 shrink-0" />
                  </div>
                );
              }

              const { timeSlot, slots, periodNumber, periodIndex, isFree } = item;
              const firstSlot = slots[0];
              const isCurrent =
                isToday && !isFree
                  ? isCurrentPeriod(timeSlot.start, timeSlot.end)
                  : false;

              const periodTitle = isFree
                ? `Period ${periodIndex}`
                : firstSlot?.label || firstSlot?.subjectName;

              return (
                <div
                  key={`${timeSlot.start}-${timeSlot.end}`}
                  className="flex items-center gap-4 sm:gap-6 group"
                >
                  {/* Time column */}
                  <div className="w-16 sm:w-20 shrink-0 text-left">
                    <p className="text-xs sm:text-sm font-semibold text-foreground/85 leading-tight">
                      {formatTime(timeSlot.start)}
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                      {formatTime(timeSlot.end)}
                    </p>
                  </div>

                  {/* Vertical accent bar + content */}
                  <div className="flex-1 min-w-0 border-l-2 border-blue-200 dark:border-blue-800/80 pl-4 sm:pl-5 py-0.5">
                    {isFree ? (
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                          {periodTitle}
                        </h4>
                        <p className="text-xs text-muted-foreground italic mt-0.5">
                          Free period
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {slots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between gap-3"
                          >
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
                        ))}
                      </div>
                    )}
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
    </div>
  );
}
