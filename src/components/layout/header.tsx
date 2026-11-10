"use client";

import { useMemo, useState, useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Menu, ShieldCheck, School, Calendar, PanelLeftClose, PanelLeftOpen, LayoutDashboard } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { type NavItem } from "./nav-config";
import { useRouter } from "next/navigation";
import { AccountMenu } from "./account/AccountMenu";

interface HeaderProps {
  items: NavItem[];
  resolvedScreen: string;
  layoutPref?: string | null;
  onPasswordChange?: () => void;
}

export function Header({ items, resolvedScreen, layoutPref = "comprehensive", onPasswordChange }: HeaderProps) {
  const { push, replace } = useRouter();
  const {
    currentUser,
    toggleSidebar,
    currentTenantName,
    sidebarOpen,
    setCurrentScreen
  } = useAppStore();

  const isModernUI = true;
  const [prefFromStorage, setPrefFromStorage] = useState<string | null>(null);

  useEffect(() => {
    const readPref = () => {
      if (typeof window === "undefined") return;
      const isStaff = currentUser?.role === "staff";
      if (isStaff) {
        const p = localStorage.getItem("schoolsaas_staff_sidebar_preference");
        setPrefFromStorage(p === "enabled" ? "comprehensive" : "minimal");
      } else {
        const p = localStorage.getItem("schoolsaas_dashboard_layout_preference");
        setPrefFromStorage(p || "comprehensive");
      }
    };

    readPref();

    const handlePrefChange = () => {
      readPref();
    };

    window.addEventListener("schoolsaas_dashboard_layout_pref_changed", handlePrefChange);
    window.addEventListener("schoolsaas_staff_sidebar_pref_changed", handlePrefChange);
    window.addEventListener("storage", handlePrefChange);
    return () => {
      window.removeEventListener("schoolsaas_dashboard_layout_pref_changed", handlePrefChange);
      window.removeEventListener("schoolsaas_staff_sidebar_pref_changed", handlePrefChange);
      window.removeEventListener("storage", handlePrefChange);
    };
  }, [currentUser]);

  const effectiveIsMinimal = layoutPref === "minimal" || prefFromStorage === "minimal";
  const shouldShowDashboard = resolvedScreen !== "dashboard" && effectiveIsMinimal;

  const dates = useMemo(() => {
    const now = new Date();
    return {
      weekday: now.toLocaleDateString("en-GB", { weekday: "long" }),
      shortWeekday: now.toLocaleDateString("en-GB", { weekday: "short" }),
      date: now.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      compact: now.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      full: now.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      short: now.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
    };
  }, []);

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
    const tid = currentUser.tenantSlug || currentUser.tenantId;
    if (tid) {
      push(`/${tid}/${screen}`);
    } else {
      push(`/${screen}`);
    }
  };

  return (
    <header className="shrink-0 z-30 bg-sidebar border-b border-border px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {!effectiveIsMinimal && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden size-8.5 sm:size-10 shrink-0 text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground bg-card hover:bg-accent border  shadow-xs transition-all"
            onClick={toggleSidebar}
          >
            <Menu className="size-4.5 sm:size-5" />
          </Button>
        )}

        {/* Back to Dashboard Button when in Minimal Mode */}
        {shouldShowDashboard && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 sm:gap-2 h-8.5 sm:h-9 px-2.5 sm:px-3.5 text-xs font-semibold text-foreground bg-card hover:bg-brand/10 border  hover:border-brand/40 hover:text-brand rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
            onClick={() => navigateTo("dashboard")}
          >
            <LayoutDashboard className="size-3.5 sm:size-4 text-brand shrink-0" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Button>
        )}

        {!isModernUI && !shouldShowDashboard && (
          <h1 className="text-sm sm:text-base md:text-lg font-semibold text-foreground truncate">
            {resolvedScreen === "profile"
              ? "My Profile"
              : items.find((i) => i.key === resolvedScreen)?.label || "Dashboard"}
          </h1>
        )}

        {/* Date Display Chip */}
        <div
          className={cn(
            "items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-muted border  text-xs font-medium text-foreground shadow-2xs select-none whitespace-nowrap shrink-0",
            shouldShowDashboard ? "hidden md:flex" : "flex",
            !effectiveIsMinimal && "hidden sm:flex"
          )}
          suppressHydrationWarning
        >
          <Calendar className="size-3.5 text-brand shrink-0" />
          {/* Compact on mobile: Wed, 16 Sep */}
          <span className="sm:hidden font-semibold text-foreground">
            {dates.shortWeekday}, {dates.compact}
          </span>
          {/* Full on sm+: Wednesday, 16 September 2026 */}
          <span className="hidden sm:inline font-semibold text-foreground">
            {dates.weekday},
          </span>
          <span className="hidden sm:inline text-muted-foreground">
            {dates.date}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <NotificationBell />
        <ThemeToggle />

        {/* Subtle Divider */}
        <div className="h-5 w-px bg-muted mx-0.5 sm:mx-1 hidden sm:block" />

        {/* User profile dropdown */}
        {(effectiveIsMinimal || isModernUI) && (
          <AccountMenu
            currentUser={currentUser}
            initials={initials}
            onNavigate={navigateTo}
            onPasswordChange={() => onPasswordChange?.()}
          />
        )}
      </div>
    </header>
  );
}
