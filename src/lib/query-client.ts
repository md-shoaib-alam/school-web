import { QueryClient, MutationCache } from "@tanstack/react-query";

/**
 * Singleton QueryClient for the entire app
 */
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      // Get the path from mutationKey if available, otherwise mutation options
      const path = (mutation.options as any).mutationKey?.[0] || 
                   (mutation.options as any).mutationFn?.toString() || "";
      triggerGlobalRefresh(path);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 0, // Set to 0 so we always get fresh data after changes
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Intelligent refresh trigger that only invalidates relevant data
 */
export async function triggerGlobalRefresh(pathOrTag: string) {
  const trigger = String(pathOrTag).toLowerCase();
  
  const refresh = async () => {
    console.log(`🧠 Smart Refresh detecting changes in: ${trigger}`);

    // Always refresh the Dashboard stats
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['admin'] });

    // Route-based intelligent invalidation
    if (trigger.includes('student')) {
      console.log('✨ Auto-refreshing Students list...');
      await queryClient.invalidateQueries({ queryKey: ['students'], refetchType: 'all' });
    } 
    
    if (trigger.includes('teacher')) {
      console.log('✨ Auto-refreshing Teachers list...');
      await queryClient.invalidateQueries({ queryKey: ['teachers'], refetchType: 'all' });
    } 

    if (trigger.includes('parent')) {
      console.log('✨ Auto-refreshing Parents list...');
      await queryClient.invalidateQueries({ queryKey: ['parents'], refetchType: 'all' });
    }

    if (trigger.includes('staff')) {
      console.log('✨ Auto-refreshing Staff list...');
      await queryClient.invalidateQueries({ queryKey: ['staff'], refetchType: 'all' });
    }
    
    if (trigger.includes('fee')) {
      await queryClient.invalidateQueries({ queryKey: ['fees'], refetchType: 'all' });
    } 
    
    if (trigger.includes('class')) {
      await queryClient.invalidateQueries({ queryKey: ['classes'], refetchType: 'all' });
    }

    if (trigger.includes('notice')) {
      await queryClient.invalidateQueries({ queryKey: ['notices'], refetchType: 'all' });
    }

    // Fallback: If unknown, refresh active queries
    if (!trigger.includes('student') && !trigger.includes('teacher') && !trigger.includes('fee') && !trigger.includes('class') && !trigger.includes('notice')) {
       queryClient.invalidateQueries({ refetchType: 'active' });
    }
  };

  // 1. Refresh immediately
  await refresh();

  // 2. Refresh again after 500ms to catch any server-side cache lag
  setTimeout(refresh, 500);
}
