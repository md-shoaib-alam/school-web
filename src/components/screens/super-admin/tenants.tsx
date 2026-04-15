"use client";

import { useState, useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Filter,
  Users,
  GraduationCap,
  UserCheck,
  CreditCard,
  Crown,
  LayoutGrid,
  List,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  Ban,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck,
  Loader2,
  Lock,
  EyeOff,
} from "lucide-react";
import { SchoolDetail } from "./school-detail";
import { format } from "date-fns";
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  useToggleTenantStatus,
  useCreateUser,
} from "@/lib/graphql/hooks";

// ── Types ──

interface TenantCount {
  users: number;
  classes: number;
  notices: number;
  events: number;
  subscriptions: number;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  plan: string;
  status: string;
  maxStudents: number;
  maxTeachers: number;
  maxParents: number;
  maxClasses: number;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  studentCount: number;
  teacherCount: number;
  parentCount: number;
  adminCount: number;
  activeSubscriptions: number;
  totalRevenue: number;
  _count: TenantCount;
}

interface TenantFormData {
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  plan: string;
  maxStudents: number;
  maxTeachers: number;
  maxParents: number;
  maxClasses: number;
  status: string;
}

type ViewMode = "grid" | "table";

const ITEMS_PER_PAGE = 8;

// ── Constants ──

const planColors: Record<string, { bg: string; text: string; border: string }> =
  {
    basic: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-700 dark:text-gray-300",
      border: "border-gray-200 dark:border-gray-700",
    },
    standard: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-700",
    },
    premium: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-700 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-700",
    },
    enterprise: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-700",
    },
  };

const formatDateSafe = (dateStr: any, formatStr: string = "MMM d, yyyy") => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, formatStr);
  } catch {
    return "N/A";
  }
};

const statusColors: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  active: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  trial: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: <Activity className="h-3 w-3" />,
  },
  suspended: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    icon: <Ban className="h-3 w-3" />,
  },
  inactive: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    icon: <XCircle className="h-3 w-3" />,
  },
};

const emptyFormData: TenantFormData = {
  name: "",
  slug: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  plan: "basic",
  maxStudents: 100,
  maxTeachers: 20,
  maxParents: 100,
  maxClasses: 10,
  status: "active",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Sub-Components (Memoized for Performance) ──

const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend: string | null;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <span className="text-[10px] text-emerald-600 font-medium">
                  +{trend}
                </span>
              )}
            </div>
          </div>
          <div
            className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const PlanBadge = memo(({ plan }: { plan: string }) => {
  const config = planColors[plan] || planColors.basic;
  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} border text-[10px] uppercase tracking-wider py-0.5 px-2 font-semibold`}
    >
      <Crown className="h-3 w-3 mr-1" />
      {plan}
    </Badge>
  );
});

const StatusBadge = memo(({ status }: { status: string }) => {
  const config = statusColors[status] || statusColors.inactive;
  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} gap-1 text-[10px] py-0.5 px-2 border-none`}
    >
      {config.icon}
      {status.toUpperCase()}
    </Badge>
  );
});

const InfoItem = memo(
  ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | null | undefined;
  }) => {
    return (
      <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="text-muted-foreground mt-0.5">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
            {label}
          </p>
          <p className="text-sm font-medium truncate">{value || "Not set"}</p>
        </div>
      </div>
    );
  },
);

