"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onSuccess: (_data, _variables, _context, mutation) => {
            // Automatically invalidate the dashboard whenever ANY change happens
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            
            // If the mutation has a meta property with a custom key to invalidate, do that too
            if (mutation.meta?.invalidates) {
              queryClient.invalidateQueries({ queryKey: mutation.meta.invalidates as any[] });
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes (for persistence)
            retry: 2,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

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
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <GooeyToaster richColors position="top-center" closeButton duration={2000} />
    </QueryClientProvider>
  );
}
