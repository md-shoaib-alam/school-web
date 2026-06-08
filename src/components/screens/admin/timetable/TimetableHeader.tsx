"use client";

import { Button } from "@/components/ui/button";
import { ClassSelect } from "@/components/ui/class-select";
import { Calendar, LayoutGrid, List, CalendarDays, Plus, Settings } from "lucide-react";
import type { ViewMode } from "./types";

interface TimetableHeaderProps {
  currentClass: any;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  selectedClass: string;
  onClassChange: (id: string) => void;
  canEdit: boolean;
  canCreate: boolean;
  onSettingsClick: () => void;
  onManageClick: () => void;
}

export function TimetableHeader({
  currentClass,
  viewMode,
  setViewMode,
  selectedClass,
  onClassChange,
  canEdit,
  canCreate,
  onSettingsClick,
  onManageClick,
}: TimetableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <Calendar className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Weekly Timetable</h2>
          <p className="text-sm text-muted-foreground">
            {currentClass
              ? `${currentClass.name}-${currentClass.section}`
              : "Select a class"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white dark:bg-zinc-900 p-0.5 shadow-sm">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "ghost"}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="size-4 mr-1.5" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
          >
            <List className="size-4 mr-1.5" />
            <span className="hidden sm:inline">List</span>
          </Button>
          <Button
            size="sm"
            variant={viewMode === "day" ? "default" : "ghost"}
            onClick={() => setViewMode("day")}
          >
            <CalendarDays className="size-4 mr-1.5" />
            <span className="hidden sm:inline">Day</span>
          </Button>
        </div>

        <ClassSelect
          value={selectedClass}
          onValueChange={onClassChange}
          placeholder="Select Class"
          className="w-full sm:w-56"
        />

        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 shadow-sm"
            onClick={onSettingsClick}
          >
            <Settings className="size-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        )}

        {selectedClass && canCreate && (
          <Button
            size="sm"
            onClick={onManageClick}
            className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 hover:shadow-lg hover:shadow-emerald-600/45 transition-all duration-200"
          >
            <Plus className="size-4 mr-1.5" />
            Manage
          </Button>
        )}
      </div>
    </div>
  );
}
