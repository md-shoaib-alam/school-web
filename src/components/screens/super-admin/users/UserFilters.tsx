import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Building2 } from "lucide-react";
import { ROLES, TenantInfo } from "./types";

interface UserFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleFilterChange: (val: string) => void;
  tenantFilter: string;
  onTenantFilterChange: (val: string) => void;
  tenants: TenantInfo[];
}

export function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  tenantFilter,
  onTenantFilterChange,
  tenants,
}: UserFiltersProps) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 w-full lg:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-11 h-11 rounded-xl border-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 font-medium"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Role Filter */}
            <div className="flex items-center gap-2 flex-1 sm:w-48">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                <SelectTrigger className="h-11 rounded-xl border-2">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2">
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="text-xs font-bold uppercase tracking-widest">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tenant Filter */}
            <div className="flex items-center gap-2 flex-1 sm:w-60">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={tenantFilter} onValueChange={onTenantFilterChange}>
                <SelectTrigger className="h-11 rounded-xl border-2">
                  <SelectValue placeholder="Filter by school" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2">
                  <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest">All Schools</SelectItem>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs font-bold">
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
