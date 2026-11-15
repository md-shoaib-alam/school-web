/**
 * The drill-menu reference plays every move on a damped spring, sampled once into a CSS
 * `linear()` easing and handed to the Web Animations API. Same here: nothing animates on a
 * plain ease curve.
 */

/** Samples the unit step of a damped spring (`mass` kg, `stiffness` N/m, `damping` N·s/m). */
export function spring(stiffness: number, damping: number, mass = 1, epsilon = 1e-3) {
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  // The damped frequency: imaginary underdamped, real overdamped, gone at critical damping.
  const w = omega * Math.sqrt(Math.abs(1 - zeta * zeta));
  const nearCritical = Math.abs(zeta - 1) < 1e-9;
  const at = (t: number) => {
    const e = Math.exp(-zeta * omega * t);
    if (nearCritical) return 1 - e * (1 + omega * t);
    // cos/sin going one way and cosh/sinh the other are the same solution of the oscillator.
    const shape = zeta < 1 ? Math.sin(w * t) : Math.sinh(w * t);
    const swing = zeta < 1 ? Math.cos(w * t) : Math.cosh(w * t);
    return 1 - e * (swing + (zeta * omega / w) * shape);
  };
  // Where the curve stops leaving `epsilon` of the target behind, scanned at a quarter frame.
  let settled = 0;
  for (let t = 0; t <= 10; t += 1 / 240) {
    if (Math.abs(1 - at(t)) >= epsilon) settled = t + 1 / 240;
  }
  const steps = Math.max(2, Math.round(settled * 60));
  const stops = ["0"];
  for (let i = 1; i <= steps; i += 1) {
    const p = i / steps;
    stops.push(i === steps ? "1" : `${at(p * settled).toFixed(4)} ${(p * 100).toFixed(2)}%`);
  }
  return { duration: Math.round(settled * 1000), easing: `linear(${stops.join(", ")})` };
}

export type Spring = ReturnType<typeof spring>;

/** The travelling item and the card's height. */
export const MOVE = spring(320, 30);
/** A level's items, arriving. */
export const ARRIVE = spring(260, 27);
/** What leaves clears the way at once, then eases off. */
export const LEAVE_EASE = "cubic-bezier(0.2, 0.6, 0.35, 1)";
/** Arriving items wait this long for the old ones to clear, then follow each other by STAGGER. */
export const ARRIVE_DELAY = 70;
export const STAGGER = 30;

/** `curve` as Web Animations API options. */
export function timing(
  curve: Spring,
  options?: KeyframeAnimationOptions,
): KeyframeAnimationOptions {
  return { duration: curve.duration, easing: curve.easing, ...options };
}

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The CSS side of the same curve: `ease-spring` starts on the fallback in globals.css and becomes
// the sampled spring as soon as this module runs in the browser.
if (typeof document !== "undefined") {
  document.documentElement.style.setProperty("--ease-spring", MOVE.easing);
}
