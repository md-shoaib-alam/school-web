"use client";

import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { roleColors, roleLabels, type NavItem } from "./nav-config";
import { firstNavMatch } from "./nav-sections";
import { useState, useEffect } from "react";

// Sub-components
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarSearch } from "./sidebar/SidebarSearch";
import { SidebarNav } from "./sidebar/SidebarNav";
import { SidebarFooter } from "./sidebar/SidebarFooter";

interface SidebarProps {
  items: NavItem[];
  resolvedScreen: string;
  navigateTo: (screen: string) => void;
  setIsChangePasswordOpen: (open: boolean) => void;
  layoutPref?: string | null;
}

export function Sidebar({ 
  items, 
  resolvedScreen, 
  navigateTo, 
  setIsChangePasswordOpen,
  layoutPref = "comprehensive"
}: SidebarProps) {
  const {
    currentUser,
    currentTenantName,
    currentTenantLogo,
    sidebarOpen,
    toggleSidebar,
    logout,
  } = useAppStore();
  const { replace } = useRouter();

  // What the rail's search holds; the list filters on it, and Enter goes to the first match.
  const [query, setQuery] = useState("");

  // State for expanded accordions
  const [expandedKeys, setExpandedKeys] = useState<string[]>(() => {
    // Auto-expand if a child is active
    const activeParent = items.find(item => 
      item.children?.some(child => child.key === resolvedScreen)
    );
    return activeParent ? [activeParent.key] : [];
  });

  useEffect(() => {
    const activeParent = items.find(item => 
      item.children?.some(child => child.key === resolvedScreen)
    );
    if (activeParent) {
      setExpandedKeys(prev => prev.includes(activeParent.key) ? prev : [...prev, activeParent.key]);
    }
  }, [resolvedScreen, items]);

  if (!currentUser) return null;

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => 
      prev.includes(key) ? [] : [key]
    );
  };

  const isSuperAdmin = currentUser.role === "super_admin";
  const isModernUI = true;
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const isMinimal = layoutPref === "minimal";

  if (isMinimal) return null;

  return (
    <aside
      className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ease-spring will-change-transform transform-gpu lg:transition-[width] lg:duration-300 lg:ease-spring lg:will-change-[width] lg:transform-none lg:h-full border-r overflow-hidden max-lg:rounded-r-2xl",
        isModernUI
          ? "bg-sidebar border-r "
          : "bg-sidebar border-sidebar-border",
        sidebarOpen 
          ? "w-72 translate-x-0 lg:w-72 lg:translate-x-0 shadow-2xl lg:shadow-none" 
          : "w-72 -translate-x-full lg:w-[72px] lg:translate-x-0",
      )}
    >
      <SidebarHeader 
        isSuperAdmin={isSuperAdmin}
        isModernUI={isModernUI}
        sidebarOpen={sidebarOpen}
        tenantLogo={currentTenantLogo}
        tenantName={currentTenantName}
        currentUser={currentUser}
        onToggle={toggleSidebar}
      />

      <SidebarSearch
        value={query}
        onChange={setQuery}
        sidebarOpen={sidebarOpen}
        onSubmit={() => {
          const key = firstNavMatch(currentUser.role, items, query);
          if (!key) return;
          navigateTo(key);
          setQuery("");
        }}
      />

      <SidebarNav 
        items={items}
        query={query}
        resolvedScreen={resolvedScreen}
        sidebarOpen={sidebarOpen}
        isSuperAdmin={isSuperAdmin}
        isModernUI={isModernUI}
        expandedKeys={expandedKeys}
        onToggleExpand={toggleExpand}
        onNavigate={navigateTo}
      />

      <SidebarFooter 
        isSuperAdmin={isSuperAdmin}
        isModernUI={isModernUI}
        sidebarOpen={sidebarOpen}
        currentUser={currentUser}
        initials={initials}
        roleColors={roleColors}
        roleLabels={roleLabels}
        onNavigate={navigateTo}
        onLogout={() => {
          replace(logout() ?? "/");
        }}
        onPasswordChange={() => setIsChangePasswordOpen(true)}
      />
    </aside>
  );
}
