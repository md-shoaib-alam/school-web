"use client";

import { apiFetch } from "@/lib/api";
import { useMemo, useReducer } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  School,
  Plus,
  Users,
  UserCheck,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  LayoutGrid,
  List,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { goeyToast as toast } from "goey-toast";
import type { ClassInfo } from "@/lib/types";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useClasses, useTeachersMin } from "@/lib/graphql/hooks";
import { useAppStore } from "@/store/use-app-store";
import { useViewMode } from "@/hooks/use-view-mode";

interface DialogState {
  addOpen: boolean;
  addFormData: {
    name: string;
    section: string;
    grade: string;
    capacity: string;
  };
  adding: boolean;
  editOpen: boolean;
  editData: {
    id: string;
    name: string;
    section: string;
    grade: string;
    capacity: string;
  };
  editing: boolean;
  deleteOpen: boolean;
  deleteTarget: ClassInfo | null;
  deleting: boolean;
}

type DialogAction =
  | { type: "TOGGLE_ADD"; payload: boolean }
  | { type: "SET_ADD_FORM"; payload: Partial<DialogState["addFormData"]> }
  | { type: "SET_ADDING"; payload: boolean }
  | { type: "RESET_ADD" }
  | { type: "OPEN_EDIT"; payload: ClassInfo }
  | { type: "TOGGLE_EDIT"; payload: boolean }
  | { type: "SET_EDIT_FORM"; payload: Partial<DialogState["editData"]> }
  | { type: "SET_EDITING"; payload: boolean }
  | { type: "OPEN_DELETE"; payload: ClassInfo }
  | { type: "TOGGLE_DELETE"; payload: boolean }
  | { type: "SET_DELETING"; payload: boolean };

const initialDialogState: DialogState = {
  addOpen: false,
  addFormData: { name: "", section: "", grade: "", capacity: "40" },
  adding: false,
  editOpen: false,
  editData: { id: "", name: "", section: "", grade: "", capacity: "40" },
  editing: false,
  deleteOpen: false,
  deleteTarget: null,
  deleting: false,
};

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "TOGGLE_ADD":
      return { ...state, addOpen: action.payload };
    case "SET_ADD_FORM":
      return { ...state, addFormData: { ...state.addFormData, ...action.payload } };
    case "SET_ADDING":
      return { ...state, adding: action.payload };
    case "RESET_ADD":
      return { ...state, addFormData: { name: "", section: "", grade: "", capacity: "40" } };
    case "OPEN_EDIT":
      return {
        ...state,
        editOpen: true,
        editData: {
          id: action.payload.id,
          name: action.payload.name,
          section: action.payload.section,
          grade: action.payload.grade,
          capacity: String(action.payload.capacity),
        },
      };
    case "TOGGLE_EDIT":
      return { ...state, editOpen: action.payload };
    case "SET_EDIT_FORM":
      return { ...state, editData: { ...state.editData, ...action.payload } };
    case "SET_EDITING":
      return { ...state, editing: action.payload };
    case "OPEN_DELETE":
      return { ...state, deleteOpen: true, deleteTarget: action.payload };
    case "TOGGLE_DELETE":
      return { ...state, deleteOpen: action.payload };
    case "SET_DELETING":
      return { ...state, deleting: action.payload };
    default:
      return state;
  }
}

