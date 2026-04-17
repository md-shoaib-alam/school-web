"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, GraduationCap } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { apiFetch } from "@/lib/api";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useAppStore } from "@/store/use-app-store";

// Sub-components
import { StudentTable } from "./students/StudentTable";
import { StudentDialog } from "./students/StudentDialog";
import { StudentSkeleton } from "./students/StudentSkeleton";
import { Pagination } from "./students/Pagination";
import { ImportExportButtons } from "./students/ImportExportButtons";

// Types
import type { StudentInfo, ClassInfo, StudentFormData } from "./students/types";

const ITEMS_PER_PAGE = 10;

const emptyFormData: StudentFormData = {
  name: "",
  email: "",
  phone: "",
  classId: "",
  rollNumber: "",
  admissionNumber: "",
  gender: "",
  dateOfBirth: "",
  bloodGroup: "",
  address: "",
  guardianName: "",
  guardianPhone: "",
  guardianRelation: "",
  password: "",
};

export function AdminStudents() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("students");

  // Data states
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);

  // --- Fetching ---

  const fetchClasses = useCallback(async () => {
    if (!currentTenantId) return;
    try {
      const res = await apiFetch(`/api/classes?tenantId=${currentTenantId}`);
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  }, [currentTenantId]);

  const fetchStudents = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        tenantId: currentTenantId,
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search,
      });
      if (selectedClass !== "all") query.append("classId", selectedClass);

      const res = await apiFetch(`/api/students?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.items || []);
        setTotalStudents(data.total || 0);
      }
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [currentTenantId, currentPage, search, selectedClass]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // --- Handlers ---

  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedStudent(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (student: StudentInfo) => {
    setDialogMode("edit");
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.user?.email || student.email,
      phone: student.user?.phone || student.phone || "",
      classId: student.classId || "",
      rollNumber: student.rollNumber || "",
      admissionNumber: student.admissionNumber || "",
      gender: student.gender || "",
      dateOfBirth: student.dateOfBirth?.split("T")[0] || "",
      bloodGroup: student.bloodGroup || "",
      address: student.address || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
      guardianRelation: student.guardianRelation || "",
    });
    setDialogOpen(true);
  };

  const handleOpenView = (student: StudentInfo) => {
    setDialogMode("view");
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.user?.email || student.email,
      phone: student.user?.phone || student.phone || "",
      classId: student.classId || "",
      rollNumber: student.rollNumber || "",
      admissionNumber: student.admissionNumber || "",
      gender: student.gender || "",
      dateOfBirth: student.dateOfBirth?.split("T")[0] || "",
      bloodGroup: student.bloodGroup || "",
      address: student.address || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
      guardianRelation: student.guardianRelation || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.classId) {
      toast.error("Please fill in required fields");
      return;
    }

    setSubmitting(true);
    try {
      const url = "/api/students";
      const method = dialogMode === "create" ? "POST" : "PUT";
      const payload = {
        ...formData,
        tenantId: currentTenantId,
        id: selectedStudent?.id,
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(dialogMode === "create" ? "Student added successfully" : "Student updated successfully");
        setDialogOpen(false);
        fetchStudents();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to save student");
      }
    } catch (err) {
      toast.error("An error occurred while saving");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/students?id=${id}&tenantId=${currentTenantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Student deleted successfully");
        fetchStudents();
      } else {
        toast.error("Failed to delete student");
      }
    } catch (err) {
      toast.error("An error occurred while deleting");
    }
  };

  const handleExport = async () => {
    try {
      const res = await apiFetch(`/api/students/export?tenantId=${currentTenantId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `students_export_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Export successful");
      }
    } catch (err) {
      toast.error("Failed to export students");
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenantId", currentTenantId || "");

      const res = await apiFetch("/api/students/import", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Successfully imported ${data.count} students`);
        fetchStudents();
      } else {
        toast.error("Failed to import students");
      }
    } catch (err) {
      toast.error("Error during import");
    } finally {
      setImporting(false);
    }
  };

  const totalPages = Math.ceil(totalStudents / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Students Management
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalStudents} total students enrolled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ImportExportButtons
            onExport={handleExport}
            onImport={handleImport}
            importing={importing}
          />
          {canCreate && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={handleOpenCreate}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-gray-50/50 dark:bg-gray-900/20">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or admission ID..."
              className="pl-9 bg-white dark:bg-gray-900"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:block">
              Filter by Class:
            </Label>
            <Select
              value={selectedClass}
              onValueChange={(v) => {
                setSelectedClass(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}-{c.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <StudentSkeleton />
            </div>
          ) : (
            <>
              <StudentTable
                students={students}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onView={handleOpenView}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        student={selectedStudent}
        classes={classes}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
