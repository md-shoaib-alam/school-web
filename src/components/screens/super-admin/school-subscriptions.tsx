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
  Sparkles,
  Layers,
  Crown,
  GraduationCap,
  BookOpen,
  ExternalLink,
  MapPin,
  RefreshCw,
  X,
  ChevronRight,
  UserCheck,
  Loader2,
  LayoutGrid,
  List,
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
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
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
      slug: tenant.slug || "",
      logo: tenant.logo || null,
      address: tenant.address || "Bengaluru, Karnataka",
      plan: tenant.plan,
      startDate: tenant.startDate || tenant.createdAt || "",
      endDate: tenant.endDate || "",
      maxStudents: tenant.maxStudents,
      maxTeachers: tenant.maxTeachers,
      maxParents: tenant.maxParents,
      maxClasses: tenant.maxClasses,
      status: tenant.status,
      studentCount: tenant.studentCount ?? tenant._count?.users ?? 0,
      teacherCount: tenant.teacherCount ?? 0,
      parentCount: tenant.parentCount ?? 0,
    });
    setIsDialogOpen(true);
  };

  const [isConfirmUpdateOpen, setIsConfirmUpdateOpen] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const handleUpdate = async () => {
    setIsSubmittingAction(true);
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
      setIsConfirmUpdateOpen(false);
      setIsDialogOpen(false);
      refetch();
      toast.success("License updated successfully");
    } catch (err: any) {
      toast.error("Failed to update subscription", { description: err.message });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmCancelSubscription = async () => {
    setIsSubmittingAction(true);
    try {
      await updateTenant.mutateAsync({
        id: editingTenant.id,
        data: {
          status: "suspended",
        } as any,
      });
      setEditingTenant({ ...editingTenant, status: "suspended" });
      setIsConfirmCancelOpen(false);
      setIsDialogOpen(false);
      refetch();
      toast.success("Subscription has been canceled (Suspended)");
    } catch (err: any) {
      toast.error("Failed to cancel subscription", { description: err.message });
    } finally {
      setIsSubmittingAction(false);
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

  const renderSchoolCard = (tenant: any) => {
    const usedCount = Math.round((tenant.maxStudents || 100) * 0.7);
    const usedPct = Math.min(100, Math.round((usedCount / (tenant.maxStudents || 100)) * 100));

    return (
      <div
        key={tenant.id}
        className="bg-white dark:bg-zinc-950 text-foreground rounded-2xl p-4 border-2 border-neutral-900 dark:border-white shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
      >
        <div>
          {/* Top Header: Logo/Emblem, Title, @subdomain, More Actions */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border-2 border-neutral-900 dark:border-white flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                {tenant.logo ? (
                  <Image
                    src={tenant.logo}
                    alt={tenant.name || "School"}
                    width={44}
                    height={44}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <span className="text-neutral-900 dark:text-white font-bold text-sm">
                    {tenant.name?.slice(0, 2).toUpperCase() || "SC"}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug truncate" title={tenant.name}>
                  {tenant.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-muted-foreground font-normal truncate">
                    /{tenant.slug || "school"}
                  </span>
                  {tenant.slug && (
                    <a
                      href={`https://schoolconnect.in/${tenant.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`https://schoolconnect.in/${tenant.slug}`}
                      className="text-muted-foreground/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-zinc-900"
              onClick={() => handleEdit(tenant)}
              title="Manage School"
            >
              <Settings2 className="size-4" />
            </Button>
          </div>

          {/* Badges: Plan & Status */}
          <div className="flex items-center gap-2 mt-3.5">
            {getPlanBadge(tenant.plan)}
            <div suppressHydrationWarning>
              {getStatusBadge(tenant.status, tenant.endDate)}
            </div>
          </div>

          {/* Info Boxes: Student Limits & License Expiry */}
          <div className="grid grid-cols-2 gap-2 mt-3.5">
            {/* Student Limit */}
            <div className="bg-white dark:bg-zinc-950 border-2 border-neutral-900 dark:border-white rounded-xl p-2.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Users className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[10px] text-muted-foreground font-normal truncate">Students</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{usedPct}%</span>
              </div>
              <p className="text-xs font-bold text-foreground leading-tight mt-1 truncate">
                {tenant.maxStudents?.toLocaleString() || 100}
              </p>
              <div className="w-full h-1.5 bg-neutral-100 dark:bg-zinc-900 rounded-full overflow-hidden mt-1.5 border border-neutral-300 dark:border-zinc-800">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    usedPct > 90 ? "bg-rose-500" : usedPct > 70 ? "bg-blue-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>

            {/* License Expiry */}
            <div className="bg-white dark:bg-zinc-950 border-2 border-neutral-900 dark:border-white rounded-xl p-2.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-[10px] text-muted-foreground font-normal truncate">License Expiry</span>
              </div>
              <p className="text-xs font-bold text-foreground leading-tight mt-1 truncate" suppressHydrationWarning>
                {tenant.endDate ? format(new Date(tenant.endDate), "PP") : "No Expiry"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate mt-1">
                {tenant.startDate ? `Since ${format(new Date(tenant.startDate), "MMM yyyy")}` : "Active"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-1">
          <Button
            variant="outline"
            className="w-full h-9 rounded-xl border-2 border-neutral-900 dark:border-white bg-white dark:bg-zinc-950 hover:bg-neutral-100 dark:hover:bg-zinc-900 text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            onClick={() => handleEdit(tenant)}
          >
            <Settings2 className="size-3.5" />
            <span>Manage Subscription</span>
          </Button>
        </div>
      </div>
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

          {/* View Mode Toggle (Desktop) */}
          <div className="hidden sm:flex items-center bg-muted/60 dark:bg-slate-900 border border-border p-0.5 rounded-xl h-9 shrink-0 shadow-2xs">
            <Button
              variant="ghost"
              size="icon"
              className={`size-7.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`size-7.5 rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("table")}
              title="List View"
            >
              <List className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Main Subscriptions Content */}
      <div className="space-y-4">
        {/* Mobile View: Always Grid */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-2xl border bg-card space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            ))
          ) : filteredTenants.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border bg-card text-muted-foreground text-xs">
              No schools found matching your search.
            </div>
          ) : (
            filteredTenants.map((tenant: any) => renderSchoolCard(tenant))
          )}
        </div>

        {/* Desktop View: Grid or Table based on viewMode */}
        {viewMode === "grid" ? (
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-2xl border bg-card space-y-3">
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              ))
            ) : filteredTenants.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl border bg-card text-muted-foreground text-xs">
                No schools found matching your search.
              </div>
            ) : (
              filteredTenants.map((tenant: any) => renderSchoolCard(tenant))
            )}
          </div>
        ) : (
          <div className="hidden sm:block rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
            {/* Table summary row */}
            <div className="p-3.5 sm:p-4 border-b border-border flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Showing <strong className="text-foreground font-bold">{filteredTenants.length}</strong> of {totalSchools} schools
              </p>
            </div>

            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/80">
                    <TableHead className="w-12 pl-6 py-3.5">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 size-3.5" />
                    </TableHead>
                    <TableHead className="w-10 text-xs font-semibold text-muted-foreground">#</TableHead>
                    <TableHead className="min-w-[200px] text-xs font-semibold text-muted-foreground">School Name</TableHead>
                    <TableHead className="w-28 text-xs font-semibold text-muted-foreground">Current Plan</TableHead>
                    <TableHead className="w-28 text-xs font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="w-36 text-xs font-semibold text-muted-foreground">Expiry Date</TableHead>
                    <TableHead className="w-48 text-xs font-semibold text-muted-foreground">Student Limit</TableHead>
                    <TableHead className="w-24 text-xs font-semibold text-muted-foreground text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i} className="border-b border-border/80">
                        <TableCell colSpan={8} className="py-4 pl-6 pr-6">
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
                        <TableRow key={tenant.id} className="hover:bg-muted/30 transition-colors border-b border-border/70 last:border-none">
                          <TableCell className="pl-6 py-3.5">
                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 size-3.5" />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                          </TableCell>
                          <TableCell className="py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                {tenant.logo ? (
                                  <Image
                                    src={tenant.logo}
                                    alt={tenant.name || "School"}
                                    width={32}
                                    height={32}
                                    className="object-contain w-full h-full"
                                  />
                                ) : (
                                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                                    {tenant.name?.slice(0, 2).toUpperCase() || "SC"}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground leading-tight truncate">{tenant.name}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[10px] text-muted-foreground font-normal leading-tight truncate">
                                    /{tenant.slug || "school"}
                                  </span>
                                  {tenant.slug && (
                                    <a
                                      href={`https://schoolconnect.in/${tenant.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={`https://schoolconnect.in/${tenant.slug}`}
                                      className="text-muted-foreground/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                                    >
                                      <ExternalLink className="size-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5">{getPlanBadge(tenant.plan)}</TableCell>
                          <TableCell className="py-3.5" suppressHydrationWarning>
                            {getStatusBadge(tenant.status, tenant.endDate)}
                          </TableCell>
                          <TableCell className="py-3.5 text-xs text-muted-foreground font-medium" suppressHydrationWarning>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="whitespace-nowrap">{tenant.endDate ? format(new Date(tenant.endDate), "PP") : "No expiry"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5">
                            <div className="w-36 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] leading-tight">
                                <span className="font-bold text-foreground">{tenant.maxStudents?.toLocaleString() || 100}</span>
                                <span className="text-muted-foreground font-semibold text-[10px]">{usedPct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
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
                          <TableCell className="text-right pr-6 py-3.5">
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
          </div>
        )}

        {/* Unified Pagination for both Mobile Grid and Desktop */}
        {!isLoading && tenantsData && tenantsData.totalPages > 1 && (
          <div className="p-3 sm:px-6 sm:py-4 rounded-2xl border border-border bg-card shadow-2xs">
            <DataTablePagination
              page={currentPage}
              totalPages={tenantsData.totalPages}
              onPageChange={setCurrentPage}
              summary={`Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}\u2013${Math.min(currentPage * ITEMS_PER_PAGE, tenantsData.total)} of ${tenantsData.total} entries`}
            />
          </div>
        )}
      </div>

      {/* Manage Subscription Dialog matching user reference */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="p-0 sm:max-w-4xl md:max-w-[880px] w-[calc(100%-1.5rem)] max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              {/* Logo-aware avatar */}
              <div className="size-11 sm:size-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0 overflow-hidden">
                {editingTenant?.logo ? (
                  <Image
                    src={editingTenant.logo}
                    alt={editingTenant.name || "School"}
                    width={48}
                    height={48}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm sm:text-base">
                    {editingTenant?.name ? editingTenant.name.slice(0, 2).toUpperCase() : "SC"}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  Manage Subscription
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {editingTenant?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Status select — visible on desktop/tablet */}
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <Select
                  value={editingTenant?.status || "active"}
                  onValueChange={(v) => setEditingTenant({ ...editingTenant, status: v })}
                >
                  <SelectTrigger className="h-auto p-0 border-0 bg-transparent shadow-none font-semibold text-emerald-700 dark:text-emerald-300 capitalize text-xs focus:ring-0 gap-1 min-w-[64px] sm:min-w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial Mode</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                {editingTenant?.startDate && (
                  <span className="text-[11px] text-slate-400">
                    Since {format(new Date(editingTenant.startDate), "MMM d, yyyy")}
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
              {/* Left Column: School Overview, Counts, Plan */}
              <div className="space-y-3.5 sm:space-y-4">
                {/* School Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {/* Logo-aware avatar: show real logo, else initials */}
                    <div className="relative size-14 sm:size-16 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      {editingTenant?.logo ? (
                        <Image
                          src={editingTenant.logo}
                          alt={editingTenant.name || "School"}
                          width={64}
                          height={64}
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                          {editingTenant?.name ? editingTenant.name.slice(0, 2).toUpperCase() : "SC"}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {editingTenant?.name}
                      </h4>
                      {/* /slug style */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-slate-400 font-normal truncate">
                          /{editingTenant?.slug || "school"}
                        </span>
                        {editingTenant?.slug && (
                          <a
                            href={`https://schoolconnect.in/${editingTenant.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`https://schoolconnect.in/${editingTenant.slug}`}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                          >
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="size-3 shrink-0" />
                        <span>{editingTenant?.address || "Bengaluru, Karnataka"}</span>
                      </p>
                    </div>
                  </div>

                  {/* 3 Stats: Students, Teachers, Parents */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 shadow-2xs">
                      <div className="size-6.5 sm:size-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Users className="size-3 sm:size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {editingTenant?.studentCount ?? 0}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">Students</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 shadow-2xs">
                      <div className="size-6.5 sm:size-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <GraduationCap className="size-3 sm:size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {editingTenant?.teacherCount ?? 0}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">Teachers</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 shadow-2xs">
                      <div className="size-6.5 sm:size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <UserCheck className="size-3 sm:size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {editingTenant?.parentCount ?? 0}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">Parents</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Plan Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-200/90 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/15 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 sm:size-11 rounded-2xl bg-amber-100/80 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Crown className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Current Plan
                      </p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-100/90 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-semibold text-xs capitalize">
                          {editingTenant?.plan ? `${editingTenant.plan} Plan` : "Starter Plan"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                        {SCHOOL_PLANS.find((p) => p.id === editingTenant?.plan)?.description?.split(".")[0] || "Basic features for small schools"}
                      </p>
                    </div>
                  </div>

                  <Select
                    value={editingTenant?.plan}
                    onValueChange={(v) => {
                      const selectedPlan = SCHOOL_PLANS.find((p) => p.id === v);
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
                        setEditingTenant({ ...editingTenant, plan: v });
                      }
                    }}
                  >
                    <SelectTrigger className="h-auto p-1 sm:h-8.5 sm:px-3 border-0 sm:border bg-transparent sm:bg-white dark:sm:bg-slate-900 sm:border-slate-200 dark:sm:border-slate-800 text-blue-600 dark:text-blue-400 hover:bg-transparent sm:hover:bg-blue-50/50 shrink-0 rounded-xl gap-1.5 shadow-none sm:shadow-2xs cursor-pointer [&_svg]:size-5 sm:[&_svg]:size-4 [&_svg]:text-slate-700 sm:[&_svg]:text-blue-600 dark:[&_svg]:text-slate-300">
                      <RefreshCw className="size-3 text-blue-600 dark:text-blue-400 hidden sm:inline" />
                      <span className="hidden sm:inline text-xs font-semibold">Change Plan</span>
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {SCHOOL_PLANS.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dates (Desktop) */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">License Start Date</Label>
                      <div className="h-10 px-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
                        <Calendar className="size-4 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span className="text-xs">
                          {editingTenant?.startDate
                            ? format(new Date(editingTenant.startDate), "MMM d, yyyy")
                            : "Oct 1, 2026"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">License Expiry Date</Label>
                      <DatePicker
                        className="w-full h-10 justify-center text-center rounded-2xl border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold shadow-2xs [&_svg]:size-4 [&_svg]:text-slate-500"
                        date={editingTenant?.endDate ? new Date(editingTenant.endDate) : undefined}
                        onChange={(date) =>
                          setEditingTenant({
                            ...editingTenant,
                            endDate: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Subscription Limits */}
              <div className="space-y-3.5 sm:space-y-4">
                <div className="p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 space-y-3.5 sm:space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 sm:size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Settings2 className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Subscription Limits</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Set maximum limits for different modules</p>
                    </div>
                  </div>

                  {/* Limits on Mobile: 1-column full row, Desktop: 2-column grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                    {/* Max Students */}
                    <div className="flex sm:flex-col items-center sm:items-stretch justify-between gap-2 p-2.5 sm:p-0 rounded-xl sm:rounded-none bg-white sm:bg-transparent dark:bg-slate-900 sm:dark:bg-transparent border sm:border-0 border-slate-200/70 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <GraduationCap className="size-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Max Students</span>
                      </div>
                      <Input
                        type="number"
                        className="w-24 sm:w-full h-9 sm:h-10 text-center font-bold text-xs rounded-xl bg-slate-50 sm:bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={editingTenant?.maxStudents ?? ""}
                        onChange={(e) => setEditingTenant({ ...editingTenant, maxStudents: e.target.value })}
                      />
                    </div>

                    {/* Max Teachers */}
                    <div className="flex sm:flex-col items-center sm:items-stretch justify-between gap-2 p-2.5 sm:p-0 rounded-xl sm:rounded-none bg-white sm:bg-transparent dark:bg-slate-900 sm:dark:bg-transparent border sm:border-0 border-slate-200/70 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Users className="size-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Max Teachers</span>
                      </div>
                      <Input
                        type="number"
                        className="w-24 sm:w-full h-9 sm:h-10 text-center font-bold text-xs rounded-xl bg-slate-50 sm:bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={editingTenant?.maxTeachers ?? ""}
                        onChange={(e) => setEditingTenant({ ...editingTenant, maxTeachers: e.target.value })}
                      />
                    </div>

                    {/* Max Parents */}
                    <div className="flex sm:flex-col items-center sm:items-stretch justify-between gap-2 p-2.5 sm:p-0 rounded-xl sm:rounded-none bg-white sm:bg-transparent dark:bg-slate-900 sm:dark:bg-transparent border sm:border-0 border-slate-200/70 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <UserCheck className="size-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Max Parents</span>
                      </div>
                      <Input
                        type="number"
                        className="w-24 sm:w-full h-9 sm:h-10 text-center font-bold text-xs rounded-xl bg-slate-50 sm:bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={editingTenant?.maxParents ?? ""}
                        onChange={(e) => setEditingTenant({ ...editingTenant, maxParents: e.target.value })}
                      />
                    </div>

                    {/* Max Classes */}
                    <div className="flex sm:flex-col items-center sm:items-stretch justify-between gap-2 p-2.5 sm:p-0 rounded-xl sm:rounded-none bg-white sm:bg-transparent dark:bg-slate-900 sm:dark:bg-transparent border sm:border-0 border-slate-200/70 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <BookOpen className="size-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Max Classes</span>
                      </div>
                      <Input
                        type="number"
                        className="w-24 sm:w-full h-9 sm:h-10 text-center font-bold text-xs rounded-xl bg-slate-50 sm:bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={editingTenant?.maxClasses ?? ""}
                        onChange={(e) => setEditingTenant({ ...editingTenant, maxClasses: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Dates on Mobile (under limits) */}
                <div className="sm:hidden space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-2.5 items-end">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">License Start Date</Label>
                      <div className="h-10 w-full px-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
                        <Calendar className="size-4 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span className="text-xs">
                          {editingTenant?.startDate
                            ? format(new Date(editingTenant.startDate), "MMM d, yyyy")
                            : "Oct 1, 2026"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">License Expiry Date</Label>
                      <DatePicker
                        className="w-full h-10 justify-center text-center rounded-2xl border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold shadow-2xs [&_svg]:size-4 [&_svg]:text-slate-500"
                        date={editingTenant?.endDate ? new Date(editingTenant.endDate) : undefined}
                        onChange={(date) =>
                          setEditingTenant({
                            ...editingTenant,
                            endDate: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Mobile Status Card matching user reference image */}
                  <div className="relative rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 p-3 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 capitalize leading-tight">
                          {editingTenant?.status || "Active"}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          {editingTenant?.startDate
                            ? `Since ${format(new Date(editingTenant.startDate), "MMM d, yyyy")}`
                            : "Since Oct 1, 2026"}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <Select
                        value={editingTenant?.status || "active"}
                        onValueChange={(v) => setEditingTenant({ ...editingTenant, status: v })}
                      >
                        <SelectTrigger className="h-7 w-7 p-0 border-0 bg-transparent shadow-none hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 rounded-lg flex items-center justify-center [&_svg]:size-4 [&_svg]:text-emerald-700 dark:[&_svg]:text-emerald-300">
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="trial">Trial Mode</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Important Information box (Desktop only) */}
                <div className="hidden sm:flex p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 items-start gap-3">
                  <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="size-3.5" />
                  </div>
                  <div className="text-xs leading-relaxed text-blue-900 dark:text-blue-200">
                    <p className="font-bold text-blue-950 dark:text-blue-100 text-xs">Important Information</p>
                    <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-1 leading-normal">
                      Updating these settings will immediately affect the school's ability to login and add data. Please make sure the limits match their subscription plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              className="hidden sm:flex h-10 px-4 rounded-xl text-xs font-semibold border-rose-200 text-rose-600 dark:text-rose-400 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
              onClick={() => setIsConfirmCancelOpen(true)}
            >
              <AlertCircle className="size-3.5" />
              <span>Cancel Subscription</span>
            </Button>

            <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="w-full sm:w-auto h-10 px-5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs"
                onClick={() => setIsConfirmUpdateOpen(true)}
              >
                <ShieldCheck className="size-4 stroke-[2.5]" />
                <span>Update License</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal: Update License */}
      <Dialog open={isConfirmUpdateOpen} onOpenChange={setIsConfirmUpdateOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
              <ShieldCheck className="size-5" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Confirm License Changes
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to update the subscription limits and license details for <strong className="text-slate-800 dark:text-slate-200">{editingTenant?.name}</strong>?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <p>• Plan: <strong className="text-slate-900 dark:text-slate-200 capitalize">{editingTenant?.plan}</strong></p>
                <p>• Status: <strong className="text-slate-900 dark:text-slate-200 capitalize">{editingTenant?.status}</strong></p>
                <p>• Student Limit: <strong className="text-slate-900 dark:text-slate-200">{editingTenant?.maxStudents}</strong></p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmittingAction}
              className="h-9 px-4 rounded-xl text-xs"
              onClick={() => setIsConfirmUpdateOpen(false)}
            >
              Back
            </Button>
            <Button
              size="sm"
              disabled={isSubmittingAction}
              className="h-9 px-4 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              onClick={handleUpdate}
            >
              {isSubmittingAction ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3.5" />
                  <span>Confirm & Save</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal: Cancel Subscription */}
      <Dialog open={isConfirmCancelOpen} onOpenChange={setIsConfirmCancelOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border border-rose-200 dark:border-rose-950/60">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/40">
              <AlertCircle className="size-5" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Cancel Subscription?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will immediately change the status of <strong className="text-slate-800 dark:text-slate-200">{editingTenant?.name}</strong> to <strong className="text-rose-600 dark:text-rose-400">Suspended</strong>. School admins, teachers, and students will no longer be able to log in or access their portals.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmittingAction}
              className="h-9 px-4 rounded-xl text-xs"
              onClick={() => setIsConfirmCancelOpen(false)}
            >
              Keep Subscription
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isSubmittingAction}
              className="h-9 px-4 rounded-xl text-xs gap-1.5"
              onClick={handleConfirmCancelSubscription}
            >
              {isSubmittingAction ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Canceling…</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-3.5" />
                  <span>Yes, Cancel Subscription</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
