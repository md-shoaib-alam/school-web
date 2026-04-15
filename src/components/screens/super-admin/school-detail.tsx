"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Download,
  Upload,
  Search,
  Users,
  GraduationCap,
  UserCheck,
  School,
  DollarSign,
  Calendar,
  Bell,
  ClipboardCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
  CheckCircle2,
  XCircle,
  Activity,
  Ban,
  CreditCard,
  BookOpen,
  Clock,
  UserCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useTenantDetail } from "@/lib/graphql/hooks";

// ── Types ──

interface SchoolDetailProps {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  tenantPlan: string;
  onBack: () => void;
}

type TabType =
  | "students"
  | "teachers"
  | "parents"
  | "classes"
  | "fees"
  | "attendance"
  | "notices";

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  maxStudents: number;
  maxTeachers: number;
  maxParents: number;
  maxClasses: number;
  createdAt: string;
  studentCount: number;
  teacherCount: number;
  parentCount: number;
  adminCount: number;
  activeSubscriptions: number;
  totalRevenue: number;
  _count: {
    users: number;
    classes: number;
    subscriptions: number;
    notices: number;
    events: number;
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  className: string;
  gender: string;
  dateOfBirth: string;
  status: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  status: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  status: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
  grade: string;
  capacity: number;
  studentCount: number;
}

interface Fee {
  id: string;
  studentName: string;
  type: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAmount: number;
}

interface Attendance {
  id: string;
  studentName: string;
  date: string;
  status: string;
  className: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  authorName: string;
  priority: string;
  createdAt: string;
  targetRole: string;
}

interface TenantDetailData {
  tenantDetail: {
    tenant: TenantInfo;
    students: Student[];
    teachers: Teacher[];
    parents: Parent[];
    classes: Class[];
    notices: Notice[];
    fees: Fee[];
    attendance: Attendance[];
  };
}

// ── Constants ──

const ITEMS_PER_PAGE = 20;

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

const priorityColors: Record<string, { bg: string; text: string }> = {
  high: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
  medium: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  low: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
  },
};

const feeStatusColors: Record<string, { bg: string; text: string }> = {
  paid: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  pending: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  overdue: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
  partial: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
};

const attendanceStatusColors: Record<string, { bg: string; text: string }> = {
  present: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  absent: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
  late: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  excused: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
};

