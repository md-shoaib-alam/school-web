"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Search,
  Clock,
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Eye,
  School,
} from "lucide-react";
import type { FeeRecord } from "@/lib/types";
import { toast } from "sonner";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useQueryClient } from "@tanstack/react-query";
import { useFees, useStudents, useClasses } from "@/lib/graphql/hooks";
import { useAppStore } from "@/store/use-app-store";

const statusConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
  paid: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  pending: {
    bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  overdue: {
    bg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

interface StudentOption {
  id: string;
  name: string;
}

interface FeeFormData {
  studentId: string;
  amount: string;
  type: string;
  status: string;
  dueDate: string;
  paidAmount: string;
  paidDate: string;
}

const emptyFeeForm: FeeFormData = {
  studentId: "",
  amount: "",
  type: "tuition",
  status: "pending",
  dueDate: "",
  paidAmount: "0",
  paidDate: "",
};

export function AdminFees() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("fees");
  const queryClient = useQueryClient();
  const { data: feesData, isLoading: feesLoading } = useFees(currentTenantId || undefined);
  const { data: studentsData, isLoading: studentsLoading } = useStudents(currentTenantId || undefined);
  const { data: classesData, isLoading: classesLoading } = useClasses(currentTenantId || undefined);

  const fees = feesData?.fees || [];
  const students = studentsData?.students || [];
  const classes = classesData?.classes || [];

  const loading = feesLoading || studentsLoading || classesLoading;
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const isSelectionMade = selectedClass !== null;

  const refetchFees = () =>
    queryClient.invalidateQueries({ queryKey: ["fees", currentTenantId] });

  // Add fee dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<FeeFormData>({ ...emptyFeeForm });
  const [adding, setAdding] = useState(false);

  // Edit fee dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [editForm, setEditForm] = useState<FeeFormData>({ ...emptyFeeForm });
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState(false);

  const filtered = fees.filter((f) => {
    const matchStatus = statusFilter === "all" || f.status === statusFilter;
    const matchType = typeFilter === "all" || f.type === typeFilter;
    const matchSearch = f.studentName
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  // Summary
  const totalCollected = fees
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = fees
    .filter((f) => f.status === "pending")
    .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
  const totalOverdue = fees
    .filter((f) => f.status === "overdue")
    .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);

  const summaryCards = [
    {
      label: "Total Collected",
      amount: totalCollected,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      color:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Pending",
      amount: totalPending,
      icon: <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      color:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Overdue",
      amount: totalOverdue,
      icon: (
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      ),
      color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
  ];

  const handleAdd = async () => {
    if (!addForm.studentId || !addForm.amount || !addForm.dueDate) {
      toast.error("Student, amount, and due date are required");
      return;
    }
    setAdding(true);
    try {
      const res = await apiFetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: addForm.studentId,
          amount: Number(addForm.amount),
          type: addForm.type,
          status: addForm.status,
          dueDate: addForm.dueDate,
          paidAmount: Number(addForm.paidAmount) || 0,
        }),
      });
      if (res.ok) {
        toast.success("Fee created successfully!");
        setAddOpen(false);
        setAddForm({ ...emptyFeeForm });
        refetchFees();
      } else {
        toast.error("Failed to create fee");
      }
    } catch {
      toast.error("Error creating fee");
    }
    setAdding(false);
  };

  const handleEdit = (fee: FeeRecord) => {
    setEditingFee(fee);
    setEditForm({
      studentId: "",
      amount: String(fee.amount),
      type: fee.type,
      status: fee.status,
      dueDate: fee.dueDate.split("T")[0],
      paidAmount: String(fee.paidAmount),
      paidDate:
        fee.status === "paid" ? new Date().toISOString().split("T")[0] : "",
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingFee) return;
    setSaving(true);
    try {
      const res = await apiFetch("/api/fees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingFee.id,
          status: editForm.status,
          paidAmount: Number(editForm.paidAmount),
          paidDate: editForm.paidDate || new Date().toISOString(),
        }),
      });
      if (res.ok) {
        toast.success("Fee updated successfully!");
        setEditOpen(false);
        refetchFees();
      } else {
        toast.error("Failed to update fee");
      }
    } catch {
      toast.error("Error updating fee");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/fees?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Fee deleted successfully!");
        refetchFees();
      } else {
        toast.error("Failed to delete fee");
      }
    } catch {
      toast.error("Error deleting fee");
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      {/* Read-only banner */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-3 py-2">
          <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            Read-only mode — you have view permission only for this module.
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fees Management
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Track and manage student payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedClass || undefined}
            onValueChange={setSelectedClass}
          >
            <SelectTrigger className="w-[200px] h-10 bg-white dark:bg-gray-950 border-gray-200">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-bold text-blue-600">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  All School Fees
                </span>
              </SelectItem>
              {classes.map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canCreate && (
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Collect Fee
            </Button>
          )}
        </div>
      </div>

      {!isSelectionMade ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/30">
          <div className="p-4 bg-white dark:bg-gray-950 shadow-sm rounded-full">
            <DollarSign className="h-12 w-12 text-blue-300" />
          </div>
          <div className="max-w-xs">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white italic">
              Financial data is ready!
            </h4>
            <p className="text-sm text-gray-500">
              Pick a class from the menu above to start managing their payments
              and schedules.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summaryCards.map((card) => (
              <Card
                key={card.label}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.color}`}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold">
                      ${card.amount.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters + Add Button */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tuition">Tuition</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
              </SelectContent>
            </Select>
            {canCreate && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                onClick={() => {
                  setAddForm({ ...emptyFeeForm });
                  setAddOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Fee
              </Button>
            )}
          </div>

          {/* Fee Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fee Records</CardTitle>
              <CardDescription>{filtered.length} records found</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Amount
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Due Date
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Paid
                        </TableHead>
                        <TableHead className="w-28 text-center">
                          Status
                        </TableHead>
                        <TableHead className="w-36 text-center">
                          {(canEdit || canDelete) && "Actions"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-12 text-muted-foreground"
                          >
                            <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p>No fee records found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((fee) => {
                          const config =
                            statusConfig[fee.status] || statusConfig.pending;
                          return (
                            <TableRow
                              key={fee.id}
                              className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold">
                                    {fee.studentName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </div>
                                  <span className="font-medium text-sm">
                                    {fee.studentName}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="font-normal capitalize"
                                >
                                  {fee.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-sm font-medium">
                                ${fee.amount.toLocaleString()}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                {new Date(fee.dueDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-emerald-600 font-medium">
                                ${fee.paidAmount.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant="outline"
                                  className={`${config.bg} font-medium capitalize`}
                                >
                                  {config.icon}
                                  <span className="ml-1">{fee.status}</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {(canEdit || canDelete) && (
                                  <div className="flex items-center justify-center gap-1">
                                    {canEdit && fee.status !== "paid" && (
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => {
                                          // For immediate optimistic visual, we'll let invalidateQueries handle it
                                          toast.success(
                                            `Payment recorded for ${fee.studentName}`,
                                          );
                                          refetchFees();
                                        }}
                                      >
                                        <CreditCard className="h-3 w-3 mr-1" />{" "}
                                        Pay
                                      </Button>
                                    )}
                                    {canEdit && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                                        onClick={() => handleEdit(fee)}
                                        title="Edit"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                    {canDelete && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                            title="Delete"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Delete Fee Record
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete
                                              the fee record for{" "}
                                              {fee.studentName}? This action
                                              cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                handleDelete(fee.id)
                                              }
                                              disabled={deleting}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              {deleting
                                                ? "Deleting..."
                                                : "Delete"}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                )}
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

          {/* Add Fee Dialog */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Fee</DialogTitle>
                <DialogDescription>
                  Create a new fee record for a student
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Student *</Label>
                  <Select
                    value={addForm.studentId}
                    onValueChange={(v) =>
                      setAddForm({ ...addForm, studentId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Type *</Label>
                    <Select
                      value={addForm.type}
                      onValueChange={(v) => setAddForm({ ...addForm, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tuition">Tuition</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Amount ($) *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={addForm.amount}
                      onChange={(e) =>
                        setAddForm({ ...addForm, amount: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    value={addForm.dueDate}
                    onChange={(e) =>
                      setAddForm({ ...addForm, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleAdd}
                  disabled={
                    adding ||
                    !addForm.studentId ||
                    !addForm.amount ||
                    !addForm.dueDate
                  }
                >
                  {adding ? "Adding..." : "Add Fee"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Fee Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Fee</DialogTitle>
                <DialogDescription>
                  Update fee record for {editingFee?.studentName}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(v) =>
                        setEditForm({ ...editForm, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Paid Amount ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.paidAmount}
                      onChange={(e) =>
                        setEditForm({ ...editForm, paidAmount: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Paid Date</Label>
                  <Input
                    type="date"
                    value={editForm.paidDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, paidDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleEditSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
