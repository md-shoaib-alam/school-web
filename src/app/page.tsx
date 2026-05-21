"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { useRouter, redirect } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { apiFetch } from "@/lib/api";
import {
  MaintenanceScreen,
  LoginScreen,
} from "@/components/screens";
import { FullPageSkeleton } from "@/components/ui/full-page-skeleton";

// Prevents hydration mismatch: returns false on server, true on client
const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export default function Home() {
  const { isLoggedIn, currentUser, currentScreen, currentTenantId } =
    useAppStore();
  const mounted = useHydrated();
  const router = useRouter();
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);

  const userRole = currentUser?.role;
  const userTenantSlug = currentUser?.tenantSlug;
  const userTenantId = currentUser?.tenantId;

  // Check maintenance mode for non-super_admin users
  useEffect(() => {
    if (!isLoggedIn || !currentUser || userRole === "super_admin") {
      queueMicrotask(() => {
        setMaintenanceLoading(false);
      });
      return;
    }
    
    queueMicrotask(() => {
      setMaintenanceLoading(true);
    });
    let cancelled = false;
    
    apiFetch("/api/platform-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          const modeSetting = data.find((s: any) => s.key === "maintenance_mode");
          const msgSetting = data.find((s: any) => s.key === "maintenance_message");
          setMaintenanceActive(modeSetting?.value === "true");
          if (msgSetting?.value) {
            setMaintenanceMessage(msgSetting.value);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setMaintenanceLoading(false);
      });
      
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, currentUser, userRole]);

  // Not mounted yet → render nothing (avoids hydration mismatch)
  if (!mounted) return null;

  // Unified Redirection Logic: Redirect to tenant-specific URL if logged in
  if (isLoggedIn && currentUser) {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const isSuperAdmin = userRole === "super_admin";
    const expectedPrefix =
      userTenantSlug || userTenantId || currentTenantId;

    // Only redirect if we are literally at the root "/"
    if (parts.length === 0 && (expectedPrefix || isSuperAdmin)) {
      const url = !expectedPrefix
        ? `/${currentScreen}`
        : currentScreen === "dashboard"
          ? `/${expectedPrefix}`
          : `/${expectedPrefix}/${currentScreen}`;

      redirect(url);
    }
  }

  // Not logged in → show login
  if (!isLoggedIn) return <LoginScreen />;

  // Maintenance mode check
  const isSuperAdmin = userRole === "super_admin";
  if (isLoggedIn && !isSuperAdmin && maintenanceLoading) {
    return <FullPageSkeleton />;
  }

  if (isLoggedIn && !isSuperAdmin && maintenanceActive) {
    return <MaintenanceScreen message={maintenanceMessage} />;
  }

  // If we are still here and logged in, we are likely at the root "/" and redirecting.
  // We show a skeleton while the router.replace kicks in.
  return <FullPageSkeleton />;
}
