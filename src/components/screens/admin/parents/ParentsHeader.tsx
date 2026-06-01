"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, List, LayoutGrid } from "lucide-react";

interface ParentsHeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  totalParents: number;
  totalChildren: number;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  onAddClick: () => void;
}

export function ParentsHeader({
  search,
  onSearchChange,
  totalParents,
  totalChildren,
  viewMode,
  setViewMode,
  onAddClick,
}: ParentsHeaderProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="hidden sm:block">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Parents
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {totalParents} parents registered • {totalChildren} children linked
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
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
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shrink-0"
            onClick={onAddClick}
          >
            <UserPlus className="size-4 mr-2" /> Add Parent
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500" />
        <Input
          placeholder="Search parents or children…"
          className="pl-9 w-full"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
