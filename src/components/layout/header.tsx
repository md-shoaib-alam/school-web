"use client";

import { useMemo, useState, useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, ShieldCheck, School, Calendar, PanelLeftClose, PanelLeftOpen, LayoutDashboard } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { type NavItem } from "./nav-config";
import { useRouter } from "next/navigation";

interface HeaderProps {
  items: NavItem[];
  resolvedScreen: string;
}

export function Header({ items, resolvedScreen }: HeaderProps) {
  const { push } = useRouter();
  const {
    currentUser,
    toggleSidebar,
    currentTenantName,
    sidebarOpen,
    setCurrentScreen,
  } = useAppStore();

  const [showDashboardButton, setShowDashboardButton] = useState(false);

  useEffect(() => {
    const updateDashboardButton = () => {
      if (currentUser?.role === "staff" && resolvedScreen !== "dashboard") {
        const pref = localStorage.getItem("schoolsaas_staff_sidebar_preference");
        setShowDashboardButton(pref !== "enabled");
      } else {
        setShowDashboardButton(false);
      }
    };

    updateDashboardButton();

    window.addEventListener("schoolsaas_staff_sidebar_pref_changed", updateDashboardButton);
    return () => {
      window.removeEventListener("schoolsaas_staff_sidebar_pref_changed", updateDashboardButton);
    };
  }, [currentUser?.role, resolvedScreen]);

  const dates = useMemo(() => {
    try {
      const now = new Date();
      const day = now.getDate();
      const month = now.toLocaleDateString("en-US", { month: "long" });
      const year = now.getFullYear();
      const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
      
      const datePart = `${day} ${month}, ${year}`;
      return {
        full: `${weekday}, ${datePart}`,
        short: datePart
      };
    } catch (e) {
      return { full: "", short: "" };
    }
  }, []);

  if (!currentUser) return null;

  const isSuperAdmin = currentUser.role === "super_admin";

  return (
    <header className="shrink-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden size-10 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all"
          onClick={toggleSidebar}
        >
          <Menu className="size-5" />
        </Button>
        <h1 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {resolvedScreen === "profile"
            ? "My Profile"
            : items.find((i) => i.key === resolvedScreen)?.label || "Dashboard"}
        </h1>
        {showDashboardButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm"
            onClick={() => {
              setCurrentScreen("dashboard");
              const tid = currentUser.tenantSlug || currentUser.tenantId;
              if (tid) {
                push(`/${tid}/dashboard`);
              } else {
                push(`/dashboard`);
              }
            }}
          >
            <LayoutDashboard className="size-3.5 text-zinc-500" />
            <span>Dashboard</span>
          </Button>
        )}
        {isSuperAdmin && (
          <Badge className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 text-[10px]">
            <ShieldCheck className="size-3 mr-1" />
            Platform Level
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 mr-2" suppressHydrationWarning>
          <Calendar className="size-4 text-zinc-500 dark:text-zinc-400" />
          <span className="hidden lg:inline">{dates.full}</span>
          <span className="lg:hidden">{dates.short}</span>
        </div>
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
