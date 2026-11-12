"use client";

import { Button } from "@/components/ui/button";
import { ClassSelect } from "@/components/ui/class-select";
import { Calendar, Plus, Settings } from "lucide-react";
import type { ViewMode } from "./types";
import { TimetableToggle } from "@/components/shared/timetable-toggle";

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

function ViewSwitcher({
  viewMode,
  setViewMode,
}: {
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
}) {
  return <TimetableToggle mode={viewMode} onChange={setViewMode} />;
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
    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center justify-between">
      {/* Top row on mobile: Title on left, View Switcher on right */}
      <div className="flex items-center justify-between gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="size-9 sm:size-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="size-4.5 sm:size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold whitespace-nowrap leading-tight">Weekly Timetable</h2>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {currentClass
                ? `${currentClass.name}-${currentClass.section}`
                : "Select a class"}
            </p>
          </div>
        </div>

        {/* View Switcher on mobile (< lg) */}
        <div className="lg:hidden shrink-0">
          <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>

      {/* Controls row: Aligned in one horizontal row on mobile */}
      <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
        {/* View Switcher on desktop (>= lg) */}
        <div className="hidden lg:block shrink-0">
          <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        <ClassSelect
          value={selectedClass}
          onValueChange={onClassChange}
          placeholder="Select Class"
          className="flex-1 lg:w-56"
        />

        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2.5 sm:px-3 bg-card hover:bg-accent  shadow-xs shrink-0"
            onClick={onSettingsClick}
            title="Timetable Settings"
          >
            <Settings className="size-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        )}

        {selectedClass && canCreate && (
          <Button
            size="sm"
            onClick={onManageClick}
            className="h-9 px-3 bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all duration-200 shrink-0"
          >
            <Plus className="size-4 mr-1.5" />
            <span>Manage</span>
          </Button>
        )}
      </div>
    </div>
  );
}