const TAB_CONFIG: { value: TabType; label: string; icon: React.ReactNode }[] = [
  {
    value: "students",
    label: "Students",
    icon: <GraduationCap className="h-4 w-4" />,
  },
  { value: "teachers", label: "Teachers", icon: <Users className="h-4 w-4" /> },
  {
    value: "parents",
    label: "Parents",
    icon: <UserCheck className="h-4 w-4" />,
  },
  { value: "classes", label: "Classes", icon: <School className="h-4 w-4" /> },
  { value: "fees", label: "Fees", icon: <DollarSign className="h-4 w-4" /> },
  {
    value: "attendance",
    label: "Attendance",
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  { value: "notices", label: "Notices", icon: <Bell className="h-4 w-4" /> },
];

const TENANT_DETAIL_QUERY = `
  query TenantDetail($tenantId: String!) {
    tenantDetail(tenantId: $tenantId) {
      tenant { id name slug plan status maxStudents maxTeachers maxParents maxClasses createdAt studentCount teacherCount parentCount adminCount activeSubscriptions totalRevenue _count { users classes subscriptions notices events } }
      students { id name email phone rollNumber className gender dateOfBirth status }
      teachers { id name email phone qualification experience status }
      parents { id name email phone occupation status }
      classes { id name section grade capacity studentCount }
      notices { id title content authorName priority createdAt targetRole }
      fees { id studentName type amount status dueDate paidAmount }
      attendance { id studentName date status className }
    }
  }
`;

// ── Component ──

export function SchoolDetail({
  tenantId,
  tenantName,
  tenantSlug,
  tenantPlan,
  onBack,
}: SchoolDetailProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("students");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── Data Fetching via TanStack Query ──
  const { data, isLoading: loading } = useTenantDetail(tenantId);

  // ── Tab data accessors ──
  const tabData = useMemo(() => {
    if (!data) return [];
    switch (activeTab) {
      case "students":
        return data.students;
      case "teachers":
        return data.teachers;
      case "parents":
        return data.parents;
      case "classes":
        return data.classes;
      case "fees":
        return data.fees;
      case "attendance":
        return data.attendance;
      case "notices":
        return data.notices;
      default:
        return [];
    }
  }, [data, activeTab]);

  // ── Search & Pagination ──
  const filteredData = useMemo(() => {
    if (!search.trim()) return tabData;
    const q = search.toLowerCase();
    return tabData.filter((item) => {
      return Object.values(item as unknown as Record<string, unknown>).some(
        (val) => {
          if (val == null) return false;
          return String(val).toLowerCase().includes(q);
        },
      );
    });
  }, [tabData, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / ITEMS_PER_PAGE),
  );
  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );
  }, [filteredData, currentPage]);

  // Reset page when tab or search changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    setSearch("");
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // ── Export ──
  async function handleExport(dataType: string) {
    setExporting(true);
    try {
      const res = await apiFetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, dataType }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tenantSlug}_${dataType}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${dataType} exported successfully`);
    } catch {
      toast.error("Export failed", {
        description: "Could not generate the export file.",
      });
    } finally {
      setExporting(false);
    }
  }

  // ── Import ──
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenantId", tenantId);
      formData.append("dataType", activeTab);

      const res = await apiFetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Imported ${result.imported} ${activeTab}`, {
          description:
            result.errors > 0 ? `${result.errors} errors occurred` : undefined,
        });
        queryClient.invalidateQueries({
          queryKey: ["tenant", "detail", tenantId],
        });
      } else {
        toast.error(result.error || "Import failed", {
          description: "Please check your CSV file format.",
        });
      }
    } catch {
      toast.error("Import failed", {
        description: "Could not process the file.",
      });
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  // ── Pagination range helper ──
  function getPaginationRange(
    current: number,
    total: number,
  ): (number | "ellipsis")[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "ellipsis")[] = [1];
    if (current > 3) pages.push("ellipsis");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("ellipsis");
    pages.push(total);
    return pages;
  }

  // ── Render Helpers ──

  const tenant = data?.tenant;
  const statusConfig =
    statusColors[tenant?.status || ""] || statusColors.inactive;
  const planConfig = planColors[tenant?.plan || ""] || planColors.basic;

  function renderStatusBadge(status: string) {
    const colors = statusColors[status] || statusColors.inactive;
    return (
      <Badge
        variant="outline"
        className={`${colors.bg} ${colors.text} border-transparent capitalize font-medium text-xs flex items-center gap-1 w-fit`}
      >
        {colors.icon}
        {status}
      </Badge>
    );
  }

  // ── Loading State ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="py-4">
              <CardContent className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header: Back + School Info ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schools
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">
              {tenant?.name || tenantName}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              @{tenant?.slug || tenantSlug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`${planConfig.bg} ${planConfig.text} ${planConfig.border} border capitalize font-medium text-xs`}
          >
            {tenant?.plan || tenantPlan}
          </Badge>
          <Badge
            variant="outline"
            className={`${statusConfig.bg} ${statusConfig.text} border-transparent capitalize font-medium text-xs flex items-center gap-1 w-fit`}
          >
            {statusConfig.icon}
            {tenant?.status || "unknown"}
          </Badge>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MiniStat
          icon={<GraduationCap className="h-4 w-4" />}
          label="Students"
          value={tenant?.studentCount ?? 0}
          sub={tenant?.maxStudents ? `/${tenant.maxStudents}` : undefined}
          iconBg="bg-rose-100 dark:bg-rose-900/30"
          iconColor="text-rose-600"
        />
        <MiniStat
          icon={<Users className="h-4 w-4" />}
          label="Teachers"
          value={tenant?.teacherCount ?? 0}
          sub={tenant?.maxTeachers ? `/${tenant.maxTeachers}` : undefined}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600"
        />
        <MiniStat
          icon={<UserCheck className="h-4 w-4" />}
          label="Parents"
          value={tenant?.parentCount ?? 0}
          sub={tenant?.maxParents ? `/${tenant.maxParents}` : undefined}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600"
        />
        <MiniStat
          icon={<School className="h-4 w-4" />}
          label="Classes"
          value={tenant?._count?.classes ?? 0}
          sub={tenant?.maxClasses ? `/${tenant.maxClasses}` : undefined}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600"
        />
        <MiniStat
          icon={<DollarSign className="h-4 w-4" />}
          label="Revenue"
          value={tenant?.totalRevenue ?? 0}
          isCurrency
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600"
        />
      </div>

      {/* ── Tabs Section ── */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            {/* Tab List - scrollable on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="overflow-x-auto -mx-1 px-1 pb-1 scrollbar-thin">
                <TabsList className="h-10">
                  {TAB_CONFIG.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="gap-1.5 px-3 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">{tab.icon}</span>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(activeTab)}
                  disabled={exporting || filteredData.length === 0}
                  className="h-8 text-xs"
                >
                  {exporting ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => importInputRef.current?.click()}
                  disabled={importing}
                  className="h-8 text-xs"
                >
                  {importing ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Import CSV
                </Button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
            </div>

            {/* Search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                className="pl-9"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Tab Content */}
            {TAB_CONFIG.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {filteredData.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground/50">
                      {tab.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-muted-foreground">
                      No {tab.label.toLowerCase()} found
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {search
                        ? `No results matching "${search}".`
                        : `No ${tab.label.toLowerCase()} data available yet.`}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              {renderTableHeaders(activeTab)}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedData.map((item, idx: number) => (
                              <TableRow
                                key={
                                  ((item as unknown as Record<string, unknown>)
                                    .id as string) || idx
                                }
                                className="hover:bg-rose-50 dark:bg-rose-900/30/30 transition-colors"
                              >
                                {renderTableCells(
                                  activeTab,
                                  item as unknown as Record<string, unknown>,
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredData.length,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredData.length}
                        </span>{" "}
                        {activeTab}
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
                        {getPaginationRange(currentPage, totalPages).map(
                          (page, idx) =>
                            page === "ellipsis" ? (
                              <span
                                key={`ellipsis-${idx}`}
                                className="px-1 text-muted-foreground text-sm"
                              >
                                ...
                              </span>
                            ) : (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="icon"
                                className={`h-8 w-8 ${currentPage === page ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            ),
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
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Table Header Rendering ──

function renderTableHeaders(tab: TabType) {
  const headers: Record<TabType, string[]> = {
    students: [
      "Name",
      "Email",
      "Phone",
      "Class",
      "Roll No",
      "Gender",
      "DOB",
      "Status",
    ],
    teachers: [
      "Name",
      "Email",
      "Phone",
      "Qualification",
      "Experience",
      "Status",
    ],
    parents: ["Name", "Email", "Phone", "Occupation", "Status"],
    classes: ["Name", "Section", "Grade", "Capacity", "Students", "Actions"],
    fees: ["Student", "Type", "Amount", "Status", "Due Date", "Paid"],
    attendance: ["Student", "Date", "Status", "Class"],
    notices: ["Title", "Author", "Priority", "Target", "Date"],
  };

  const responsiveHide: Record<TabType, Record<number, string>> = {
    students: {
      1: "hidden md:table-cell",
      2: "hidden lg:table-cell",
      3: "hidden md:table-cell",
      4: "hidden md:table-cell",
      5: "hidden lg:table-cell",
      6: "hidden lg:table-cell",
    },
    teachers: {
      1: "hidden md:table-cell",
      2: "hidden lg:table-cell",
      3: "hidden md:table-cell",
      4: "hidden lg:table-cell",
    },
    parents: {
      1: "hidden md:table-cell",
      2: "hidden lg:table-cell",
      3: "hidden md:table-cell",
    },
    classes: {
      1: "hidden md:table-cell",
      2: "hidden md:table-cell",
      3: "hidden md:table-cell",
    },
    fees: {
      1: "hidden md:table-cell",
      2: "hidden sm:table-cell",
      3: "hidden sm:table-cell",
      4: "hidden md:table-cell",
    },
    attendance: { 2: "hidden sm:table-cell", 3: "hidden sm:table-cell" },
    notices: { 3: "hidden md:table-cell", 4: "hidden md:table-cell" },
  };

  return (headers[tab] || []).map((h, i) => (
    <TableHead key={h} className={responsiveHide[tab]?.[i] || ""}>
      {h}
    </TableHead>
  ));
}

// ── Table Cell Rendering ──

function renderTableCells(tab: TabType, item: Record<string, unknown>) {
  switch (tab) {
    case "students":
      return (
        <>
          <TableCell>
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 text-xs font-semibold">
                {(item.name as string)?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <span className="font-medium text-sm truncate">
                {item.name as string}
              </span>
            </div>
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
            {item.email as string}
          </TableCell>
          <TableCell className="hidden lg:table-cell text-sm">
            {(item.phone as string) || "—"}
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm">
            {(item.className as string) || "—"}
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm font-mono">
            {(item.rollNumber as string) || "—"}
          </TableCell>
          <TableCell className="hidden lg:table-cell">
            <Badge variant="secondary" className="text-xs capitalize">
              {(item.gender as string) || "—"}
            </Badge>
          </TableCell>
          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
            {item.dateOfBirth
              ? format(new Date(item.dateOfBirth as string), "MMM d, yyyy")
              : "—"}
          </TableCell>
          <TableCell>{renderStatusBadge(item.status as string)}</TableCell>
        </>
      );

    case "teachers":
      return (
        <>
          <TableCell>
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 text-xs font-semibold">
                {(item.name as string)?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <span className="font-medium text-sm truncate">
                {item.name as string}
              </span>
            </div>
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
            {item.email as string}
          </TableCell>
          <TableCell className="hidden lg:table-cell text-sm">
            {(item.phone as string) || "—"}
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm">
            {(item.qualification as string) || "—"}
          </TableCell>
          <TableCell className="hidden lg:table-cell text-sm">
            {(item.experience as string) || "—"}
          </TableCell>
          <TableCell>{renderStatusBadge(item.status as string)}</TableCell>
        </>
      );

    case "parents":
      return (
        <>
          <TableCell>
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 text-xs font-semibold">
                {(item.name as string)?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <span className="font-medium text-sm truncate">
                {item.name as string}
              </span>
            </div>
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
            {item.email as string}
          </TableCell>
          <TableCell className="hidden lg:table-cell text-sm">
            {(item.phone as string) || "—"}
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm">
            {(item.occupation as string) || "—"}
          </TableCell>
          <TableCell>{renderStatusBadge(item.status as string)}</TableCell>
        </>
      );

    case "classes":
      return (
        <>
          <TableCell className="font-medium text-sm">
            {item.name as string}
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm">
            {(item.section as string) || "—"}
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm">
            {(item.grade as string) || "—"}
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm">
            {(item.capacity as number) || 0}
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {(item.studentCount as number) || 0}
              </span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{
                    width: `${item.capacity ? Math.min(100, Math.round(((item.studentCount as number) / (item.capacity as number)) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              View
            </Button>
          </TableCell>
        </>
      );

    case "fees": {
      const feeStatus = item.status as string;
      const feeColors = feeStatusColors[feeStatus] || feeStatusColors.pending;
      return (
        <>
          <TableCell className="font-medium text-sm">
            {item.studentName as string}
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm">
            {item.type as string}
          </TableCell>
          <TableCell className="hidden sm:table-cell text-sm font-semibold">
            ${((item.amount as number) || 0).toLocaleString()}
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <Badge
              variant="outline"
              className={`${feeColors.bg} ${feeColors.text} border capitalize font-medium text-xs`}
            >
              {feeStatus}
            </Badge>
          </TableCell>
          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
            {item.dueDate
              ? format(new Date(item.dueDate as string), "MMM d, yyyy")
              : "—"}
          </TableCell>
          <TableCell className="text-sm font-medium text-emerald-600">
            ${((item.paidAmount as number) || 0).toLocaleString()}
          </TableCell>
        </>
      );
    }

    case "attendance": {
      const attStatus = item.status as string;
      const attColors =
        attendanceStatusColors[attStatus] || attendanceStatusColors.present;
      return (
        <>
          <TableCell className="font-medium text-sm">
            {item.studentName as string}
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">
            {item.date
              ? format(new Date(item.date as string), "MMM d, yyyy")
              : "—"}
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <Badge
              variant="outline"
              className={`${attColors.bg} ${attColors.text} border capitalize font-medium text-xs`}
            >
              {attStatus}
            </Badge>
          </TableCell>
          <TableCell className="hidden sm:table-cell text-sm">
            {(item.className as string) || "—"}
          </TableCell>
        </>
      );
    }

    case "notices": {
      const prio = item.priority as string;
      const prioColors = priorityColors[prio] || priorityColors.low;
      return (
        <>
          <TableCell>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {item.title as string}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-xs">
                {(item.content as string)?.substring(0, 80) || ""}
                {(item.content as string)?.length > 80 ? "..." : ""}
              </p>
            </div>
          </TableCell>
          <TableCell className="text-sm">
            {(item.authorName as string) || "—"}
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Badge
              variant="outline"
              className={`${prioColors.bg} ${prioColors.text} border capitalize font-medium text-xs`}
            >
              {prio}
            </Badge>
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Badge variant="secondary" className="text-xs capitalize">
              {(item.targetRole as string) || "all"}
            </Badge>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">
            {item.createdAt
              ? format(new Date(item.createdAt as string), "MMM d, yyyy")
              : "—"}
          </TableCell>
        </>
      );
    }

    default:
      return null;
  }
}

// ── Helper: Status Badge ──

function renderStatusBadge(status: string) {
  const colors = statusColors[status] || statusColors.inactive;
  return (
    <Badge
      variant="outline"
      className={`${colors.bg} ${colors.text} border-transparent capitalize font-medium text-xs flex items-center gap-1 w-fit`}
    >
      {colors.icon}
      {status}
    </Badge>
  );
}

// ── Helper: MiniStat Card ──

function MiniStat({
  icon,
  label,
  value,
  sub,
  isCurrency,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  isCurrency?: boolean;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-lg font-bold">
              {isCurrency ? `$${value.toLocaleString()}` : value}
            </p>
            {sub && (
              <span className="text-xs text-muted-foreground">{sub}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
