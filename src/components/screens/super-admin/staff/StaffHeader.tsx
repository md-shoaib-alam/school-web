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
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
          Staff Management
        </h2>
        <p className="text-sm font-bold text-muted-foreground mt-0.5">
          Create platform staff accounts with restricted role-based permissions
        </p>
      </div>
      <div className="flex gap-3 items-center w-full sm:w-auto">
        <div className="relative max-w-xs flex-1 sm:flex-none w-full sm:w-64 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50 group-focus-within:opacity-100 transition-opacity" />
          <Input
            placeholder="Search by name, email, phone..."
            className="pl-11 h-11 rounded-xl border-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 font-medium"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button
            className="h-11 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-teal-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 shrink-0"
            onClick={onAddClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        )}
      </div>
    </div>
  );
}
