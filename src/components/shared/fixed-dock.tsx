"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};
const useMounted = () => useSyncExternalStore(subscribe, () => true, () => false);

export function FixedDock({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(<div className={className}>{children}</div>, document.body);
}
