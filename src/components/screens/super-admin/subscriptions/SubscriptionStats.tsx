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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-teal-900 to-teal-800 p-6 text-white shadow-lg">
      <div className="absolute top-0 right-0 size-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Crown className="size-6 text-teal-200" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                B2C User Subscriptions
              </h2>
              <p className="text-teal-200 text-sm">
                Manage premium access across all schools
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-1 flex items-center gap-2">
              <Building2 className="size-4 ml-2 text-teal-200" />
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between cursor-pointer capitalize text-white hover:bg-white/10 hover:text-white border-0 h-8 font-normal px-2 text-xs"
                  >
                    <span className="truncate">
                      {selectedTenant === "all" ? "All Schools" : (tenants.find(t => t.id === selectedTenant)?.name || "Select School")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-teal-200" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-0 border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 shadow-xl text-zinc-950 dark:text-white" align="end">
                  <div className="flex items-center border-b px-3 border-zinc-200 dark:border-zinc-800">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input 
                      placeholder="Search schools..." 
                      value={tenantSearch}
                      onChange={(e) => onTenantSearchChange(e.target.value)}
                      className="flex h-9 w-full rounded-md bg-transparent py-3 text-xs outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground text-zinc-950 dark:text-white"
                    />
                  </div>
                  <ScrollArea className="h-48 p-1">
                    <button
                      onClick={() => {
                        onTenantChange("all");
                        setOpen(false);
                        onTenantSearchChange("");
                      }}
                      className="flex items-center justify-between w-full text-left px-3 py-1.5 text-xs hover:bg-teal-500/10 dark:hover:bg-teal-500/20 rounded-md transition-colors cursor-pointer group"
                    >
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate pr-2 group-hover:text-teal-600 dark:group-hover:text-teal-400">All Schools</span>
                      {selectedTenant === "all" && (
                        <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      )}
                    </button>
                    
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
                            className="flex items-center justify-between w-full text-left px-3 py-1.5 text-xs hover:bg-teal-500/10 dark:hover:bg-teal-500/20 rounded-md transition-colors cursor-pointer group"
                          >
                            <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate pr-2 group-hover:text-teal-600 dark:group-hover:text-teal-400">{t.name}</span>
                            {selectedTenant === t.id && (
                              <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                            )}
                          </button>
                        ))}
                        {isFetchingNextPage && (
                          <div className="flex items-center justify-center p-2 text-muted-foreground gap-1.5">
                            <Loader2 className="size-3 animate-spin text-teal-600" />
                            <span className="text-[10px]">Loading...</span>
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
                className="bg-white/20 border-white/30 hover:bg-white/30 text-white"
                onClick={onNewSetup}
              >
                <Plus className="size-4 mr-2" /> New Setup
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <p className="text-teal-200 text-[10px] font-medium uppercase tracking-wider">
              Active Plans
            </p>
            <p className="text-xl font-bold mt-0.5">
              {stats?.activeSubscriptions || 0}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <p className="text-teal-200 text-[10px] font-medium uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-xl font-bold mt-0.5 flex items-center gap-1">
              <IndianRupee className="size-3.5" />
              {(stats?.totalRevenue || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <p className="text-teal-200 text-[10px] font-medium uppercase tracking-wider">
              Avg Plan Value
            </p>
            <p className="text-xl font-bold mt-0.5 flex items-center gap-1">
              <IndianRupee className="size-3.5" />
              {stats?.totalSubscriptions
                ? Math.round(
                    stats.totalRevenue / stats.totalSubscriptions,
                  ).toLocaleString()
                : 0}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <p className="text-teal-200 text-[10px] font-medium uppercase tracking-wider">
              Non-Subscribers
            </p>
            <p className="text-xl font-bold mt-0.5 text-emerald-300">
              {selectedTenant === "all"
                ? "–"
                : Math.max(0, parentsTotal - (stats?.totalSubscriptions || 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
