"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";

interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
  sidebarOpen: boolean;
  /** Enter in the field: go to the first row that matches. */
  onSubmit: () => void;
}

/**
 * The rail's filter, pinned above the scrolling list so a long result set never takes the box away.
 * Cmd/Ctrl+K focuses it from anywhere; on the closed rail the same key opens the rail first, and the
 * focus lands once the field is on screen — which is why the request waits for the render.
 */
export function SidebarSearch({ value, onChange, sidebarOpen, onSubmit }: SidebarSearchProps) {
  const box = useRef<HTMLInputElement>(null);
  const [wantsFocus, setWantsFocus] = useState(false);

  const reveal = () => {
    useAppStore.getState().setSidebarOpen(true);
    setWantsFocus(true);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      reveal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!wantsFocus || !sidebarOpen) return;
    box.current?.focus();
    box.current?.select();
    setWantsFocus(false);
  }, [wantsFocus, sidebarOpen]);

  if (!sidebarOpen) {
    return (
      <div className="px-2 pt-2 pb-1 lg:px-4">
        <button
          type="button"
          onClick={reveal}
          aria-label="Search the menu"
          className="flex h-10 w-full items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-colors duration-300 ease-spring hover:bg-accent hover:text-foreground"
        >
          <Search className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 pt-2 pb-1">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={box}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit();
            } else if (event.key === "Escape") {
              event.preventDefault();
              if (value) onChange("");
              else box.current?.blur();
            }
          }}
          placeholder="Search"
          aria-label="Search the menu"
          className="h-10 w-full rounded-xl border bg-muted pl-9 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              box.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  );
}
