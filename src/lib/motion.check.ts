// Runnable check for the spring sampler: `node src/lib/motion.check.ts`
import assert from "node:assert/strict";
import { ARRIVE, LEAVE_EASE, MOVE, spring, timing, type Spring } from "./motion.ts";

/** `linear(0, 0.16 3.29%, 1)` -> the value and the percentage of each stop. */
function parse(easing: string) {
  const body = easing.replace(/^linear\(|\)$/g, "").split(", ");
  return body.map((stop, i) => {
    const [value, position] = stop.split(" ");
    // A bare stop is the head or the tail of the run.
    return { v: Number(value), p: position ? Number(position.slice(0, -1)) : i === 0 ? 0 : 100 };
  });
}

for (const curve of [MOVE, ARRIVE]) {
  const stops = parse(curve.easing);
  assert(stops[0]!.v === 0 && stops.at(-1)!.v === 1, "must run 0 -> 1");
  assert(
    stops.every((s, i) => i === 0 || s.p > stops[i - 1]!.p),
    "percentages must rise",
  );
  assert(stops.every((s) => Number.isFinite(s.v)), "every stop must be a number");
  assert(curve.duration > 100 && curve.duration < 1500, `duration sane, got ${curve.duration}`);
  assert(
    stops.some((s) => s.v > 1),
    "a spring must overshoot",
  );
}

// Settle time follows the damper and the mass (ζω = c / 2m), not the stiffness.
assert(spring(320, 30, 2).duration > MOVE.duration, "a heavier mass settles later");
assert(spring(320, 80).duration > MOVE.duration, "an overdamped spring creeps in");
const peak = (curve: Spring) => Math.max(...parse(curve.easing).map((s) => s.v));
assert(peak(spring(320, 60)) < peak(spring(320, 20)), "more damping, less overshoot");
assert(timing(MOVE).easing === MOVE.easing);
assert(timing(MOVE, { delay: 70 }).delay === 70);
assert(LEAVE_EASE.startsWith("cubic-bezier"));

console.log(`ok — MOVE ${MOVE.duration}ms, ARRIVE ${ARRIVE.duration}ms`);
