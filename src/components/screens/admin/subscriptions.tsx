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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Users,
  Crown,
  MoreHorizontal,
  Trash2,
  Ban,
  ArrowUpRight,
  Star,
  Eye,
  CalendarDays,
  Banknote,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Zap,
  Plus,
  Pencil,
  RotateCcw,
  CalendarClock,
  Shield,
  Sparkles,
  ArrowUpDown,
  Download,
  Filter,
  ChevronDown,
  Wallet,
  Gem,
  Gift,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { goeyToast as toast } from "goey-toast";

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
    occupation: string | null;
    user: { name: string; email: string; phone: string | null };
    students: {
      id: string;
      user: { name: string };
      class: { name: string; section: string; grade: number } | null;
    }[];
  };
}

interface ParentOption {
  id: string;
  name: string;
  email: string;
  children: string;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  planBreakdown: Record<string, number>;
}

type FilterStatus = "all" | "active" | "cancelled" | "expired";
type FilterPlan = "all" | "Basic" | "Standard" | "Premium";
type SortKey = "date" | "amount" | "name" | "plan";
type SortDir = "asc" | "desc";

// ── Constants ──
const statusConfig: Record<
  string,
  { bg: string; icon: React.ReactNode; dot: string; label: string }
> = {
  active: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    dot: "bg-emerald-500",
    label: "Active",
  },
  cancelled: {
    bg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: <XCircle className="h-3.5 w-3.5" />,
    dot: "bg-red-500",
    label: "Cancelled",
  },
  expired: {
    bg: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    icon: <Clock className="h-3.5 w-3.5" />,
    dot: "bg-gray-400",
    label: "Expired",
  },
};

const planConfig: Record<
  string,
  {
    bar: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
    price: number;
  }
> = {
  Basic: {
    bar: "bg-gray-400",
    bg: "bg-gray-50 dark:bg-gray-800/50",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-700",
    icon: <CreditCard className="h-3.5 w-3.5" />,
    price: 0,
  },
  Standard: {
    bar: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    icon: <Star className="h-3.5 w-3.5" />,
    price: 299,
  },
  Premium: {
    bar: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: <Crown className="h-3.5 w-3.5" />,
    price: 599,
  },
};

const paymentMethodIcons: Record<
  string,
  { icon: React.ReactNode; color: string }
> = {
  card: {
    icon: <CreditCard className="h-3.5 w-3.5" />,
    color: "text-blue-600",
  },
  upi: { icon: <Wallet className="h-3.5 w-3.5" />, color: "text-violet-600" },
  netbanking: {
    icon: <Banknote className="h-3.5 w-3.5" />,
    color: "text-teal-600",
  },
  wallet: {
    icon: <Wallet className="h-3.5 w-3.5" />,
    color: "text-orange-600",
  },
  free: {
    icon: <Gift className="h-3.5 w-3.5" />,
    color: "text-gray-500 dark:text-gray-400",
  },
};

const revenueChartConfig = {
  revenue: { label: "Revenue (₹)", color: "#10b981" },
} satisfies ChartConfig;

const PIE_COLORS = ["#94a3b8", "#f59e0b", "#10b981"];

