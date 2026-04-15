'use client';

import { useAppStore } from '@/store/use-app-store';
import { LoginScreen } from '@/components/screens/login';
import { AppLayout } from '@/components/layout/app-layout';
import { useSyncExternalStore } from 'react';

// Prevents hydration mismatch
const emptySubscribe = () => () => { };
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn } = useAppStore();
  const hydrated = useHydrated();

  if (!hydrated) return null;

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return <AppLayout>{children}</AppLayout>;
}
