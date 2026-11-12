"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { NavItem } from "../nav-config";
import { groupNavItems } from "../nav-sections";
import { useAppStore } from "@/store/use-app-store";
import {
  ARRIVE,
  ARRIVE_DELAY,
  STAGGER,
  prefersReducedMotion,
  timing,
} from "@/lib/motion";
import { usePillSlider } from "@/lib/pill-slider";

interface SidebarNavProps {
  items: NavItem[];
  resolvedScreen: string;
  sidebarOpen: boolean;
  isSuperAdmin: boolean;
  isModernUI?: boolean;
  expandedKeys: string[];
  onToggleExpand: (key: string) => void;
  onNavigate: (screen: string) => void;
}

/**
 * The sub-item tree, in px, mirroring the rows: `h-9` with a `space-y-1` gap. A branch runs down
 * the trunk, turns at its elbow just under the row's middle, and stops at the row's pill.
 */
const ROW = 36;
const GAP = 4;
/** How far above the first row the trunk starts, in the gap under its title. */
const TRUNK_TOP = 8;
const ELBOW = 7.5;
const RADIUS = 5;
const BRANCH_END = 10;

const branch = (k: number) => {
  const y = TRUNK_TOP + k * (ROW + GAP) + ROW / 2 + ELBOW;
  return `M0.5 0V${y - RADIUS}A${RADIUS} ${RADIUS} 0 0 0 ${RADIUS + 0.5} ${y}H${BRANCH_END}`;
};

const treeHeight = (rows: number) => TRUNK_TOP + (rows - 1) * (ROW + GAP) + ROW / 2 + ELBOW;

