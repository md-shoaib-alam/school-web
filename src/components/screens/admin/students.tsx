"use client";

import { useReducer, useEffect, useCallback, useMemo } from "react";
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
import { Suspense } from "react";

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

type State = {
  search: string;
  classFilter: string;
  currentPage: number;
  dialogOpen: boolean;
  dialogMode: "create" | "edit";
  editingStudent: StudentInfo | null;
  formData: StudentFormData;
  submitting: boolean;
};

type Action =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CLASS_FILTER'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'OPEN_CREATE' }
  | { type: 'OPEN_EDIT'; payload: StudentInfo }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'SET_FORM_DATA'; payload: StudentFormData }
  | { type: 'SET_SUBMITTING'; payload: boolean };

const initialState: State = {
  search: "",
  classFilter: "all",
  currentPage: 1,
  dialogOpen: false,
  dialogMode: "create",
  editingStudent: null,
  formData: emptyFormData,
  submitting: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload, currentPage: 1 };
    case 'SET_CLASS_FILTER':
      return { ...state, classFilter: action.payload, currentPage: 1 };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'OPEN_CREATE':
      return { ...state, dialogMode: "create", formData: emptyFormData, dialogOpen: true };
    case 'OPEN_EDIT':
      return {
        ...state,
        dialogMode: "edit",
        editingStudent: action.payload,
        formData: {
          name: action.payload.name,
          email: action.payload.email,
          phone: action.payload.phone || "",
          rollNumber: action.payload.rollNumber,
          classId: action.payload.classId || "",
          gender: action.payload.gender || "male",
          dateOfBirth: action.payload.dateOfBirth || "",
          transportEnabled: !!action.payload.transport,
          routeId: action.payload.transport?.routeId || "",
          pickupPoint: action.payload.transport?.pickupPoint || "",
        },
        dialogOpen: true,
      };
    case 'CLOSE_DIALOG':
      return { ...state, dialogOpen: false };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
    default:
      return state;
  }
}

function AdminStudentsContent() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("students");

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    search,
    classFilter,
    currentPage,
    dialogOpen,
    dialogMode,
    editingStudent,
    formData,
    submitting,
  } = state;

  const debouncedSearch = useDebounce(search, 300);

  const queryClient = useQueryClient();

  // Queries
  const { data: studentData, isLoading: loadingStudents } = useStudents(
    currentTenantId || undefined,
    classFilter === "all" ? undefined : classFilter,
    debouncedSearch || undefined,
    currentPage,
    ITEMS_PER_PAGE,
  );

  const { data: classesData } = useClassesMin(currentTenantId || undefined);

  const students = useMemo(() => {
    const list = studentData?.students || [];
    return [...list].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
  }, [studentData]);
  const totalItems = studentData?.total || 0;
  const totalPages = studentData?.totalPages || 1;
  const classes = classesData?.classes || [];
  const loading = loadingStudents;

  const searchParams = useSearchParams();
  const classIdParam = searchParams.get("classId");

  useEffect(() => {
    if (classIdParam && classIdParam !== classFilter) {
      dispatch({ type: 'SET_CLASS_FILTER', payload: classIdParam });
    }
  }, [classIdParam, classFilter]);

  // --- Handlers ---

  const handleOpenCreate = () => dispatch({ type: 'OPEN_CREATE' });

  const handleOpenEdit = (student: StudentInfo) => dispatch({ type: 'OPEN_EDIT', payload: student });

  const handleSubmit = async () => {
    const isCreate = dialogMode === "create";

    // OPTIMISTIC UPDATE: Update the UI instantly if editing
    if (!isCreate && editingStudent) {
      const updatedStudent = { ...editingStudent, ...formData };
      queryClient.setQueriesData(
        { queryKey: queryKeys.students },
        (old: any) => {
          if (!old || !old.students) return old;
          return {
            ...old,
            students: old.students.map((s: any) =>
              s.id === editingStudent.id ? updatedStudent : s,
            ),
          };
        },
      );
    }

    toast.promise(
      (async () => {
        dispatch({ type: 'SET_SUBMITTING', payload: true });
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

          dispatch({ type: 'CLOSE_DIALOG' });
          // Refresh from server to ensure total accuracy
          queryClient.invalidateQueries({ queryKey: queryKeys.students });
          queryClient.invalidateQueries({
            queryKey: ["admin-dashboard", currentTenantId],
          });
          return isCreate
            ? "Student registered successfully"
            : "Student details updated";
        } finally {
          dispatch({ type: 'SET_SUBMITTING', payload: false });
        }
      })(),
      {
        loading: isCreate
          ? "Registering new student..."
          : "Updating student details...",
        success: (msg) => msg,
        error: (err: any) => err.message,
      },
    );
  };

  const handleDelete = async (id: string) => {
    toast.promise(
      (async () => {
        const res = await apiFetch(`/api/students?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to delete student");
        }

        // Refresh from server
        queryClient.invalidateQueries({ queryKey: queryKeys.students });
        queryClient.invalidateQueries({
          queryKey: ["admin-dashboard", currentTenantId],
        });

        // Force a RED morphing pill for deletion
        throw new Error("Student record removed");
      })(),
      {
        loading: "Deleting student records...",
        success: () => "", // Not reached
        error: (err: any) => err.message, // Shows the red pill
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-9"
              value={search}
              onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
            />
          </div>
          <Select
            value={classFilter}
            onValueChange={(v) => dispatch({ type: 'SET_CLASS_FILTER', payload: v })}
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
              onImportSuccess={() =>
                queryClient.invalidateQueries({ queryKey: queryKeys.students })
              }
            />
            {canCreate && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleOpenCreate}
              >
                <Plus className="size-4 mr-2" />
                Add Student
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Read-only banner */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
          <Eye className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
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
                onPageChange={(p) => dispatch({ type: 'SET_CURRENT_PAGE', payload: p })}
              />
            </>
          )}
        </CardContent>
      </Card>

      <StudentDialog
        open={dialogOpen}
        onOpenChange={(open) => dispatch({ type: open ? 'OPEN_CREATE' : 'CLOSE_DIALOG' })}
        mode={dialogMode}
        classes={classes}
        formData={formData}
        setFormData={(fd) => dispatch({ type: 'SET_FORM_DATA', payload: fd })}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export function AdminStudents() {
  return (
    <Suspense fallback={<StudentSkeleton />}>
      <AdminStudentsContent />
    </Suspense>
  );
}
