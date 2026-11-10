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
        isModernUI
          ? cn(
              "px-5 h-14 sm:h-16 flex items-center border-b  bg-sidebar",
              sidebarOpen ? "justify-between" : "justify-center"
            )
          : cn(
              "mt-3 mb-2 bg-card border  shadow-sm flex items-center",
              sidebarOpen
                ? "mx-3 p-3 rounded-xl justify-between"
                : "size-12 rounded-xl justify-center mx-auto"
            )
      )}
    >
      <div className={cn("flex items-center gap-3", !sidebarOpen && "lg:gap-0 lg:justify-center")}>
        {sidebarOpen && (
          <>
            {/* SchoolConnect Graduation Cap or School Logo Container */}
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center text-white shadow-xs overflow-hidden shrink-0",
                isSuperAdmin 
                  ? "bg-gradient-to-br from-brand to-indigo-700 shadow-brand/20" 
                  : "border  bg-card",
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
            <div className="transition-all duration-300">
              <h2
                className={cn(
                  "font-extrabold text-base leading-tight tracking-tight",
                  isSuperAdmin
                    ? "text-brand"
                    : "text-foreground",
                )}
              >
                {isSuperAdmin
                  ? "SchoolConnect"
                  : tenantName || currentUser?.tenantName || "Demo Academy"}
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium">
                {isSuperAdmin
                  ? "Platform Console"
                  : currentUser?.role === "teacher"
                  ? "Teacher Portal"
                  : currentUser?.role === "student"
                  ? "Student Portal"
                  : currentUser?.role === "parent"
                  ? "Parent Portal"
                  : currentUser?.role === "staff"
                  ? "Staff Portal"
                  : "Admin Portal"}
              </p>
            </div>
          </>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "size-8 transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 rounded-lg",
          isModernUI
            ? "text-muted-foreground hover:text-foreground hover:bg-accent"
            : "text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground hover:bg-accent",
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