export function SidebarNav({
  items,
  resolvedScreen,
  sidebarOpen,
  isSuperAdmin,
  isModernUI = true,
  expandedKeys,
  onToggleExpand,
  onNavigate,
}: SidebarNavProps) {
  const nav = useRef<HTMLElement>(null);
  const activePill = useRef<HTMLDivElement>(null);
  const groupPill = useRef<HTMLDivElement>(null);
  const hoverPill = useRef<HTMLDivElement>(null);
  const hovered = useRef<HTMLElement | null>(null);
  const expanded = useRef(expandedKeys);
  const place = usePillSlider(nav);
  const role = useAppStore((state) => state.currentUser?.role);
  const groups = useMemo(() => groupNavItems(role, items), [role, items]);

  // The active screen's pill travels to its new home; a group that just opened staggers in.
  useLayoutEffect(() => {
    if (!isModernUI) return;
    const list = nav.current;
    if (!list) return;
    place(activePill.current, list.querySelector<HTMLElement>("[data-nav][data-active]"));
    // A group holding the open screen keeps a light band, so collapsing it does not lose the tab.
    place(groupPill.current, list.querySelector<HTMLElement>("[data-nav][data-active-group]"));
    place(hoverPill.current, hovered.current);
    const justOpened = expandedKeys.filter((key) => !expanded.current.includes(key));
    expanded.current = expandedKeys;
    if (prefersReducedMotion() || !justOpened.length) return;
    // Items of a group that appeared rise into place behind each other, as the reference's levels do.
    for (const key of justOpened) {
      const arriving = Array.from(
        list.querySelectorAll<HTMLElement>(`[data-submenu="${key}"] [data-nav]`),
      );
      arriving.forEach((element, i) =>
        element.animate(
          [
            { opacity: 0, transform: "translateY(18px)", filter: "blur(4px)" },
            { opacity: 1, transform: "none", filter: "blur(0)" },
          ],
          timing(ARRIVE, { delay: ARRIVE_DELAY + i * STAGGER, fill: "backwards" }),
        ),
      );
    }
  }, [isModernUI, resolvedScreen, sidebarOpen, expandedKeys, items]);

  // The sidebar eases its own width open and shut; the pills track that frame by frame.
  useLayoutEffect(() => {
    if (!isModernUI || typeof ResizeObserver === "undefined") return;
    const box = nav.current;
    if (!box) return;
    const observer = new ResizeObserver(() => {
      place(activePill.current, box.querySelector("[data-nav][data-active]"), true);
      place(groupPill.current, box.querySelector("[data-nav][data-active-group]"), true);
      place(hoverPill.current, hovered.current, true);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [isModernUI]);

  const itemClasses = (isActive: boolean, hasChildren: boolean, isChild: boolean) =>
    cn(
      "relative w-full cursor-pointer font-normal transition-all duration-300 ease-spring active:scale-[0.97]",
      isChild
        ? "h-9 justify-start gap-3 px-3 text-sm"
        : cn(
            "h-10 justify-start transition-all duration-300 ease-spring",
            sidebarOpen ? "gap-3 px-3" : "gap-0 lg:px-4"
          ),
      // Tailwind v4 puts the important marker at the END of the utility. These have to win over
      // the ghost variant's own hover background and text colour, or they paint over the pills.
      isActive && !hasChildren
        ? isModernUI
          ? "bg-transparent! text-brand-foreground! font-semibold hover:bg-transparent! hover:text-brand-foreground! [&_svg]:text-brand-foreground!"
          : "bg-muted dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] border dark:border-emerald-900/50 hover:bg-muted dark:hover:bg-emerald-900/50 font-semibold"
        : isModernUI
          ? "text-foreground! dark:text-muted-foreground! hover:bg-transparent! hover:text-foreground! [&_svg]:text-foreground! dark:[&_svg]:text-muted-foreground!"
          : "text-foreground border border-transparent hover:bg-accent hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:text-emerald-600 dark:hover:text-emerald-400",
      isActive &&
        hasChildren &&
        (isModernUI
          ? "text-brand! hover:text-brand! [&_svg]:text-brand!"
          : "text-emerald-700 font-semibold dark:text-emerald-400"),
    );

  return (
    // One provider for the whole rail: the first label takes 150ms, and skipDelayDuration makes the
    // rest of the column instant as the pointer moves down.
    <TooltipProvider delayDuration={150} skipDelayDuration={300}>
    <nav
      ref={nav}
      data-lenis-scroll-container
      className={cn(
        "relative flex-1 overflow-y-auto p-3 sidebar-scrollbar overscroll-contain touch-pan-y",
        // no-scrollbar is a plain class in globals.css, so it takes no lg: variant. On phones a
        // closed drawer is off screen anyway.
        !sidebarOpen && "lg:px-2 no-scrollbar",
      )}
      onPointerOver={(event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>("[data-nav]");
        hovered.current = target ?? null;
        // Over a row that already has a band under it, there is nothing to add.
        place(hoverPill.current, target && !target.dataset.active && !target.dataset.activeGroup ? target : null);
      }}
      onPointerLeave={() => {
        hovered.current = null;
        place(hoverPill.current, null);
      }}
    >
      {isModernUI && (
        <>
          <div
            ref={hoverPill}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-0 rounded-xl bg-accent opacity-0 will-change-transform"
          />
          <div
            ref={groupPill}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-0 rounded-xl bg-brand/10 opacity-0 shadow-xs will-change-transform"
          />
          <div
            ref={activePill}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-0 rounded-xl bg-brand opacity-0 shadow-xs will-change-transform"
          />
        </>
      )}
      <div className="relative space-y-3">
        {groups.map((group) => (
        <div key={group.label} className="space-y-1">
        {group.label && (
          <p
            className={cn(
              "px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground/70 transition-opacity duration-300 ease-spring",
              // The slot keeps its height when the rail closes: shrinking it made every row below
              // slide during the width transition. Only the text fades.
              !sidebarOpen && "lg:opacity-0",
            )}
          >
            {group.label}
          </p>
        )}
        {group.items.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedKeys.includes(item.key);
          const isChildActive = !!item.children?.some((child) => child.key === resolvedScreen);
          const isActive = resolvedScreen === item.key || isChildActive;
          /** The row whose branch is lit: drawn last, so its trunk covers the grey it shares. */
          const litBranch = (item.children ?? []).findIndex((child) => child.key === resolvedScreen);

          const row = (
            <Button
                variant="ghost"
                data-nav={item.key}
                data-active={(isActive && !hasChildren) || undefined}
                data-active-group={(isActive && !!hasChildren) || undefined}
                aria-current={isActive && !hasChildren ? "page" : undefined}
                className={itemClasses(isActive, !!hasChildren, false)}
                onClick={() => {
                  if (!sidebarOpen) {
                    // Expand sidebar first when any tab is clicked in collapsed mode
                    useAppStore.getState().setSidebarOpen(true);
                    if (hasChildren && !isExpanded) {
                      onToggleExpand(item.key);
                    }
                    if (!hasChildren) {
                      onNavigate(item.key);
                    }
                  } else if (hasChildren) {
                    onToggleExpand(item.key);
                  } else {
                    onNavigate(item.key);
                  }
                }}
              >
                <div className="shrink-0 flex items-center justify-center size-5">
                  {item.icon}
                </div>
                <span
                  className={cn(
                    "flex-1 text-left whitespace-nowrap transition-all duration-300 ease-spring overflow-hidden",
                    sidebarOpen
                      ? "opacity-100 max-w-[170px]"
                      : "lg:w-0 lg:max-w-0 lg:opacity-0 lg:pointer-events-none",
                  )}
                >
                  {item.label}
                </span>
                <span
                  className={cn(
                    "flex items-center shrink-0 transition-all duration-300 ease-spring overflow-hidden",
                    sidebarOpen
                      ? "opacity-100"
                      : "lg:w-0 lg:max-w-0 lg:opacity-0 lg:pointer-events-none",
                  )}
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDown className="size-4 opacity-50" />
                    ) : (
                      <ChevronRight className="size-4 opacity-50" />
                    )
                  ) : item.badge && (
                    <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                </span>
            </Button>
          );

          return (
            <div key={item.key} className="space-y-1">
              {/* The rail shows icons only, so the name rides in a tooltip. Open, the bubble is not
                  rendered at all: Radix ignores delayDuration once another tooltip has opened, so a
                  delay cannot switch it off, and unwrapping the Tooltip remounted all 21 rows. */}
              <Tooltip>
                <TooltipTrigger asChild>{row}</TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>

              {/* Sub Items (Accordion): hung from a trunk under the title's icon. */}
              {hasChildren && isExpanded && sidebarOpen && (
                <div
                  data-submenu={item.key}
                  className="relative mt-1 ml-[22px] space-y-1 pl-[10px]"
                >
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 left-0 stroke-border"
                    width={BRANCH_END}
                    height={treeHeight(item.children?.length ?? 0)}
                  >
                    {(item.children ?? []).map(
                      (child, k) =>
                        k === litBranch ? null : (
                          <path key={child.key} fill="none" strokeWidth={1} d={branch(k)} />
                        ),
                    )}
                    {litBranch >= 0 && (
                      <path
                        className="stroke-brand"
                        fill="none"
                        strokeWidth={1}
                        d={branch(litBranch)}
                      />
                    )}
                  </svg>
                  {item.children?.map((child) => (
                    <Button
                      key={child.key}
                      variant="ghost"
                      data-nav={child.key}
                      data-active={resolvedScreen === child.key || undefined}
                      aria-current={resolvedScreen === child.key ? "page" : undefined}
                      className={itemClasses(resolvedScreen === child.key, false, true)}
                      onClick={() => onNavigate(child.key)}
                    >
                      <div className="shrink-0 flex items-center justify-center size-4">
                        {child.icon}
                      </div>
                      {child.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        </div>
        ))}
      </div>
    </nav>
    </TooltipProvider>
  );
}
