"use client";

import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  ChevronLeft,
  Settings,
  KeyRound,
  LogOut,
  ChevronDown,
  ChevronRight,
  Crown,
  User,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isRootAdmin } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { navItems, roleColors, roleLabels, type NavItem } from "./nav-config";
import { useState } from "react";

interface SidebarProps {
  items: NavItem[];
  resolvedScreen: string;
  navigateTo: (screen: string) => void;
  setIsChangePasswordOpen: (open: boolean) => void;
}

export function Sidebar({ 
  items, 
  resolvedScreen, 
  navigateTo, 
  setIsChangePasswordOpen 
}: SidebarProps) {
  const {
    currentUser,
    currentTenantName,
    currentTenantLogo,
    sidebarOpen,
    toggleSidebar,
    logout,
  } = useAppStore();
  const router = useRouter();
  
  // State for expanded accordions
  const [expandedKeys, setExpandedKeys] = useState<string[]>(() => {
    // Auto-expand if a child is active
    const activeParent = items.find(item => 
      item.children?.some(child => child.key === resolvedScreen)
    );
    return activeParent ? [activeParent.key] : [];
  });

  if (!currentUser) return null;

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isSuperAdmin = currentUser.role === "super_admin";
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <aside
      className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 lg:h-dvh border-r overflow-hidden",
        isSuperAdmin
          ? "bg-gradient-to-b from-teal-950 to-teal-900 border-teal-800/50"
          : "bg-sidebar border-sidebar-border",
        sidebarOpen 
          ? "w-72 translate-x-0 lg:w-72 lg:translate-x-0" 
          : "w-0 -translate-x-full lg:w-[72px] lg:translate-x-0",
      )}
    >
      {/* Sidebar Header */}
      <div
        className={cn(
          isSuperAdmin
            ? cn(
                "p-4 flex items-center border-b border-teal-800/50",
                sidebarOpen ? "justify-between" : "justify-center"
              )
            : cn(
                "mt-3 mb-2 bg-white dark:bg-zinc-950 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex items-center",
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
                    src={currentTenantLogo || currentUser?.tenantLogo || "/test.webp"} 
                    alt={currentTenantName || "School Logo"} 
                    className="size-full object-cover" 
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
                      : "text-gray-900 dark:text-gray-100",
                  )}
                >
                  {isSuperAdmin
                    ? "SchoolSaaS"
                    : currentTenantName || "the school"}
                </h2>
                <p
                  className={cn(
                    "text-xs",
                    isSuperAdmin ? "text-rose-300" : "text-gray-400",
                  )}
                >
                  {isSuperAdmin ? "Platform Console" : "Management System"}
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
            isSuperAdmin
              ? "text-teal-200 hover:text-white hover:bg-teal-800/40 border border-teal-800/50 bg-teal-900/20 shadow-sm"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900",
          )}
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto py-3 px-3 sidebar-scrollbar overscroll-contain", !sidebarOpen && "lg:px-2")}>
        <div className="space-y-1">
          {items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedKeys.includes(item.key);
            const isChildActive = item.children?.some(c => c.key === resolvedScreen);
            const isActive = resolvedScreen === item.key || isChildActive;

            return (
              <div key={item.key} className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3 font-normal cursor-pointer transition-all",
                    !sidebarOpen && "lg:justify-center lg:px-0 lg:gap-0",
                    isActive && !hasChildren
                      ? isSuperAdmin
                        ? "bg-rose-800/60 text-white font-medium"
                        : "bg-white dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] border border-gray-200/80 dark:border-emerald-900/50 hover:bg-white dark:hover:bg-emerald-900/50 font-semibold"
                      : isSuperAdmin
                        ? "text-rose-200 hover:text-white hover:bg-rose-800/40"
                        : "text-gray-600 dark:text-gray-400 border border-transparent hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-200/80 dark:hover:border-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400",
                    isActive && hasChildren && "text-emerald-700 font-semibold dark:text-emerald-400"
                  )}
                  onClick={() => {
                    if (!sidebarOpen) {
                      // Expand sidebar first when any tab is clicked in collapsed mode
                      useAppStore.getState().setSidebarOpen(true);
                      if (hasChildren && !isExpanded) {
                        toggleExpand(item.key);
                      }
                      if (!hasChildren) {
                        navigateTo(item.key);
                      }
                    } else {
                      // Normal behavior when sidebar is already open
                      if (hasChildren) {
                        toggleExpand(item.key);
                      } else {
                        navigateTo(item.key);
                      }
                    }
                  }}
                >
                  <div className="shrink-0 flex items-center justify-center size-5">
                    {item.icon}
                  </div>
                  <span className={cn("flex-1 text-left transition-all duration-300", !sidebarOpen && "lg:hidden")}>{item.label}</span>
                  {sidebarOpen && (
                    <>
                      {hasChildren ? (
                        isExpanded ? <ChevronDown className="size-4 opacity-50" /> : <ChevronRight className="size-4 opacity-50" />
                      ) : item.badge && (
                        <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>

                {/* Sub Items (Accordion) */}
                {hasChildren && isExpanded && sidebarOpen && (
                  <div className="ml-4 pl-4 border-l border-sidebar-border space-y-1 mt-1 animate-in slide-in-from-top-1 duration-200">
                    {item.children?.map((child) => (
                      <Button
                        key={child.key}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-9 px-3 font-normal cursor-pointer transition-all text-sm",
                          resolvedScreen === child.key
                            ? "bg-white dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] border border-gray-200/80 dark:border-emerald-900/50 hover:bg-white dark:hover:bg-emerald-900/50 font-semibold"
                            : "text-gray-500 border border-transparent hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-200/80"
                        )}
                        onClick={() => navigateTo(child.key)}
                      >
                        <div className="shrink-0 flex items-center justify-center size-4">
                          {child.icon}
                        </div>
                        {child.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div
        className={cn(
          isSuperAdmin
            ? cn(
                "p-4 border-t border-rose-800/50",
                !sidebarOpen && "flex items-center justify-center"
              )
            : cn(
                "bg-white dark:bg-zinc-950 border border-gray-200/80 dark:border-zinc-800 shadow-sm",
                sidebarOpen
                  ? "mx-3 mb-3 p-3 rounded-xl"
                  : "size-12 mb-3 rounded-xl flex items-center justify-center mx-auto"
              )
        )}
      >
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
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
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  isSuperAdmin
                    ? "text-white"
                    : "text-gray-900 dark:text-gray-100",
                )}
              >
                {currentUser.name}
              </p>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  isSuperAdmin
                    ? "bg-rose-800/60 text-rose-200 hover:bg-rose-800/60"
                    : "",
                )}
              >
                {currentUser.customRole?.name || roleLabels[currentUser.role]}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-8",
                    isSuperAdmin
                      ? "text-rose-300 hover:bg-rose-800/60 hover:text-white"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <Settings className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="size-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} className="object-cover" />
                    <AvatarFallback
                      className={cn(
                        "text-white text-[10px] font-semibold",
                        roleColors[currentUser.role],
                      )}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer gap-2"
                  onClick={() => navigateTo("profile")}
                >
                  <User className="size-4 text-emerald-500" />
                  My Profile
                </DropdownMenuItem>
                {currentUser.role === "admin" && (
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2"
                    onClick={() => navigateTo("school-subscription")}
                  >
                    <Crown className="size-4 text-amber-500" />
                    My Subscription
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="cursor-pointer gap-2"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  <KeyRound className="size-4 text-orange-500" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                  onClick={() => {
                    logout();
                    router.replace("/");
                  }}
                >
                  <LogOut className="size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 size-9 rounded-full focus-visible:ring-0">
                  <Avatar className="size-9 cursor-pointer hover:opacity-85 transition-opacity">
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
              <DropdownMenuContent align="start" className="w-56 ml-2">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="size-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} className="object-cover" />
                    <AvatarFallback
                      className={cn(
                        "text-white text-[10px] font-semibold",
                        roleColors[currentUser.role],
                      )}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer gap-2"
                  onClick={() => navigateTo("profile")}
                >
                  <User className="size-4 text-emerald-500" />
                  My Profile
                </DropdownMenuItem>
                {currentUser.role === "admin" && (
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2"
                    onClick={() => navigateTo("school-subscription")}
                  >
                    <Crown className="size-4 text-amber-500" />
                    My Subscription
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="cursor-pointer gap-2"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  <KeyRound className="size-4 text-orange-500" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                  onClick={() => {
                    logout();
                    router.replace("/");
                  }}
                >
                  <LogOut className="size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </aside>
  );
}
