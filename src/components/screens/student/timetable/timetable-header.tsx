import { Button } from "@/components/ui/button";
import { LayoutGrid, List, CalendarDays } from "lucide-react";
import { ViewMode } from "./types";

interface TimetableHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function TimetableHeader({ viewMode, setViewMode }: TimetableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          My Timetable
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Weekly class schedule and time slots
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-lg border  bg-muted p-1">
        <Button
          size="sm"
          variant={viewMode === "grid" ? "default" : "ghost"}
          onClick={() => setViewMode("grid")}
          className={
            viewMode === "grid"
              ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
              : "text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground"
          }
        >
          <LayoutGrid className="size-4 mr-1.5" />
          Grid
        </Button>
        <Button
          size="sm"
          variant={viewMode === "list" ? "default" : "ghost"}
          onClick={() => setViewMode("list")}
          className={
            viewMode === "list"
              ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
              : "text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground"
          }
        >
          <List className="size-4 mr-1.5" />
          List
        </Button>
        <Button
          size="sm"
          variant={viewMode === "day" ? "default" : "ghost"}
          onClick={() => setViewMode("day")}
          className={
            viewMode === "day"
              ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
              : "text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground"
          }
        >
          <CalendarDays className="size-4 mr-1.5" />
          Day
        </Button>
      </div>
    </div>
  );
}
