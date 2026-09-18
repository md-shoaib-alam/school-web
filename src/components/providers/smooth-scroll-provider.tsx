"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const windowLenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1. Initialize Lenis for the window (e.g. login, landing, full-window pages)
    const windowLenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      autoRaf: false,
    });
    windowLenisRef.current = windowLenis;
    (window as any).__lenis = windowLenis;

    // 2. Initialize secondary Lenis instances for inner scroll containers (like app-layout main)
    const innerInstances = new Map<HTMLElement, Lenis>();

    const attachInnerLenis = () => {
      const scrollContainers = document.querySelectorAll<HTMLElement>("[data-lenis-scroll-container]");
      scrollContainers.forEach((container) => {
        if (!innerInstances.has(container)) {
          const innerLenis = new Lenis({
            wrapper: container,
            content: container.firstElementChild as HTMLElement || container,
            duration: 1.1,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
            autoRaf: false,
          });
          innerInstances.set(container, innerLenis);
        }
      });
    };

    attachInnerLenis();

    // Observe DOM mutations to auto-attach to dynamically mounted containers
    const observer = new MutationObserver(() => {
      attachInnerLenis();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    let rafId: number;
    function raf(time: number) {
      windowLenis.raf(time);
      innerInstances.forEach((instance) => {
        instance.raf(time);
      });
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      innerInstances.forEach((instance) => instance.destroy());
      innerInstances.clear();
      windowLenis.destroy();
      windowLenisRef.current = null;
      delete (window as any).__lenis;
    };
  }, []);

  return <>{children}</>;
}
