"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { useStudents, useClassesMin } from "@/lib/graphql/hooks/academic.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchParams } from "next/navigation";

// Sub-components
import { StudentTable } from "./students/StudentTable";
import { StudentDialog } from "./students/StudentDialog";
import { StudentSkeleton } from "./students/StudentSkeleton";
import { Pagination } from "./students/Pagination";
import { ImportExportButtons } from "./students/ImportExportButtons";

// Types
import type { StudentInfo, ClassInfo, StudentFormData } from "./students/types";

const ITEMS_PER_PAGE = 15;

const emptyFormData: StudentFormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  rollNumber: "",
  classId: "",
  gender: "male",
  dateOfBirth: "",
  transportEnabled: false,
  routeId: "",
  pickupPoint: "",
};

export function AdminStudents() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("students");

  // Filter & Search states
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [classFilter, setClassFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  // Queries
  const { 
    data: studentData, 
    isLoading: loadingStudents 
  } = useStudents(
    currentTenantId || undefined, 
    classFilter === "all" ? undefined : classFilter,
    debouncedSearch || undefined,
    currentPage, 
    ITEMS_PER_PAGE
  );

  const { data: classesData } = useClassesMin(currentTenantId || undefined);

  const students = useMemo(() => {
    const list = studentData?.students || [];
    return [...list].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [studentData]);
  const totalItems = studentData?.total || 0;
  const totalPages = studentData?.totalPages || 1;
  const classes = classesData?.classes || [];
  const loading = loadingStudents;

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingStudent, setEditingStudent] = useState<StudentInfo | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const classIdParam = searchParams.get("classId");

  useEffect(() => {
    if (classIdParam && classIdParam !== classFilter) {
      setClassFilter(classIdParam);
      setCurrentPage(1);
    }
  }, [classIdParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

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
      transportEnabled: !!student.transport,
      routeId: student.transport?.routeId || "",
      pickupPoint: student.transport?.pickupPoint || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const isCreate = dialogMode === "create";
    
    // OPTIMISTIC UPDATE: Update the UI instantly if editing
    if (!isCreate && editingStudent) {
      const updatedStudent = { ...editingStudent, ...formData };
      queryClient.setQueriesData({ queryKey: queryKeys.students }, (old: any) => {
        if (!old || !old.students) return old;
        return {
          ...old,
          students: old.students.map((s: any) => s.id === editingStudent.id ? updatedStudent : s)
        };
      });
    }

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
          // Refresh from server to ensure total accuracy
          queryClient.invalidateQueries({ queryKey: queryKeys.students });
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard', currentTenantId] });
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
        
        // Refresh from server
        queryClient.invalidateQueries({ queryKey: queryKeys.students });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard', currentTenantId] });
        
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

  // --- No longer using client-side filtered/paginated variables ---
  // We use `students` directly as it's now the paginated slice from the server.


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
              onImportSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.students })} 
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
                students={students}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
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
