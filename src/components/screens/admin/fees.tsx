"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, DollarSign, RotateCcw } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { apiFetch } from "@/lib/api";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useFees, useStudents, useClasses } from "@/lib/graphql/hooks";
import { useAppStore } from "@/store/use-app-store";
import { useQueryClient } from "@tanstack/react-query";

// Sub-components
import { FeeTable } from "./fees/FeeTable";
import { FeeStats } from "./fees/FeeStats";
import { FeeDialog } from "./fees/FeeDialog";
import { FeeSkeleton } from "./fees/FeeSkeleton";

// Types
import type { FeeRecord, FeeFormData, StudentOption } from "./fees/types";

const emptyFormData: FeeFormData = {
  studentId: "",
  amount: "",
  type: "tuition",
  status: "pending",
  dueDate: new Date().toISOString().split("T")[0],
  paidAmount: "",
  paidDate: "",
  remark: "",
};

export function AdminFees() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("fees");
  const queryClient = useQueryClient();

  // Queries
  const { data: feesData, isLoading: loadingFees } = useFees(currentTenantId || undefined);
  const { data: studentsData } = useStudents(currentTenantId || undefined, undefined, 1, 1000);
  const { data: classesData } = useClasses(currentTenantId || undefined);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [formData, setFormData] = useState<FeeFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  // --- Helpers ---

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["fees"] });
  };

  // --- Handlers ---

  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedRecord(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (record: FeeRecord) => {
    setDialogMode("edit");
    setSelectedRecord(record);
    setFormData({
      studentId: record.studentId,
      amount: record.amount.toString(),
      type: record.type,
      status: record.status,
      dueDate: record.dueDate.split("T")[0],
      paidAmount: record.paidAmount?.toString() || "",
      paidDate: record.paidDate?.split("T")[0] || "",
      remark: record.remark || "",
    });
    setDialogOpen(true);
  };

  const handleOpenView = (record: FeeRecord) => {
    setDialogMode("view");
    setSelectedRecord(record);
    setFormData({
      studentId: record.studentId,
      amount: record.amount.toString(),
      type: record.type,
      status: record.status,
      dueDate: record.dueDate.split("T")[0],
      paidAmount: record.paidAmount?.toString() || "",
      paidDate: record.paidDate?.split("T")[0] || "",
      remark: record.remark || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.amount || !formData.dueDate) {
      toast.error("Please fill in required fields");
      return;
    }

    setSubmitting(true);
    try {
      const url = "/api/fees";
      const method = dialogMode === "create" ? "POST" : "PUT";
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : 0,
        tenantId: currentTenantId,
        id: selectedRecord?.id,
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(dialogMode === "create" ? "Record created" : "Record updated");
        setDialogOpen(false);
        invalidate();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to save record");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/fees?id=${id}&tenantId=${currentTenantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Record deleted");
        invalidate();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  // --- Derived ---

  const records = useMemo(() => {
    let filtered = (feesData?.fees || []) as FeeRecord[];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.student?.name.toLowerCase().includes(s) ||
          r.type.toLowerCase().includes(s) ||
          r.transactionId?.toLowerCase().includes(s)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (classFilter !== "all") {
      filtered = filtered.filter((r) => r.student?.class?.name === classFilter);
    }

    return filtered;
  }, [feesData, search, statusFilter, classFilter]);

  const stats = useMemo(() => {
    const all = (feesData?.fees || []) as FeeRecord[];
    const total = all.reduce((acc, r) => acc + r.amount, 0);
    const paid = all.reduce((acc, r) => acc + (r.paidAmount || 0), 0);
    const pending = total - paid;
    const rate = total > 0 ? Math.round((paid / total) * 100) : 0;

    return { total, pending, rate };
  }, [feesData]);

  const studentOptions = useMemo(() => {
    return (studentsData?.students || []).map((s: any) => ({
      id: s.id,
      name: s.name,
    }));
  }, [studentsData]);

  if (loadingFees) {
    return <FeeSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fee Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track student payments and school revenue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => invalidate()}
            className="h-10 w-10"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          {canCreate && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={handleOpenCreate}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Fee Record
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <FeeStats
        totalRevenue={stats.total}
        pendingAmount={stats.pending}
        collectionRate={stats.rate}
      />

      {/* Filters */}
      <Card className="border-none shadow-sm bg-gray-50/50 dark:bg-gray-900/20">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by student name or transaction ID..."
              className="pl-9 bg-white dark:bg-gray-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-white dark:bg-gray-900">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[140px] bg-white dark:bg-gray-900">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classesData?.classes?.map((c: any) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}-{c.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-900/20 px-6 py-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Recent Fee Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <FeeTable
            records={records}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onView={handleOpenView}
          />
        </CardContent>
      </Card>

      <FeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        record={selectedRecord}
        students={studentOptions}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
