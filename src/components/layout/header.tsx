"use client";

import { useMemo, useState, useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Menu, ShieldCheck, School, Calendar, PanelLeftClose, PanelLeftOpen, LayoutDashboard, User, Crown, Settings as SettingsIcon, KeyRound, LogOut, ChevronDown } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { type NavItem, roleColors, roleLabels } from "./nav-config";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    setCurrentScreen,
    logout
  } = useAppStore();

  const isMinimal = layoutPref === "minimal";
  const [showDashboardButton, setShowDashboardButton] = useState(false);

  useEffect(() => {
    const updateDashboardButton = () => {
      if (!currentUser || resolvedScreen === "dashboard") {
        setShowDashboardButton(false);
        return;
      }

      const isStaff = currentUser.role === "staff";
      
      if (isStaff) {
        const pref = localStorage.getItem("schoolsaas_staff_sidebar_preference");
        setShowDashboardButton(pref !== "enabled");
      } else {
        // For Admin, Teacher, Parent, and Student roles
        // Read directly from storage to ensure consistency and avoid hook size issues
        const lPref = localStorage.getItem("schoolsaas_dashboard_layout_preference") || "comprehensive";
        setShowDashboardButton(lPref === "minimal");
      }
    };

    updateDashboardButton();
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "schoolsaas_staff_sidebar_preference" ||
        e.key === "schoolsaas_dashboard_layout_preference"
      ) {
        updateDashboardButton();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [currentUser, resolvedScreen]);

  const dates = useMemo(() => {
    const now = new Date();
    return {
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

  const isSuperAdmin = currentUser.role === "super_admin";
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
    <header className="shrink-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {!isMinimal && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden size-9 sm:size-10 shrink-0 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-all"
            onClick={toggleSidebar}
          >
            <Menu className="size-5" />
          </Button>
        )}
        {!isSuperAdmin && (
          <h1 className="text-sm sm:text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {resolvedScreen === "profile"
              ? "My Profile"
              : items.find((i) => i.key === resolvedScreen)?.label || "Dashboard"}
          </h1>
        )}
        {showDashboardButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs"
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
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        )}

        {/* Date & Time Display on Left Side */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 pl-1" suppressHydrationWarning>
          <Calendar className="size-3.5 text-slate-400" />
          <span>{dates.full}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <NotificationBell />
        <ThemeToggle />

        {/* User profile dropdown */}
        {(isMinimal || isSuperAdmin) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" className="h-9 px-1.5 sm:px-2 gap-1.5 sm:gap-2 rounded-xl focus-visible:ring-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Avatar className="size-8 cursor-pointer shadow-xs">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} className="object-cover" />
                  <AvatarFallback
                    className={cn(
                      "text-white text-xs font-semibold",
                      roleColors[currentUser.role],
                    )}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    {currentUser.name}
                  </span>
                  {!isSuperAdmin && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {currentUser.customRole?.name || roleLabels[currentUser.role]}
                    </span>
                  )}
                </div>
                <ChevronDown className="size-3.5 text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-2">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="size-8">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} className="object-cover" />
                  <AvatarFallback className={cn("text-white text-[10px] font-semibold", roleColors[currentUser.role])}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigateTo("profile")}>
                <User className="size-4 text-blue-500" />
                My Profile
              </DropdownMenuItem>
              {currentUser.role === "admin" && (
                <>
                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigateTo("school-subscription")}>
                    <Crown className="size-4 text-amber-500" />
                    My Subscription
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigateTo("school-settings")}>
                    <SettingsIcon className="size-4 text-blue-500" />
                    School Settings
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => onPasswordChange?.()}>
                <KeyRound className="size-4 text-orange-500" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2 text-red-600" onClick={() => { logout(); window.location.href = "/"; }}>
                <LogOut className="size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
