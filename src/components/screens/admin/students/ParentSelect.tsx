"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search, UserRound, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ParentOption {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface ParentSelectProps {
  parents: ParentOption[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ParentSelect({ parents, value, onChange, disabled, loading }: ParentSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectable = useMemo(() => parents.filter((p) => !p.id.startsWith("unlinked-")), [parents]);
  const selected = selectable.find((p) => p.id === value) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return selectable;
    return selectable.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.phone || "").replace(/\D/g, "").includes(q.replace(/\D/g, ""))
    );
  }, [selectable, query]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-xl border bg-muted px-3 text-xs text-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <span className={cn("flex min-w-0 items-center gap-1.5 truncate", !selected && "text-muted-foreground")}>
            <UserRound className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{selected ? selected.name : "Search & select a parent"}</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-[260px] p-0">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="h-6 w-full bg-transparent text-xs text-foreground focus:outline-none"
            aria-label="Search parents"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div role="listbox" aria-label="Parents" className="max-h-56 overflow-y-auto p-1">
          {value && (
            <button
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => pick("")}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-muted-foreground hover:bg-accent"
            >
              <X className="size-3.5" /> No parent (unlink)
            </button>
          )}
          {loading ? (
            <p className="px-2.5 py-3 text-xs text-muted-foreground">Loading parents…</p>
          ) : filtered.length === 0 ? (
            <p className="px-2.5 py-3 text-xs text-muted-foreground">No parents found. Add them in the Parents section first.</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={p.id === value}
                onClick={() => pick(p.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-accent",
                  p.id === value && "bg-emerald-500/10"
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-foreground">{p.name}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {[p.phone, p.email].filter(Boolean).join(" · ") || "No contact"}
                  </span>
                </span>
                {p.id === value && <Check className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
