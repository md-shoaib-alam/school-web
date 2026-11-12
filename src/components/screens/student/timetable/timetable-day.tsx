"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, MapPin, Coffee, Calendar } from "lucide-react";
import type { TimetableSlot } from "@/types";
import { DAYS, DAY_LABELS, DAY_FULL_LABELS, formatTime } from "./types";

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

interface TimetableDayProps {
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  todayKey: string;
  slotsByDay: Record<string, TimetableSlot[]>;
  timeSlots: { start: string; end: string }[];
  slotLookup: Record<string, TimetableSlot>;
  subjectColorMap: Record<string, string>;
  currentTimeStr: string;
  isCurrentSlot: (start: string, end: string) => boolean;
  isSlotPast: (start: string) => boolean;
}

export function TimetableDay({
  selectedDay,
  setSelectedDay,
  todayKey,
  slotsByDay,
  timeSlots,
  slotLookup,
  subjectColorMap,
  currentTimeStr,
  isCurrentSlot,
  isSlotPast,
}: TimetableDayProps) {
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
          slot: TimetableSlot | null;
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
      const slot = slotLookup[`${selectedDay}-${ts.start}`] || null;

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
      const isNamedBreak =
        slot &&
        (slot.subjectName.toLowerCase().includes("break") ||
          slot.subjectName.toLowerCase().includes("lunch"));

      if (isNamedBreak) {
        list.push({
          type: "break",
          id: slot.id,
          time: formatTime(slot.startTime),
          name: slot.subjectName || "Break",
        });
        slotCounter += 1;
        continue;
      }

      periodIndex += 1;
      const isFree = !slot;

      list.push({
        type: "period",
        timeSlot: ts,
        slot,
        periodIndex,
        periodNumber: slotCounter,
        isFree,
      });

      slotCounter += 1;
    }

    return { items: list, totalPeriods: periodIndex };
  }, [timeSlots, slotLookup, selectedDay]);

  return (
    <div className="space-y-6">
      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DAYS.map((day) => {
          const isSelected = day === selectedDay;
          const isToday = day === todayKey;

          return (
            <Button
              key={day}
              size="sm"
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelectedDay(day)}
              className={`rounded-full px-4 text-xs font-medium shrink-0 transition-colors ${
                isSelected
                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                  : isToday
                    ? "border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-400 bg-teal-50/60 dark:bg-teal-950/20 hover:bg-teal-100/80"
                    : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{DAY_LABELS[day]}</span>
              {isToday && !isSelected && (
                <span className="ml-1.5 size-1.5 rounded-full bg-teal-500 inline-block" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Main Day View Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border/50">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-center shrink-0">
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

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/50">
              {fullDay}
            </span>
          </div>
        </div>

        {/* Schedule List */}
        <div className="mt-6 space-y-6 sm:space-y-7">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Coffee className="size-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium text-sm">No classes scheduled</p>
              <p className="text-xs mt-1">This day is completely free.</p>
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
                        <Coffee className="size-3.5 text-muted-foreground/80" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </div>

                    <div className="w-7 sm:w-8 shrink-0" />
                  </div>
                );
              }

              const { timeSlot, slot, periodNumber, periodIndex } = item;
              const isCurrent =
                selectedDay === todayKey &&
                slot !== null &&
                isCurrentSlot(slot.startTime, slot.endTime);

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
                  <div className="flex-1 min-w-0 border-l-2 border-indigo-200 dark:border-indigo-800/80 pl-4 sm:pl-5 py-0.5">
                    {!slot ? (
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                          Period {periodIndex}
                        </h4>
                        <p className="text-xs text-muted-foreground italic mt-0.5">
                          Free period
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                            {slot.subjectName}
                          </h4>
                          {isCurrent && (
                            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold h-4 px-1.5 shadow-xs animate-pulse">
                              Live
                            </Badge>
                          )}
                        </div>
                        {(slot.teacherName || slot.className) && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {slot.teacherName ? slot.teacherName : ""}
                            {slot.teacherName && slot.className ? " • " : ""}
                            {slot.className ? slot.className : ""}
                          </p>
                        )}
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
