'use client';

import React from 'react';
import { Save, Loader2, CheckCircle2, PenLine } from 'lucide-react';
import { FixedDock } from '@/components/shared/fixed-dock';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';

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
  const { sidebarOpen } = useAppStore();

  return (
    <FixedDock
      className={cn(
        "fixed bottom-7 sm:bottom-6 z-40 pointer-events-none px-4 sm:px-4 transition-[left,right] duration-300 ease-spring",
        sidebarOpen ? "left-0 right-0 lg:left-[298px] lg:right-2.5" : "left-0 right-0 lg:left-[82px] lg:right-2.5"
      )}
    >
      <div className="pointer-events-auto flex justify-center w-full">
        <div
          role="status"
          aria-live="polite"
          className="w-full max-w-[420px] sm:max-w-[460px] flex items-center justify-between gap-2.5 sm:gap-3 p-2 pl-3 sm:pl-3.5 pr-2 rounded-2xl bg-card/95 border border-border shadow-[0_14px_34px_-12px_rgba(0,0,0,0.45)] backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300"
        >
          {/* Status icon tile */}
          <span
            className={cn(
              "shrink-0 size-8 rounded-[11px] grid place-items-center transition-all duration-300",
              isSaving
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                : hasChanges
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isSaving ? (
              <Loader2 className="size-[17px] animate-spin" strokeWidth={2.3} />
            ) : hasChanges ? (
              <PenLine className="size-[17px]" strokeWidth={2.2} />
            ) : (
              <CheckCircle2 className="size-[17px]" strokeWidth={2.2} />
            )}
          </span>

          {/* Status text */}
          <div className="flex-1 min-w-0 text-left">
            <b className="block text-[12.5px] sm:text-[13px] font-semibold text-foreground truncate leading-tight">
              {isSaving
                ? "Syncing attendance…"
                : hasChanges
                ? `${pendingCount} Unsaved Change${pendingCount > 1 ? "s" : ""}`
                : "All Attendance Saved"}
            </b>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate mt-0.5 leading-tight">
              {hasChanges ? (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="size-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                  <span>{activeTab === "teacher" ? "Teachers" : "Staff"} · Ready to save</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>No unsaved changes</span>
                </span>
              )}
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            title={!hasChanges ? "No changes to save" : "Save attendance"}
            className={cn(
              "shrink-0 h-[38px] px-3.5 sm:px-4 rounded-[13px] flex items-center gap-1.5 text-xs sm:text-[13px] font-bold transition-all",
              hasChanges && !isSaving
                ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-[#12c58b] dark:hover:bg-[#10b981] text-white dark:text-[#04140d] cursor-pointer shadow-sm active:scale-[0.97]"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-[15px] animate-spin" strokeWidth={2.3} />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Save className="size-[15px]" strokeWidth={2.3} />
                <span className="hidden sm:inline">Save {activeTab === "teacher" ? "Teachers" : "Staff"}</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </FixedDock>
  );
}
