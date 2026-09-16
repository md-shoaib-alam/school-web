"use client";

import { Crown, IndianRupee, Building2, Plus, Search, Check, ChevronsUpDown, Loader2, Users, BarChart3, UserX } from "lucide-react";
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

// Simple sparkline SVG component
function Sparkline({ color, values, w = 80, h = 32 }: { color: string; values: number[]; w?: number; h?: number }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="opacity-70">
      <polyline
        points={pts}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const DEMO_LINES = {
  green: [2, 3, 2, 5, 4, 6, 5, 8, 7, 9],
  purple: [3, 2, 4, 3, 5, 4, 6, 5, 7, 8],
  blue: [1, 2, 2, 3, 2, 4, 3, 5, 4, 6],
  orange: [5, 4, 6, 5, 4, 3, 5, 4, 3, 4],
};

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

  const activePlans = stats?.activeSubscriptions || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const avgValue = stats?.totalSubscriptions
    ? Math.round(totalRevenue / stats.totalSubscriptions)
    : 0;
  const nonSubscribers = !selectedTenant
    ? null
    : Math.max(0, parentsTotal - (stats?.totalSubscriptions || 0));

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Card Header: title + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-border">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
            <Crown className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">B2C User Subscriptions</h3>
            <p className="text-xs text-muted-foreground">Manage premium access across all schools</p>
          </div>
        </div>

        {/* Controls — full-width row on mobile, auto on desktop */}
        <div className="flex items-center gap-2">
          {/* School selector — grows to fill on mobile */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2 h-9 flex-1 sm:flex-none">
            <Building2 className="size-3.5 text-muted-foreground shrink-0" />
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={open}
                  className="flex-1 sm:w-[180px] justify-between cursor-pointer h-7 font-normal px-1.5 text-xs hover:bg-transparent"
                >
                  <span className="truncate">
                    {selectedTenant ? (tenants.find(t => t.id === selectedTenant)?.name || "Select School") : "Select School"}
                  </span>
                  <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
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
                            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
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

          {/* New Setup button */}
          <Button
            className="h-9 px-4 text-sm rounded-lg gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onNewSetup}
          >
            <Plus className="size-3.5" />
            New Setup
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
        {/* Active Plans */}
        <div className="px-3 sm:px-5 py-3 sm:py-4 flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <div className="size-7 sm:size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <Users className="size-3.5 sm:size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-tight">Active plans</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{activePlans}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">+0 this month</p>
          </div>
          <div className="shrink-0 mt-1">
            <span className="block sm:hidden"><Sparkline color="#10b981" values={DEMO_LINES.green} w={50} h={24} /></span>
            <span className="hidden sm:block"><Sparkline color="#10b981" values={DEMO_LINES.green} /></span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="px-3 sm:px-5 py-3 sm:py-4 flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <div className="size-7 sm:size-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                <IndianRupee className="size-3.5 sm:size-4 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-tight">Total revenue</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1 flex items-center gap-0.5">
              <span className="text-sm sm:text-base font-semibold">₹</span>
              {totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">+0 this month</p>
          </div>
          <div className="shrink-0 mt-1">
            <span className="block sm:hidden"><Sparkline color="#8b5cf6" values={DEMO_LINES.purple} w={50} h={24} /></span>
            <span className="hidden sm:block"><Sparkline color="#8b5cf6" values={DEMO_LINES.purple} /></span>
          </div>
        </div>

        {/* Avg Plan Value */}
        <div className="px-3 sm:px-5 py-3 sm:py-4 flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <div className="size-7 sm:size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <BarChart3 className="size-3.5 sm:size-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-tight">Avg plan value</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1 flex items-center gap-0.5">
              <span className="text-sm sm:text-base font-semibold">₹</span>
              {avgValue.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">+0 this month</p>
          </div>
          <div className="shrink-0 mt-1">
            <span className="block sm:hidden"><Sparkline color="#3b82f6" values={DEMO_LINES.blue} w={50} h={24} /></span>
            <span className="hidden sm:block"><Sparkline color="#3b82f6" values={DEMO_LINES.blue} /></span>
          </div>
        </div>

        {/* Non-subscribers */}
        <div className="px-3 sm:px-5 py-3 sm:py-4 flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <div className="size-7 sm:size-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                <UserX className="size-3.5 sm:size-4 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-tight">Non-subscribers</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
              {nonSubscribers === null ? "–" : nonSubscribers}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              {nonSubscribers === null ? "No data yet" : "without a plan"}
            </p>
          </div>
          <div className="shrink-0 mt-1">
            <span className="block sm:hidden"><Sparkline color="#f97316" values={DEMO_LINES.orange} w={50} h={24} /></span>
            <span className="hidden sm:block"><Sparkline color="#f97316" values={DEMO_LINES.orange} /></span>
          </div>
        </div>
      </div>
    </div>
  );
}
