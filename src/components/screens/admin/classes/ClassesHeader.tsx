"use client";

import { Button } from "@/components/ui/button";
import { List, LayoutGrid, Plus } from "lucide-react";

interface ClassesHeaderProps {
  totalClasses: number;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  canCreate: boolean;
  onAddClick: () => void;
}

export function ClassesHeader({
  totalClasses,
  viewMode,
  setViewMode,
  canCreate,
  onAddClick,
}: ClassesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
      {/* Title (Centered on Mobile; Subtitle hidden on mobile) */}
      <div className="text-center sm:text-left">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          Classes
        </h2>
        <p className="text-sm text-muted-foreground hidden sm:block">
          {totalClasses} classes configured
        </p>
      </div>

      {/* Desktop Controls (View switcher & Add Class button) */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className={`size-8 p-0 ${viewMode === "table" ? "bg-card shadow-sm" : ""}`}
            aria-label="Table view"
          >
            <List className="size-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`size-8 p-0 ${viewMode === "grid" ? "bg-card shadow-sm" : ""}`}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </Button>
        </div>
        {canCreate && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            onClick={onAddClick}
          >
            <Plus className="size-4 mr-2" />
            Add Class
          </Button>
        )}
      </div>
    </div>
  );
}
