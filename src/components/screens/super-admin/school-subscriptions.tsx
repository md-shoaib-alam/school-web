"use client";

import { useState, useEffect } from "react";
import {
  useTenants,
  useUpdateTenant
} from "@/lib/graphql/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import Image from "next/image";
import {
  Building2,
  Calendar,
  CreditCard,
  Search,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowUpCircle,
  Settings2,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  CheckCircle2,
  Layers,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { SCHOOL_PLANS } from "@/lib/billing-constants";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export function SuperAdminSchoolSubscriptions() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [showStatsOnMobile, setShowStatsOnMobile] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: tenantsData, isLoading, refetch } = useTenants({
    search: search || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const updateTenant = useUpdateTenant();

  const handleEdit = (tenant: any) => {
    setEditingTenant({
      id: tenant.id,
      name: tenant.name,
      plan: tenant.plan,
      endDate: tenant.endDate || "",
      maxStudents: tenant.maxStudents,
      maxTeachers: tenant.maxTeachers,
      maxParents: tenant.maxParents,
      maxClasses: tenant.maxClasses,
      status: tenant.status
    });
    setIsDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        plan: editingTenant.plan,
        status: editingTenant.status,
        maxStudents: parseInt(editingTenant.maxStudents) || 0,
        maxTeachers: parseInt(editingTenant.maxTeachers) || 0,
        maxParents: parseInt(editingTenant.maxParents) || 0,
        maxClasses: parseInt(editingTenant.maxClasses) || 0,
        endDate: editingTenant.endDate || null
      };

      await updateTenant.mutateAsync({
        id: editingTenant.id,
        data: payload as any
      });
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error("Failed to update subscription", { description: err.message });
    }
  };

  const totalSchools = tenantsData?.stats?.total ?? 0;
  const activeLicenses = (tenantsData?.stats?.active ?? 0) + (tenantsData?.stats?.trial ?? 0);
  const expiringSoon = tenantsData?.stats?.expiring ?? 0;
  const totalStudents = tenantsData?.tenants?.reduce((acc: number, t: any) => acc + (t.maxStudents || 0), 0) ?? 0;

  // Filter tenants by client-side status & plan if selected
  const filteredTenants = (tenantsData?.tenants || []).filter((t: any) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (planFilter !== "all" && t.plan?.toLowerCase() !== planFilter.toLowerCase()) return false;
    return true;
  });

  const getStatusBadge = (status: string, endDate: string | null) => {
    const now = new Date();
    const expiry = endDate ? new Date(endDate) : null;

    if (status === "trial") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50">
          <span className="size-1.5 rounded-full bg-amber-500" /> Trial
        </span>
      );
    }
    if (status === "suspended") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50">
          <span className="size-1.5 rounded-full bg-rose-500" /> Suspended
        </span>
      );
    }
    if (status !== "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50">
          <span className="size-1.5 rounded-full bg-rose-500" /> {status}
        </span>
      );
    }
    if (expiry && expiry < now) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50">
          <span className="size-1.5 rounded-full bg-rose-500" /> Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
        <span className="size-1.5 rounded-full bg-emerald-500" /> Active
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const p = (plan || "").toLowerCase();
    if (p === "premium") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50">
          Premium
        </span>
      );
    }
    if (p === "standard") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
          Standard
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
        Basic
      </span>
    );
  };

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Hero Banner with schoolsubstop.png */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-blue-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-100/90 dark:border-blue-900/40 px-4 sm:px-6 py-3 sm:py-3.5 shadow-2xs">
        {/* Ambient glow effects */}
        <div className="absolute top-0 right-1/4 w-80 h-48 bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-6 right-10 w-48 h-36 bg-sky-300/15 dark:bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left Copy */}
          <div className="max-w-md min-w-0">
            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/40 shadow-2xs">
              <CreditCard className="size-3 text-blue-600 dark:text-blue-400" />
              <span>B2B Subscriptions</span>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight leading-tight mt-1 sm:mt-1.5">
              B2B School Licenses
            </h3>

            <p className="hidden sm:block text-xs text-muted-foreground mt-0.5 leading-snug font-normal">
              Manage school-level plans, limits, and license periods.
            </p>
          </div>

          {/* Right 3D Illustration */}
          <div className="relative flex items-center justify-end shrink-0 gap-3 pr-0.5 sm:pr-2">
            <div className="hidden lg:flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="size-3.5" /> Multiple Plans
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="size-3.5" /> Flexible Limits
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="size-3.5" /> Simple Management
              </div>
            </div>
            <div className="relative h-14 sm:h-20 md:h-22 aspect-[16/9] overflow-hidden select-none">
              <Image
                src="/assets/schoolsubstop.png"
                alt="B2B School Licenses"
                fill
                priority
                className="object-contain scale-125 drop-shadow-md"
                sizes="(max-width: 640px) 110px, (max-width: 768px) 160px, 200px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Dropdown Button for Stats Cards */}
      <div className="flex sm:hidden items-center justify-between">
        <button
          type="button"
          onClick={() => setShowStatsOnMobile((prev) => !prev)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted/40 text-xs font-semibold text-foreground transition-all shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="size-3.5" />
            </div>
            <span>License Overview Stats ({totalSchools} Schools)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>{showStatsOnMobile ? "Hide" : "Show"}</span>
            {showStatsOnMobile ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </div>
        </button>
      </div>

      {/* 2. Four Stat Cards (Collapsible on Mobile, 4-col on Desktop) */}
      <div className={`${showStatsOnMobile ? "grid" : "hidden"} sm:grid grid-cols-2 lg:grid-cols-4 gap-3.5`}>
        {/* Total Schools */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 sm:size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Building2 className="size-4" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Total Schools</p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {totalSchools}
              </span>
              <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                <ArrowUpRight className="size-2.5 mr-0.5" /> 20%
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 font-medium">+2 this month</p>
        </div>

        {/* Active Licenses */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 sm:size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Award className="size-4" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Active Licenses</p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {activeLicenses}
              </span>
              <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                <ArrowUpRight className="size-2.5 mr-0.5" /> 25%
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 font-medium">+2 this month</p>
        </div>

        {/* Expiring Soon */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 sm:size-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="size-4" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Expiring Soon</p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {expiringSoon}
              </span>
              <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400">
                <ArrowDownRight className="size-2.5 mr-0.5" /> 33%
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 font-medium">-1 this month</p>
        </div>

        {/* Total Students */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 sm:size-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <Users className="size-4" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Total Students</p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {totalStudents.toLocaleString()}
              </span>
              <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                <ArrowUpRight className="size-2.5 mr-0.5" /> 18%
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 font-medium">+750 this month</p>
        </div>
      </div>

      {/* 3. Filters Row */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search schools by name, domain, or plan..."
            className="pl-9 h-9 text-xs rounded-xl border bg-card placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1 sm:w-[130px] h-9 text-xs rounded-xl bg-card">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <SelectValue placeholder="All Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial Mode</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          {/* Plan Filter */}
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="flex-1 sm:w-[130px] h-9 text-xs rounded-xl bg-card">
              <div className="flex items-center gap-1.5">
                <Layers className="size-3.5 text-muted-foreground" />
                <SelectValue placeholder="All Plans" />
              </div>
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4. Table Container */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
        {/* Table summary row */}
        <div className="p-3.5 sm:p-4 border-b border-border flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Showing <strong className="text-foreground font-bold">{filteredTenants.length}</strong> of {totalSchools} schools
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                <TableHead className="w-10 pl-4 py-3">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 size-3.5" />
                </TableHead>
                <TableHead className="w-12 text-xs font-semibold text-muted-foreground">#</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">School Name</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Current Plan</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Expiry Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Student Limit</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-b border-border">
                    <TableCell colSpan={8} className="py-3">
                      <Skeleton className="h-8 w-full rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-xs">
                    No schools found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant: any, idx: number) => {
                  const usedCount = Math.round((tenant.maxStudents || 100) * 0.7); // Displayed active utilization
                  const usedPct = Math.min(100, Math.round((usedCount / (tenant.maxStudents || 100)) * 100));

                  return (
                    <TableRow key={tenant.id} className="hover:bg-muted/30 transition-colors border-b border-border">
                      <TableCell className="pl-4 py-3">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 size-3.5" />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                            {tenant.name?.slice(0, 2).toUpperCase() || "SC"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground leading-tight">{tenant.name}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                              {tenant.slug ? `${tenant.slug}.schoolconnect.in` : "school.schoolconnect.in"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">{getPlanBadge(tenant.plan)}</TableCell>
                      <TableCell className="py-3" suppressHydrationWarning>
                        {getStatusBadge(tenant.status, tenant.endDate)}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-muted-foreground font-medium" suppressHydrationWarning>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          <span>{tenant.endDate ? format(new Date(tenant.endDate), "PP") : "No expiry"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-foreground mb-1">
                            <span>{tenant.maxStudents?.toLocaleString() || 100}</span>
                            <span className="text-muted-foreground text-[10px]">{usedPct}%</span>
                          </div>
                          <div className="w-24 sm:w-28 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                usedPct > 90 ? "bg-rose-500" : usedPct > 70 ? "bg-blue-500" : "bg-emerald-500"
                              )}
                              style={{ width: `${usedPct}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tenant)}
                          className="h-8 px-3 rounded-xl gap-1.5 text-xs font-semibold border-border hover:bg-muted/60 cursor-pointer shadow-2xs"
                        >
                          <Settings2 className="size-3.5 text-muted-foreground" />
                          <span>Manage</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && tenantsData && tenantsData.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border">
            <DataTablePagination
              page={currentPage}
              totalPages={tenantsData.totalPages}
              onPageChange={setCurrentPage}
              summary={`Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}\u2013${Math.min(currentPage * ITEMS_PER_PAGE, tenantsData.total)} of ${tenantsData.total} entries`}
            />
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Subscription: {editingTenant?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Plan</Label>
                <Select
                  value={editingTenant?.plan}
                  onValueChange={(v) => {
                    const selectedPlan = SCHOOL_PLANS.find(p => p.id === v);
                    if (selectedPlan) {
                      setEditingTenant({
                        ...editingTenant,
                        plan: v,
                        maxStudents: selectedPlan.limits.students,
                        maxTeachers: selectedPlan.limits.teachers,
                        maxParents: selectedPlan.limits.parents,
                        maxClasses: selectedPlan.limits.classes,
                      });
                    } else {
                      setEditingTenant({...editingTenant, plan: v});
                    }
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SCHOOL_PLANS.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>System Status</Label>
                <Select value={editingTenant?.status} onValueChange={(v) => setEditingTenant({...editingTenant, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="trial">Trial Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>License Expiry Date</Label>
              <DatePicker
                date={editingTenant?.endDate ? new Date(editingTenant.endDate) : undefined}
                onChange={(date) => setEditingTenant({
                  ...editingTenant,
                  endDate: date ? format(date, "yyyy-MM-dd") : ""
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Students</Label>
                <Input
                  type="number"
                  value={editingTenant?.maxStudents}
                  onChange={(e) => setEditingTenant({...editingTenant, maxStudents: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Teachers</Label>
                <Input
                  type="number"
                  value={editingTenant?.maxTeachers}
                  onChange={(e) => setEditingTenant({...editingTenant, maxTeachers: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Parents</Label>
                <Input
                  type="number"
                  value={editingTenant?.maxParents}
                  onChange={(e) => setEditingTenant({...editingTenant, maxParents: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Classes</Label>
                <Input
                  type="number"
                  value={editingTenant?.maxClasses}
                  onChange={(e) => setEditingTenant({...editingTenant, maxClasses: e.target.value})}
                />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg border flex items-start gap-3">
              <AlertCircle className="size-5 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Updating these settings will immediately affect the school's ability to login and add data.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update License</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
