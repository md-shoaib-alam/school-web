"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, List, LayoutGrid } from "lucide-react";

interface TeachersHeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  canCreate: boolean;
  onAddClick: () => void;
}

export function TeachersHeader({
  search,
  onSearchChange,
  viewMode,
  setViewMode,
  canCreate,
  onAddClick,
}: TeachersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative w-full sm:max-w-sm flex-1 order-2 sm:order-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search teachers…"
          className="pl-9 w-full"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto order-1 sm:order-2">
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
        {canCreate && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-sm"
            onClick={onAddClick}
          >
            <Plus className="size-4 mr-2" />
            Add Teacher
          </Button>
        )}
      </div>
    </div>
  );
}
