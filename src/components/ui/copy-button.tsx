"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

/*
 * The one copy button for the whole app. The look comes from the card-reveal reference: the same
 * two-sheet copy glyph, the same single-stroke check, and copying turns the button into a green
 * chip with the check drawing itself in for a moment before it fades back.
 */

/** How long the green check holds after a copy. */
const COPIED_FOR = 1600;
const FAILED_FOR = 2400;

type State = "idle" | "copied" | "failed";

interface CopyButtonProps {
  /** The text that goes on the clipboard. Empty value disables the button. */
  value: string;
  /** Words after the glyph, e.g. "Copy Email"; becomes "Copied Email" while on. Icon-only without it. */
  label?: string;
  /** Noun for the toast — "<toastSubject> copied to clipboard". Falls back to the label. */
  toastSubject?: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline";
  className?: string;
  disabled?: boolean;
  /** Runs before the copy, with the click event — for buttons inside a clickable row or card. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** After a copy that actually landed — for callers with their own side effect. */
  onSuccess?: () => void;
}

const ICON_BOX = { sm: "size-6", md: "size-7", lg: "size-8" };
const LABEL_BOX = { sm: "h-7 px-2.5", md: "h-8 px-3", lg: "h-9 px-3.5" };
const GLYPH_BOX = { sm: "size-3.5", md: "size-4", lg: "size-4" };

const REST: Record<NonNullable<CopyButtonProps["variant"]>, string> = {
  ghost: "border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground",
  outline: "bg-background text-foreground hover:bg-accent",
};
/** The border, the fill and the draining ring all go the same colour as the outcome. */
const COPIED = "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
const FAILED = "border-destructive/40 bg-destructive/10 text-destructive";

/** The reference's copy glyph: a sheet over a sheet, both rounded. */
export function CopyGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="7.25" y="7.25" width="9.5" height="9.5" rx="2.25" />
      <path d="M12.75 7.25V5.5a2.25 2.25 0 0 0-2.25-2.25h-5a2.25 2.25 0 0 0-2.25 2.25v5a2.25 2.25 0 0 0 2.25 2.25h1.75" />
    </svg>
  );
}

/** The reference's check, one stroke, drawn in by copy-check-draw while the chip is green. */
export function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path pathLength={10} className="copy-check-draw" d="m5.2 10.4 3.2 3.2 6.6-7" />
    </svg>
  );
}

function FailedGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m7 7 6 6M13 7l-6 6" />
    </svg>
  );
}

export function CopyButton({
  value,
  label,
  toastSubject,
  size = "md",
  variant = "ghost",
  className,
  disabled,
  onClick,
  onSuccess,
}: CopyButtonProps) {
  const [state, setState] = useState<State>("idle");
  /** Bumped on each press so a second press while still green replays the check draw. */
  const [run, setRun] = useState(0);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const press = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    window.clearTimeout(timer.current);
    setRun((now) => now + 1);
    void runCopy();
  };

  const runCopy = async () => {
    const ok = await copyToClipboard(value);
    setState(ok ? "copied" : "failed");
    timer.current = window.setTimeout(() => setState("idle"), ok ? COPIED_FOR : FAILED_FOR);
    if (ok) {
      toast.success(`${toastSubject ?? label ?? "Text"} copied to clipboard`);
      onSuccess?.();
    } else {
      toast.error("Couldn't copy — select the text and copy it manually");
    }
  };

  const shown = state !== "idle";
  const name = label ?? (toastSubject ? `Copy ${toastSubject}` : undefined);
  const word =
    state === "copied" ? label?.replace(/^Copy\b/, "Copied") : state === "failed" ? "Couldn't copy" : label;

  return (
    <button
      type="button"
      onClick={press}
      disabled={disabled || !value}
      data-copy-state={state}
      aria-label={shown ? undefined : name}
      title={name}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold outline-none transition-all duration-200 ease-spring active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        "data-[copy-state=copied]:opacity-100 data-[copy-state=failed]:opacity-100",
        label ? LABEL_BOX[size] : ICON_BOX[size],
        state === "idle" ? REST[variant] : state === "copied" ? COPIED : FAILED,
        className
      )}
    >
      <span className={cn("relative", GLYPH_BOX[size])}>
        <CopyGlyph
          className={cn(
            "absolute inset-0 size-full transition-all duration-200 ease-spring",
            state === "idle" ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
        <CheckGlyph
          key={run}
          className={cn(
            "absolute inset-0 size-full transition-all duration-200 ease-spring",
            state === "copied" ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
        <FailedGlyph
          className={cn(
            "absolute inset-0 size-full transition-all duration-200 ease-spring",
            state === "failed" ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>
      {/* The reference's countdown ring, run down the time the outcome holds. */}
      {shown && (
        <svg
          key={run}
          className="copy-ring"
          aria-hidden="true"
          style={
            {
              "--copy-ring-ms": `${state === "copied" ? COPIED_FOR : FAILED_FOR}ms`,
            } as CSSProperties
          }
        >
          <rect pathLength={100} />
        </svg>
      )}
      {word && <span className="truncate">{word}</span>}
    </button>
  );
}
