"use client";

import { useLayoutEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { usePillSlider } from "@/lib/pill-slider";

interface PillTabsProps<T extends string> {
  tabs: readonly { id: T; label: string; icon: LucideIcon }[];
  active: T;
  onChange: (id: T) => void;
}

/**
 * The profile tab row on the sidebar's terms: a light band springs to whatever tab the pointer is
 * over and the solid one travels to the open tab, instead of the fill jumping between buttons.
 */
export function PillTabs<T extends string>({ tabs, active, onChange }: PillTabsProps<T>) {
  const bar = useRef<HTMLDivElement>(null);
  const hoverPill = useRef<HTMLDivElement>(null);
  const activePill = useRef<HTMLDivElement>(null);
  const hovered = useRef<HTMLElement | null>(null);
  const place = usePillSlider(bar);

  // Switching tabs moves the solid band, so the hover band must be re-placed against the new one.
  useLayoutEffect(() => {
    const box = bar.current;
    if (!box) return;
    place(activePill.current, box.querySelector<HTMLElement>("[data-tab][data-active]"));
    place(hoverPill.current, hovered.current);
  }, [active, tabs, place]);

  return (
    <div className="bg-card rounded-xl border px-2 py-2 overflow-x-auto no-scrollbar">
      <div
        ref={bar}
        className="relative flex items-center gap-1.5 min-w-max sm:min-w-0"
        onPointerOver={(event) => {
          const target = (event.target as HTMLElement).closest<HTMLElement>("[data-tab]");
          hovered.current = target;
          // Over the open tab there is nothing to add, the solid band already sits there.
          place(hoverPill.current, target && !target.dataset.active ? target : null);
        }}
        onPointerLeave={() => {
          hovered.current = null;
          place(hoverPill.current, null);
        }}
      >
        <div
          ref={hoverPill}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-0 rounded-xl bg-accent opacity-0 will-change-transform"
        />
        <div
          ref={activePill}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-0 rounded-xl bg-emerald-600 shadow-sm shadow-emerald-600/30 opacity-0 will-change-transform"
        />
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-tab
              data-active={isActive || undefined}
              onClick={() => onChange(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-300 ease-spring active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <Icon className={`size-4 shrink-0 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
