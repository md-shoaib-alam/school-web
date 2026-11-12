"use client";

import { useEffect, useLayoutEffect, useRef, type ComponentType, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Loader2, Pencil } from "lucide-react";

/*
 * A profile section that opens into its form in place. Press Edit and the card's height springs
 * while each value glides out of its read-only cell and into the field that takes it; the labels
 * arrive a few ms behind them, and the other sections of the page dim and blur. Cancel or Save
 * plays the same move home.
 *
 * Both layers stay mounted. The one in use is in flow and gives the card its height; the other
 * lies over it, invisible. That is what makes the glide cheap: the layer the values came from
 * still has a position on screen while the new one is laid out, so both can be measured in one
 * pass, after the swap.
 *
 * Call sites mark what travels with data-travel (the same key on a cell's value and on the field
 * that takes it) and what arrives late with data-fade. A field with no twin in the view layer
 * only fades, which is what you want for a photo upload or a new-item input.
 */

/**
 * The lift and the settle.
 * ponytail: one overshoot, no oscillation, unlike a real spring; upgrade path is sampling a
 * damped spring into a linear() easing string and keeping the duration.
 */
const EASE = "cubic-bezier(0.2, 1.2, 0.35, 1)";
const MOVE_MS = 500;
const FADE_MS = 260;
const FADE_STEP_MS = 45;

const layerOf = (editing: boolean) => (editing ? "form" : "view");

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const fontOf = (el: Element) => parseFloat(getComputedStyle(el).fontSize);

const travellersIn = (layer: HTMLElement) =>
  Array.from(layer.querySelectorAll<HTMLElement>("[data-travel]"));

export interface ProfileSectionProps {
  icon: ComponentType<{ className?: string }>;
  title: ReactNode;
  /** Open in the form rather than the cells. */
  editing: boolean;
  collapsed: boolean;
  saving?: boolean;
  canEdit?: boolean;
  /** Another section of the page is open: dim and blur this one behind it. */
  dimmed?: boolean;
  onEdit?: () => void;
  onCancel: () => void;
  onSave: () => void;
  onToggleCollapse?: () => void;
  saveLabel?: string;
  editLabel?: string;
  view: ReactNode;
  form: ReactNode;
}

export function ProfileSection({
  icon: Icon,
  title,
  editing,
  collapsed,
  saving = false,
  canEdit = true,
  dimmed = false,
  onEdit,
  onCancel,
  onSave,
  onToggleCollapse,
  saveLabel = "Save",
  editLabel = "Edit",
  view,
  form,
}: ProfileSectionProps) {
  const body = useRef<HTMLDivElement>(null);
  /** The layer the values are leaving, so a switch knows which way to play. */
  const wasEditing = useRef(editing);
  const running = useRef<Animation[]>([]);

  useLayoutEffect(() => {
    const from = wasEditing.current;
    wasEditing.current = editing;
    const card = body.current;
    if (!card || from === editing || reducedMotion()) return;

    const shown = card.querySelector<HTMLElement>(`[data-layer='${layerOf(editing)}']`);
    const leaving = card.querySelector<HTMLElement>(`[data-layer='${layerOf(from)}']`);
    if (!shown || !leaving) return;

    // Everything is measured before a single animation starts: the height animation moves the
    // page below, and a rect read after it began would already be mid-move.
    const spots = new Map<string, { rect: DOMRect; font: number }>();
    for (const el of travellersIn(leaving)) {
      spots.set(el.dataset.travel ?? "", { rect: el.getBoundingClientRect(), font: fontOf(el) });
    }
    const moves = travellersIn(shown).flatMap((el) => {
      const was = spots.get(el.dataset.travel ?? "");
      if (!was) return [];
      const now = el.getBoundingClientRect();
      const x = was.rect.left - now.left;
      const y = was.rect.top + was.rect.height / 2 - (now.top + now.height / 2);
      return [{ el, start: `translate(${x}px, ${y}px) scale(${was.font / fontOf(el)})` }];
    });
    const fades = Array.from(shown.querySelectorAll<HTMLElement>("[data-fade]"));
    const h0 = leaving.offsetHeight;
    const h1 = shown.offsetHeight;

    for (const animation of running.current) animation.cancel();
    const timing = { duration: MOVE_MS, easing: EASE };
    running.current = [
      card.animate([{ height: `${h0}px` }, { height: `${h1}px` }], timing),
      ...moves.map(({ el, start }) =>
        el.animate([{ transform: start }, { transform: "none" }], timing),
      ),
      ...fades.map((el, order) =>
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: FADE_MS,
          delay: order * FADE_STEP_MS,
          easing: "ease-out",
          fill: "backwards",
        }),
      ),
    ];
  }, [editing]);

  useEffect(() => {
    const animations = running;
    return () => animations.current.forEach((animation) => animation.cancel());
  }, []);

  return (
    <div
      className={`bg-card rounded-2xl border  shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden transition-[opacity,filter] duration-300 ${
        dimmed ? "opacity-60 blur-[1.5px]" : ""
      }`}
      onKeyDown={
        editing
          ? (event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
              }
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b ">
        <div className="flex items-center gap-2.5">
          <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                disabled={saving}
                className="h-8 px-3 text-xs rounded-lg font-medium text-foreground  hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={saving}
                className="h-8 px-3 text-xs rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
              >
                {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                {saveLabel}
              </Button>
            </div>
          ) : (
            canEdit &&
            onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground px-3 py-1.5 rounded-lg border  hover:bg-accent transition-colors"
              >
                <Pencil className="size-3" /> {editLabel}
              </button>
            )
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground ml-1"
              aria-label="Toggle section"
            >
              {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div ref={body} className="relative overflow-hidden">
          <div
            data-layer="view"
            className={`px-5 sm:px-6 py-5 ${editing ? "absolute inset-x-0 top-0 invisible" : ""}`}
            inert={editing || undefined}
          >
            {view}
          </div>
          <div
            data-layer="form"
            className={`px-5 sm:px-6 py-5 ${!editing ? "absolute inset-x-0 top-0 invisible" : ""}`}
            inert={!editing || undefined}
          >
            {form}
          </div>
        </div>
      )}
    </div>
  );
}
