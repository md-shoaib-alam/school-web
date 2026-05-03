"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { useTenantResolution } from "@/lib/graphql/hooks/platform.hooks";
import { hasPermission, isRootAdmin } from "@/lib/permissions";
import { ChangePasswordModal } from "@/components/modals/change-password-modal";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { navItems } from "./nav-config";
import { useIsFetching } from "@tanstack/react-query";
import { getCookie } from "@/lib/cookies";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { PlatformNoticeBar } from "./platform-notice-bar";

function LoadingProgress() {
  const isFetching = useIsFetching();
  if (isFetching === 0) return null;
  return <div className="loading-progress-bar" />;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams();
  const {
    currentUser,
    currentTenantId,
    currentTenantSlug,
    setCurrentTenant,
    currentScreen,
    setCurrentScreen,
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
      setCurrentTenant(
        resolvedTenant.id,
        resolvedTenant.name,
        resolvedTenant.slug,
        resolvedTenant.logo
      );

    }
  }, [resolvedTenant, currentTenantSlug, setCurrentTenant]);

  // Refresh permissions from DB on mount
  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  // Cookie guard: Redirect to login if cookie is missing while logged in
  useEffect(() => {
    const checkAuth = () => {
      const token = getCookie("school_token");
      if (!token && currentUser) {
        window.location.href = "/";
      }
    };

    // Check once on mount and then every few seconds
    checkAuth();
    const interval = setInterval(checkAuth, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) return null;

  // Determine current screen from pathname
  const parts = pathname.split("/").filter(Boolean);
  let resolvedScreen = "dashboard";
  if (parts.length >= 2) {
    resolvedScreen = parts[1];
  } else if (parts.length === 1) {
    const p = parts[0];
    const isTenantRoot =
      p === currentUser?.tenantId ||
      p === currentTenantSlug ||
      p === currentUser?.tenantSlug;
    resolvedScreen = isTenantRoot ? "dashboard" : p;
  }

  const isSuperAdmin = currentUser.role === "super_admin";
  const isRoot = isRootAdmin(currentUser);
  const hasCustomPermissions =
    !!currentUser.customRole?.permissions &&
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

  const navigateTo = useCallback((screen: string) => {
    setSidebarOpen(false);
    if (screen === currentScreen) return; // Skip if already on this screen
    
    setCurrentScreen(screen);
    const tenantIdentifier = currentTenantSlug || currentTenantId;

    // For Super Admins, platform routes should always be at the top level (e.g. /users, /feature-flags)
    // We only use the prefix if they are explicitly visiting a school's specific screen.
    const isPlatformRoute = [
      "dashboard",
      "tenants",
      "billing",
      "users",
      "audit-logs",
      "platform-analytics",
      "feature-flags",
      "roles",
      "staff",
      "manage-admins",
      "subscriptions",
      "settings",
      "school-subscriptions",
      "platform-notices",
    ].includes(screen);

    if (isSuperAdmin && isPlatformRoute) {
      router.push(`/${screen}`);
      return;
    }

    // Always use the full /[tenant]/[screen] pattern
    if (!tenantIdentifier) {
      router.push(`/${screen}`);
    } else {
      router.push(`/${tenantIdentifier}/${screen}`);
    }
  }, [currentScreen, currentTenantId, currentTenantSlug, isSuperAdmin, router, setCurrentScreen, setSidebarOpen]);

  // Listen for navigation events from children (e.g. SuperAdminDashboard Quick Actions)
  useEffect(() => {
    const handleNavigationEvent = (e: any) => {
      if (e.detail) {
        navigateTo(e.detail);
      }
    };
    window.addEventListener("super-admin-navigate", handleNavigationEvent);
    return () => window.removeEventListener("super-admin-navigate", handleNavigationEvent);
  }, [navigateTo]);

  return (
    <NotificationProvider>
      <div className="h-dvh flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        <PlatformNoticeBar />
        <div className="flex-1 flex overflow-hidden">
          <LoadingProgress />
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
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 overscroll-contain">
            {children}
          </main>
        </div>

        </div>
        <ChangePasswordModal
          open={isChangePasswordOpen}
          onOpenChange={setIsChangePasswordOpen}
        />
      </div>
    </NotificationProvider>
  );
}
