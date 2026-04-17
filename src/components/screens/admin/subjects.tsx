"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Eye,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useModulePermissions } from "@/hooks/use-permissions";
import {
  useSubjects,
  useClassesMin,
  useTeachersMin,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from "@/lib/graphql/hooks";
import { useAppStore } from "@/store/use-app-store";

interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  className: string;
  teacherName?: string;
  classId: string;
  teacherId: string;
}

const emptyForm = { name: "", code: "", classId: "", teacherId: "" };

export function AdminSubjects() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("subjects");

  // TanStack Queries
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects(currentTenantId || undefined);
  const { data: classesData, isLoading: classesLoading } = useClassesMin(currentTenantId || undefined);
  const { data: teachersData, isLoading: teachersLoading } = useTeachersMin(currentTenantId || undefined);

  const subjects = subjectsData?.subjects || [];
  const classes = classesData?.classes || [];
  const teachers = teachersData?.teachers || [];

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", ...emptyForm });

  // TanStack Mutations
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  // Only show full skeleton if we have NO data at all
  const loading = (subjectsLoading && subjects.length === 0) || (classesLoading && classes.length === 0);

  const filtered = subjects.filter((s: any) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.className.toLowerCase().includes(search.toLowerCase()) ||
      (s.teacherName &&
        s.teacherName.toLowerCase().includes(search.toLowerCase()));

    const matchesClass = classFilter === "all" || s.classId === classFilter;

    return matchesSearch && matchesClass;
  });

  const handleCreate = async () => {
    if (!form.name || !form.code || !form.classId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const promise = createMutation.mutateAsync({ 
      ...form, 
      teacherId: form.teacherId || null 
    });

    toast.promise(promise, {
      loading: "Creating subject...",
      success: "Subject created successfully!",
      error: (err: any) => err.message || "Failed to create subject",
    });

    try {
      await promise;
      setCreateOpen(false);
      setForm({ ...emptyForm });
    } catch (err) {
      // Error handled by toast.promise
    }
  };

  const handleEdit = async () => {
    if (!editForm.name || !editForm.code || !editForm.classId) {
      toast.error("Please fill in all required fields");
      return;
    }
    const { id, ...data } = editForm;
    const promise = updateMutation.mutateAsync({ 
      id, 
      data: { ...data, teacherId: data.teacherId || null } 
    });

    toast.promise(promise, {
      loading: "Updating subject...",
      success: "Subject updated successfully!",
      error: (err: any) => err.message || "Failed to update subject",
    });

    try {
      await promise;
      setEditOpen(false);
      setEditForm({ id: "", ...emptyForm });
    } catch (err) {
      // Error handled by toast.promise
    }
  };

  const openEditDialog = (subject: SubjectInfo) => {
    setEditForm({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      classId: subject.classId,
      teacherId: subject.teacherId || "",
    });
    setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      const promise = (async () => {
        await deleteMutation.mutateAsync(id);
        // Force red pill morph
        throw new Error("Subject record removed");
      })();
      
      toast.promise(promise, {
        loading: "Deleting subject...",
        success: () => "",
        error: (err: any) => err.message,
      });

      try {
        await promise;
      } catch (err) {
        // Error handled by toast.promise
      }
    }
  };

  const subjectFormFields = (
    value: typeof form & { id?: string },
    onChange: (v: typeof form & { id?: string }) => void,
  ) => (
    <div className="space-y-4 pt-2">
      <div>
        <Label>Subject Name *</Label>
        <Input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="e.g. Mathematics"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>Subject Code *</Label>
        <Input
          value={value.code}
          onChange={(e) => onChange({ ...value, code: e.target.value })}
          placeholder="e.g. MATH-101"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>Class *</Label>
        <Select
          value={value.classId}
          onValueChange={(v) => onChange({ ...value, classId: v })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {(classes || []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} - {c.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Teacher (optional)</Label>
        <Select
          value={value.teacherId}
          onValueChange={(v) => onChange({ ...value, teacherId: v })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select teacher" />
          </SelectTrigger>
          <SelectContent>
            {(teachers || []).map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Subjects
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subjects.length} subjects across all classes
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          {canCreate && (
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Subject
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Create a new subject and assign it to a class
              </DialogDescription>
            </DialogHeader>
            {subjectFormFields(form, setForm)}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setCreateOpen(false);
                  setForm({ ...emptyForm });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {createMutation.isPending ? "Creating..." : "Create Subject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {(classes || []).map((c: any) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} - {c.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subject List</CardTitle>
          <CardDescription>{filtered.length} subjects found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Class
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Teacher
                    </TableHead>
                    <TableHead className="w-20 text-center">Status</TableHead>
                    <TableHead className="w-20 text-center">
                      {(canEdit || canDelete) && "Actions"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>No subjects found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((subject) => (
                      <TableRow
                        key={subject.id}
                        className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-sm">
                              {subject.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-mono">
                            {subject.code}
                          </code>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="font-normal">
                            {subject.className}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {subject.teacherName &&
                          subject.teacherName !== "Not Assigned" ? (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                                {subject.teacherName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              {subject.teacherName}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Not Assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {subject.teacherName &&
                          subject.teacherName !== "Not Assigned" ? (
                            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px]">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px]">
                              Unassigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {(canEdit || canDelete) && (
                            <div className="flex items-center justify-center gap-1">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                                  onClick={() => openEditDialog(subject)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  onClick={() => handleDelete(subject.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Subject Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Update subject details</DialogDescription>
          </DialogHeader>
          {subjectFormFields(editForm, (v) =>
            setEditForm((prev) => ({ ...prev, ...v })),
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setEditForm({ id: "", ...emptyForm });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
