"use client";

import { Button } from "@/components/ui/button";
import { Shield, Plus } from "lucide-react";

interface RoleHeaderProps {
  onCreateRole: () => void;
}

export function RoleHeader({ onCreateRole }: RoleHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2.5 sm:gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-8.5 sm:size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100/80 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
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
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-normal truncate">
            Define granular access control and assign roles to platform staff
          </p>
        </div>
      </div>

      <Button
        onClick={onCreateRole}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8.5 sm:h-9 px-3 sm:px-3.5 rounded-xl gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
      >
        <Plus className="size-3.5 stroke-[2.5]" />
        <span>Create Role</span>
      </Button>
    </div>
  );
}
