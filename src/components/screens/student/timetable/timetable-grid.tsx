import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Coffee, Utensils } from "lucide-react";
import type { TimetableSlot } from "@/types";
import { DAYS, DAY_LABELS, formatTime } from "./types";

interface TimetableGridProps {
  todayKey: string;
  timeSlots: { start: string; end: string }[];
  slotLookup: Record<string, TimetableSlot>;
  subjectColorMap: Record<string, string>;
  isCurrentSlot: (start: string, end: string) => boolean;
  isSlotPast: (start: string) => boolean;
}

export function TimetableGrid({
  todayKey,
  timeSlots,
  slotLookup,
  subjectColorMap,
  isCurrentSlot,
  isSlotPast,
}: TimetableGridProps) {
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="size-4 text-violet-500" />
            Weekly Schedule
          </CardTitle>
          {todayKey && (
            <Badge className="bg-violet-100 text-violet-700 text-[10px] hover:bg-violet-100">
              Today: {DAY_LABELS[todayKey]}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[600px]">
          <div className="min-w-[640px]">
            {/* Table Header */}
            <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1.5 mb-2">
              <div className="text-xs font-medium text-muted-foreground p-2" />
              {DAYS.map((day) => (
                <div
                  key={day}
                  className={`text-center text-xs py-2 rounded-lg ${
                    day === todayKey
                      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 font-medium"
                      : "text-muted-foreground font-normal"
                  }`}
                >
                  {DAY_LABELS[day]}
                </div>
              ))}
            </div>

            {/* Table Rows */}
            {timeSlots.map((slot) => (
              <div
                key={slot.start}
                className="grid grid-cols-[100px_repeat(5,1fr)] gap-1.5 mb-1.5"
              >
                {/* Time label */}
                <div className="flex items-center justify-center px-2 py-1">
                  <div className="text-center">
                    <p className="text-xs font-normal text-foreground/90">
                      {formatTime(slot.start)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatTime(slot.end)}
                    </p>
                  </div>
                </div>

                {/* Day cells */}
                {DAYS.map((day) => {
                  const cellSlot = slotLookup[`${day}-${slot.start}`];
                  const isToday = day === todayKey;
                  const isCurrent =
                    isToday &&
                    cellSlot &&
                    isCurrentSlot(cellSlot.startTime, cellSlot.endTime);
                  const isPast =
                    isToday &&
                    cellSlot &&
                    isSlotPast(cellSlot.startTime) &&
                    !isCurrent;
                  const isBreak =
                    cellSlot &&
                    (!!(cellSlot as any).label ||
                      (!cellSlot.teacherName && !cellSlot.subjectName) ||
                      cellSlot.subjectName?.toLowerCase().includes("break") ||
                      cellSlot.subjectName?.toLowerCase().includes("lunch") ||
                      (cellSlot as any).label?.toLowerCase().includes("break") ||
                      (cellSlot as any).label?.toLowerCase().includes("lunch"));
                  const BreakIcon =
                    isBreak &&
                    (((cellSlot as any).label || cellSlot.subjectName || "").toLowerCase().includes("tea") ||
                      ((cellSlot as any).label || cellSlot.subjectName || "").toLowerCase().includes("coffee"))
                      ? Coffee
                      : Utensils;

                  return (
                    <div
                      key={day}
                      className={`rounded-lg border p-2 min-h-[60px] transition-all ${
                        cellSlot
                          ? isBreak
                            ? "border-amber-300/60 dark:border-amber-600/40 bg-amber-500/10 dark:bg-amber-500/15"
                            : subjectColorMap[cellSlot.subjectName] || "bg-muted "
                          : "bg-muted  border-dashed"
                      } ${isToday && !cellSlot ? "bg-violet-50/30 border-violet-100" : ""} ${
                        isCurrent
                          ? "ring-2 ring-violet-500 ring-offset-1 shadow-md scale-[1.02]"
                          : ""
                      } ${isPast ? "opacity-60" : ""}`}
                    >
                      {cellSlot ? (
                        isBreak ? (
                          <div className="flex items-center gap-2 h-full">
                            <div className="size-6 rounded-md bg-amber-500/15 dark:bg-amber-500/25 flex items-center justify-center shrink-0">
                              <BreakIcon className="size-3 text-amber-700 dark:text-amber-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate text-amber-900 dark:text-amber-200 leading-tight">
                                {(cellSlot as any).label || cellSlot.subjectName || "Lunch Break"}
                              </p>
                              {cellSlot.teacherName && (
                                <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70 truncate font-normal mt-0.5">
                                  {cellSlot.teacherName}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5 justify-center h-full">
                            <p className="text-xs font-medium truncate leading-tight">
                              {(cellSlot as any).label || cellSlot.subjectName}
                            </p>
                            <p className="text-[10px] opacity-75 truncate font-normal">
                              {cellSlot.teacherName}
                            </p>
                            {isCurrent && (
                              <Badge className="bg-violet-500 text-white text-[9px] px-1.5 py-0 w-fit mt-0.5 hover:bg-violet-500 font-normal">
                                Live
                              </Badge>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-[10px] text-muted-foreground">
                            -
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
