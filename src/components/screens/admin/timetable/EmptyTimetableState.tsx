"use client";

import { Calendar } from "lucide-react";

export function EmptyTimetableState() {
  return (
    <div className="text-center py-24 text-muted-foreground bg-muted/5">
      <div className="size-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="size-8 opacity-20" />
      </div>
      <p className="font-medium">No timetable records found</p>
      <p className="text-xs max-w-[200px] mx-auto mt-1 opacity-60">
        Please add periods using the &quot;Manage&quot; button above.
      </p>
    </div>
  );
}
