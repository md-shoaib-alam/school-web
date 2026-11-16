"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

export type DownloadState = "idle" | "downloading" | "downloaded" | "failed";

export interface DownloadButtonProps {
  /** Callback triggered when user clicks to download. Can be async. */
  onDownload?: () => Promise<void> | void;
  /** Explicit controlled state. If omitted, the button manages its own state from onDownload. */
  state?: DownloadState;
  /** Optional text label next to the icon (e.g. "Download PDF"). If omitted, renders as an icon button. */
  label?: string;
  /** Accessible title and tooltip. Defaults to "Download PDF". */
  title?: string;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "ghost" | "default";
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

const BOX_SIZE = {
  sm: "size-8",
  md: "size-9",
  lg: "size-10",
};

const LABEL_PADDING = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-3.5 text-xs",
  lg: "h-10 px-4 text-sm",
};

const VARIANT_REST: Record<"outline" | "ghost" | "default", string> = {
  outline: "border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground shadow-xs",
  ghost: "border border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
};

export function DownloadButton({
  onDownload,
  state: controlledState,
  label,
  title = "Download PDF",
  size = "md",
  variant = "outline",
  className,
  disabled = false,
  "aria-label": ariaLabel,
}: DownloadButtonProps) {
  const [internalState, setInternalState] = useState<DownloadState>("idle");
  const [run, setRun] = useState(0);
  const resetTimer = useRef<number>(0);

  const state = controlledState !== undefined ? controlledState : internalState;
  const isBusy = state === "downloading";

  useEffect(() => {
    return () => {
      window.clearTimeout(resetTimer.current);
    };
  }, []);

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled || isBusy || state === "downloaded") return;

    window.clearTimeout(resetTimer.current);
    setRun((r) => r + 1);

    if (controlledState === undefined) {
      setInternalState("downloading");
    }

    try {
      if (onDownload) {
        await onDownload();
      }
      if (controlledState === undefined) {
        setInternalState("downloaded");
        resetTimer.current = window.setTimeout(() => {
          setInternalState("idle");
        }, 2000);
      }
    } catch {
      if (controlledState === undefined) {
        setInternalState("failed");
        resetTimer.current = window.setTimeout(() => {
          setInternalState("idle");
        }, 2000);
      }
    }
  };

  const getEffectiveTitle = () => {
    if (state === "downloading") return "Downloading PDF...";
    if (state === "downloaded") return "Downloaded successfully!";
    if (state === "failed") return "Download failed. Please try again.";
    return title;
  };

  const currentTitle = getEffectiveTitle();

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isBusy}
      data-download-state={state}
      aria-label={ariaLabel || currentTitle}
      title={currentTitle}
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-medium outline-none transition-all duration-200 ease-spring active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
        label ? LABEL_PADDING[size] : BOX_SIZE[size],
        // State styles
        state === "idle" && VARIANT_REST[variant],
        state === "downloading" && "border border-border bg-muted/80 text-muted-foreground cursor-wait",
        state === "downloaded" && "border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        state === "failed" && "border border-destructive/40 bg-destructive/10 text-destructive",
        className
      )}
    >
      <span className="relative size-4 shrink-0 flex items-center justify-center">
        {/* Idle Download Glyph */}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-200 ease-spring",
            state === "idle" ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
          )}
        >
          <svg
            className="size-3.5 text-foreground transition-transform duration-200 group-hover:translate-y-0.5"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 3.5v9M6.5 9 10 12.5 13.5 9" />
            <path d="M4 14.5v1a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-1" />
          </svg>
        </span>

        {/* Downloading Spinner (Delorence 10-dot radial spinner) */}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-200 ease-spring",
            state === "downloading" ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
          )}
        >
          <svg
            className="size-3.5 animate-spin text-foreground shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <circle
                key={i}
                cx="10"
                cy="2.6"
                r="1.35"
                transform={`rotate(${i * 36} 10 10)`}
                opacity={0.15 + 0.85 * ((i + 1) / 10)}
              />
            ))}
          </svg>
        </span>

        {/* Downloaded Check Glyph */}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-200 ease-spring",
            state === "downloaded" ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
          )}
        >
          <svg
            key={run}
            className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="8.2" strokeWidth={1.5} opacity={0.25} />
            <path pathLength={10} className="copy-check-draw" d="m6.2 10.2 2.8 2.8 5.2-5.4" />
          </svg>
        </span>

        {/* Failed Alert Glyph */}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-200 ease-spring",
            state === "failed" ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
          )}
        >
          <svg
            className="size-3.5 text-destructive shrink-0"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="8.2" strokeWidth={1.5} opacity={0.3} />
            <path d="M10 6.5v4.5M10 14h.01" />
          </svg>
        </span>
      </span>

      {label && (
        <span className="truncate">
          {state === "downloading"
            ? "Downloading..."
            : state === "downloaded"
            ? "Downloaded"
            : state === "failed"
            ? "Failed"
            : label}
        </span>
      )}
    </button>
  );
}
