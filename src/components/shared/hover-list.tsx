"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePillSlider } from "@/lib/pill-slider";

/**
 * A Radix menu or select list whose highlight is a pill that slides between its rows, on the same
 * spring as the sidebar's. The rows' own highlight is switched off, because it would paint over
 * the pill; a destructive row keeps its red.
 *
 * `pillClassName` carries the radius the list's own rows use, so the pill matches them.
 */
export function HoverList({
  className,
  pillClassName = "rounded-lg",
  children,
}: {
  className?: string;
  pillClassName?: string;
  children: ReactNode;
}) {
  const list = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const place = usePillSlider(list);
  const row = (target: EventTarget | null) =>
    (target as HTMLElement | null)?.closest<HTMLElement>('[role="menuitem"], [role="option"]') ?? null;
  return (
    <div
      ref={list}
      className={cn(
        "relative",
        // Only positioned rows can sit above the pill; Radix's sub-triggers are not by default.
        "[&_[role=menuitem]]:relative [&_[role=menuitem]]:cursor-pointer",
        "[&_[role=option]]:relative [&_[role=option]]:cursor-pointer",
        "[&_[data-highlighted]:not([data-variant=destructive])]:bg-transparent!",
        className,
      )}
      onPointerMove={(event) => place(pill.current, row(event.target))}
      onPointerLeave={() => place(pill.current, null)}
      onFocus={(event) => place(pill.current, row(event.target))}
    >
      <div
        ref={pill}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-0 bg-accent opacity-0 will-change-transform",
          pillClassName,
        )}
      />
      {children}
    </div>
  );
}
