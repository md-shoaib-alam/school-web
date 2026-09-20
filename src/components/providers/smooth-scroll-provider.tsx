"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const windowLenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // ─── Window-level Lenis (for full-window pages like login/landing) ─────────
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

    // ─── Inner scroll-container instances ────────────────────────────────────
    //
    // THREE permanent defences against broken desktop scrolling:
    //
    //  [1] content = container  ← never holds a stale reference to a removed DOM
    //      node. Previously we used firstElementChild which silently broke when
    //      React replaced the view (e.g. list → profile).
    //
    //  [2] childObserver        ← when React swaps the direct child (view switch),
    //      we destroy and recreate the Lenis instance so it remeasures the new view.
    //
    //  [3] resizeObserver       ← when content height changes *inside* the view
    //      (data loads, accordion toggles, image loads …) we call lenis.resize()
    //      so Lenis always knows the correct scrollable height.
    //
    type InnerEntry = {
      lenis: Lenis;
      childObserver: MutationObserver;
      resizeObserver: ResizeObserver;
    };

    const innerInstances = new Map<HTMLElement, InnerEntry>();

    const destroyInner = (container: HTMLElement) => {
      const entry = innerInstances.get(container);
      if (!entry) return;
      entry.lenis.destroy();
      entry.childObserver.disconnect();
      entry.resizeObserver.disconnect();
      innerInstances.delete(container);
    };

    const createInner = (container: HTMLElement) => {
      destroyInner(container);

      // [1] content = container → no stale child references
      const innerLenis = new Lenis({
        wrapper: container,
        content: container,
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        autoRaf: false,
      });

      // [2] childObserver → rebuild on view switch (list ↔ profile view)
      const childObserver = new MutationObserver(() => {
        createInner(container);
      });
      childObserver.observe(container, { childList: true });

      // [3] resizeObserver → remeasure when content height changes dynamically
      const resizeObserver = new ResizeObserver(() => {
        innerLenis.resize();
      });
      resizeObserver.observe(container); // container scroll height will change

      innerInstances.set(container, { lenis: innerLenis, childObserver, resizeObserver });
    };

    const attachInner = () => {
      document
        .querySelectorAll<HTMLElement>("[data-lenis-scroll-container]")
        .forEach((el) => {
          if (!innerInstances.has(el)) createInner(el);
        });
    };

    attachInner();

    // Auto-attach when new scroll containers are mounted dynamically
    const bodyObserver = new MutationObserver(attachInner);
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    // ─── RAF loop ─────────────────────────────────────────────────────────────
    let rafId: number;
    const raf = (time: number) => {
      windowLenis.raf(time);
      innerInstances.forEach(({ lenis }) => lenis.raf(time));
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      bodyObserver.disconnect();
      innerInstances.forEach(({ lenis, childObserver, resizeObserver }) => {
        lenis.destroy();
        childObserver.disconnect();
        resizeObserver.disconnect();
      });
      innerInstances.clear();
      windowLenis.destroy();
      windowLenisRef.current = null;
      delete (window as any).__lenis;
    };
  }, []);

  return <>{children}</>;
}
