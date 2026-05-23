"use client";

import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface AttendanceFooterProps {
  hasChanges: boolean;
  pendingCount: number;
  activeTab: string;
  isSaving: boolean;
  onSave: () => void;
}

export function AttendanceFooter({
  hasChanges,
  pendingCount,
  activeTab,
  isSaving,
  onSave,
}: AttendanceFooterProps) {
  return (
    <div className="fixed bottom-6 left-6 right-6 lg:left-[calc(18rem+1.5rem)] lg:right-10 flex flex-col sm:flex-row items-center justify-between bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-4 px-6 rounded-2xl shadow-2xl border border-zinc-100/20 dark:border-zinc-800/50 gap-4 z-[100]">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {hasChanges ? (
          <div className="flex items-center gap-3">
            <div className="size-2 bg-violet-500 rounded-full animate-ping" />
            <span className="text-xs font-bold text-violet-500 uppercase tracking-widest">
              {pendingCount} Pending in{" "}
              {activeTab === "teacher" ? "Teachers" : "Staff"}
            </span>
          </div>
        ) : (
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic hidden sm:inline">
            No unsaved changes
          </span>
        )}
      </div>
      <Button
        onClick={onSave}
        disabled={isSaving || !hasChanges}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 h-12 shadow-lg shadow-blue-500/20 font-bold"
      >
        {isSaving ? (
          "Syncing..."
        ) : (
          <span className="flex items-center justify-center gap-2 tracking-wide">
            <Save className="size-4" /> Save {activeTab} Attendance
          </span>
        )}
      </Button>
    </div>
  );
}
