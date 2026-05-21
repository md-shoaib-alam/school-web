"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, List, LayoutGrid } from "lucide-react";

interface SubjectsFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  classFilter: string;
  onClassFilterChange: (v: string) => void;
  classes: any[];
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
}

export function SubjectsFilters({
  search,
  onSearchChange,
  classFilter,
  onClassFilterChange,
  classes,
  viewMode,
  setViewMode,
}: SubjectsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects…"
            className="pl-9"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={classFilter} onValueChange={onClassFilterChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {(classes || []).map((c: any) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} - {c.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
        <Button
          variant={viewMode === "table" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("table")}
          className={`size-8 p-0 ${viewMode === "table" ? "bg-white dark:bg-zinc-700 shadow-sm" : ""}`}
        >
          <List className="size-4" />
        </Button>
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("grid")}
          className={`size-8 p-0 ${viewMode === "grid" ? "bg-white dark:bg-zinc-700 shadow-sm" : ""}`}
        >
          <LayoutGrid className="size-4" />
        </Button>
      </div>
    </div>
  );
}
