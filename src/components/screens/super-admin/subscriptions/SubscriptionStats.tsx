import { Crown, IndianRupee, Building2, Plus, Search, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useRef, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubscriptionStatsProps {
  stats: any;
  selectedTenant: string;
  onTenantChange: (value: string) => void;
  tenants: any[];
  onNewSetup: () => void;
  parentsTotal: number;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  tenantSearch: string;
  onTenantSearchChange: (value: string) => void;
}

export function SubscriptionStats({
  stats,
  selectedTenant,
  onTenantChange,
  tenants,
  onNewSetup,
  parentsTotal,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  tenantSearch,
  onTenantSearchChange,
}: SubscriptionStatsProps) {
  const [open, setOpen] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastTenantElementRef = useCallback((node: HTMLButtonElement | null) => {
    if (isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && fetchNextPage) {
        fetchNextPage();
      }
    });
    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) =>
      t.name.toLowerCase().includes(tenantSearch.toLowerCase())
    );
  }, [tenants, tenantSearch]);
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-muted flex items-center justify-center border">
            <Crown className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              B2C User Subscriptions
            </h2>
            <p className="text-muted-foreground text-sm">
              Manage premium access across all schools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border p-1 flex items-center gap-2">
            <Building2 className="size-4 ml-2 text-muted-foreground" />
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between cursor-pointer capitalize hover:bg-muted h-8 font-normal px-2 text-xs"
                >
                  <span className="truncate">
                    {selectedTenant ? (tenants.find(t => t.id === selectedTenant)?.name || "Select School") : "Select School"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-0 border bg-popover shadow-md" align="end">
                <div className="flex items-center border-b px-3 border-border">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search schools..."
                    value={tenantSearch}
                    onChange={(e) => onTenantSearchChange(e.target.value)}
                    className="flex h-9 w-full rounded-md bg-transparent py-3 text-xs outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                  />
                </div>
                <ScrollArea className="h-48 p-1">

                  {filteredTenants.length === 0 ? (
                    <div className="p-3 text-xs text-muted-foreground text-center">No schools found.</div>
                  ) : (
                    <>
                      {filteredTenants.map((t, index) => (
                        <button
                          key={`${t.id}-${index}`}
                          ref={index === filteredTenants.length - 1 ? lastTenantElementRef : null}
                          onClick={() => {
                            onTenantChange(t.id);
                            setOpen(false);
                            onTenantSearchChange("");
                          }}
                          className="flex items-center justify-between w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded-md transition-colors cursor-pointer"
                        >
                          <span className="font-medium truncate pr-2">{t.name}</span>
                          {selectedTenant === t.id && (
                            <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                        </button>
                      ))}
                      {isFetchingNextPage && (
                        <div className="flex items-center justify-center p-2 text-muted-foreground gap-1.5">
                          <Loader2 className="size-3 animate-spin" />
                          <span className="text-xs">Loading...</span>
                        </div>
                      )}
                    </>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          {selectedTenant !== "all" && (
            <Button
              variant="outline"
              onClick={onNewSetup}
            >
              <Plus className="size-4 mr-2" /> New Setup
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="rounded-xl border p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Active plans
          </p>
          <p className="text-2xl font-semibold mt-0.5">
            {stats?.activeSubscriptions || 0}
          </p>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Total revenue
          </p>
          <p className="text-2xl font-semibold mt-0.5 flex items-center gap-1">
            <IndianRupee className="size-3.5" />
            {(stats?.totalRevenue || 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Avg plan value
          </p>
          <p className="text-2xl font-semibold mt-0.5 flex items-center gap-1">
            <IndianRupee className="size-3.5" />
            {stats?.totalSubscriptions
              ? Math.round(
                  stats.totalRevenue / stats.totalSubscriptions,
                ).toLocaleString()
              : 0}
          </p>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Non-subscribers
          </p>
          <p className="text-2xl font-semibold mt-0.5">
            {!selectedTenant
              ? "\u2013"
              : Math.max(0, parentsTotal - (stats?.totalSubscriptions || 0))}
          </p>
        </div>
      </div>
    </div>
  );
}
