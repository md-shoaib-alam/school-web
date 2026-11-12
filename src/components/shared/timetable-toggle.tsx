"use client";

import { useLayoutEffect, useRef } from "react";
import { CalendarDays, List, LayoutGrid } from "lucide-react";
import { usePillSlider } from "@/lib/pill-slider";
import { cn } from "@/lib/utils";

export type TimetableTabMode = "day" | "list" | "grid";

interface TimetableToggleProps {
  mode: TimetableTabMode;
  onChange: (mode: TimetableTabMode) => void;
  className?: string;
}

const TABS: { key: TimetableTabMode; icon: typeof CalendarDays; label: string }[] = [
  { key: "day", icon: CalendarDays, label: "Today" },
  { key: "list", icon: List, label: "List" },
  { key: "grid", icon: LayoutGrid, label: "Grid" },
];

export function TimetableToggle({
  mode,
  onChange,
  className,
}: TimetableToggleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activePill = useRef<HTMLDivElement>(null);
  const hoverPill = useRef<HTMLDivElement>(null);
  const hovered = useRef<HTMLElement | null>(null);
  const place = usePillSlider(containerRef);

  // Update pill positions when active tab changes
  useLayoutEffect(() => {
    const box = containerRef.current;
    if (!box || (box.offsetWidth === 0 && box.offsetHeight === 0)) return;
    const activeEl = box.querySelector<HTMLElement>("[data-nav][data-active='true']");
    place(activePill.current, activeEl);
    place(
      hoverPill.current,
      hovered.current && !hovered.current.dataset.active ? hovered.current : null
    );
  }, [mode]);

  // Keep pills in sync on resize (e.g. mobile/desktop toggles, font load)
  useLayoutEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const box = containerRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() => {
      if (box.offsetWidth === 0 && box.offsetHeight === 0) return;
      place(
        activePill.current,
        box.querySelector<HTMLElement>("[data-nav][data-active='true']"),
        true
      );
      place(
        hoverPill.current,
        hovered.current && !hovered.current.dataset.active ? hovered.current : null,
        true
      );
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center rounded-lg border bg-card p-0.5 shadow-xs shrink-0 select-none",
        className
      )}
      onPointerOver={(event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>("[data-nav]");
        hovered.current = target ?? null;
        place(
          hoverPill.current,
          target && !target.dataset.active ? target : null
        );
      }}
      onPointerLeave={() => {
        hovered.current = null;
        place(hoverPill.current, null);
      }}
    >
      {/* Sliding Hover Pill */}
      <div
        ref={hoverPill}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 rounded-md bg-accent opacity-0 will-change-transform"
      />

      {/* Sliding Active Pill */}
      <div
        ref={activePill}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 rounded-md bg-blue-600 opacity-0 shadow-xs will-change-transform"
      />

      {TABS.map(({ key, icon: Icon, label }) => {
        const isActive = mode === key;
        return (
          <button
            key={key}
            type="button"
            data-nav
            data-active={isActive ? "true" : undefined}
            onClick={() => onChange(key)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center h-8 px-2.5 sm:px-3 text-xs font-medium rounded-md cursor-pointer transition-colors duration-200 active:scale-[0.97]",
              isActive
                ? "text-white font-semibold [&_svg]:text-white"
                : "text-muted-foreground hover:text-foreground [&_svg]:text-muted-foreground hover:[&_svg]:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0 sm:mr-1" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

