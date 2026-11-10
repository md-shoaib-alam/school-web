"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { NavItem } from "../nav-config";
import { useAppStore } from "@/store/use-app-store";

interface SidebarNavProps {
  items: NavItem[];
  resolvedScreen: string;
  sidebarOpen: boolean;
  isSuperAdmin: boolean;
  isModernUI?: boolean;
  expandedKeys: string[];
  onToggleExpand: (key: string) => void;
  onNavigate: (screen: string) => void;
}

export function SidebarNav({
  items,
  resolvedScreen,
  sidebarOpen,
  isSuperAdmin,
  isModernUI = true,
  expandedKeys,
  onToggleExpand,
  onNavigate,
}: SidebarNavProps) {
  return (
    <nav 
      data-lenis-scroll-container
      className={cn(
        "flex-1 overflow-y-auto p-3 sidebar-scrollbar overscroll-contain touch-pan-y", 
        !sidebarOpen && "lg:px-2"
      )}
    >
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
                    ? isModernUI
                      ? "!bg-brand !text-brand-foreground font-semibold rounded-xl shadow-xs [&_svg]:!text-brand-foreground"
                      : "bg-muted dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] border  dark:border-emerald-900/50 hover:bg-muted dark:hover:bg-emerald-900/50 font-semibold"
                    : isModernUI
                      ? "!text-foreground dark:!text-muted-foreground hover:!text-foreground hover:bg-accent rounded-xl [&_svg]:!text-foreground dark:[&_svg]:!text-muted-foreground"
                      : "text-foreground border border-transparent hover:bg-accent hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover: dark:hover:border-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400",
                  isActive && hasChildren && (isModernUI ? "!text-brand font-semibold dark:!text-brand [&_svg]:!text-brand" : "text-emerald-700 font-semibold dark:text-emerald-400")
                )}
                onClick={() => {
                  if (!sidebarOpen) {
                    // Expand sidebar first when any tab is clicked in collapsed mode
                    useAppStore.getState().setSidebarOpen(true);
                    if (hasChildren && !isExpanded) {
                      onToggleExpand(item.key);
                    }
                    if (!hasChildren) {
                      onNavigate(item.key);
                    }
                  } else {
                    // Normal behavior when sidebar is already open
                    if (hasChildren) {
                      onToggleExpand(item.key);
                    } else {
                      onNavigate(item.key);
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
                <div className={cn(
                  "ml-4 pl-4 border-l space-y-1 mt-1 animate-in slide-in-from-top-1 duration-200",
                  isModernUI ? "" : "border-sidebar-border"
                )}>
                  {item.children?.map((child) => (
                    <Button
                      key={child.key}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-9 px-3 font-normal cursor-pointer transition-all text-sm",
                        resolvedScreen === child.key
                          ? isModernUI
                            ? "!bg-brand !text-brand-foreground font-semibold rounded-xl shadow-xs [&_svg]:!text-brand-foreground"
                            : "bg-muted dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] border  dark:border-emerald-900/50 hover:bg-muted dark:hover:bg-emerald-900/50 font-semibold"
                          : isModernUI
                            ? "!text-foreground dark:!text-muted-foreground hover:!text-foreground hover:bg-accent rounded-xl"
                            : "text-muted-foreground border border-transparent hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-accent hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:"
                      )}
                      onClick={() => onNavigate(child.key)}
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
  );
}
