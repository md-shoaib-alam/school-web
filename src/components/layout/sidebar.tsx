"use client";

import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
        "fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:h-dvh border-r overflow-hidden",
        isSuperAdmin
          ? "bg-gradient-to-b from-teal-950 to-teal-900 border-teal-800/50"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Sidebar Header */}
      <div
        className={cn(
          "p-4 flex items-center justify-between border-b",
          isSuperAdmin
            ? "border-teal-800/50"
            : "border-gray-100 dark:border-gray-800",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md",
              isSuperAdmin ? "bg-teal-600" : "bg-emerald-600",
            )}
          >
            <Building2 className="h-5 w-5" />
          </div>
          <div>
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
                : currentTenantName || "Sigel School"}
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
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "lg:hidden",
            isSuperAdmin
              ? "text-rose-300 hover:text-white hover:bg-rose-800"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
          )}
          onClick={toggleSidebar}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 sidebar-scrollbar overscroll-contain">
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
                    isActive && !hasChildren
                      ? isSuperAdmin
                        ? "bg-rose-800/60 text-white font-medium"
                        : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-medium"
                      : isSuperAdmin
                        ? "text-rose-200 hover:text-white hover:bg-rose-800/40"
                        : "text-gray-600 dark:text-gray-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400",
                    isActive && hasChildren && "text-emerald-700 dark:text-emerald-400"
                  )}
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpand(item.key);
                    } else {
                      navigateTo(item.key);
                    }
                  }}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasChildren ? (
                    isExpanded ? <ChevronDown className="h-4 w-4 opacity-50" /> : <ChevronRight className="h-4 w-4 opacity-50" />
                  ) : item.badge && (
                    <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                </Button>

                {/* Sub Items (Accordion) */}
                {hasChildren && isExpanded && (
                  <div className="ml-4 pl-4 border-l border-gray-100 dark:border-gray-800 space-y-1 mt-1 animate-in slide-in-from-top-1 duration-200">
                    {item.children?.map((child) => (
                      <Button
                        key={child.key}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-9 px-3 font-normal cursor-pointer transition-all text-sm",
                          resolvedScreen === child.key
                            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium"
                            : "text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/30"
                        )}
                        onClick={() => navigateTo(child.key)}
                      >
                        {child.icon}
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
          "p-4 border-t",
          isSuperAdmin
            ? "border-rose-800/50"
            : "border-gray-100 dark:border-gray-800",
        )}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
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
                  "h-8 w-8",
                  isSuperAdmin
                    ? "text-rose-300 hover:bg-rose-800/60 hover:text-white"
                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
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
                onClick={() => setIsChangePasswordOpen(true)}
              >
                <KeyRound className="h-4 w-4 text-orange-500" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
