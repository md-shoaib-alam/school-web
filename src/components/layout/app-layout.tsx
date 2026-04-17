"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { useTenantResolution } from "@/lib/graphql/hooks/platform.hooks";
import { hasPermission, isRootAdmin } from "@/lib/permissions";
import { ChangePasswordModal } from "@/components/modals/change-password-modal";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { navItems } from "./nav-config";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams();
  const {
    currentUser,
    currentTenantId,
    currentTenantSlug,
    setCurrentTenant,
    sidebarOpen,
    setSidebarOpen,
    refreshPermissions,
  } = useAppStore();
  
  const pathname = usePathname();
  const router = useRouter();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Sync tenant context from slug
  const { data: resolvedTenant } = useTenantResolution(slug as string);

  useEffect(() => {
    if (resolvedTenant && resolvedTenant.slug !== currentTenantSlug) {
      setCurrentTenant(resolvedTenant.id, resolvedTenant.name, resolvedTenant.slug);
    }
  }, [resolvedTenant, currentTenantSlug, setCurrentTenant]);

  // Refresh permissions from DB on mount
  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  if (!currentUser) return null;

  // Determine current screen from pathname
  const parts = pathname.split("/").filter(Boolean);
  let resolvedScreen = "dashboard";
  if (parts.length >= 2) {
    resolvedScreen = parts[1];
  } else if (parts.length === 1) {
    const p = parts[0];
    const isTenantRoot = p === currentUser?.tenantId || p === currentTenantSlug || p === currentUser?.tenantSlug;
    resolvedScreen = isTenantRoot ? "dashboard" : p;
  }

  const isSuperAdmin = currentUser.role === "super_admin";
  const isRoot = isRootAdmin(currentUser);
  const hasCustomPermissions = !!currentUser.customRole?.permissions &&
    Object.keys(currentUser.customRole.permissions).length > 0;
  const hasPlatformPermissions = isSuperAdmin && !!currentUser.platformRole;

  // Filter nav items based on permissions
  const allItems = navItems[currentUser.role];
  const items = allItems.filter((item) => {
    if (item.key === "dashboard") return true;
    if (item.rootOnly && !isRoot) return false;
    if (hasPlatformPermissions && item.permModule) {
      return hasPermission(currentUser, item.permModule, "view");
    }
    if (hasCustomPermissions && item.permModule) {
      return hasPermission(currentUser, item.permModule, "view");
    }
    return true;
  });

  const navigateTo = (screen: string) => {
    setSidebarOpen(false);
    const tenantIdentifier = currentTenantSlug || currentTenantId;
    const url = !tenantIdentifier
      ? screen === "dashboard"
        ? "/"
        : `/${screen}`
      : screen === "dashboard"
        ? `/${tenantIdentifier}`
        : `/${tenantIdentifier}/${screen}`;
    router.push(url);
  };

  return (
    <div className="h-dvh flex overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        items={items} 
        resolvedScreen={resolvedScreen} 
        navigateTo={navigateTo}
        setIsChangePasswordOpen={setIsChangePasswordOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header items={items} resolvedScreen={resolvedScreen} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>

      <ChangePasswordModal 
        open={isChangePasswordOpen} 
        onOpenChange={setIsChangePasswordOpen} 
      />
    </div>
  );
}
