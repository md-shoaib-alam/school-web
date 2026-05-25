"use client";

import { useReducer, useEffect, useMemo } from "react";
import { useViewMode } from "@/hooks/use-view-mode";
import { goeyToast as toast } from "goey-toast";
import { useModulePermissions } from "@/hooks/use-permissions";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { useTeachers } from "@/lib/graphql/hooks/academic.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import { Pagination } from "@/components/shared/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import anime from "animejs";

// Sub-components
import { TeacherDialog } from "./teachers/TeacherDialog";
import { TeacherSkeleton } from "./teachers/TeacherSkeleton";
import { TeachersHeader } from "./teachers/TeachersHeader";
import { TeachersTableView } from "./teachers/TeachersTableView";
import { TeachersGridView } from "./teachers/TeachersGridView";
import { TeachersEmptyState } from "./teachers/TeachersEmptyState";
import { Eye } from "lucide-react";
import type { TeacherInfo } from "./teachers/types";

const emptyFormData = {
  name: "",
  email: "",
  phone: "",
  qualification: "",
  experience: "",
  password: "",
};

type State = {
  search: string;
  currentPage: number;
  dialogOpen: boolean;
  editingTeacher: TeacherInfo | null;
  formData: typeof emptyFormData;
  submitting: boolean;
  deletingId: string | null;
};

type Action =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_CURRENT_PAGE"; payload: number }
  | { type: "OPEN_DIALOG"; payload: { teacher: TeacherInfo | null; formData: typeof emptyFormData } }
  | { type: "CLOSE_DIALOG" }
  | { type: "SET_FORM_DATA"; payload: typeof emptyFormData }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_DELETING_ID"; payload: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload, currentPage: 1 };
    case "SET_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };
    case "OPEN_DIALOG":
      return {
        ...state,
        dialogOpen: true,
        editingTeacher: action.payload.teacher,
        formData: action.payload.formData,
      };
    case "CLOSE_DIALOG":
      return {
        ...state,
        dialogOpen: false,
        editingTeacher: null,
        formData: emptyFormData,
      };
    case "SET_FORM_DATA":
      return { ...state, formData: action.payload };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };
    case "SET_DELETING_ID":
      return { ...state, deletingId: action.payload };
    default:
      return state;
  }
}

const initialState: State = {
  search: "",
  currentPage: 1,
  dialogOpen: false,
  editingTeacher: null,
  formData: emptyFormData,
  submitting: false,
  deletingId: null,
};