export function AdminClasses() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("classes");
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  // ⚡ TanStack Query with GraphQL Group-wise hooks
  const { data: classesData, isLoading: classesLoading } = useClasses(currentTenantId || undefined);
  const { data: teachersData } = useTeachersMin(currentTenantId || undefined);

  const classes = useMemo(() => {
    const list = classesData?.classes || [];
    return [...list].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [classesData]);

  const [viewMode, setViewMode] = useViewMode("classes", "grid");

  // Only show full skeleton if we have NO data at all
  const loading = classesLoading && classes.length === 0;

  const refetchClasses = () =>
    queryClient.invalidateQueries({ queryKey: ["classes", currentTenantId] });

  // Dialog State Reducer
  const [state, dispatch] = useReducer(dialogReducer, initialDialogState);
  const {
    addOpen,
    addFormData,
    adding,
    editOpen,
    editData,
    editing,
    deleteOpen,
    deleteTarget,
    deleting,
  } = state;

  const handleAddClass = async () => {
    const promise = (async () => {
      const res = await apiFetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addFormData,
          capacity: parseInt(addFormData.capacity),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add class");
      }
      return res.json();
    })();

    toast.promise(promise, {
      loading: "Creating new class...",
      success: "Class created successfully!",
      error: (err: any) => err.message,
    });

    dispatch({ type: "SET_ADDING", payload: true });
    try {
      await promise;
      dispatch({ type: "TOGGLE_ADD", payload: false });
      dispatch({ type: "RESET_ADD" });
      await refetchClasses();
    } catch (err) {
      // Error handled by toast.promise
    } finally {
      dispatch({ type: "SET_ADDING", payload: false });
    }
  };

  const handleEditClass = async () => {
    const updatedClassData = {
      ...editData,
      capacity: parseInt(editData.capacity),
    };

    // OPTIMISTIC UPDATE: Update the UI instantly
    queryClient.setQueryData(["classes", currentTenantId], (old: any) => {
      if (!old || !old.classes) return old;
      return {
        ...old,
        classes: old.classes.map((cls: any) => 
          cls.id === editData.id ? { ...cls, ...updatedClassData } : cls
        )
      };
    });

    const promise = (async () => {
      const res = await apiFetch("/api/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClassData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update class");
      }
      return res.json();
    })();

    toast.promise(promise, {
      loading: "Updating class details...",
      success: "Class updated successfully!",
      error: (err: any) => err.message,
    });

    dispatch({ type: "SET_EDITING", payload: true });
    try {
      await promise;
      dispatch({ type: "TOGGLE_EDIT", payload: false });
      await refetchClasses();
    } catch (err) {
      // On error, the invalidation in refetchClasses will fix the UI
    } finally {
      dispatch({ type: "SET_EDITING", payload: false });
    }
  };

  const openEditDialog = (cls: ClassInfo) => {
    dispatch({ type: "OPEN_EDIT", payload: cls });
  };

  const handleDeleteClass = async () => {
    if (!deleteTarget) return;

    const promise = (async () => {
      const res = await apiFetch(`/api/classes?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete class");
      }
      
      dispatch({ type: "TOGGLE_DELETE", payload: false });
      await refetchClasses();
      
      // Force RED pill morphing
      throw new Error("Class record removed");
    })();

    toast.promise(promise, {
      loading: "Deleting class...",
      success: () => "",
      error: (err: any) => err.message,
    });

    dispatch({ type: "SET_DELETING", payload: true });
    try {
      await promise;
    } catch (err) {
      // Error handled by toast.promise
    } finally {
      dispatch({ type: "SET_DELETING", payload: false });
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "[&>div]:bg-red-500";
    if (percentage >= 75) return "[&>div]:bg-amber-500";
    if (percentage >= 50) return "[&>div]:bg-emerald-500";
    return "[&>div]:bg-emerald-400";
  };

  return (
    <div className="space-y-6">
      {/* Read-only banner */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-3 py-2">
          <Eye className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            Read-only mode — you have view permission only for this module.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Classes
          </h2>
          <p className="text-sm text-muted-foreground">
            {classes.length} classes configured
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`size-8 p-0 ${viewMode === "table" ? "bg-white dark:bg-zinc-700 shadow-sm" : ""}`}
            >
              <List className="size-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`size-8 p-0 ${viewMode === "grid" ? "bg-white dark:bg-zinc-700 shadow-sm" : ""}`}
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
          {canCreate && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={() => dispatch({ type: "TOGGLE_ADD", payload: true })}
            >
              <Plus className="size-4 mr-2" />
              Add Class
            </Button>
          )}
        </div>
      </div>

      {/* Class View */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2 w-full mt-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="py-20 text-center text-muted-foreground">
            <School className="size-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No classes found</p>
            <p className="text-sm text-muted-foreground">Create your first class to get started</p>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="shadow-sm border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Class Details</th>
                    <th className="px-6 py-4">Section</th>
                    <th className="px-6 py-4">Teacher</th>
                    <th className="px-6 py-4">Occupancy</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {classes.map((cls) => {
                    const percentage = cls.capacity > 0 ? Math.round((cls.studentCount / cls.capacity) * 100) : 0;
                    return (
                      <tr key={cls.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{cls.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-medium">Section {cls.section}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <UserCheck className="size-3.5 text-blue-500" />
                            <span className="text-zinc-600 dark:text-zinc-400">{cls.classTeacher || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 min-w-[150px]">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-[10px] font-medium">
                              <span className="text-muted-foreground">{cls.studentCount}/{cls.capacity} Students</span>
                              <span className={percentage >= 90 ? "text-red-500" : "text-emerald-500"}>{percentage}%</span>
                            </div>
                            <Progress value={percentage} className={`h-1 ${getProgressColor(percentage)}`} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-2 text-xs border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50"
                              onClick={() => router.push(`/${slug}/students?classId=${cls.id}`)}
                            >
                              <Users className="size-3.5" />
                              View Students
                            </Button>
                            {canEdit && (
                              <Button variant="ghost" size="icon" className="size-8 text-zinc-400 hover:text-emerald-600" onClick={() => openEditDialog(cls)}>
                                <Pencil className="size-3.5" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button variant="ghost" size="icon" className="size-8 text-zinc-400 hover:text-red-600" onClick={() => { dispatch({ type: "OPEN_DELETE", payload: cls }); }}>
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <LazyMotion features={domAnimation}>
            <AnimatePresence mode="popLayout">
              {classes.map((cls) => {
                const percentage = cls.capacity > 0 ? Math.round((cls.studentCount / cls.capacity) * 100) : 0;

                return (
                  <m.div
                    key={cls.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden border-0 shadow-sm">
                      <CardContent className="p-6">
                        {/* Action buttons - top right */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 transition-opacity">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                              onClick={() => openEditDialog(cls)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                              onClick={() => {
                                dispatch({ type: "OPEN_DELETE", payload: cls });
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>

                        {/* Class name and grade badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                              {cls.name}
                            </h3>
                            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest px-2 py-0">
                              Section {cls.section}
                            </Badge>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 gap-3 mb-6 mt-6">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="size-4 text-emerald-500" />
                              <span className="text-zinc-500 font-medium text-xs">Students</span>
                            </div>
                            <span className="font-bold">{cls.studentCount}<span className="text-zinc-400 font-normal ml-0.5">/{cls.capacity}</span></span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <UserCheck className="size-4 text-blue-500" />
                              <span className="text-zinc-500 font-medium text-xs">Teacher</span>
                            </div>
                            <span className="text-zinc-700 dark:text-zinc-300 font-semibold truncate max-w-[120px]">
                              {cls.classTeacher || 'Unassigned'}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-tighter text-zinc-400">
                            <span>Capacity</span>
                            <span className={percentage >= 90 ? "text-red-500" : "text-emerald-500"}>{percentage}% Full</span>
                          </div>
                          <Progress
                            value={percentage}
                            className={`h-1.5 ${getProgressColor(percentage)}`}
                          />
                        </div>

                        <Button 
                          className="w-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border-0 shadow-none transition-all duration-300 font-bold text-xs h-9"
                          onClick={() => router.push(`/${slug}/students?classId=${cls.id}`)}
                        >
                          <Users className="size-3.5 mr-2" />
                          View Students
                        </Button>
                      </CardContent>
                    </Card>
                  </m.div>
                );
              })}
            </AnimatePresence>
          </LazyMotion>
        </div>
      )}

      {/* Add Class Dialog */}
      <AddClassDialog
        open={addOpen}
        onOpenChange={(open) => dispatch({ type: "TOGGLE_ADD", payload: open })}
        formData={addFormData}
        onChange={(v) => dispatch({ type: "SET_ADD_FORM", payload: v })}
        submitting={adding}
        onConfirm={handleAddClass}
      />

      {/* Edit Class Dialog */}
      <EditClassDialog
        open={editOpen}
        onOpenChange={(open) => dispatch({ type: "TOGGLE_EDIT", payload: open })}
        editData={editData}
        onChange={(v) => dispatch({ type: "SET_EDIT_FORM", payload: v })}
        editing={editing}
        onConfirm={handleEditClass}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteClassDialog
        open={deleteOpen}
        onOpenChange={(open) => dispatch({ type: "TOGGLE_DELETE", payload: open })}
        deleteTarget={deleteTarget}
        deleting={deleting}
        onConfirm={handleDeleteClass}
      />
    </div>
  );
}

// ==========================================
// Extracted Helper Components
// ==========================================

interface ClassFormProps {
  value: {
    name: string;
    section: string;
    grade: string;
    capacity: string;
    id?: string;
  };
  onChange: (v: {
    name: string;
    section: string;
    grade: string;
    capacity: string;
    id?: string;
  }) => void;
}

function ClassForm({ value, onChange }: ClassFormProps) {
  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Class Name</Label>
          <Select
            value={value.name}
            onValueChange={(v) => onChange({ ...value, name: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Class 1",
                "Class 2",
                "Class 3",
                "Class 4",
                "Class 5",
                "Class 6",
                "Class 7",
                "Class 8",
                "Class 9",
                "Class 10",
                "Class 11",
                "Class 12",
              ].map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Section</Label>
          <Select
            value={value.section}
            onValueChange={(v) => onChange({ ...value, section: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {["A", "B", "C", "D"].map((sec) => (
                <SelectItem key={sec} value={sec}>
                  Section {sec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Grade</Label>
        <Select
          value={value.grade}
          onValueChange={(v) => onChange({ ...value, grade: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select grade" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                Grade {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Capacity</Label>
        <Input
          type="number"
          value={value.capacity}
          onChange={(e) => onChange({ ...value, capacity: e.target.value })}
          placeholder="40"
        />
      </div>
    </div>
  );
}

interface AddClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: DialogState["addFormData"];
  onChange: (v: DialogState["addFormData"]) => void;
  submitting: boolean;
  onConfirm: () => void;
}

function AddClassDialog({
  open,
  onOpenChange,
  formData,
  onChange,
  submitting,
  onConfirm,
}: AddClassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
          <DialogDescription>Create a new class section</DialogDescription>
        </DialogHeader>
        <ClassForm value={formData} onChange={onChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={onConfirm}
            disabled={
              submitting ||
              !formData.name ||
              !formData.section ||
              !formData.grade
            }
          >
            {submitting && <Loader2 className="size-4 mr-2 animate-spin" />}
            {submitting ? "Adding..." : "Add Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData: DialogState["editData"];
  onChange: (v: DialogState["editData"]) => void;
  editing: boolean;
  onConfirm: () => void;
}

function EditClassDialog({
  open,
  onOpenChange,
  editData,
  onChange,
  editing,
  onConfirm,
}: EditClassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>Update class details</DialogDescription>
        </DialogHeader>
        <ClassForm value={editData} onChange={(v) => onChange({ ...v, id: v.id ?? "" })} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={onConfirm}
            disabled={
              editing ||
              !editData.name ||
              !editData.section ||
              !editData.grade
            }
          >
            {editing && <Loader2 className="size-4 mr-2 animate-spin" />}
            {editing ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteTarget: ClassInfo | null;
  deleting: boolean;
  onConfirm: () => void;
}

function DeleteClassDialog({
  open,
  onOpenChange,
  deleteTarget,
  deleting,
  onConfirm,
}: DeleteClassDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Class</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <strong>
              {deleteTarget?.name} - Section {deleteTarget?.section}
            </strong>
            ? This action cannot be undone and will remove all associated data
            including students, subjects, and attendance records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleting && <Loader2 className="size-4 mr-2 animate-spin" />}
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

