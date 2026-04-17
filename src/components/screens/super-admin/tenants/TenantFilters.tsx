import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, List, LayoutGrid, Plus, Filter } from "lucide-react";
import { ViewMode } from "./types";

interface TenantFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  planFilter: string;
  onPlanFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddClick: () => void;
  canCreate: boolean;
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
  onAddClick,
  canCreate,
}: TenantFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schools..."
              className="pl-9 h-10 rounded-xl"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={planFilter} onValueChange={onPlanFilterChange}>
              <SelectTrigger className="w-full sm:w-36 h-10 rounded-xl">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-36 h-10 rounded-xl">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
          <div className="flex items-center bg-muted/50 p-1 rounded-xl mr-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className={`h-8 w-8 rounded-lg ${viewMode === "grid" ? "shadow-sm bg-white dark:bg-gray-800" : ""}`}
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className={`h-8 w-8 rounded-lg ${viewMode === "table" ? "shadow-sm bg-white dark:bg-gray-800" : ""}`}
              onClick={() => onViewModeChange("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {canCreate && (
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white flex-1 sm:flex-none h-10 rounded-xl gap-2 shadow-md shadow-teal-100 dark:shadow-none"
              onClick={onAddClick}
            >
              <Plus className="h-4 w-4" />
              Add School
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