export function AdminTeachers() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("teachers");

  const [state, dispatch] = useReducer(reducer, initialState);
  const { search, currentPage, dialogOpen, editingTeacher, formData, submitting, deletingId } = state;

  const debouncedSearch = useDebounce(search, 500);

  const queryClient = useQueryClient();

  const { data: teachersData, isLoading: loading } = useTeachers(
    currentTenantId || undefined,
    debouncedSearch || undefined,
    currentPage,
    12,
  );

  const teachers = useMemo(() => {
    const list = teachersData?.teachers || [];
    return [...list].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [teachersData]);
  
  const totalItems = teachersData?.total || 0;
  const totalPages = teachersData?.totalPages || 1;
  const [viewMode, setViewMode] = useViewMode("teachers", "grid");

  const handleOpenAdd = () => {
    dispatch({ type: "OPEN_DIALOG", payload: { teacher: null, formData: emptyFormData } });
  };

  const handleOpenEdit = (teacher: TeacherInfo) => {
    dispatch({
      type: "OPEN_DIALOG",
      payload: {
        teacher,
        formData: {
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone || "",
          qualification: teacher.qualification || "",
          experience: teacher.experience || "",
          password: "",
        },
      },
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required");
      return;
    }

    const isEdit = !!editingTeacher;
    const queryKey = [queryKeys.teachers, currentTenantId, debouncedSearch, currentPage, 12];

    if (isEdit && editingTeacher) {
      const updatedTeacher = { ...editingTeacher, ...formData };
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !old.teachers) return old;
        return {
          ...old,
          teachers: old.teachers.map((t: any) => t.id === editingTeacher.id ? updatedTeacher : t)
        };
      });
    }

    toast.promise(
      (async () => {
        dispatch({ type: "SET_SUBMITTING", payload: true });
        try {
          const url = "/api/teachers";
          const method = isEdit ? "PUT" : "POST";
          const res = await apiFetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(isEdit ? { id: editingTeacher.id, ...formData } : formData),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to ${isEdit ? "update" : "add"} teacher`);
          }

          dispatch({ type: "CLOSE_DIALOG" });
          queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard', currentTenantId] });
          return isEdit ? "Teacher updated" : "Teacher added";
        } finally {
          dispatch({ type: "SET_SUBMITTING", payload: false });
        }
      })(),
      {
        loading: `${editingTeacher ? "Updating" : "Adding"} teacher...`,
        success: (msg) => msg,
        error: (err: any) => err.message || "Action failed",
      },
    );
  };

  const handleDelete = async (id: string) => {
    const element = document.getElementById(`teacher-item-${id}`);
    
    const executeDeletion = async () => {
      const queryKey = [queryKeys.teachers, currentTenantId, debouncedSearch, currentPage, 12];
      const previousTeachers = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !old.teachers) return old;
        return {
          ...old,
          teachers: old.teachers.filter((t: any) => t.id !== id),
          total: Math.max(0, old.total - 1)
        };
      });

      toast.promise(
        (async () => {
          try {
            const res = await apiFetch(`/api/teachers?id=${id}`, { method: "DELETE" });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || "Deletion failed");
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard', currentTenantId] });
            dispatch({ type: "SET_DELETING_ID", payload: null });
            throw new Error("Teacher record removed");
          } catch (err) {
            queryClient.setQueryData(queryKey, previousTeachers);
            throw err;
          }
        })(),
        {
          loading: "Removing teacher record...",
          success: () => "",
          error: (err: any) => err.message,
        },
      );
    };

    if (element) {
      element.style.cssText += '; pointer-events: none; position: relative; z-index: 10;';
      anime({
        targets: element,
        scale: [1, 0.5],
        translateX: [0, 150],
        rotate: '6deg',
        opacity: [1, 0],
        duration: 350,
        easing: 'easeInBack',
        complete: () => executeDeletion()
      });
    } else {
      executeDeletion();
    }
  };

  return (
    <div className="space-y-6">
      {/* Read-only banner */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-3 py-2">
          <Eye className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            Read-only mode, you have view permission only for this module.
          </span>
        </div>
      )}

      <TeachersHeader 
        search={search}
        onSearchChange={(val) => dispatch({ type: "SET_SEARCH", payload: val })}
        viewMode={viewMode}
        setViewMode={setViewMode}
        canCreate={canCreate}
        onAddClick={handleOpenAdd}
      />

      {loading ? (
        <TeacherSkeleton />
      ) : teachers.length === 0 ? (
        <TeachersEmptyState />
      ) : viewMode === "table" ? (
        <TeachersTableView 
          teachers={teachers}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
          setDeletingId={(id) => dispatch({ type: "SET_DELETING_ID", payload: id })}
        />
      ) : (
        <TeachersGridView 
          teachers={teachers}
          canEdit={canEdit}
          canDelete={canDelete}
          deletingId={deletingId}
          setDeletingId={(id) => dispatch({ type: "SET_DELETING_ID", payload: id })}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={12}
        onPageChange={(page) => dispatch({ type: "SET_CURRENT_PAGE", payload: page })}
      />

      <TeacherDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            dispatch({ type: "CLOSE_DIALOG" });
          } else {
            // This case might not be triggered from the dialog itself but handle open change
          }
        }}
        editingTeacher={editingTeacher}
        formData={formData}
        setFormData={(data: any) => dispatch({ type: "SET_FORM_DATA", payload: data })}
        submitting={submitting}
        onSubmit={handleSubmit}
        isFormValid={formData.name.trim() !== "" && formData.email.trim() !== ""}
      />
    </div>
  );
}
