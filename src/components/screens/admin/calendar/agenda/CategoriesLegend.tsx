"use client";

import { ALL_EVENT_TYPES, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "../types";

export function CategoriesLegend() {
  return (
    <div className="bg-card border border-border shadow-xs rounded-2xl p-4 sm:p-5 shrink-0 mt-auto">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 border-b border-border pb-2">
        Event Categories
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
        {ALL_EVENT_TYPES.map((t) => (
          <div key={t} className="flex items-center gap-2 text-xs font-medium text-foreground">
            <span className="size-2 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: EVENT_TYPE_COLORS[t] }} />
            <span className="truncate tracking-tight text-xs">{EVENT_TYPE_LABELS[t]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
