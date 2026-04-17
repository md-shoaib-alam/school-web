"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  Users,
  GraduationCap,
  Zap,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { apiFetch } from "@/lib/api";

import {
  PromotionRecord,
  ClassOption,
  StudentOption,
  PromotionFormData,
  emptyForm,
} from "./promotions/types";
import { getCurrentAcademicYear, getNextClass } from "./promotions/utils";
import { PromotionsTable } from "./promotions/PromotionsTable";
import { BulkPromoteTab } from "./promotions/BulkPromoteTab";
import { GraduatedTab } from "./promotions/GraduatedTab";
import {
  NewPromotionDialog,
  BulkPromotionDialog,
  RejectPromotionDialog,
} from "./promotions/PromotionDialogs";

export function AdminPromotions() {
  const [activeTab, setActiveTab] = useState<
    "individual" | "bulk" | "graduated"
  >("individual");

  // Data
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
  const [graduations, setGraduations] = useState<PromotionRecord[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Individual promotion dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PromotionFormData>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  // Bulk promote dialog
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkFromClass, setBulkFromClass] = useState("");
  const [bulkToClass, setBulkToClass] = useState("");
  const [bulkAcademicYear, setBulkAcademicYear] = useState(
    getCurrentAcademicYear(),
  );
  const [bulkRemarks, setBulkRemarks] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Graduation dialog
  const [gradClassId, setGradClassId] = useState("");
  const [gradAcademicYear, setGradAcademicYear] = useState(
    getCurrentAcademicYear(),
  );
  const [gradRemarks, setGradRemarks] = useState("");
  const [gradSelectedIds, setGradSelectedIds] = useState<Set<string>>(
    new Set(),
  );
  const [gradSubmitting, setGradSubmitting] = useState(false);

  // Reject confirmation dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingPromotion, setRejectingPromotion] =
    useState<PromotionRecord | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // Approving state
  const [approvingId, setApprovingId] = useState<string | null>(null);

  /* ---- Fetch helpers ---- */

  const fetchPromotions = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type: "promotion", limit: "50" });
      if (academicYearFilter && academicYearFilter !== "all")
        params.set("academicYear", academicYearFilter);
      if (classFilter && classFilter !== "all")
        params.set("classId", classFilter);
      if (statusFilter && statusFilter !== "all")
        params.set("status", statusFilter);
      const res = await apiFetch(`/api/promotions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setPromotions(json.items || []);
      }
    } catch {
      /* silent */
    }
  }, [academicYearFilter, classFilter, statusFilter]);

  const fetchGraduations = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type: "graduation", limit: "50" });
      if (academicYearFilter && academicYearFilter !== "all")
        params.set("academicYear", academicYearFilter);
      const res = await apiFetch(`/api/promotions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setGraduations(json.items || []);
      }
    } catch {
      /* silent */
    }
  }, [academicYearFilter]);

  const fetchClassesAndStudents = useCallback(async () => {
    try {
      const [classesRes, studentsRes] = await Promise.all([
        apiFetch("/api/classes?mode=min"),
        apiFetch("/api/students?limit=1000&status=active"), // Higher limit for promotion lists
      ]);
      if (classesRes.ok) setClasses(await classesRes.json());
      if (studentsRes.ok) {
        const json = await studentsRes.json();
        const studentItems = json.items || [];
        setStudents(
          studentItems.map(
            (s: {
              id: string;
              name: string;
              rollNumber: string;
              className: string;
              classId: string;
              status?: string;
            }) => ({
              id: s.id,
              name: s.name,
              rollNumber: s.rollNumber,
              className: s.className,
              classId: s.classId,
            }),
          ),
        );
      }
    } catch {
      /* silent */
    }
  }, []);

  // Fetch graduations: include in init and on tab change
  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([
        fetchPromotions(),
        fetchGraduations(),
        fetchClassesAndStudents(),
      ]);
      setLoading(false);
    }
    init();
  }, [fetchPromotions, fetchGraduations, fetchClassesAndStudents]);

  /* ---- Derived data ---- */

  const academicYears = Array.from(
    new Set([
      ...promotions.map((p) => p.academicYear),
      ...graduations.map((g) => g.academicYear),
    ]),
  ).sort();

  const summary = {
    total: promotions.length,
    pending: promotions.filter((p) => p.status === "pending").length,
    approved: promotions.filter((p) => p.status === "approved").length,
    graduated: graduations.length,
  };

  /* ---- Handlers ---- */

  // Individual promotion
  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setForm({
        ...form,
        studentId,
        fromClassId: student.classId,
        toClassId: "",
      });
    }
  };

  const handleCreatePromotion = async () => {
    if (
      !form.studentId ||
      !form.fromClassId ||
      !form.toClassId ||
      !form.academicYear
    ) {
      toast.error("Validation Error", {
        description: "Please fill all required fields",
      });
      return;
    }

    setSubmitting(true);
    const promise = (async () => {
      const res = await apiFetch("/api/promotions", {
        method: "POST",
        body: JSON.stringify({
          studentId: form.studentId,
          fromClassId: form.fromClassId,
          toClassId: form.toClassId,
          academicYear: form.academicYear,
          remarks: form.remarks || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create promotion");
      }

      setDialogOpen(false);
      setForm({ ...emptyForm });
      await fetchPromotions();
    })();

    toast.promise(promise, {
      loading: "Creating promotion request...",
      success: "Promotion request created successfully",
      error: (err: any) => err.message || "Error creating promotion",
    });

    try {
      await promise;
    } catch {
      /* handled by toast */
    }
    setSubmitting(false);
  };

  // Bulk promote preview
  const openBulkDialog = () => {
    setBulkFromClass("");
    setBulkToClass("");
    setBulkAcademicYear(getCurrentAcademicYear());
    setBulkRemarks("");
    setBulkDialogOpen(true);
  };

  // Compute bulk preview as derived state
  const bulkPreview = bulkFromClass
    ? students.filter((s) => s.classId === bulkFromClass)
    : [];

  // Handle bulk from class change with auto-detect
  const handleBulkFromClassChange = (classId: string) => {
    setBulkFromClass(classId);
    const autoTo = classId ? getNextClass(classId, classes) : null;
    setBulkToClass(autoTo ? autoTo.id : "");
  };

  const handleBulkPromote = async () => {
    if (!bulkFromClass || !bulkToClass || !bulkAcademicYear) {
      toast.error("Validation Error", {
        description: "Please fill all required fields",
      });
      return;
    }
    if (bulkPreview.length === 0) {
      toast.error("Validation Error", {
        description: "No students found in the selected class",
      });
      return;
    }

    setBulkSubmitting(true);
    const promise = (async () => {
      const res = await apiFetch("/api/promotions", {
        method: "POST",
        body: JSON.stringify({
          bulk: true,
          fromClassId: bulkFromClass,
          toClassId: bulkToClass,
          academicYear: bulkAcademicYear,
          remarks: bulkRemarks || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bulk promotion failed");
      }

      const data = await res.json();
      setBulkDialogOpen(false);
      await Promise.all([fetchPromotions(), fetchClassesAndStudents()]);
      return data;
    })();

    toast.promise(promise, {
      loading: "Bulk promoting students...",
      success: (data: any) =>
        `${data.created} promotion(s) created successfully`,
      error: (err: any) => err.message || "Error during bulk promotion",
    });

    try {
      await promise;
    } catch {
      /* handled by toast */
    }
    setBulkSubmitting(false);
  };

  // Graduation
  const openGradDialog = () => {
    setGradClassId("");
    setGradAcademicYear(getCurrentAcademicYear());
    setGradRemarks("");
    setGradSelectedIds(new Set());
    setActiveTab("graduated");
  };

  // Compute grad preview as derived state
  const gradPreview = gradClassId
    ? students.filter((s) => s.classId === gradClassId)
    : [];

  // Handle grad class change — select all by default
  const handleGradClassChange = (classId: string) => {
    setGradClassId(classId);
    const previewStudents = classId
      ? students.filter((s) => s.classId === classId)
      : [];
    setGradSelectedIds(new Set(previewStudents.map((s) => s.id)));
  };

  const toggleGradStudent = (id: string) => {
    setGradSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGraduate = async () => {
    if (!gradClassId || !gradAcademicYear) {
      toast.error("Validation Error", {
        description: "Please fill all required fields",
      });
      return;
    }
    if (gradSelectedIds.size === 0) {
      toast.error("Validation Error", {
        description: "No students selected for graduation",
      });
      return;
    }

    setGradSubmitting(true);
    const promise = (async () => {
      const body: Record<string, unknown> = {
        graduation: true,
        fromClassId: gradClassId,
        academicYear: gradAcademicYear,
        remarks: gradRemarks || undefined,
        studentIds: Array.from(gradSelectedIds),
      };
      const res = await apiFetch("/api/promotions", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Graduation failed");
      }

      await Promise.all([fetchClassesAndStudents(), fetchGraduations()]);
    })();

    toast.promise(promise, {
      loading: "Graduating students...",
      success: "Students graduated successfully",
      error: (err: any) => err.message || "Error during graduation",
    });

    try {
      await promise;
    } catch {
      /* handled by toast */
    }
    setGradSubmitting(false);
  };

  // Approve / Reject
  const handleApprove = async (promotion: PromotionRecord) => {
    setApprovingId(promotion.id);
    const promise = (async () => {
      const res = await apiFetch("/api/promotions", {
        method: "PUT",
        body: JSON.stringify({ id: promotion.id, status: "approved" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to approve promotion");
      }

      await Promise.all([fetchPromotions(), fetchClassesAndStudents()]);
    })();

    toast.promise(promise, {
      loading: `Approving promotion for ${promotion.studentName}...`,
      success: "Promotion approved successfully",
      error: (err: any) => err.message || "Error approving promotion",
    });

    try {
      await promise;
    } catch {
      /* handled by toast */
    }
    setApprovingId(null);
  };

  const openRejectDialog = (promotion: PromotionRecord) => {
    setRejectingPromotion(promotion);
    setRejectRemarks("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingPromotion) return;
    setRejecting(true);
    try {
      const res = await apiFetch("/api/promotions", {
        method: "PUT",
        body: JSON.stringify({
          id: rejectingPromotion.id,
          status: "rejected",
          remarks: rejectRemarks || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Rejected", {
          description: `Promotion for ${rejectingPromotion.studentName} rejected`,
        });
        setRejectDialogOpen(false);
        setRejectingPromotion(null);
        await fetchPromotions();
      } else {
        const data = await res.json();
        toast.error("Error", {
          description: data.error || "Failed to reject promotion",
        });
      }
    } catch {
      toast.error("System Error", {
        description: "Error rejecting promotion",
      });
    }
    setRejecting(false);
  };

  /* ---- Render ---- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Student Promotion
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Promote students to next class, bulk promote a whole class, or
            graduate pass-out students.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-900/30"
            onClick={openGradDialog}
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Graduate</span>
          </Button>
          <Button
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={openBulkDialog}
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Promote</span>
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              setForm({ ...emptyForm, academicYear: getCurrentAcademicYear() });
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Promotion</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Promotions",
            value: summary.total,
            icon: <Users className="h-5 w-5" />,
            color:
              "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
            border: "border-blue-200 dark:border-blue-800",
          },
          {
            label: "Pending Review",
            value: summary.pending,
            icon: <Clock className="h-5 w-5" />,
            color:
              "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
            border: "border-amber-200 dark:border-amber-800",
          },
          {
            label: "Approved",
            value: summary.approved,
            icon: <CheckCircle2 className="h-5 w-5" />,
            color:
              "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-200 dark:border-emerald-800",
          },
          {
            label: "Graduated",
            value: summary.graduated,
            icon: <GraduationCap className="h-5 w-5" />,
            color:
              "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
            border: "border-violet-200 dark:border-violet-800",
          },
        ].map((card) => (
          <Card
            key={card.label}
            className={`hover:shadow-md transition-shadow border ${card.border}`}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}
              >
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {card.label}
                </p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/80 p-1 rounded-lg w-fit">
        {[
          {
            key: "individual" as const,
            label: "Promotions",
            icon: <ArrowRight className="h-4 w-4" />,
          },
          {
            key: "bulk" as const,
            label: "Bulk Promote",
            icon: <Zap className="h-4 w-4" />,
          },
          {
            key: "graduated" as const,
            label: "Graduated",
            icon: <GraduationCap className="h-4 w-4" />,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════ INDIVIDUAL PROMOTIONS TAB ═══════ */}
      {activeTab === "individual" && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Select
              value={academicYearFilter}
              onValueChange={setAcademicYearFilter}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}-{c.section} (Grade {c.grade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <PromotionsTable
            promotions={promotions}
            loading={loading}
            approvingId={approvingId}
            handleApprove={handleApprove}
            openRejectDialog={openRejectDialog}
          />
        </>
      )}

      {/* ═══════ BULK PROMOTE TAB ═══════ */}
      {activeTab === "bulk" && (
        <BulkPromoteTab
          classes={classes}
          bulkFromClass={bulkFromClass}
          handleBulkFromClassChange={handleBulkFromClassChange}
          bulkToClass={bulkToClass}
          setBulkToClass={setBulkToClass}
          bulkAcademicYear={bulkAcademicYear}
          setBulkAcademicYear={setBulkAcademicYear}
          bulkRemarks={bulkRemarks}
          setBulkRemarks={setBulkRemarks}
          bulkPreview={bulkPreview}
          handleBulkPromote={handleBulkPromote}
          bulkSubmitting={bulkSubmitting}
        />
      )}

      {/* ═══════ GRADUATED TAB ═══════ */}
      {activeTab === "graduated" && (
        <GraduatedTab
          classes={classes}
          gradClassId={gradClassId}
          handleGradClassChange={handleGradClassChange}
          gradAcademicYear={gradAcademicYear}
          setGradAcademicYear={setGradAcademicYear}
          gradRemarks={gradRemarks}
          setGradRemarks={setGradRemarks}
          gradPreview={gradPreview}
          gradSelectedIds={gradSelectedIds}
          setGradSelectedIds={setGradSelectedIds}
          toggleGradStudent={toggleGradStudent}
          handleGraduate={handleGraduate}
          gradSubmitting={gradSubmitting}
          graduations={graduations}
        />
      )}

      {/* ═══════ DIALOGS ═══════ */}
      <NewPromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        setForm={setForm}
        students={students}
        classes={classes}
        submitting={submitting}
        handleCreatePromotion={handleCreatePromotion}
        handleStudentChange={handleStudentChange}
      />

      <BulkPromotionDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        classes={classes}
        bulkFromClass={bulkFromClass}
        handleBulkFromClassChange={handleBulkFromClassChange}
        bulkToClass={bulkToClass}
        setBulkToClass={setBulkToClass}
        bulkAcademicYear={bulkAcademicYear}
        setBulkAcademicYear={setBulkAcademicYear}
        bulkRemarks={bulkRemarks}
        setBulkRemarks={setBulkRemarks}
        bulkPreview={bulkPreview}
        handleBulkPromote={handleBulkPromote}
        bulkSubmitting={bulkSubmitting}
      />

      <RejectPromotionDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        rejectingPromotion={rejectingPromotion}
        rejectRemarks={rejectRemarks}
        setRejectRemarks={setRejectRemarks}
        handleReject={handleReject}
        rejecting={rejecting}
      />
    </div>
  );
}
