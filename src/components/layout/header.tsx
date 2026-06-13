"use client";

import { useMemo, useState, useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Menu, ShieldCheck, School, Calendar, PanelLeftClose, PanelLeftOpen, LayoutDashboard, User, Crown, Settings as SettingsIcon, KeyRound, LogOut } from "lucide-react";
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

    window.addEventListener("schoolsaas_staff_sidebar_pref_changed", updateDashboardButton);
    window.addEventListener("schoolsaas_dashboard_layout_pref_changed", updateDashboardButton);
    return () => {
      window.removeEventListener("schoolsaas_staff_sidebar_pref_changed", updateDashboardButton);
      window.removeEventListener("schoolsaas_dashboard_layout_pref_changed", updateDashboardButton);
    };
  }, [currentUser, resolvedScreen]); // Removed layoutPref to fix array size change error

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
    <header className="shrink-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {!isMinimal && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden size-10 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all"
            onClick={toggleSidebar}
          >
            <Menu className="size-5" />
          </Button>
        )}
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
      <div className="flex items-center gap-2 lg:gap-4">
        <div className="hidden md:flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 mr-2" suppressHydrationWarning>
          <Calendar className="size-4 text-zinc-500 dark:text-zinc-400" />
          <span className="hidden lg:inline">{dates.full}</span>
          <span className="lg:hidden">{dates.short}</span>
        </div>
        <NotificationBell />
        <ThemeToggle />

        {isMinimal && (
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" className="p-0 size-10 rounded-full focus-visible:ring-0 hover:bg-transparent">
                <Avatar className="size-9 cursor-pointer hover:scale-105 transition-all">
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
              </Button>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 mt-2">
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
                  <User className="size-4 text-emerald-500" />
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
