"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Plus,
  IndianRupee,
  RotateCcw,
  Crown,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  CalendarClock,
  CalendarDays,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { goeyToast as toast } from "goey-toast";
import { cn } from "@/lib/utils";
import {
  useParents,
  useSubscriptions,
  useTenants,
  queryKeys,
} from "@/lib/graphql/hooks";
import { useQueryClient } from "@tanstack/react-query";

// ── Types ──
interface SubscriptionRecord {
  id: string;
  parentId: string;
  planName: string;
  planId: string;
  amount: number;
  period: string;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  addons: string;
  createdAt: string;
  updatedAt: string;
  parent: {
    id: string;
    userId: string;
    user: { name: string; email: string; phone: string | null };
    students: {
      id: string;
      user: { name: string };
      class: { name: string; section: string; grade: number } | null;
    }[];
  };
}

const statusConfig: Record<
  string,
  { bg: string; icon: React.ReactNode; label: string }
> = {
  active: {
    bg: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Active",
  },
  cancelled: {
    bg: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    icon: <XCircle className="h-3.5 w-3.5" />,
    label: "Cancelled",
  },
  expired: {
    bg: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    icon: <Clock className="h-3.5 w-3.5" />,
    label: "Expired",
  },
};

export function SuperAdminSubscriptions() {
  const [selectedTenant, setSelectedTenant] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedTenant, statusFilter, search]);

  const limit = 10;
  const queryClient = useQueryClient();

  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState<SubscriptionRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<SubscriptionRecord | null>(null);
  const [extendDialog, setExtendDialog] = useState<SubscriptionRecord | null>(
    null,
  );
  const [extendDays, setExtendDays] = useState("30");
  const [processing, setProcessing] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    parentId: "",
    planId: "standard",
    planName: "Standard",
    amount: 299,
    period: "yearly",
    paymentMethod: "card",
  });
  const [editForm, setEditForm] = useState({
    planName: "",
    amount: 0,
    period: "",
    autoRenew: true,
    paymentMethod: "",
    status: "",
  });

  // ── Queries ──
  const { data: tenantsData } = useTenants({ page: 1, limit: 100 });
  const tenants = tenantsData?.tenants || [];

  const { data: subsData, isLoading: loadingSubs } = useSubscriptions({
    tenantId: selectedTenant === "all" ? undefined : selectedTenant,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
    page,
    limit,
  });

  const { data: parentsData, isLoading: loadingParents } = useParents(
    selectedTenant === "all" ? undefined : selectedTenant,
    page,
    limit,
  );

  const loading = loadingSubs || (selectedTenant !== "all" && loadingParents);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
    queryClient.invalidateQueries({ queryKey: queryKeys.parents });
  };

  // Merge parents and subscriptions
  const unifiedData = useMemo(() => {
    if (selectedTenant === "all") {
      return (subsData?.subscriptions || []).map((s) => ({
        id: s.id,
        parent: s.parent,
        subscription: s,
        status: s.status,
      }));
    }

    return (parentsData?.parents || []).map((p) => {
      const sub = p.subscription;
      return {
        id: p.id,
        parent: {
          user: { name: p.name, email: p.email, phone: p.phone },
          students: p.children || [],
        },
        subscription: sub || null,
        status: sub ? sub.status : "none",
      };
    });
  }, [parentsData, subsData, selectedTenant]);

  const stats = subsData?.stats || null;
  const totalPages =
    selectedTenant === "all"
      ? subsData?.totalPages || 1
      : parentsData?.totalPages || 1;

  const totalEntries =
    selectedTenant === "all"
      ? subsData?.total || 0
      : parentsData?.total || 0;

  // ── Handlers ──
  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/subscriptions?id=${deleteDialog.id}`, {
        method: "DELETE",
      });
      toast.success("Subscription deleted");
      invalidate();
      setDeleteDialog(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.parentId) {
      toast.error("Please select a parent");
      return;
    }
    setProcessing(true);
    try {
      const res = await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admin-create", ...createForm }),
      });
      if (!res.ok) throw new Error();
      toast.success("Subscription created");
      invalidate();
      setCreateDialog(false);
    } catch {
      toast.error("Failed to create");
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = async () => {
    if (!editDialog) return;
    setProcessing(true);
    try {
      await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-update",
          subscriptionId: editDialog.id,
          ...editForm,
        }),
      });
      toast.success("Subscription updated");
      invalidate();
      setEditDialog(null);
    } catch {
      toast.error("Failed to update");
    } finally {
      setProcessing(false);
    }
  };

  const handleExtend = async () => {
    if (!extendDialog || !extendDays || Number(extendDays) <= 0) {
      toast.error("Enter valid days");
      return;
    }
    setProcessing(true);
    try {
      await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-extend",
          subscriptionId: extendDialog.id,
          days: Number(extendDays),
        }),
      });
      toast.success(`Extended by ${extendDays} days`);
      invalidate();
      setExtendDialog(null);
    } catch {
      toast.error("Failed to extend");
    } finally {
      setProcessing(false);
    }
  };

  const openEditDialog = (sub: any) => {
    setEditForm({
      planName: sub.planName,
      amount: sub.amount,
      period: sub.period,
      autoRenew: sub.autoRenew,
      paymentMethod: sub.paymentMethod,
      status: sub.status,
    });
    setEditDialog(sub);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-teal-900 to-teal-800 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Crown className="h-6 w-6 text-teal-200" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Parent Subscriptions
                </h2>
                <p className="text-teal-200 text-sm">
                  Manage premium access across all schools
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-1 flex items-center gap-2">
                <Building2 className="h-4 w-4 ml-2 text-teal-200" />
                <Select
                  value={selectedTenant}
                  onValueChange={setSelectedTenant}
                >
                  <SelectTrigger className="w-[200px] bg-transparent border-0 text-white focus:ring-0">
                    <SelectValue placeholder="Select School" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {tenants.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedTenant !== "all" && (
                <Button
                  className="bg-white/20 border-white/30 hover:bg-white/30 text-white"
                  onClick={() => setCreateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> New Setup
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
                <IndianRupee className="h-3.5 w-3.5" />
                {(stats?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-teal-200 text-[10px] font-medium uppercase tracking-wider">
                Avg Plan Value
              </p>
              <p className="text-xl font-bold mt-0.5 flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5" />
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
                  ? "—"
                  : (parentsData?.total || 0) -
                    (stats?.totalSubscriptions || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by parent name, email or transaction ID..."
              className="pl-9 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-11">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="none">No Plan</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              onClick={() => invalidate()}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden border-teal-100 dark:border-teal-900/20">
        <Table>
          <TableHeader className="bg-teal-50/50 dark:bg-teal-900/10">
            <TableRow>
              <TableHead>Parent & Students</TableHead>
              <TableHead>Plan Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-12 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : selectedTenant === "all" &&
              (subsData?.subscriptions || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">No Results Found</p>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        We couldn't find any subscriptions matching your
                        filters.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : unifiedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No records found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              unifiedData.map((item) => {
                const sub = item.subscription;
                const parent = item.parent;

                return (
                  <TableRow
                    key={item.id}
                    className="group hover:bg-teal-50/30 dark:hover:bg-teal-900/5 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center font-bold uppercase",
                            sub
                              ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500",
                          )}
                        >
                          {parent?.user?.name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {parent?.user?.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {parent?.user?.email}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {parent?.students?.map((s: any) => (
                              <Badge
                                key={s.id}
                                variant="outline"
                                className="text-[10px] py-0 h-4 bg-white dark:bg-gray-950"
                              >
                                {s.name || s.user?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sub ? (
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "p-1.5 rounded-lg",
                              sub.planName === "Premium"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-blue-100 text-blue-600",
                            )}
                          >
                            {sub.planName === "Premium" ? (
                              <Crown className="h-4 w-4" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {sub.planName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                              ID: {sub.planId}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No Plan Assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "gap-1 py-1 px-2 text-[11px] font-medium border shadow-none",
                          sub
                            ? statusConfig[sub.status]?.bg
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 border-gray-200 dark:border-gray-700",
                        )}
                      >
                        {sub ? (
                          statusConfig[sub.status]?.icon
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {sub
                          ? statusConfig[sub.status]?.label
                          : "No Active Plan"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium capitalize">
                            {sub.period}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(sub.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {sub ? (
                        <div className="flex items-center gap-1 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {sub.amount.toLocaleString()}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {sub ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                              Subscription Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openEditDialog(sub)}
                            >
                              <Pencil className="h-4 w-4 mr-2" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setExtendDialog(sub)}
                            >
                              <CalendarClock className="h-4 w-4 mr-2" /> Extend
                              Validity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700 focus:bg-red-50"
                              onClick={() => setDeleteDialog(sub)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          onClick={() => {
                            setCreateForm((p) => ({ ...p, parentId: item.id }));
                            setCreateDialog(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Assign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Improved Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-900/20 border-t">
            <p className="text-sm text-muted-foreground">
              Showing page{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {totalPages}
              </span>
              <span className="ml-1 text-xs">
                ({totalEntries} total entries)
              </span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 gap-1 pr-3"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum = page;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0",
                        page === pageNum && "bg-teal-600 hover:bg-teal-700",
                      )}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 gap-1 pl-3"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Setup New Subscription</DialogTitle>
            <DialogDescription>
              Manually create a premium plan for a parent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Parent</Label>
              <Select
                value={createForm.parentId}
                onValueChange={(val) =>
                  setCreateForm((p) => ({ ...p, parentId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Parent" />
                </SelectTrigger>
                <SelectContent>
                  {(parentsData?.parents || []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select
                  value={createForm.planName}
                  onValueChange={(val) => {
                    const isMonthly = createForm.period === "monthly";
                    setCreateForm((p) => ({
                      ...p,
                      planName: val,
                      amount:
                        val === "Premium"
                          ? isMonthly
                            ? 99
                            : 599
                          : isMonthly
                            ? 49
                            : 299,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Select
                  value={createForm.period}
                  onValueChange={(val) => {
                    const isPremium = createForm.planName === "Premium";
                    setCreateForm((p) => ({
                      ...p,
                      period: val,
                      amount:
                        val === "monthly"
                          ? isPremium
                            ? 99
                            : 49
                          : isPremium
                            ? 599
                            : 299,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={createForm.amount}
                onChange={(e) =>
                  setCreateForm((p) => ({
                    ...p,
                    amount: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleCreate}
              disabled={processing}
            >
              {processing ? "Starting..." : "Create Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Modify active subscription details for{" "}
              {editDialog?.parent?.user?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, status: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Select
                  value={editForm.period}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, period: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input
                  value={editForm.planName}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, planName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      amount: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleEdit}
              disabled={processing}
            >
              Update Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog open={!!extendDialog} onOpenChange={() => setExtendDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Validity</DialogTitle>
            <DialogDescription>
              Add extra days to the current subscription of{" "}
              {extendDialog?.parent?.user?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Label>Number of days to add</Label>
            <Input
              type="number"
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialog(null)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleExtend}
              disabled={processing}
            >
              Add {extendDays} Days
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={() => setDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription record for{" "}
              <b>{deleteDialog?.parent?.user?.name}</b>. This action cannot be
              undone and may affect the parent's app access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
