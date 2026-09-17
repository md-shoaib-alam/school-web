import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

interface StaffHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  canCreate: boolean;
  onAddClick: () => void;
}

export function StaffHeader({
  search,
  onSearchChange,
  canCreate,
  onAddClick,
}: StaffHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Staff Management
        </h2>
        <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">
          Create platform staff accounts with restricted role-based permissions
        </p>
      </div>
      <div className="flex gap-2 items-center w-full sm:w-auto">
        <div className="relative max-w-xs flex-1 sm:flex-none w-full sm:w-60 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground opacity-50 group-focus-within:opacity-100 transition-opacity" />
          <Input
            placeholder="Search by name, email, phone..."
            className="pl-9 h-9 text-sm rounded-lg border focus-visible:ring-primary/20 focus-visible:border-primary"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button
            className="h-9 px-4 text-sm rounded-lg shrink-0 gap-1.5"
            onClick={onAddClick}
          >
            <Plus className="size-3.5" />
            Add Staff
          </Button>
        )}
      </div>
    </div>
  );
}
