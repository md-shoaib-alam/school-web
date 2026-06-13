"use client";

import { Button } from "@/components/ui/button";
import { Building2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/store/use-app-store";

interface SidebarHeaderProps {
  isSuperAdmin: boolean;
  sidebarOpen: boolean;
  tenantLogo: string | null;
  tenantName: string | null;
  currentUser: AppUser;
  onToggle: () => void;
}

export function SidebarHeader({
  isSuperAdmin,
  sidebarOpen,
  tenantLogo,
  tenantName,
  currentUser,
  onToggle,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        isSuperAdmin
          ? cn(
              "p-4 flex items-center border-b border-teal-800/50",
              sidebarOpen ? "justify-between" : "justify-center"
            )
          : cn(
              "mt-3 mb-2 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center",
              sidebarOpen
                ? "mx-3 p-3 rounded-xl justify-between"
                : "size-12 rounded-xl justify-center mx-auto"
            )
      )}
    >
      <div className={cn("flex items-center gap-3", !sidebarOpen && "lg:gap-0 lg:justify-center")}>
        {sidebarOpen && (
          <>
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center text-white shadow-md overflow-hidden shrink-0",
                isSuperAdmin ? "bg-teal-600" : "bg-emerald-600",
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
                <Building2 className="size-5" />
              )}
            </div>
            <div className="transition-all duration-300">
              <h2
                className={cn(
                  "font-bold text-sm",
                  isSuperAdmin
                    ? "text-white"
                    : "text-zinc-900 dark:text-zinc-100",
                )}
              >
                {isSuperAdmin
                  ? "SchoolSaaS"
                  : tenantName || "the school"}
              </h2>
              {isSuperAdmin && (
                <p className="text-xs text-rose-300">
                  Platform Console
                </p>
              )}
            </div>
          </>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "size-8 transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 rounded-lg",
          isSuperAdmin
            ? "text-teal-200 hover:text-white hover:bg-teal-800/40 border border-teal-800/50 bg-teal-900/20 shadow-sm"
            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900",
        )}
        onClick={onToggle}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="size-4" />
        ) : (
          <PanelLeftOpen className="size-4" />
        )}
      </Button>
    </div>
  );
}
