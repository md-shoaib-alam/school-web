"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, ShieldCheck, School, Calendar, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { type NavItem } from "./nav-config";

interface HeaderProps {
  items: NavItem[];
  resolvedScreen: string;
}

export function Header({ items, resolvedScreen }: HeaderProps) {
  const {
    currentUser,
    toggleSidebar,
    currentTenantName,
    sidebarOpen,
  } = useAppStore();

  const todayString = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  if (!currentUser) return null;

  const isSuperAdmin = currentUser.role === "super_admin";

  return (
    <header className="shrink-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 shadow-sm transition-all"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {resolvedScreen === "profile"
            ? "My Profile"
            : items.find((i) => i.key === resolvedScreen)?.label || "Dashboard"}
        </h1>
        {isSuperAdmin && (
          <Badge className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 text-[10px]">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Platform Level
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!isSuperAdmin && currentTenantName && (
          <Badge variant="outline" className="hidden sm:flex gap-1 text-xs">
            <School className="h-3 w-3" />
            {currentTenantName}
          </Badge>
        )}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mr-2" suppressHydrationWarning>
          <Calendar className="h-4 w-4" />
          {todayString}
        </div>
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
