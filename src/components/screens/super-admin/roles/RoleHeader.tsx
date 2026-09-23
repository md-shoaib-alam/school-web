"use client";

import { Button } from "@/components/ui/button";
import { Shield, Plus, LayoutGrid, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleHeaderProps {
  onCreateRole: () => void;
  activeTab: "templates" | "roles";
  onTabChange: (tab: "templates" | "roles") => void;
}

export function RoleHeader({
  onCreateRole,
  activeTab,
  onTabChange,
}: RoleHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="size-8.5 sm:size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100/80 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0">
          <Shield className="size-4 sm:size-4.5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="text-base sm:text-lg font-semibold text-foreground tracking-tight truncate">
              Roles &amp; Permissions
            </h2>
            <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-rose-50 text-rose-600 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60">
              <Shield className="size-2.5 text-rose-500" />
              Platform
            </span>
          </div>

          {/* In place of that text: Segmented Control like billing tabs */}
          <div className="mt-1.5 inline-grid grid-cols-2 h-9 p-1 rounded-xl bg-muted/70 border border-border">
            <button
              type="button"
              onClick={() => onTabChange("templates")}
              className={cn(
                "rounded-lg text-xs font-semibold px-3 sm:px-4 cursor-pointer transition-all flex items-center justify-center gap-1.5",
                activeTab === "templates"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-3.5 text-blue-600 dark:text-blue-400" />
              <span>Role Templates</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange("roles")}
              className={cn(
                "rounded-lg text-xs font-semibold px-3 sm:px-4 cursor-pointer transition-all flex items-center justify-center gap-1.5",
                activeTab === "roles"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserCheck className="size-3.5 text-blue-600 dark:text-blue-400" />
              <span>Your Roles</span>
            </button>
          </div>
        </div>
      </div>

      <Button
        onClick={onCreateRole}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8.5 sm:h-9 px-3 sm:px-3.5 rounded-xl gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer self-start sm:self-center"
      >
        <Plus className="size-3.5 stroke-[2.5]" />
        <span>Create Role</span>
      </Button>
    </div>
  );
}
