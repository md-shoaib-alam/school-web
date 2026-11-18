"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toKey } from "./date-utils";

// Desktop date picker: month grid with navigation, future and off-days disabled.
export function DateCalendar({
  date,
  viewMonth,
  onViewMonthChange,
  disableDates,
  onSelect,
}: {
  date: string;
  viewMonth: Date;
  onViewMonthChange: (month: Date) => void;
  disableDates: (d: Date) => boolean;
  onSelect: (key: string) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toKey(today);
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const nextMonthDisabled =
    viewMonth.getFullYear() > today.getFullYear() ||
    (viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() >= today.getMonth());

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-lg"
          aria-label="Previous month"
          onClick={() => onViewMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {viewMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-lg"
          aria-label="Next month"
          disabled={nextMonthDisabled}
          onClick={() => onViewMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center sm:gap-1.5">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((l) => (
          <span key={l} className="py-1 text-xs text-muted-foreground">{l}</span>
        ))}
        {Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1);
          const key = toKey(d);
          const disabled = disableDates(d);
          const isSelected = key === date;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              onClick={() => onSelect(key)}
              className={cn(
                "grid aspect-square place-items-center rounded-xl border transition-colors",
                isSelected
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : disabled
                    ? "border-border bg-card text-muted-foreground/40 cursor-not-allowed"
                    : "border-border bg-card text-foreground hover:bg-muted/40",
                !isSelected && key === todayKey && "ring-1 ring-emerald-500/60",
              )}
            >
              <span className="text-sm font-semibold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
