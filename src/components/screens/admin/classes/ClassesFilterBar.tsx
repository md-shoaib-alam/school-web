"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ClassesFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  sections: string[];
  activeSection: string;
  onSectionChange: (v: string) => void;
}

export function ClassesFilterBar({
  search,
  onSearchChange,
  sections,
  activeSection,
  onSectionChange,
}: ClassesFilterBarProps) {
  const pill = (isActive: boolean) =>
    `h-8 sm:h-9 rounded-xl px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
      isActive
        ? "bg-emerald-600 text-white hover:bg-emerald-700"
        : "border border-border bg-card text-foreground hover:bg-accent"
    }`;

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
      {/* Desktop Search Input (Mobile uses the top-level sticky search bar) */}
      <div className="hidden sm:flex items-center gap-2.5 w-full sm:w-auto sm:flex-1 sm:max-w-md sm:min-w-[220px]">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search class or teacher..."
            className="h-9 sm:h-9.5 rounded-xl bg-muted pl-9 text-sm"
            aria-label="Search class or teacher"
          />
        </div>
      </div>

      {/* Section Filter Pills (Visible on both mobile & desktop) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar sm:flex-wrap py-0.5">
        <Button variant="ghost" className={pill(activeSection === "all")} onClick={() => onSectionChange("all")}>
          All
        </Button>
        {sections.map((sec) => (
          <Button
            key={sec}
            variant="ghost"
            className={pill(activeSection === sec)}
            onClick={() => onSectionChange(sec)}
          >
            Section {sec}
          </Button>
        ))}
      </div>
    </div>
  );
}
