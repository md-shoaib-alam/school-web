"use client";

import { UserCheck } from "lucide-react";

export function AttendanceEmptyState() {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed  rounded-3xl">
      <div className="p-4 bg-muted rounded-full">
        <UserCheck className="size-12 text-muted-foreground" />
      </div>
      <div className="max-w-xs">
        <h4 className="text-lg font-medium text-foreground">
          Ready to track?
        </h4>
        <p className="text-sm text-muted-foreground italic">
          Please select a class from the dropdown above to view student
          attendance data.
        </p>
      </div>
    </div>
  );
}
