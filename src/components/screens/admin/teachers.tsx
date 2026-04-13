"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Search,
  Mail,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import type { TeacherInfo } from "@/lib/types";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useTeachers } from "@/lib/graphql/hooks";

const avatarColors = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-lime-500",
];

const emptyFormData = {
  name: "",
  email: "",
  phone: "",
  qualification: "",
  experience: "",
};

export function AdminTeachers() {
  const { canCreate, canEdit, canDelete } = useModulePermissions("teachers");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // ⚡ TanStack Query with GraphQL Group-wise hooks
  const { data: teachers = [], isLoading: loading } = useTeachers();

  const refetchTeachers = () =>
    queryClient.invalidateQueries({ queryKey: ["teachers"] });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherInfo | null>(
    null,
  );
  const [formData, setFormData] = useState(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase())),
  );

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (teacher: TeacherInfo) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const isEdit = !!editingTeacher;
      const url = "/api/teachers";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit ? { id: editingTeacher.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok)
        throw new Error(`Failed to ${isEdit ? "update" : "add"} teacher`);

      toast.success(`Teacher ${isEdit ? "updated" : "added"} successfully`);
      setDialogOpen(false);
      setEditingTeacher(null);
      setFormData(emptyFormData);
      refetchTeachers();
    } catch {
      toast.error(
        `Failed to ${editingTeacher ? "update" : "add"} teacher. Please try again.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/teachers?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete teacher");
      toast.success("Teacher deleted successfully");
      refetchTeachers();
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete teacher. Please try again.");
    }
  };

  const isFormValid =
    formData.name.trim() !== "" && formData.email.trim() !== "";

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

      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            onClick={handleOpenAdd}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        )}
      </div>

      {/* Teacher Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No teachers found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((teacher, index) => {
            const initials = teacher.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const color = avatarColors[index % avatarColors.length];

            return (
              <Card
                key={teacher.id}
                className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-sm">
                      <AvatarFallback
                        className={`${color} text-white text-sm font-bold`}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {teacher.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                      {teacher.phone && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {teacher.phone}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    {(canEdit || canDelete) && (
                      <div className="flex items-center gap-1 shrink-0">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
                            onClick={() => handleOpenEdit(teacher)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <AlertDialog
                            open={deletingId === teacher.id}
                            onOpenChange={(open) => {
                              if (!open) setDeletingId(null);
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                onClick={() => setDeletingId(teacher.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Teacher
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  <strong>{teacher.name}</strong>? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setDeletingId(null)}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleDelete(teacher.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="mt-5 space-y-3">
                    {/* Subjects */}
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from(new Set(teacher.subjects as string[])).map(
                          (subject, idx) => (
                            <Badge
                              key={`${subject}-${idx}`}
                              variant="secondary"
                              className="text-xs font-normal bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            >
                              {subject}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Classes */}
                    <div className="flex items-start gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from(new Set(teacher.classes as string[])).map(
                          (cls) => (
                            <Badge
                              key={cls}
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              {cls}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Experience & Qualification */}
                    <div className="flex items-center gap-4 pt-2 border-t dark:border-gray-700">
                      {teacher.experience && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{teacher.experience} exp</span>
                        </div>
                      )}
                      {teacher.qualification && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Award className="h-3.5 w-3.5" />
                          <span>{teacher.qualification}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Showing count */}
      {!loading && filtered.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filtered.length} of {teachers.length} teachers
        </p>
      )}

      {/* Add/Edit Teacher Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingTeacher(null);
            setFormData(emptyFormData);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
            </DialogTitle>
            <DialogDescription>
              {editingTeacher
                ? "Update the teacher details below"
                : "Fill in the teacher details below"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="teacher-name">Full Name</Label>
              <Input
                id="teacher-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Dr. Jane Smith"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teacher-email">Email</Label>
              <Input
                id="teacher-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="jane.smith@school.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teacher-phone">Phone</Label>
              <Input
                id="teacher-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="teacher-qualification">Qualification</Label>
                <Input
                  id="teacher-qualification"
                  value={formData.qualification}
                  onChange={(e) =>
                    setFormData({ ...formData, qualification: e.target.value })
                  }
                  placeholder="Ph.D., M.Ed."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher-experience">Experience</Label>
                <Input
                  id="teacher-experience"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  placeholder="e.g., 5 years"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSubmit}
              disabled={submitting || !isFormValid}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingTeacher ? "Updating..." : "Adding..."}
                </>
              ) : editingTeacher ? (
                "Update Teacher"
              ) : (
                "Add Teacher"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
