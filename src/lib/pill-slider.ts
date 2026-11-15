import { useRef, type RefObject } from "react";
import { MOVE, prefersReducedMotion, timing } from "./motion";

type Box = { x: number; y: number; w: number; h: number };

/**
 * Slides a pill onto the item it points at, on the drill-menu spring: from wherever the pill last
 * stood — mid-flight included — to the target's box, measured in the container's own scroll
 * coordinates so the pill stays glued to the list while it scrolls.
 *
 * The pill must sit earlier in the DOM than the items and the items must be positioned, or the
 * items' own background paints over it.
 */
export function usePillSlider(container: RefObject<HTMLElement | null>) {
  const boxes = useRef(new Map<HTMLElement, Box>());

  /** Moves `pill` onto `target` — or hides it. `instant` skips the spring, for pure re-layouts. */
  return function place(pill: HTMLElement | null, target: HTMLElement | null, instant = false) {
    const box = container.current;
    if (!pill || !box) return;
    if (!target || !target.isConnected) {
      // Keep the last box: a screen inside a group that is still collapsed hides the pill for one
      // commit, before it opens again, and the travel must start from where it stood.
      pill.style.opacity = "0";
      return;
    }
    const frame = box.getBoundingClientRect();
    const item = target.getBoundingClientRect();
    const next: Box = {
      x: item.left - frame.left - box.clientLeft + box.scrollLeft,
      y: item.top - frame.top - box.clientTop + box.scrollTop,
      w: item.width,
      h: item.height,
    };
    const prev = boxes.current.get(pill);
    pill.style.opacity = "1";
    pill.style.width = `${next.w}px`;
    pill.style.height = `${next.h}px`;
    pill.style.transform = `translate(${next.x}px, ${next.y}px)`;
    boxes.current.set(pill, next);
    const moved =
      prev && (prev.x !== next.x || prev.y !== next.y || prev.w !== next.w || prev.h !== next.h);
    if (!moved || instant || prefersReducedMotion()) return;
    pill.getAnimations().forEach((animation) => animation.cancel());
    pill.animate(
      [
        {
          transform: `translate(${prev!.x}px, ${prev!.y}px)`,
          width: `${prev!.w}px`,
          height: `${prev!.h}px`,
        },
        {
          transform: `translate(${next.x}px, ${next.y}px)`,
          width: `${next.w}px`,
          height: `${next.h}px`,
        },
      ],
      timing(MOVE),
    );
  };
}
