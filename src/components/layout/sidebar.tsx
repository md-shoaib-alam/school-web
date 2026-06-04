"use client";

import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { roleColors, roleLabels, type NavItem } from "./nav-config";
import { useState, useEffect } from "react";

// Sub-components
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNav } from "./sidebar/SidebarNav";
import { SidebarFooter } from "./sidebar/SidebarFooter";

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
  const { replace } = useRouter();

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
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <aside
      className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 lg:h-full border-r overflow-hidden",
        isSuperAdmin
          ? "bg-gradient-to-b from-teal-950 to-teal-900 border-teal-800/50"
          : "bg-sidebar border-sidebar-border",
        sidebarOpen 
          ? "w-72 translate-x-0 lg:w-72 lg:translate-x-0" 
          : "w-0 -translate-x-full lg:w-[72px] lg:translate-x-0",
      )}
    >
      <SidebarHeader 
        isSuperAdmin={isSuperAdmin}
        sidebarOpen={sidebarOpen}
        tenantLogo={currentTenantLogo}
        tenantName={currentTenantName}
        currentUser={currentUser}
        onToggle={toggleSidebar}
      />

      <SidebarNav 
        items={items}
        resolvedScreen={resolvedScreen}
        sidebarOpen={sidebarOpen}
        isSuperAdmin={isSuperAdmin}
        expandedKeys={expandedKeys}
        onToggleExpand={toggleExpand}
        onNavigate={navigateTo}
      />

      <SidebarFooter 
        isSuperAdmin={isSuperAdmin}
        sidebarOpen={sidebarOpen}
        currentUser={currentUser}
        initials={initials}
        roleColors={roleColors}
        roleLabels={roleLabels}
        onNavigate={navigateTo}
        onLogout={() => {
          logout();
          replace("/");
        }}
        onPasswordChange={() => setIsChangePasswordOpen(true)}
      />
    </aside>
  );
}
