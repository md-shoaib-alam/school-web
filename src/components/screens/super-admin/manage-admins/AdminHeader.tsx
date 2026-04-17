import { Search, Plus, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

export function AdminHeader({
  search,
  onSearchChange,
  onAddClick,
}: AdminHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Manage Admins
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage platform super administrator accounts
          </p>
        </div>
        <div className="flex gap-3 items-center w-full sm:w-auto">
          <div className="relative max-w-xs flex-1 sm:flex-none w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 h-10 rounded-xl"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white shrink-0 h-10 rounded-xl gap-2 shadow-md shadow-teal-100 dark:shadow-none"
            onClick={onAddClick}
          >
            <Plus className="h-4 w-4" />
            Add Super Admin
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-teal-200 bg-teal-50 dark:bg-teal-950/20 dark:border-teal-800/30 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-teal-800 dark:text-teal-300">
              Platform Admin Accounts
            </p>
            <p className="text-teal-700/80 dark:text-teal-400/80 mt-0.5">
              Super admins have full access to all schools, billing, and
              platform settings. The root platform owner is protected and cannot
              be modified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
