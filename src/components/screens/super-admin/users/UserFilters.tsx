import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, Filter, Building2, Check, ChevronsUpDown } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tenants, searchQuery]);

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-zinc-800 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 w-full lg:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-50" />
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
              <Filter className="size-4 text-muted-foreground shrink-0" />
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
              <Building2 className="size-4 text-muted-foreground shrink-0" />
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    role="combobox"
                    aria-expanded={open}
                    className="h-11 rounded-xl border-2 w-full justify-between font-normal text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <span className="truncate">
                      {tenantFilter === "all" ? "All Schools" : (tenants.find(t => t.id === tenantFilter)?.name || "Select School")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl" align="start">
                  <div className="flex items-center border-b px-3 border-zinc-200 dark:border-zinc-800">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-zinc-400" />
                    <Input 
                      placeholder="Search schools..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground text-zinc-950 dark:text-white"
                    />
                  </div>
                  <ScrollArea className="h-64 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        onTenantFilterChange("all");
                        setOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">All Schools</span>
                      </div>
                      {tenantFilter === "all" && (
                        <Check className="h-4 w-4 text-teal-600 shrink-0" />
                      )}
                    </button>
                    
                    {filteredTenants.length === 0 ? (
                      <div className="p-3 text-xs text-muted-foreground text-center">No schools found.</div>
                    ) : (
                      filteredTenants.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            onTenantFilterChange(t.id);
                            setOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer group"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{t.name}</span>
                            <span className="text-xs text-muted-foreground truncate">{t.slug}</span>
                          </div>
                          {tenantFilter === t.id && (
                            <Check className="h-4 w-4 text-teal-600 shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
