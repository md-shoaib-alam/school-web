"use client";

import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, ShieldCheck, School, Calendar } from "lucide-react";
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
  } = useAppStore();

  if (!currentUser) return null;

  const isSuperAdmin = currentUser.role === "super_admin";

  return (
    <header className="shrink-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {items.find((i) => i.key === resolvedScreen)?.label ||
            "Dashboard"}
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
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mr-2">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