// ── Component ──
export function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [planFilter, setPlanFilter] = useState<FilterPlan>("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Dialogs
  const [detailDialog, setDetailDialog] = useState<SubscriptionRecord | null>(
    null,
  );
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

  // Create form
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [createForm, setCreateForm] = useState({
    parentId: "",
    planId: "standard",
    planName: "Standard",
    amount: 299,
    period: "yearly",
    paymentMethod: "card",
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    planName: "",
    amount: 0,
    period: "",
    autoRenew: true,
    paymentMethod: "",
    status: "",
  });

  // ── Data Fetching ──
  const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await apiFetch("/api/subscriptions?view=admin");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSubscriptions(data.subscriptions);
      setStats(data.stats);
    } catch {
      toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParents = useCallback(async () => {
    try {
      const res = await apiFetch("/api/parents");
      if (!res.ok) return;
      const data = await res.json();
      setParents(
        data.map(
          (p: {
            id: string;
            name: string;
            email: string;
            children?: { name: string }[];
          }) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            children:
              p.children?.map((s: { name: string }) => s.name).join(", ") || "",
          }),
        ),
      );
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
    fetchParents();
  }, [fetchSubscriptions, fetchParents]);

  // ── Computed ──
  const filteredSubscriptions = useMemo(() => {
    let result = subscriptions.filter((s) => {
      const matchStatus = activeFilter === "all" || s.status === activeFilter;
      const matchPlan = planFilter === "all" || s.planName === planFilter;
      const matchPayment =
        paymentFilter === "all" || s.paymentMethod === paymentFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.parent?.user?.name?.toLowerCase().includes(q) ||
        s.parent?.user?.email?.toLowerCase().includes(q) ||
        s.transactionId?.toLowerCase().includes(q);
      return matchStatus && matchPlan && matchPayment && matchSearch;
    });

    result.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "date":
          return (
            dir *
            (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          );
        case "amount":
          return dir * (b.amount - a.amount);
        case "name":
          return (
            dir *
            (a.parent?.user?.name || "").localeCompare(
              b.parent?.user?.name || "",
            )
          );
        case "plan":
          return dir * (a.planName || "").localeCompare(b.planName || "");
        default:
          return 0;
      }
    });

    return result;
  }, [
    subscriptions,
    activeFilter,
    planFilter,
    paymentFilter,
    search,
    sortKey,
    sortDir,
  ]);

  const mostPopularPlan = useMemo(() => {
    if (!stats?.planBreakdown) return "N/A";
    const entries = Object.entries(stats.planBreakdown);
    if (entries.length === 0) return "N/A";
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  }, [stats]);

  const activePercent =
    stats && stats.totalSubscriptions > 0
      ? Math.round((stats.activeSubscriptions / stats.totalSubscriptions) * 100)
      : 0;

  const expiringSoon = useMemo(() => {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return subscriptions.filter((s) => {
      if (s.status !== "active" || !s.endDate) return false;
      return (
        new Date(s.endDate) <= thirtyDays && new Date(s.endDate) >= new Date()
      );
    });
  }, [subscriptions]);

  const paymentBreakdown = useMemo(() => {
    return subscriptions.reduce(
      (acc, s) => {
        const method = s.paymentMethod || "free";
        acc[method] = (acc[method] || 0) + s.amount;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [subscriptions]);

  const planRevenue = useMemo(() => {
    return Object.entries(
      subscriptions.reduce(
        (acc, s) => {
          acc[s.planName] = (acc[s.planName] || 0) + s.amount;
          return acc;
        },
        {} as Record<string, number>,
      ),
    ).map(([name, value]) => ({ name, revenue: value }));
  }, [subscriptions]);

  const activeRevenue = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + s.amount, 0);
  }, [subscriptions]);

  const maxPlanCount = stats
    ? Math.max(...Object.values(stats.planBreakdown), 1)
    : 1;

  const filterTabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: "all", label: "All", count: subscriptions.length },
    {
      key: "active",
      label: "Active",
      count: subscriptions.filter((s) => s.status === "active").length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: subscriptions.filter((s) => s.status === "cancelled").length,
    },
    {
      key: "expired",
      label: "Expired",
      count: subscriptions.filter((s) => s.status === "expired").length,
    },
  ];

  // ── Handlers ──
  const handleCancel = async (sub: SubscriptionRecord) => {
    try {
      const res = await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", subscriptionId: sub.id }),
      });
      if (!res.ok) throw new Error();
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === sub.id ? { ...s, status: "cancelled", autoRenew: false } : s,
        ),
      );
      setStats((prev) =>
        prev
          ? {
              ...prev,
              activeSubscriptions:
                prev.activeSubscriptions - (sub.status === "active" ? 1 : 0),
            }
          : prev,
      );
      toast.success(`Cancelled ${sub.parent?.user?.name}'s subscription`);
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/subscriptions?id=${deleteDialog.id}`, {
        method: "DELETE",
      });
      setSubscriptions((prev) => prev.filter((s) => s.id !== deleteDialog.id));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalSubscriptions: prev.totalSubscriptions - 1,
              activeSubscriptions:
                prev.activeSubscriptions -
                (deleteDialog.status === "active" ? 1 : 0),
              totalRevenue: prev.totalRevenue - deleteDialog.amount,
            }
          : prev,
      );
      toast.success("Subscription deleted");
      setDeleteDialog(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleActivate = async (sub: SubscriptionRecord) => {
    setProcessing(true);
    try {
      const newEnd = new Date();
      newEnd.setFullYear(newEnd.getFullYear() + 1);
      const res = await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-activate",
          subscriptionId: sub.id,
          newEndDate: newEnd.toISOString().split("T")[0],
        }),
      });
      if (!res.ok) throw new Error();
      await fetchSubscriptions();
      toast.success(`Reactivated ${sub.parent?.user?.name}'s subscription`);
      setDetailDialog(null);
    } catch {
      toast.error("Failed to reactivate");
    } finally {
      setProcessing(false);
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
        body: JSON.stringify({
          action: "admin-create",
          ...createForm,
          addons: [],
        }),
      });
      if (!res.ok) throw new Error();
      await fetchSubscriptions();
      toast.success("Subscription created successfully");
      setCreateDialog(false);
      setCreateForm({
        parentId: "",
        planId: "standard",
        planName: "Standard",
        amount: 299,
        period: "yearly",
        paymentMethod: "card",
      });
    } catch {
      toast.error("Failed to create subscription");
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = async () => {
    if (!editDialog) return;
    setProcessing(true);
    try {
      const res = await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-update",
          subscriptionId: editDialog.id,
          ...editForm,
        }),
      });
      if (!res.ok) throw new Error();
      await fetchSubscriptions();
      toast.success("Subscription updated");
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
      const res = await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-extend",
          subscriptionId: extendDialog.id,
          days: Number(extendDays),
        }),
      });
      if (!res.ok) throw new Error();
      await fetchSubscriptions();
      toast.success(`Extended by ${extendDays} days`);
      setExtendDialog(null);
    } catch {
      toast.error("Failed to extend");
    } finally {
      setProcessing(false);
    }
  };

  const openEditDialog = (sub: SubscriptionRecord) => {
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

  const handlePlanSelect = (planId: string) => {
    const configs: Record<string, { name: string; price: number }> = {
      basic: { name: "Basic", price: 0 },
      standard: { name: "Standard", price: 299 },
      premium: { name: "Premium", price: 599 },
    };
    const c = configs[planId] || configs.standard;
    setCreateForm((prev) => ({
      ...prev,
      planId,
      planName: c.name,
      amount: c.price,
    }));
  };

  const handleEditPlanSelect = (planName: string) => {
    const prices: Record<string, number> = {
      Basic: 0,
      Standard: 299,
      Premium: 599,
    };
    const ids: Record<string, string> = {
      Basic: "basic",
      Standard: "standard",
      Premium: "premium",
    };
    setEditForm((prev) => ({
      ...prev,
      planName,
      amount: prices[planName] || 0,
      planId: ids[planName],
    }));
  };

  const parseAddons = (addonsStr: string): string[] => {
    try {
      return JSON.parse(addonsStr || "[]");
    } catch {
      return [];
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Subscription Management
                  </h2>
                  <p className="text-emerald-100 text-sm">
                    Monitor, create, edit and manage all parent subscriptions
                  </p>
                </div>
              </div>
              <Button
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm hidden sm:flex"
                onClick={() => setCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> New Subscription
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
                  >
                    <Skeleton className="h-3 w-16 bg-white/20" />
                    <Skeleton className="h-6 w-10 bg-white/20 mt-1" />
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <p className="text-emerald-100 text-xs font-medium">
                      Total Plans
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.totalSubscriptions || 0}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <p className="text-emerald-100 text-xs font-medium">
                      Active
                    </p>
                    <p className="text-2xl font-bold text-emerald-200">
                      {stats?.activeSubscriptions || 0}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <p className="text-emerald-100 text-xs font-medium">
                      Revenue
                    </p>
                    <p className="text-xl font-bold flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {(stats?.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <p className="text-emerald-100 text-xs font-medium">
                      Active Revenue
                    </p>
                    <p className="text-xl font-bold flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {activeRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <p className="text-emerald-100 text-xs font-medium">
                      Top Plan
                    </p>
                    <p className="text-lg font-bold capitalize">
                      {mostPopularPlan}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Create Button */}
        <Button
          className="sm:hidden w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setCreateDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Create New Subscription
        </Button>

        {/* Expiring Soon Alert */}
        {expiringSoon.length > 0 && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                    {expiringSoon.length} Subscription
                    {expiringSoon.length > 1 ? "s" : ""} Expiring Soon
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    {expiringSoon.map((s) => s.parent?.user?.name).join(", ")} —
                    within 30 days
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 shrink-0"
                  onClick={() => setActiveFilter("active")}
                >
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health + Distribution */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Subscription Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active Rate</span>
                      <span className="font-semibold text-emerald-600">
                        {activePercent}%
                      </span>
                    </div>
                    <Progress value={activePercent} className="h-2.5" />
                    <p className="text-xs text-muted-foreground">
                      {stats?.activeSubscriptions || 0} of{" "}
                      {stats?.totalSubscriptions || 0} active
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-center">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Avg Revenue
                      </p>
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                        ₹
                        {stats?.totalSubscriptions
                          ? Math.round(
                              stats.totalRevenue / stats.totalSubscriptions,
                            ).toLocaleString()
                          : 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-center">
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Expiring Soon
                      </p>
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                        {expiringSoon.length}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Plan Distribution
                    </p>
                    {stats && Object.keys(stats.planBreakdown).length > 0 ? (
                      Object.entries(stats.planBreakdown)
                        .sort((a, b) => b[1] - a[1])
                        .map(([plan, count]) => {
                          const colors = planConfig[plan] || planConfig.Basic;
                          return (
                            <div key={plan} className="flex items-center gap-3">
                              <div className="flex items-center gap-2 min-w-[90px]">
                                <div
                                  className={`h-2.5 w-2.5 rounded-full ${colors.bar}`}
                                />
                                <span className="text-xs font-medium">
                                  {plan}
                                </span>
                              </div>
                              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
                                  style={{
                                    width: `${Math.max((count / maxPlanCount) * 100, 8)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-6 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No data
                      </p>
                    )}
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-2 pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Payment Methods
                    </p>
                    {Object.entries(paymentBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .map(([method, amount]) => (
                        <div
                          key={method}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                paymentMethodIcons[method]?.color ||
                                "text-gray-500 dark:text-gray-400"
                              }
                            >
                              {paymentMethodIcons[method]?.icon || (
                                <Wallet className="h-3.5 w-3.5" />
                              )}
                            </span>
                            <span className="text-xs capitalize">{method}</span>
                          </div>
                          <span className="text-xs font-semibold">
                            ₹{amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" /> Revenue by
                Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[220px] w-full" />
              ) : (
                <ChartContainer
                  config={revenueChartConfig}
                  className="h-[220px] w-full"
                >
                  <BarChart data={planRevenue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={70}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="revenue"
                      fill="var(--color-revenue)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Plan Pie + Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Gem className="h-4 w-4 text-violet-500" /> Plan Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[180px] w-full" />
              ) : (
                <ChartContainer
                  config={revenueChartConfig}
                  className="h-[180px] w-full"
                >
                  <PieChart>
                    <Pie
                      data={planRevenue.map((p) => ({
                        ...p,
                        count: stats?.planBreakdown?.[p.name] || 0,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="name"
                      fontSize={11}
                    >
                      {planRevenue.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RTooltip
                      content={({ active, payload }) => {
                        if (!active?.[0]?.payload) return null;
                        const d = active[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-xs">
                            <span className="font-semibold">{d.name}</span>:{" "}
                            {d.count} (
                            {d.revenue > 0
                              ? `₹${d.revenue.toLocaleString()}`
                              : "Free"}
                            )
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              )}
              <Separator className="my-4" />
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(planConfig).map(([name, cfg]) => (
                  <div
                    key={name}
                    className={`p-2 rounded-lg border text-center ${cfg.bg} ${cfg.border}`}
                  >
                    <p className={`text-xs font-semibold capitalize ${cfg.text}`}>
                      {name}
                    </p>
                    <p className={`text-lg font-bold ${cfg.text}`}>
                      {stats?.planBreakdown?.[name] || 0}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3">
              {/* Top bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-teal-600" /> All
                    Subscriptions
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {filteredSubscriptions.length} result
                    {filteredSubscriptions.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search parent, email, txn..."
                    className="pl-8 h-8 text-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-2">
                {filterTabs.map((tab) => (
                  <Button
                    key={tab.key}
                    variant={activeFilter === tab.key ? "default" : "outline"}
                    size="sm"
                    className={
                      activeFilter === tab.key
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3"
                        : "text-xs h-7 px-3"
                    }
                    onClick={() => setActiveFilter(tab.key)}
                  >
                    {tab.label}{" "}
                    <span
                      className={`ml-1.5 text-[10px] ${activeFilter === tab.key ? "text-emerald-100" : "text-muted-foreground"}`}
                    >
                      {tab.count}
                    </span>
                  </Button>
                ))}
                <Separator
                  orientation="vertical"
                  className="h-5 mx-1 hidden sm:block"
                />
                <Select
                  value={planFilter}
                  onValueChange={(v) => setPlanFilter(v as FilterPlan)}
                >
                  <SelectTrigger className="w-[120px] h-7 text-xs">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-[120px] h-7 text-xs">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={`${sortKey}-${sortDir}`}
                  onValueChange={(v) => {
                    const [k, d] = v.split("-");
                    setSortKey(k as SortKey);
                    setSortDir(d as SortDir);
                  }}
                >
                  <SelectTrigger className="w-[130px] h-7 text-xs">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="amount-desc">Highest Amount</SelectItem>
                    <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full" />
                ))}
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Parent</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Amount
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Payment
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Period
                      </TableHead>
                      <TableHead className="w-14">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-16 text-muted-foreground"
                        >
                          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p className="font-medium">No subscriptions found</p>
                          <p className="text-xs mt-1">
                            {search
                              ? "Try adjusting filters"
                              : "No data matches current filters"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscriptions.map((sub) => {
                        const config =
                          statusConfig[sub.status] || statusConfig.expired;
                        const isExpiring = expiringSoon.some(
                          (e) => e.id === sub.id,
                        );
                        return (
                          <TableRow
                            key={sub.id}
                            className="hover:bg-teal-50/50 transition-colors cursor-pointer group"
                            onClick={() => setDetailDialog(sub)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[11px] font-semibold shrink-0">
                                  {(sub.parent?.user?.name || "??")
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {sub.parent?.user?.name || "Unknown"}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {sub.parent?.students?.[0]?.user?.name
                                      ? `Child: ${sub.parent.students[0].user.name}`
                                      : sub.parent?.user?.email || ""}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`font-normal capitalize text-xs ${planConfig[sub.planName] ? `${planConfig[sub.planName].bg} ${planConfig[sub.planName].text} ${planConfig[sub.planName].border}` : ""}`}
                              >
                                {planConfig[sub.planName]?.icon}
                                {sub.planName}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <span className="text-sm font-semibold">
                                ₹{sub.amount.toLocaleString()}
                              </span>
                              <span className="text-[11px] text-muted-foreground ml-0.5">
                                /{sub.period === "yearly" ? "yr" : "mo"}
                              </span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`h-2 w-2 rounded-full ${config.dot}`}
                                />
                                <span className="text-xs font-medium capitalize">
                                  {config.label}
                                </span>
                                {isExpiring && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Expiring within 30 days
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={
                                    paymentMethodIcons[sub.paymentMethod]
                                      ?.color ||
                                    "text-gray-500 dark:text-gray-400"
                                  }
                                >
                                  {paymentMethodIcons[sub.paymentMethod]
                                    ?.icon || (
                                    <Wallet className="h-3.5 w-3.5" />
                                  )}
                                </span>
                                <span className="text-xs capitalize">
                                  {sub.paymentMethod}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                              {sub.startDate
                                ? new Date(sub.startDate).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric" },
                                  )
                                : "—"}
                              {" → "}
                              {sub.endDate
                                ? new Date(sub.endDate).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric" },
                                  )
                                : "—"}
                              {sub.autoRenew && (
                                <RefreshCw className="h-3 w-3 inline ml-1 text-emerald-500" />
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDetailDialog(sub);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" /> View
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditDialog(sub);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                    Plan
                                  </DropdownMenuItem>
                                  {sub.status === "active" && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExtendDialog(sub);
                                        setExtendDays("30");
                                      }}
                                    >
                                      <CalendarClock className="h-4 w-4 mr-2" />{" "}
                                      Extend Date
                                    </DropdownMenuItem>
                                  )}
                                  {(sub.status === "cancelled" ||
                                    sub.status === "expired") && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleActivate(sub);
                                      }}
                                    >
                                      <RotateCcw className="h-4 w-4 mr-2" />{" "}
                                      Reactivate
                                    </DropdownMenuItem>
                                  )}
                                  {sub.status === "active" && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancel(sub);
                                      }}
                                      className="text-amber-600 focus:text-amber-600"
                                    >
                                      <Ban className="h-4 w-4 mr-2" /> Cancel
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteDialog(sub);
                                    }}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── DIALOGS ── */}

        {/* Create Subscription Dialog */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" /> Create
                Subscription
              </DialogTitle>
              <DialogDescription>
                Manually assign a subscription plan to a parent
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Parent *</Label>
                <Select
                  value={createForm.parentId}
                  onValueChange={(v) =>
                    setCreateForm((p) => ({ ...p, parentId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {parents.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex flex-col">
                          <span>{p.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {p.email}
                            {p.children ? ` · ${p.children}` : ""}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Plan</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["basic", "standard", "premium"] as const).map((id) => {
                    const name = id.charAt(0).toUpperCase() + id.slice(1);
                    const cfg = planConfig[name];
                    const price: Record<string, number> = {
                      basic: 0,
                      standard: 299,
                      premium: 599,
                    };
                    return (
                      <button
                        key={id}
                        onClick={() => handlePlanSelect(id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${createForm.planId === id ? `${cfg.bg} ${cfg.border} ring-2 ring-emerald-200` : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                      >
                        <div className={`mx-auto mb-1 ${cfg.text}`}>
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-semibold">{name}</p>
                        <p className="text-sm font-bold">
                          {price[id] === 0 ? "Free" : `₹${price[id]}`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Period</Label>
                  <Select
                    value={createForm.period}
                    onValueChange={(v) =>
                      setCreateForm((p) => ({ ...p, period: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <Select
                    value={createForm.paymentMethod}
                    onValueChange={(v) =>
                      setCreateForm((p) => ({ ...p, paymentMethod: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Admin-created subscription. Transaction ID will be
                  auto-generated.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleCreate}
                disabled={processing || !createForm.parentId}
              >
                {processing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Subscription Dialog */}
        <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-amber-500" /> Edit Subscription
              </DialogTitle>
              <DialogDescription>
                Modify plan, status, and settings
              </DialogDescription>
            </DialogHeader>
            {editDialog && (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                    {(editDialog.parent?.user?.name || "??")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {editDialog.parent?.user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {editDialog.parent?.user?.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Plan</Label>
                    <Select
                      value={editForm.planName}
                      onValueChange={handleEditPlanSelect}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
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
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Amount (₹)</Label>
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Period</Label>
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
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Payment Method
                    </Label>
                    <Select
                      value={editForm.paymentMethod}
                      onValueChange={(v) =>
                        setEditForm((p) => ({ ...p, paymentMethod: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="netbanking">Net Banking</SelectItem>
                        <SelectItem value="wallet">Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      checked={editForm.autoRenew}
                      onCheckedChange={(v) =>
                        setEditForm((p) => ({ ...p, autoRenew: v }))
                      }
                    />
                    <Label className="text-sm">Auto-Renew</Label>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditDialog(null)}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleEdit}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Extend Date Dialog */}
        <Dialog
          open={!!extendDialog}
          onOpenChange={() => setExtendDialog(null)}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-blue-500" /> Extend
                Subscription
              </DialogTitle>
              <DialogDescription>
                Add extra days to the subscription end date
              </DialogDescription>
            </DialogHeader>
            {extendDialog && (
              <div className="space-y-4 py-2">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm">
                  <p className="font-medium text-blue-800">
                    {extendDialog.parent?.user?.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Current end:{" "}
                    {extendDialog.endDate
                      ? new Date(extendDialog.endDate).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" },
                        )
                      : "Not set"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Days to Extend</Label>
                  <Input
                    type="number"
                    min="1"
                    value={extendDays}
                    onChange={(e) => setExtendDays(e.target.value)}
                    placeholder="e.g. 30"
                  />
                  <div className="flex gap-2">
                    {[7, 15, 30, 90, 365].map((d) => (
                      <Button
                        key={d}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setExtendDays(String(d))}
                      >
                        {d}d
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setExtendDialog(null)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleExtend}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Extending...
                  </>
                ) : (
                  "Extend"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog
          open={!!detailDialog}
          onOpenChange={() => setDetailDialog(null)}
        >
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" /> Subscription
                Details
              </DialogTitle>
              <DialogDescription>
                Complete subscription information
              </DialogDescription>
            </DialogHeader>
            {detailDialog && (
              <div className="space-y-4 py-2">
                {/* Parent */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                    {(detailDialog.parent?.user?.name || "??")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {detailDialog.parent?.user?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {detailDialog.parent?.user?.email}
                      {detailDialog.parent?.user?.phone
                        ? ` · ${detailDialog.parent.user.phone}`
                        : ""}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${statusConfig[detailDialog.status]?.bg || ""} font-medium capitalize`}
                  >
                    {statusConfig[detailDialog.status]?.icon}{" "}
                    <span className="ml-1">{detailDialog.status}</span>
                  </Badge>
                </div>

                {/* Children */}
                {detailDialog.parent?.students &&
                  detailDialog.parent.students.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Children ({detailDialog.parent.students.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {detailDialog.parent.students.map((student) => (
                          <Badge
                            key={student.id}
                            variant="outline"
                            className="bg-teal-50 text-teal-700 border-teal-200"
                          >
                            {student.user.name}
                            {student.class
                              ? ` (${student.class.name}${student.class.section ? "-" + student.class.section : ""})`
                              : ""}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Plan & Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border space-y-1">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="font-semibold flex items-center gap-1.5 capitalize">
                      {planConfig[detailDialog.planName]?.icon}
                      {detailDialog.planName}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border space-y-1">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-semibold">
                      ₹{detailDialog.amount.toLocaleString()}
                      <span className="text-xs text-muted-foreground font-normal">
                        /{detailDialog.period === "yearly" ? "yr" : "mo"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Dates & Payment */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ArrowUpRight className="h-4 w-4" />
                    <div>
                      <p className="text-xs">Start</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {detailDialog.startDate
                          ? new Date(detailDialog.startDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <div>
                      <p className="text-xs">End</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {detailDialog.endDate
                          ? new Date(detailDialog.endDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {paymentMethodIcons[detailDialog.paymentMethod]?.icon || (
                        <Banknote className="h-4 w-4" />
                      )}
                      <span>Payment</span>
                    </div>
                    <span className="text-sm font-medium capitalize">
                      {detailDialog.paymentMethod}
                    </span>
                  </div>
                  {detailDialog.transactionId && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Transaction ID
                      </span>
                      <code className="text-xs bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                        {detailDialog.transactionId}
                      </code>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Auto-Renew
                    </span>
                    <Badge
                      className={
                        detailDialog.autoRenew
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs border-emerald-200 dark:border-emerald-800"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs"
                      }
                    >
                      {detailDialog.autoRenew ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Created
                    </span>
                    <span className="text-xs">
                      {new Date(detailDialog.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </div>
                </div>

                {/* Add-ons */}
                {(() => {
                  const addons = parseAddons(detailDialog.addons);
                  return addons.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Add-ons
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {addons.map((a) => (
                          <Badge
                            key={a}
                            variant="outline"
                            className="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800"
                          >
                            <Gem className="h-3 w-3 mr-1" />
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            <DialogFooter className="gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (detailDialog) openEditDialog(detailDialog);
                  setDetailDialog(null);
                }}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              {detailDialog?.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (detailDialog) setExtendDialog(detailDialog);
                    setDetailDialog(null);
                  }}
                >
                  <CalendarClock className="h-3.5 w-3.5 mr-1" />
                  Extend
                </Button>
              )}
              {(detailDialog?.status === "cancelled" ||
                detailDialog?.status === "expired") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  onClick={() => {
                    if (detailDialog) handleActivate(detailDialog);
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reactivate
                </Button>
              )}
              {detailDialog?.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  onClick={() => {
                    if (detailDialog) {
                      handleCancel(detailDialog);
                      setDetailDialog(null);
                    }
                  }}
                >
                  <Ban className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailDialog(null)}
              >
                Close
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
              <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the subscription for{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {deleteDialog?.parent?.user?.name}
                </span>
                ? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
