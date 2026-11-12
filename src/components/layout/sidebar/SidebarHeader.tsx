"use client";

import { Button } from "@/components/ui/button";
import { GraduationCap, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/store/use-app-store";

interface SidebarHeaderProps {
  isSuperAdmin: boolean;
  isModernUI?: boolean;
  sidebarOpen: boolean;
  tenantLogo: string | null;
  tenantName: string | null;
  currentUser: AppUser;
  onToggle: () => void;
}

export function SidebarHeader({
  isSuperAdmin,
  isModernUI = true,
  sidebarOpen,
  tenantLogo,
  tenantName,
  currentUser,
  onToggle,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "relative h-14 sm:h-16 flex items-center border-b bg-sidebar overflow-hidden px-3.5 transition-all duration-300 ease-spring",
        isModernUI ? "" : "mt-3 mb-2 bg-card border shadow-sm mx-3 p-3 rounded-xl"
      )}
    >
      {/* Brand logo + School name: smoothly shrinks and fades on collapse without snapping */}
      <div
        className={cn(
          "flex items-center gap-3 min-w-0 transition-all duration-300 ease-spring overflow-hidden",
          sidebarOpen
            ? "flex-1 opacity-100 max-w-[210px]"
            : "w-0 max-w-0 opacity-0 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center text-white shadow-xs overflow-hidden shrink-0",
            isSuperAdmin
              ? "bg-gradient-to-br from-brand to-indigo-700 shadow-brand/20"
              : "border bg-card",
          )}
        >
          {!isSuperAdmin ? (
            <img
              src={tenantLogo || currentUser?.tenantLogo || "/test.webp"}
              alt={tenantName || "School Logo"}
              className="size-full object-cover"
              loading="eager"
            />
          ) : (
            <GraduationCap className="size-6 text-white" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className={cn(
              "font-normal text-base leading-tight whitespace-nowrap truncate",
              isSuperAdmin
                ? "text-brand"
                : "text-foreground",
            )}
          >
            {isSuperAdmin
              ? "SchoolConnect"
              : tenantName || currentUser?.tenantName || "Demo Academy"}
          </h2>
        </div>
      </div>

      {/* Collapse / Expand toggle button: smoothly slides into center in collapsed rail */}
      <div
        className={cn(
          "flex items-center justify-center shrink-0 transition-all duration-300 ease-spring",
          sidebarOpen ? "ml-auto" : "mx-auto"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="size-8 transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={onToggle}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
