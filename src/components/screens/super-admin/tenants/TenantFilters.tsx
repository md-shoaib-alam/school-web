import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, LayoutGrid, List } from "lucide-react";
import { ViewMode } from "./types";
import { SCHOOL_PLANS } from "@/lib/billing-constants";

interface TenantFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  planFilter: string;
  onPlanFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

export function TenantFilters({
  search,
  onSearchChange,
  planFilter,
  onPlanFilterChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  sortBy = "newest",
  onSortChange,
}: TenantFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const onSearchChangeRef = useRef(onSearchChange);

  // Sync ref with the latest onSearchChange callback
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  // Sync local search when the external search prop changes (e.g., cleared/reset)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce the onSearchChange callback using the stable ref
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChangeRef.current(localSearch);
    }, 400);

    return () => clearTimeout(timer);
  }, [localSearch]);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-1">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px] max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/70" />
        <Input
          placeholder="Search schools by name, domain, or plan..."
          className="pl-9 h-9 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 rounded-xl text-xs placeholder:text-slate-400 shadow-2xs focus-visible:ring-1 focus-visible:ring-blue-500"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>

      {/* Filter Selects & Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Plans Dropdown */}
        <Select value={planFilter} onValueChange={onPlanFilterChange}>
          <SelectTrigger className="w-[120px] sm:w-[125px] h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs px-3">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs">
            <SelectItem value="all" className="text-xs">All Plans</SelectItem>
            {SCHOOL_PLANS.map((plan) => (
              <SelectItem key={plan.id} value={plan.id} className="text-xs">
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Dropdown */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[120px] sm:w-[125px] h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs px-3">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs">
            <SelectItem value="all" className="text-xs">All Status</SelectItem>
            <SelectItem value="active" className="text-xs">Active</SelectItem>
            <SelectItem value="trial" className="text-xs">Trial</SelectItem>
            <SelectItem value="suspended" className="text-xs">Suspended</SelectItem>
            <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* View mode toggle */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-0.5 rounded-xl h-9 shadow-2xs">
          <Button
            variant="ghost"
            size="icon"
            className={`size-7.5 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
            onClick={() => onViewModeChange("grid")}
            title="Grid View"
          >
            <LayoutGrid className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`size-7.5 rounded-lg transition-colors ${
              viewMode === "table"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
            onClick={() => onViewModeChange("table")}
            title="List View"
          >
            <List className="size-3.5" />
          </Button>
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={onSortChange || (() => {})}>
          <SelectTrigger className="w-[145px] sm:w-[155px] h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs px-3">
            <span className="text-slate-400 mr-1 text-[11px]">Sort by:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs">
            <SelectItem value="newest" className="text-xs">Newest</SelectItem>
            <SelectItem value="oldest" className="text-xs">Oldest</SelectItem>
            <SelectItem value="name_asc" className="text-xs">Name (A-Z)</SelectItem>
            <SelectItem value="students_desc" className="text-xs">Most Students</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