const UsageStat = memo(
  ({
    icon,
    label,
    current,
    max,
    color,
    isCurrency = false,
  }: {
    icon: React.ReactNode;
    label: string;
    current: number;
    max: number | null;
    color: string;
    isCurrency?: boolean;
  }) => {
    const [bgClass] = color.split(" ");
    const pct = max ? Math.min(100, Math.round((current / max) * 100)) : null;

    return (
      <div className={`p-3 rounded-lg ${bgClass}/30 space-y-1.5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {icon}
            {label}
          </div>
          {pct !== null && (
            <span className="text-[10px] font-medium">{pct}%</span>
          )}
        </div>
        <p className="text-lg font-bold">
          {isCurrency ? `$${current.toLocaleString()}` : current}
          {max !== null && (
            <span className="text-xs font-normal text-muted-foreground">
              /{max}
            </span>
          )}
        </p>
        {pct !== null && (
          <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pct > 90
                  ? "bg-red-500"
                  : pct > 70
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
    );
  },
);

const TenantCard = memo(function TenantCard({
  tenant,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onManageData,
  onAddAdmin,
}: {
  tenant: Tenant;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onManageData?: () => void;
  onAddAdmin: (tenant: Tenant) => void;
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-rose-100/50 dark:border-rose-900/20">
      <CardContent className="p-5 space-y-4">
        {/* Header content... (kept same) */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/40 dark:to-rose-900/40 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/50 dark:border-rose-800/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base truncate">{tenant.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {tenant.slug}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onManageData}>
                <Database className="h-4 w-4 mr-2" />
                Manage Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddAdmin(tenant)}>
                <ShieldCheck className="h-4 w-4 mr-2 text-indigo-600" />
                Create Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleStatus}>
                {tenant.status === "active" ? (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Suspend
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges and Stats... (kept same) */}
        <div className="flex items-center gap-2">
          <PlanBadge plan={tenant.plan} />
          <StatusBadge status={tenant.status} />
        </div>

        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="text-center py-2 px-1 rounded-xl bg-muted/40 border border-muted-foreground/5">
            <GraduationCap className="h-4 w-4 mx-auto text-rose-500 mb-1" />
            <p className="text-sm font-bold leading-tight">
              {tenant.studentCount}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-tight">
              Students
            </p>
          </div>
          <div className="text-center py-2 px-1 rounded-xl bg-muted/40 border border-muted-foreground/5">
            <Users className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-sm font-bold leading-tight">
              {tenant.teacherCount}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-tight">
              Teachers
            </p>
          </div>
          <div className="text-center py-2 px-1 rounded-xl bg-muted/40 border border-muted-foreground/5">
            <UserCheck className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
            <p className="text-sm font-bold leading-tight">
              {tenant.parentCount}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-tight">
              Parents
            </p>
          </div>
        </div>

        {/* Updated Footer Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={onView}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              onClick={onManageData}
            >
              Live Data
            </Button>
          </div>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-9 rounded-lg gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
            size="sm"
            onClick={() => onAddAdmin(tenant)}
          >
            <ShieldCheck className="h-4 w-4" />
            Add School Admin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

// ── Main Component ──

export function SuperAdminTenants() {
  // Filter state
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // ── GraphQL Hooks ──
  const { data: tenantsData, isLoading: loading } = useTenants({
    status: statusFilter !== "all" ? statusFilter : undefined,
    plan: planFilter !== "all" ? planFilter : undefined,
    search: search || undefined,
  });
  const tenants = (tenantsData ?? []) as Tenant[];

  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();
  const toggleTenantStatus = useToggleTenantStatus();

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<TenantFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Admin creation state
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [targetTenantForAdmin, setTargetTenantForAdmin] =
    useState<Tenant | null>(null);
  const [adminFormData, setAdminFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const createUser = useCreateUser();

  // ── Computed values ──
  const stats = useMemo(() => {
    const allTenants = tenants;
    return {
      total: allTenants.length,
      active: allTenants.filter((t) => t.status === "active").length,
      trial: allTenants.filter((t) => t.status === "trial").length,
      suspended: allTenants.filter((t) => t.status === "suspended").length,
    };
  }, [tenants]);

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase());
      const matchesPlan = planFilter === "all" || t.plan === planFilter;
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [tenants, search, planFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTenants.length / ITEMS_PER_PAGE),
  );
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ── Handlers ──
  const handleOpenAddDialog = () => {
    setEditingTenant(null);
    setFormData(emptyFormData);
    setAutoSlug(true);
    setFormDialogOpen(true);
  };

  const handleOpenEditDialog = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      email: tenant.email || "",
      phone: tenant.phone || "",
      address: tenant.address || "",
      website: tenant.website || "",
      plan: tenant.plan,
      maxStudents: tenant.maxStudents,
      maxTeachers: tenant.maxTeachers,
      maxParents: tenant.maxParents,
      maxClasses: tenant.maxClasses,
      status: tenant.status,
    });
    setAutoSlug(false);
    setFormDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      ...(autoSlug ? { slug: generateSlug(name) } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) return;
    setSubmitting(true);
    try {
      if (editingTenant) {
        await updateTenant.mutateAsync({
          id: editingTenant.id,
          data: formData as unknown as Record<string, unknown>,
        });
      } else {
        await createTenant.mutateAsync(formData);
      }
      setFormDialogOpen(false);
    } catch (err) {
      console.error("Error saving tenant:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    const newStatus = tenant.status === "active" ? "suspended" : "active";
    try {
      await toggleTenantStatus.mutateAsync({
        id: tenant.id,
        status: newStatus,
      });
    } catch (err) {
      console.error("Error toggling tenant status:", err);
    }
  };

  const handleDelete = async () => {
    if (!deletingTenant) return;
    try {
      await deleteTenant.mutateAsync(deletingTenant.id);
      setDeleteDialogOpen(false);
      setDeletingTenant(null);
    } catch (err) {
      console.error("Error deleting tenant:", err);
    }
  };

  const handleOpenAddAdmin = (tenant: Tenant) => {
    setTargetTenantForAdmin(tenant);
    setAdminFormData({ name: "", email: "", phone: "", password: "" });
    setAdminModalOpen(true);
  };

  const handleCreateAdmin = async () => {
    if (
      !targetTenantForAdmin ||
      !adminFormData.name ||
      !adminFormData.email ||
      !adminFormData.password
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await createUser.mutateAsync({
        ...adminFormData,
        role: "admin",
        tenantId: targetTenantForAdmin.id,
      });
      setAdminModalOpen(false);
    } catch (err) {
      console.error("Error creating admin:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setPlanFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // ── Render ──
  if (selectedTenant) {
    return (
      <SchoolDetail
        tenantId={selectedTenant.id}
        tenantName={selectedTenant.name}
        tenantSlug={selectedTenant.slug}
        tenantPlan={selectedTenant.plan}
        onBack={() => setSelectedTenant(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Schools"
          value={stats.total}
          icon={<Building2 className="h-5 w-5" />}
          iconBg="bg-rose-100 dark:bg-rose-900/30"
          iconColor="text-rose-600"
          trend={null}
        />
        <StatCard
          title="Active Schools"
          value={stats.active}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600"
          trend={
            stats.total > 0
              ? `${Math.round((stats.active / stats.total) * 100)}%`
              : null
          }
        />
        <StatCard
          title="Trial Schools"
          value={stats.trial}
          icon={<Activity className="h-5 w-5" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600"
          trend={null}
        />
        <StatCard
          title="Suspended"
          value={stats.suspended}
          icon={<Ban className="h-5 w-5" />}
          iconBg="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600"
          trend={null}
        />
      </div>

      {/* ── Filters & Actions ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schools..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={planFilter}
              onValueChange={(v) => {
                setPlanFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(search || planFilter !== "all" || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-muted-foreground"
            >
              <Filter className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <div className="flex items-center border rounded-lg p-0.5">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            className="bg-rose-600 hover:bg-rose-700 text-white"
            onClick={handleOpenAddDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add School
          </Button>
        </div>
      </div>

      {/* ── Content: Loading ── */}
      {loading ? (
        <div className="space-y-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[...Array(3)].map((_, j) => (
                        <Skeleton key={j} className="h-12 rounded-lg" />
                      ))}
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : paginatedTenants.length === 0 ? (
        /* ── Content: Empty ── */
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              No schools found
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search || planFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters or search query."
                : "Get started by adding your first school."}
            </p>
            {!search && planFilter === "all" && statusFilter === "all" && (
              <Button
                className="mt-4 bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleOpenAddDialog}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add School
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* ── Content: Grid View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedTenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onView={() => {
                setViewingTenant(tenant);
                setDetailDialogOpen(true);
              }}
              onEdit={() => handleOpenEditDialog(tenant)}
              onToggleStatus={() => handleToggleStatus(tenant)}
              onDelete={() => {
                setDeletingTenant(tenant);
                setDeleteDialogOpen(true);
              }}
              onManageData={() => setSelectedTenant(tenant)}
              onAddAdmin={handleOpenAddAdmin}
            />
          ))}
        </div>
      ) : (
        /* ── Content: Table View ── */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Students
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Teachers
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Parents
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Revenue
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Subscriptions
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="w-12 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTenants.map((tenant) => (
                    <TableRow
                      key={tenant.id}
                      className="hover:bg-rose-50 dark:bg-rose-900/30/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {tenant.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {tenant.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PlanBadge plan={tenant.plan} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={tenant.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm font-medium">
                          {tenant.studentCount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /{tenant.maxStudents}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm font-medium">
                          {tenant.teacherCount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /{tenant.maxTeachers}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm font-medium">
                          {tenant.parentCount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /{tenant.maxParents}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm font-semibold">
                          ${tenant.totalRevenue.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm">
                          {tenant.activeSubscriptions}
                        </span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                        {formatDateSafe(tenant.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
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
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setViewingTenant(tenant);
                                setDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTenant(tenant);
                              }}
                            >
                              <Database className="h-4 w-4 mr-2" />
                              Manage Data
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenAddAdmin(tenant)}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2 text-indigo-600" />
                              Create Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenEditDialog(tenant)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit School
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(tenant)}
                            >
                              {tenant.status === "active" ? (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend School
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Activate School
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => {
                                setDeletingTenant(tenant);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete School
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredTenants.length,
                  )}
                </span>{" "}
                of <span className="font-medium">{filteredTenants.length}</span>{" "}
                schools
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className={`h-8 w-8 ${currentPage === page ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-muted-foreground">...</span>
                    <Button
                      variant={
                        currentPage === totalPages ? "default" : "outline"
                      }
                      size="icon"
                      className={`h-8 w-8 ${currentPage === totalPages ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid pagination */}
      {!loading && viewMode === "grid" && paginatedTenants.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTenants.length)}
            </span>{" "}
            of <span className="font-medium">{filteredTenants.length}</span>{" "}
            schools
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 ${currentPage === page ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-1 text-muted-foreground">...</span>
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 ${currentPage === totalPages ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Add/Edit Dialog ── */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTenant ? "Edit School" : "Add New School"}
            </DialogTitle>
            <DialogDescription>
              {editingTenant
                ? "Update the school details below."
                : "Fill in the details to create a new school tenant."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Name & Slug */}
            <div className="grid gap-2">
              <Label htmlFor="tenant-name">School Name *</Label>
              <Input
                id="tenant-name"
                placeholder="e.g. Springfield Academy"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tenant-slug">Slug *</Label>
                <button
                  type="button"
                  className="text-xs text-rose-600 hover:underline"
                  onClick={() => setAutoSlug(!autoSlug)}
                >
                  {autoSlug ? "Manual edit" : "Auto-generate"}
                </button>
              </div>
              <Input
                id="tenant-slug"
                placeholder="e.g. springfield-academy"
                value={formData.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setFormData((prev) => ({ ...prev, slug: e.target.value }));
                }}
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier. Used for routing.
              </p>
            </div>

            <Separator />

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tenant-email">
                  <Mail className="h-3.5 w-3.5 inline mr-1" />
                  Email
                </Label>
                <Input
                  id="tenant-email"
                  type="email"
                  placeholder="admin@school.edu"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tenant-phone">
                  <Phone className="h-3.5 w-3.5 inline mr-1" />
                  Phone
                </Label>
                <Input
                  id="tenant-phone"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tenant-address">
                <MapPin className="h-3.5 w-3.5 inline mr-1" />
                Address
              </Label>
              <Textarea
                id="tenant-address"
                placeholder="123 Main Street, City, State, ZIP"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tenant-website">
                <Globe className="h-3.5 w-3.5 inline mr-1" />
                Website
              </Label>
              <Input
                id="tenant-website"
                placeholder="https://www.school.edu"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
              />
            </div>

            <Separator />

            {/* Plan & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, plan: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-500" />
                        Basic
                      </span>
                    </SelectItem>
                    <SelectItem value="standard">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Standard
                      </span>
                    </SelectItem>
                    <SelectItem value="premium">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-500" />
                        Premium
                      </span>
                    </SelectItem>
                    <SelectItem value="enterprise">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Enterprise
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingTenant && (
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, status: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* Limits */}
            <div>
              <Label className="mb-3 block">Usage Limits</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Max Students
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.maxStudents}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxStudents: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Max Teachers
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.maxTeachers}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxTeachers: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    Max Parents
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.maxParents}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxParents: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Max Classes
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.maxClasses}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxClasses: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleSubmit}
              disabled={
                submitting || !formData.name.trim() || !formData.slug.trim()
              }
            >
              {submitting
                ? "Saving..."
                : editingTenant
                  ? "Update School"
                  : "Create School"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Details Dialog ── */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {viewingTenant && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {viewingTenant.name}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs">
                        @{viewingTenant.slug}
                      </span>
                      <PlanBadge plan={viewingTenant.plan} />
                      <StatusBadge status={viewingTenant.status} />
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid gap-5 py-2">
                {/* Contact */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoItem
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      value={viewingTenant.email}
                    />
                    <InfoItem
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone"
                      value={viewingTenant.phone}
                    />
                    <InfoItem
                      icon={<Globe className="h-4 w-4" />}
                      label="Website"
                      value={viewingTenant.website}
                    />
                    <InfoItem
                      icon={<MapPin className="h-4 w-4" />}
                      label="Address"
                      value={viewingTenant.address}
                    />
                  </div>
                </div>

                <Separator />

                {/* Stats */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Usage Statistics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <UsageStat
                      icon={<GraduationCap className="h-4 w-4" />}
                      label="Students"
                      current={viewingTenant.studentCount}
                      max={viewingTenant.maxStudents}
                      color="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                    />
                    <UsageStat
                      icon={<Users className="h-4 w-4" />}
                      label="Teachers"
                      current={viewingTenant.teacherCount}
                      max={viewingTenant.maxTeachers}
                      color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    />
                    <UsageStat
                      icon={<UserCheck className="h-4 w-4" />}
                      label="Parents"
                      current={viewingTenant.parentCount}
                      max={viewingTenant.maxParents}
                      color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    />
                    <UsageStat
                      icon={<Building2 className="h-4 w-4" />}
                      label="Classes"
                      current={viewingTenant._count.classes}
                      max={viewingTenant.maxClasses}
                      color="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    />
                    <UsageStat
                      icon={<CreditCard className="h-4 w-4" />}
                      label="Subscriptions"
                      current={viewingTenant.activeSubscriptions}
                      max={null}
                      color="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                    />
                    <UsageStat
                      icon={<Crown className="h-4 w-4" />}
                      label="Revenue"
                      current={viewingTenant.totalRevenue}
                      max={null}
                      color="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      isCurrency
                    />
                  </div>
                </div>

                <Separator />

                {/* Dates */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Important Dates
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InfoItem
                      icon={<Calendar className="h-4 w-4" />}
                      label="Created"
                      value={formatDateSafe(viewingTenant.createdAt)}
                    />
                    <InfoItem
                      icon={<Calendar className="h-4 w-4" />}
                      label="Start Date"
                      value={formatDateSafe(viewingTenant.startDate)}
                    />
                    <InfoItem
                      icon={<Calendar className="h-4 w-4" />}
                      label="End Date"
                      value={formatDateSafe(viewingTenant.endDate)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Plan details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Plan Details
                  </h4>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold capitalize">
                        {viewingTenant.plan}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {viewingTenant._count.users}
                      </span>{" "}
                      total users
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {viewingTenant._count.notices}
                      </span>{" "}
                      notices
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {viewingTenant._count.events}
                      </span>{" "}
                      events
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    handleOpenEditDialog(viewingTenant);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit School
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingTenant?.name}</strong>? This will permanently
              remove the school and all associated data including users,
              classes, notices, and subscriptions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingTenant(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete School
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Create Admin Modal ── */}
      <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold text-xl">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Create School Admin
            </DialogTitle>
            <DialogDescription>
              Set up the administrative account for{" "}
              <span className="text-foreground font-semibold uppercase text-xs px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                {targetTenantForAdmin?.name}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="admin-name"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1"
              >
                Full Name
              </Label>
              <Input
                id="admin-name"
                placeholder="e.g. Dr. Jane Smith"
                value={adminFormData.name}
                onChange={(e) =>
                  setAdminFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="admin-email"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1"
              >
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@school.com"
                  className="pl-11 h-11 rounded-xl"
                  value={adminFormData.email}
                  onChange={(e) =>
                    setAdminFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="admin-phone"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1"
              >
                Phone Number (Optional)
              </Label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="admin-phone"
                  placeholder="+1 (555) 000-0000"
                  className="pl-11 h-11 rounded-xl"
                  value={adminFormData.phone}
                  onChange={(e) =>
                    setAdminFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="admin-password"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1"
              >
                Initial Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  id="admin-password"
                  type={showAdminPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  className="pl-11 pr-11 h-11 rounded-xl"
                  value={adminFormData.password}
                  onChange={(e) =>
                    setAdminFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent text-gray-400 hover:text-indigo-600"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                >
                  {showAdminPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setAdminModalOpen(false)}
              disabled={submitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none min-w-[140px]"
              onClick={handleCreateAdmin}
              disabled={
                submitting ||
                !adminFormData.name ||
                !adminFormData.email ||
                !adminFormData.password
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Provisioning...
                </>
              ) : (
                "Create Admin"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
