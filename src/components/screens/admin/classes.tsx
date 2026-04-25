"use client";


import { apiFetch } from "@/lib/api";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { goeyToast as toast } from "goey-toast";
import type { ClassInfo } from "@/lib/types";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useClasses, useTeachersMin } from "@/lib/graphql/hooks";
import { useAppStore } from "@/store/use-app-store";

export function AdminClasses() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("classes");
  const queryClient = useQueryClient();

  // ⚡ TanStack Query with GraphQL Group-wise hooks
  const { data: classesData, isLoading: classesLoading } = useClasses(currentTenantId || undefined);
  const { data: teachersData } = useTeachersMin(currentTenantId || undefined);

  const classes = classesData?.classes || [];
  const teachers = teachersData?.teachers || [];

  // Only show full skeleton if we have NO data at all
  const loading = classesLoading && classes.length === 0;

  const refetchClasses = () =>
    queryClient.invalidateQueries({ queryKey: ["classes", currentTenantId] });

  // Add class dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    grade: "",
    capacity: "40",
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit class dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    section: "",
    grade: "",
    capacity: "40",
  });
  const [editing, setEditing] = useState(false);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassInfo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAddClass = async () => {
    const promise = (async () => {
      const res = await apiFetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
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

    setSubmitting(true);
    try {
      await promise;
      setAddDialogOpen(false);
      setFormData({ name: "", section: "", grade: "", capacity: "40" });
      await refetchClasses();
    } catch (err) {
      // Error handled by toast.promise
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClass = async () => {
    const promise = (async () => {
      const res = await apiFetch("/api/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editData,
          capacity: parseInt(editData.capacity),
        }),
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

    setEditing(true);
    try {
      await promise;
      setEditDialogOpen(false);
      await refetchClasses();
    } catch (err) {
      // Error handled by toast.promise
    } finally {
      setEditing(false);
    }
  };

  const openEditDialog = (cls: ClassInfo) => {
    setEditData({
      id: cls.id,
      name: cls.name,
      section: cls.section,
      grade: cls.grade,
      capacity: String(cls.capacity),
    });
    setEditDialogOpen(true);
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
      
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      await refetchClasses();
      
      // Force RED pill morphing
      throw new Error("Class record removed");
    })();

    toast.promise(promise, {
      loading: "Deleting class...",
      success: () => "",
      error: (err: any) => err.message,
    });

    setDeleting(true);
    try {
      await promise;
    } catch (err) {
      // Error handled by toast.promise
    } finally {
      setDeleting(false);
    }
  };

  const gradeColors: Record<string, string> = {
    "1": "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    "2": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    "3": "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800",
    "4": "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    "5": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    "6": "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800",
    "7": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    "8": "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    "9": "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    "10": "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    "11": "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    "12": "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "[&>div]:bg-red-500";
    if (percentage >= 75) return "[&>div]:bg-amber-500";
    if (percentage >= 50) return "[&>div]:bg-emerald-500";
    return "[&>div]:bg-emerald-400";
  };

  const classForm = (
    value: {
      name: string;
      section: string;
      grade: string;
      capacity: string;
      id?: string;
    },
    onChange: (v: {
      name: string;
      section: string;
      grade: string;
      capacity: string;
      id?: string;
    }) => void,
  ) => (
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {classes.length} classes configured
          </p>
        </div>
        {canCreate && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        )}
      </div>

      {/* Class Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
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
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <School className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No classes found</p>
            <p className="text-sm">Create your first class to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {classes.map((cls) => {
              const percentage =
                cls.capacity > 0
                  ? Math.round((cls.studentCount / cls.capacity) * 100)
                  : 0;
              const colorClass =
                gradeColors[cls.grade] ||
                "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";

              return (
                <motion.div
                  key={cls.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                >
                  <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative">
                    <CardContent className="p-6">
                      {/* Action buttons - top right */}
                      {(canEdit || canDelete) && (
                        <div className="absolute top-3 right-3 flex items-center gap-1">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                              onClick={() => openEditDialog(cls)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                              onClick={() => {
                                setDeleteTarget(cls);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Class name and grade badge */}
                      <div className="flex items-start justify-between mb-4 pr-16">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {cls.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Section {cls.section}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${colorClass}`}
                        >
                          Grade {cls.grade}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-emerald-500" />
                          <div>
                            <span className="font-semibold">
                              {cls.studentCount}
                            </span>
                            <span className="text-muted-foreground">
                              /{cls.capacity}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <UserCheck className="h-4 w-4 text-blue-500" />
                          <span className="text-muted-foreground truncate">
                            {cls.classTeacher}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Capacity</span>
                          <span
                            className={`font-medium ${percentage >= 90 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
                          >
                            {percentage}%
                          </span>
                        </div>
                        <Progress
                          value={percentage}
                          className={`h-2 ${getProgressColor(percentage)}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Class Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>Create a new class section</DialogDescription>
          </DialogHeader>
          {classForm(formData, setFormData)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAddClass}
              disabled={
                submitting ||
                !formData.name ||
                !formData.section ||
                !formData.grade
              }
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {submitting ? "Adding..." : "Add Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Update class details</DialogDescription>
          </DialogHeader>
          {classForm(editData, (v) =>
            setEditData((prev) => ({ ...prev, ...v })),
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleEditClass}
              disabled={
                editing ||
                !editData.name ||
                !editData.section ||
                !editData.grade
              }
            >
              {editing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={handleDeleteClass}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
