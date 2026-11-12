"use client";

import { Clock, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DAY_LABELS, DAY_FULL_LABELS } from "./constants";
import { formatTime, getSubjectBadgeClass, isBreakSlot, getBreakIcon } from "./helpers";
import type { TimetableSlot } from "./types";

interface GridViewProps {
  timeSlots: { start: string; end: string }[];
  gridData: Map<string, Map<string, TimetableSlot[]>>;
  uniqueSubjects: string[];
  workingDays: string[];
  currentDayIndex: number;
  onDeleteSlot: (id: string) => void;
  onEditSlot: (slot: TimetableSlot) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function GridView({
  timeSlots,
  gridData,
  uniqueSubjects,
  workingDays,
  currentDayIndex,
  onDeleteSlot,
  onEditSlot,
  canEdit,
  canDelete,
}: GridViewProps) {
  const showActions = canEdit || canDelete;

  return (
    <div className="overflow-x-auto">
      {/* Desktop: HTML Table */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="py-2.5 px-3 text-left text-xs font-normal text-muted-foreground w-32">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Time Slot
                </div>
              </th>
              {workingDays.map((day, idx) => (
                <th
                  key={day}
                  className={`py-2.5 px-2 text-center text-xs ${
                    idx === currentDayIndex
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium"
                      : "text-muted-foreground font-normal"
                  }`}
                >
                  {DAY_LABELS[day]}
                  {idx === currentDayIndex && (
                    <span className="ml-1.5 inline-block size-1.5 rounded-full bg-emerald-500" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(({ start, end }, slotIdx) => (
              <tr
                key={`${start}-${end}`}
                className={slotIdx % 2 === 0 ? "bg-background" : "bg-muted/10"}
              >
                <td className="py-2.5 px-3 align-top">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Clock className="size-3 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground/90">{formatTime(start)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatTime(end)}
                      </p>
                    </div>
                  </div>
                </td>
                {workingDays.map((day, dayIdx) => {
                  const key = `${start}-${end}`;
                  const cellSlots = gridData.get(day)?.get(key);

                  return (
                    <td
                      key={day}
                      className={`py-2 px-1.5 align-top ${
                        dayIdx === currentDayIndex
                          ? "bg-emerald-50/40 dark:bg-emerald-900/20"
                          : ""
                      }`}
                    >
                      {cellSlots && cellSlots.length > 0 ? (
                        <div className="space-y-1">
                          {cellSlots.map((slot) => {
                            const isBreak = isBreakSlot(slot);
                            const BreakIcon = isBreak ? getBreakIcon(slot) : null;

                            return (
                              <div className="relative group" key={slot.id}>
                                {isBreak && BreakIcon ? (
                                  <div
                                    className="rounded-lg border border-amber-300/50 dark:border-amber-600/30 bg-amber-500/10 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200 px-2.5 py-2 transition-all hover:shadow-sm min-h-[50px] flex items-center gap-2"
                                  >
                                    <div className="size-6 rounded-md bg-amber-500/15 dark:bg-amber-500/25 flex items-center justify-center shrink-0">
                                      <BreakIcon className="size-3 text-amber-700 dark:text-amber-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium leading-tight truncate">
                                        {slot.label || slot.subjectName || "Lunch Break"}
                                      </p>
                                      {slot.teacherName && (
                                        <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70 mt-0.5 truncate font-normal">
                                          {slot.teacherName}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className={`rounded-lg border px-2.5 py-2 transition-all hover:shadow-sm min-h-[50px] flex flex-col justify-center ${getSubjectBadgeClass(slot.subjectName, uniqueSubjects)}`}
                                  >
                                    <p className="text-xs font-medium leading-tight truncate">
                                      {slot.label || slot.subjectName}
                                    </p>
                                    {slot.teacherName && (
                                      <p className="text-[11px] mt-0.5 opacity-75 font-normal truncate">
                                        {slot.teacherName}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {showActions && (
                                  <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {canEdit && (
                                      <button
                                        type="button"
                                        onClick={() => onEditSlot(slot)}
                                        className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-800"
                                        title="Edit slot"
                                      >
                                        <Pencil className="size-2.5" />
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button
                                        type="button"
                                        onClick={() => onDeleteSlot(slot.id)}
                                        className="size-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800"
                                        title="Delete slot"
                                      >
                                        <Trash2 className="size-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-muted-foreground/20 h-[50px] flex items-center justify-center">
                          <span className="text-[11px] font-normal text-muted-foreground/40">
                            Free
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Day-by-day card layout */}
      <div className="md:hidden divide-y">
        {workingDays.map((day, dayIdx) => (
          <div
            key={day}
            className={`p-4 ${dayIdx === currentDayIndex ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <h3
                className={`text-xs font-medium ${
                  dayIdx === currentDayIndex
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-foreground"
                }`}
              >
                {DAY_FULL_LABELS[day]}
              </h3>
              {dayIdx === currentDayIndex && (
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-[10px] px-1.5 py-0 font-normal">
                  Today
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {timeSlots.map(({ start, end }) => {
                const key = `${start}-${end}`;
                const cellSlots = gridData.get(day)?.get(key);

                return (
                  <div key={key} className="flex items-start gap-3">
                    <div className="shrink-0 w-16 text-xs text-muted-foreground pt-2">
                      <span className="font-normal text-foreground/85">
                        {formatTime(start).replace(" ", "")}
                      </span>
                      <span className="mx-0.5">-</span>
                      <span>{formatTime(end).replace(" ", "")}</span>
                    </div>
                    {cellSlots && cellSlots.length > 0 ? (
                      <div className="flex-1 space-y-1">
                        {cellSlots.map((slot) => {
                          const isBreak = isBreakSlot(slot);
                          const BreakIcon = isBreak ? getBreakIcon(slot) : null;

                          return (
                            <div
                              className="flex items-center gap-2"
                              key={slot.id}
                            >
                              {isBreak && BreakIcon ? (
                                <div className="flex-1 rounded-lg border border-amber-300/50 dark:border-amber-600/30 bg-amber-500/10 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200 px-2.5 py-2 flex items-center gap-2">
                                  <div className="size-6 rounded-md bg-amber-500/15 dark:bg-amber-500/25 flex items-center justify-center shrink-0">
                                    <BreakIcon className="size-3 text-amber-700 dark:text-amber-400" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium leading-tight truncate">
                                      {slot.label || slot.subjectName || "Lunch Break"}
                                    </p>
                                    {slot.teacherName && (
                                      <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70 mt-0.5 truncate font-normal">
                                        {slot.teacherName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`flex-1 rounded-lg border px-2.5 py-2 ${getSubjectBadgeClass(slot.subjectName, uniqueSubjects)}`}
                                >
                                  <p className="text-xs font-medium leading-tight truncate">
                                    {slot.label || slot.subjectName}
                                  </p>
                                  {slot.teacherName && (
                                    <p className="text-[11px] mt-0.5 opacity-75 font-normal truncate">
                                      {slot.teacherName}
                                    </p>
                                  )}
                                </div>
                              )}
                              {showActions && (
                                <>
                                  {canEdit && (
                                    <button
                                      onClick={() => onEditSlot(slot)}
                                      className="shrink-0 size-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                                      title="Edit slot"
                                    >
                                      <Pencil className="size-3" />
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      onClick={() => onDeleteSlot(slot.id)}
                                      className="shrink-0 size-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                      title="Delete slot"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex-1 rounded-lg border border-dashed border-muted-foreground/20 py-2 px-3">
                        <span className="text-[11px] font-normal text-muted-foreground/40">
                          Free period
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
