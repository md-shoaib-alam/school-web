"use client";

import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "next-themes";

function ToasterProvider() {
  const { theme } = useTheme();
  return (
    <Toaster 
      richColors 
      position="top-center" 
      duration={3000} 
      theme={theme as "light" | "dark" | "system"}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: "SCHOOL_SAAS_OFFLINE_CACHE",
    });

    const [unsubscribe] = persistQueryClient({
      queryClient,
      persister,
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    return unsubscribe;
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
        <ToasterProvider />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
