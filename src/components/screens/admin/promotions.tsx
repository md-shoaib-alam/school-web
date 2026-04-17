"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, GraduationCap, Zap, Users, RotateCcw } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { apiFetch } from "@/lib/api";

// Sub-components
import { PromotionTable } from "./promotions/PromotionTable";
import { PromotionSkeleton } from "./promotions/PromotionSkeleton";
import {
  NewPromotionDialog,
  BulkPromotionDialog,
  GraduationDialog,
  RejectDialog,
} from "./promotions/PromotionDialogs";

// Types
import {
  PromotionRecord,
  ClassOption,
  StudentOption,
  PromotionFormData,
  getCurrentAcademicYear,
} from "./promotions/types";

const emptyForm: PromotionFormData = {
  studentId: "",
  fromClassId: "",
  toClassId: "",
  academicYear: "",
  remarks: "",
};

export function AdminPromotions() {
  const [activeTab, setActiveTab] = useState<"individual" | "bulk" | "graduated">("individual");

  // Data states
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
  const [graduations, setGraduations] = useState<PromotionRecord[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PromotionFormData>({ ...emptyForm, academicYear: getCurrentAcademicYear() });
  const [submitting, setSubmitting] = useState(false);

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const [gradDialogOpen, setGradDialogOpen] = useState(false);
  const [gradSubmitting, setGradSubmitting] = useState(false);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingPromotion, setRejectingPromotion] = useState<PromotionRecord | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [approvingId, setApprovingId] = useState<string | null>(null);

  // --- Fetching ---

  const fetchPromotions = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const params = new URLSearchParams({ type: "promotion" });
      if (academicYearFilter !== "all") params.set("academicYear", academicYearFilter);
      if (classFilter !== "all") params.set("classId", classFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await apiFetch(`/api/promotions?${params.toString()}`);
      if (res.ok) setPromotions(await res.json());
    } catch (err) {
      toast.error("Failed to load promotions");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [academicYearFilter, classFilter, statusFilter]);

  const fetchGraduations = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const params = new URLSearchParams({ type: "graduation" });
      if (academicYearFilter !== "all") params.set("academicYear", academicYearFilter);

      const res = await apiFetch(`/api/promotions?${params.toString()}`);
      if (res.ok) setGraduations(await res.json());
    } catch (err) {
      toast.error("Failed to load graduations");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [academicYearFilter]);

  const fetchClassesAndStudents = useCallback(async () => {
    try {
      const [classesRes, studentsRes] = await Promise.all([
        apiFetch("/api/classes"),
        apiFetch("/api/students?limit=1000"),
      ]);
      if (classesRes.ok) setClasses(await classesRes.json());
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(
          (data.items || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            rollNumber: s.rollNumber || "N/A",
            className: s.class ? `${s.class.name}-${s.class.section}` : "Unassigned",
            classId: s.classId,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch classes/students:", err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPromotions(), fetchGraduations(), fetchClassesAndStudents()]).finally(() => setLoading(false));
  }, [fetchPromotions, fetchGraduations, fetchClassesAndStudents]);

  // --- Handlers ---

  const handleSubmitPromotion = async () => {
    if (!form.studentId || !form.toClassId || !form.academicYear) {
      toast.error("Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Promotion request created");
        setDialogOpen(false);
        fetchPromotions();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to create promotion");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkPromote = async (fromClass: string, toClass: string, year: string, remarks: string) => {
    setBulkSubmitting(true);
    try {
      const res = await apiFetch("/api/promotions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromClassId: fromClass, toClassId: toClass, academicYear: year, remarks }),
      });
      if (res.ok) {
        toast.success("Bulk promotion processed successfully");
        setBulkDialogOpen(false);
        fetchPromotions();
      } else {
        toast.error("Bulk promotion failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleGraduate = async (classId: string, studentIds: string[], year: string, remarks: string) => {
    setGradSubmitting(true);
    try {
      const res = await apiFetch("/api/promotions/graduate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, studentIds, academicYear: year, remarks }),
      });
      if (res.ok) {
        toast.success("Graduation processed successfully");
        setGradDialogOpen(false);
        fetchGraduations();
      } else {
        toast.error("Graduation failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setGradSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const res = await apiFetch("/api/promotions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "approved" }),
      });
      if (res.ok) {
        toast.success("Promotion approved and student moved");
        fetchPromotions();
      } else {
        toast.error("Approval failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingPromotion) return;
    setRejecting(true);
    try {
      const res = await apiFetch("/api/promotions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rejectingPromotion.id, status: "rejected", remarks: rejectRemarks }),
      });
      if (res.ok) {
        toast.success("Promotion rejected");
        setRejectDialogOpen(false);
        fetchPromotions();
      } else {
        toast.error("Rejection failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setRejecting(false);
    }
  };

  // --- Derived ---
  const filteredPromotions = promotions.filter(p =>
    p.studentName.toLowerCase().includes(search.toLowerCase()) ||
    p.fromClassName.toLowerCase().includes(search.toLowerCase()) ||
    p.toClassName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Promotions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage academic progression and graduations</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => { fetchPromotions(true); fetchGraduations(true); }} className="h-10 w-10">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Promote Student
          </Button>
          <Button variant="secondary" onClick={() => setBulkDialogOpen(true)}>
            <Users className="h-4 w-4 mr-2" /> Bulk Promote
          </Button>
          <Button variant="outline" className="text-violet-600 border-violet-200" onClick={() => setGradDialogOpen(true)}>
            <GraduationCap className="h-4 w-4 mr-2" /> Mass Graduation
          </Button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'individual' ? 'bg-white dark:bg-gray-900 shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Promotions
          </button>
          <button
            onClick={() => setActiveTab('graduated')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'graduated' ? 'bg-white dark:bg-gray-900 shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Graduations
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by student or class..."
            className="pl-9 bg-white dark:bg-gray-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-gray-50/50 dark:bg-gray-900/20">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
              <SelectTrigger className="bg-white dark:bg-gray-900"><SelectValue placeholder="Academic Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2025-2026">2025-2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {activeTab === 'individual' && (
            <>
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="bg-white dark:bg-gray-900"><SelectValue placeholder="Source Class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white dark:bg-gray-900"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="border-none shadow-sm overflow-hidden min-h-[400px]">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6"><PromotionSkeleton /></div>
          ) : activeTab === 'individual' ? (
            <PromotionTable
              records={filteredPromotions}
              onApprove={handleApprove}
              onReject={(r) => { setRejectingPromotion(r); setRejectRemarks(""); setRejectDialogOpen(true); }}
              approvingId={approvingId}
              type="promotion"
            />
          ) : (
            <PromotionTable
              records={graduations}
              type="graduation"
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <NewPromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        setForm={setForm}
        classes={classes}
        students={students}
        submitting={submitting}
        onSubmit={handleSubmitPromotion}
      />

      <BulkPromotionDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        classes={classes}
        onBulkPromote={handleBulkPromote}
        submitting={bulkSubmitting}
      />

      <GraduationDialog
        open={gradDialogOpen}
        onOpenChange={setGradDialogOpen}
        classes={classes}
        students={students}
        onGraduate={handleGraduate}
        submitting={gradSubmitting}
      />

      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        promotion={rejectingPromotion}
        remarks={rejectRemarks}
        setRemarks={setRejectRemarks}
        onReject={handleReject}
        submitting={rejecting}
      />
    </div>
  );
}
