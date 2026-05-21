"use client";

import { useEffect, useSyncExternalStore, useReducer } from "react";
import { useRouter } from "next/navigation";
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

interface MaintenanceState {
  active: boolean;
  message: string;
  loading: boolean;
}

type MaintenanceAction = 
  | { type: 'START_LOADING' }
  | { type: 'SET_DATA', payload: { active: boolean, message: string } }
  | { type: 'STOP_LOADING' };

function maintenanceReducer(state: MaintenanceState, action: MaintenanceAction): MaintenanceState {
  switch (action.type) {
    case 'START_LOADING': return { ...state, loading: true };
    case 'SET_DATA': return { ...state, active: action.payload.active, message: action.payload.message, loading: false };
    case 'STOP_LOADING': return { ...state, loading: false };
    default: return state;
  }
}

export default function HomeClient() {
  const { isLoggedIn, currentUser, currentScreen, currentTenantId } =
    useAppStore();
  const mounted = useHydrated();
  const router = useRouter();
  
  const [maintenance, dispatchMaintenance] = useReducer(maintenanceReducer, {
    active: false,
    message: "",
    loading: true
  });

  const userRole = currentUser?.role;

  // Check maintenance mode for non-super_admin users
  useEffect(() => {
    if (!isLoggedIn || !currentUser || userRole === "super_admin") {
      queueMicrotask(() => {
        dispatchMaintenance({ type: 'STOP_LOADING' });
      });
      return;
    }
    
    queueMicrotask(() => {
      dispatchMaintenance({ type: 'START_LOADING' });
    });
    let cancelled = false;
    
    apiFetch("/api/platform-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          const modeSetting = data.find((s: any) => s.key === "maintenance_mode");
          const msgSetting = data.find((s: any) => s.key === "maintenance_message");
          
          dispatchMaintenance({
            type: 'SET_DATA',
            payload: {
              active: modeSetting?.value === "true",
              message: msgSetting?.value || ""
            }
          });
        } else if (!cancelled) {
          dispatchMaintenance({ type: 'STOP_LOADING' });
        }
      })
      .catch(() => {
        if (!cancelled) dispatchMaintenance({ type: 'STOP_LOADING' });
      });
      
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, currentUser, userRole]);

  // Unified Redirection Logic: Redirect to tenant-specific URL if logged in
  useEffect(() => {
    if (mounted && isLoggedIn && currentUser) {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const isSuperAdmin = currentUser.role === "super_admin";
      const expectedPrefix = currentUser.tenantSlug || currentUser.tenantId || currentTenantId;

      // Only redirect if we are literally at the root "/"
      if (parts.length === 0 && (expectedPrefix || isSuperAdmin)) {
        const url = !expectedPrefix
          ? `/${currentScreen}`
          : currentScreen === "dashboard"
            ? `/${expectedPrefix}`
            : `/${expectedPrefix}/${currentScreen}`;

        router.replace(url);
      }
    }
  }, [mounted, isLoggedIn, currentUser, currentScreen, currentTenantId, router]);

  // Not mounted yet → render nothing (avoids hydration mismatch)
  if (!mounted) return null;

  // Not logged in → show login
  if (!isLoggedIn) return <LoginScreen />;

  // If logged in but still at "/", show skeleton while useEffect redirect kicks in
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts.length === 0) {
    return <FullPageSkeleton />;
  }

  // Maintenance mode check
  const isSuperAdmin = userRole === "super_admin";
  if (isLoggedIn && !isSuperAdmin && maintenance.loading) {
    return <FullPageSkeleton />;
  }

  if (isLoggedIn && !isSuperAdmin && maintenance.active) {
    return <MaintenanceScreen message={maintenance.message} />;
  }

  return <FullPageSkeleton />;
}
