"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Eye, RotateCcw } from "lucide-react";
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
  password: "",
  phone: "",
  rollNumber: "",
  classId: "",
  gender: "male",
  dateOfBirth: "",
};

export function AdminStudents() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("students");

  // Data states
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states (Client-side filtering as per user code)
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingStudent, setEditingStudent] = useState<StudentInfo | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  // --- Fetching ---

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/students");
      if (!res.ok) throw new Error("Failed to fetch students");
      const json = await res.json();
      setStudents(json);
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Failed to load student data from the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await apiFetch("/api/classes");
      if (!res.ok) throw new Error("Failed to fetch classes");
      const json = await res.json();
      setClasses(json);
    } catch {
      console.error("Error fetching classes");
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [fetchStudents, fetchClasses]);

  // --- Handlers ---

  const handleOpenCreate = () => {
    setDialogMode("create");
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (student: StudentInfo) => {
    setDialogMode("edit");
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || "",
      rollNumber: student.rollNumber,
      classId: student.classId || "",
      gender: student.gender || "male",
      dateOfBirth: student.dateOfBirth || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const isCreate = dialogMode === "create";
    
    toast.promise(
      (async () => {
        setSubmitting(true);
        try {
          const url = "/api/students";
          const method = isCreate ? "POST" : "PUT";
          const body = isCreate 
            ? formData 
            : { id: editingStudent?.id, ...formData };

          const res = await apiFetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to ${dialogMode} student`);
          }

          setDialogOpen(false);
          fetchStudents();
          return isCreate ? "Student registered successfully" : "Student details updated";
        } finally {
          setSubmitting(false);
        }
      })(),
      {
        loading: isCreate ? "Registering new student..." : "Updating student details...",
        success: (msg) => msg,
        error: (err: any) => err.message,
      }
    );
  };

  const handleDelete = async (id: string) => {
    toast.promise(
      (async () => {
        const res = await apiFetch(`/api/students?id=${id}`, { method: "DELETE" });
        if (!res.ok) {
           const err = await res.json().catch(() => ({}));
           throw new Error(err.error || "Failed to delete student");
        }
        setStudents((prev) => prev.filter((s) => s.id !== id));
        
        // Force a RED morphing pill for deletion
        throw new Error("Student record removed");
      })(),
      {
        loading: "Deleting student records...",
        success: () => "", // Not reached
        error: (err: any) => err.message, // Shows the red pill
      }
    );
  };

  // --- Filter Logic (Client-side) ---

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === "all" || s.classId === classFilter;
    return matchSearch && matchClass;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll no..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Select
            value={classFilter}
            onValueChange={(v) => {
              setClassFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by class" />
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

        {(canCreate || canEdit || canDelete) && (
          <div className="flex gap-2 shrink-0">
            <ImportExportButtons 
              canCreate={canCreate} 
              tenantId={currentTenantId || ""} 
              onImportSuccess={fetchStudents} 
            />
            {canCreate && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleOpenCreate}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Read-only banner */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
          <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Read-only mode — you have view permission only for this module.
          </span>
        </div>
      )}

      {/* Table Content */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <StudentSkeleton />
          ) : (
            <>
              <StudentTable
                students={paginated}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={ITEMS_PER_PAGE}
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
        classes={classes}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
