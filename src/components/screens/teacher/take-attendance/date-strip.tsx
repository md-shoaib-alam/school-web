"use client";

import { cn } from "@/lib/utils";
import { toKey } from "./date-utils";

// Mobile date picker: the current Monday-to-Sunday week as tall tiles.
export function DateStrip({
  date,
  disableDates,
  onSelect,
}: {
  date: string;
  disableDates: (d: Date) => boolean;
  onSelect: (key: string) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toKey(today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - ((today.getDay() + 6) % 7) + i);
    return d;
  });

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {week.map(d => {
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
              "grid aspect-[5/6] place-items-center rounded-xl border transition-colors",
              isSelected
                ? "border-emerald-600 bg-emerald-600 text-white"
                : disabled
                  ? "border-border bg-card text-muted-foreground/40 cursor-not-allowed"
                  : "border-border bg-card text-foreground hover:bg-muted/40",
              !isSelected && key === todayKey && "ring-1 ring-emerald-500/60",
            )}
          >
            <span className="sr-only">
              {d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </span>
            <span aria-hidden="true" className="flex flex-col items-center gap-0.5">
              <span className={cn("text-[10px] font-medium", isSelected ? "text-emerald-50" : "text-muted-foreground")}>
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-sm font-semibold">{d.getDate()}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
