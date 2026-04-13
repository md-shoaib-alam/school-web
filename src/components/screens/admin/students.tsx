"use client";

import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Plus,
  Search,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Phone,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
} from "lucide-react";
import type { StudentInfo, ClassInfo } from "@/lib/types";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useAppStore } from "@/store/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { useStudents, useClasses } from "@/lib/graphql/hooks";

const ITEMS_PER_PAGE = 10;

// Smart pagination with sliding window
function PaginationPages({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [1];

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center gap-1">
      {getPageNumbers().map((page, idx) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="px-1.5 text-muted-foreground text-sm select-none"
            >
              ...
            </span>
          );
        }
        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            className={`h-8 w-8 text-sm ${currentPage === page ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        );
      })}
    </div>
  );
}

export function AdminStudents() {
  const { canCreate, canEdit, canDelete } = useModulePermissions("students");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // ⚡ TanStack Query with GraphQL Group-wise hooks
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: classes = [] } = useClasses();

  const loading = studentsLoading;

  // Helper to invalidate after mutations
  const refetchStudents = () =>
    queryClient.invalidateQueries({ queryKey: ["students"] });

  // Add student dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rollNumber: "",
    classId: "",
    gender: "male",
    dateOfBirth: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit student dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentInfo | null>(
    null,
  );
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rollNumber: "",
    classId: "",
    gender: "male",
    dateOfBirth: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Import state
  const { currentTenantId } = useAppStore();
  const { toast } = useToast();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: number;
    total: number;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter students
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

  const handleAddStudent = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to add student");
      setAddDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        rollNumber: "",
        classId: "",
        gender: "male",
        dateOfBirth: "",
      });
      refetchStudents();
    } catch {
      console.error("Error adding student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (student: StudentInfo) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || "",
      rollNumber: student.rollNumber,
      classId: student.classId,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditStudent = async () => {
    if (!editingStudent) return;
    setEditSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingStudent.id, ...editFormData }),
      });
      if (!res.ok) throw new Error("Failed to update student");
      toast({
        title: "Student updated",
        description: `${editFormData.name}'s information has been updated successfully.`,
      });
      setEditDialogOpen(false);
      setEditingStudent(null);
      refetchStudents();
    } catch {
      toast({
        title: "Update failed",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete student");
      refetchStudents();
    } catch {
      console.error("Error deleting student");
    }
  };

  const downloadSampleCSV = () => {
    const headers =
      "name,email,phone,class (e.g. 10-A),roll_number,gender,date_of_birth";
    const sampleRows = [
      "John Doe,john@school.com,+1 234 567 890,10-A,001,male,2010-05-15",
      "Jane Smith,jane@school.com,+1 234 567 891,10-A,002,female,2010-08-22",
    ];
    const csv = [headers, ...sampleRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_students.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importFile || !currentTenantId) {
      toast({
        title: "Missing information",
        description: "Please select a file and ensure a tenant is selected.",
        variant: "destructive",
      });
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("tenantId", currentTenantId);
      formData.append("dataType", "students");
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Import failed");
      const data = await res.json();
      setImportResult(data);
      if (data.success) {
        toast({
          title: "Import successful",
          description: `Successfully imported ${data.imported} of ${data.total} students.`,
        });
        refetchStudents();
      } else {
        toast({
          title: "Import completed with errors",
          description: `${data.errors} of ${data.total} records had errors.`,
          variant: "destructive",
        });
      }
    } catch {
      setImportResult({ success: false, imported: 0, errors: 0, total: 0 });
      toast({
        title: "Import failed",
        description: "An error occurred while importing students.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      setImportFile(file);
      setImportResult(null);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
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
            {canCreate && (
              <Button
                variant="outline"
                className="text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                onClick={() => {
                  setImportDialogOpen(true);
                  setImportFile(null);
                  setImportResult(null);
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Students
              </Button>
            )}
            {canCreate && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setAddDialogOpen(true)}
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

      {/* Student Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Class
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Gender
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Parent
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Phone
                      </TableHead>
                      {(canEdit || canDelete) && (
                        <TableHead className="w-24 text-right">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={canEdit || canDelete ? 7 : 6}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p>No students found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((student) => (
                        <TableRow
                          key={student.id}
                          className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors"
                        >
                          <TableCell className="font-mono text-sm">
                            {student.rollNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold shrink-0">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {student.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate md:hidden">
                                  {student.className}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="secondary" className="font-normal">
                              {student.className}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell capitalize">
                            {student.gender}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {student.parentName || "—"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {student.phone || "—"}
                          </TableCell>
                          {(canEdit || canDelete) && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
                                    onClick={() => handleOpenEdit(student)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {canDelete && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                        onClick={() =>
                                          setDeletingId(student.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete Student
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete{" "}
                                          <strong>{student.name}</strong>? This
                                          action cannot be undone.
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
                                          onClick={() =>
                                            handleDelete(student.id)
                                          }
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filtered.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t gap-3">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium">
                      {Math.min(
                        (currentPage - 1) * ITEMS_PER_PAGE + 1,
                        filtered.length,
                      )}
                    </span>
                    {" to "}
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                    </span>
                    {" of "}
                    <span className="font-medium">{filtered.length}</span>{" "}
                    students
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <PaginationPages
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Import Students Dialog */}
      <Dialog
        open={importDialogOpen}
        onOpenChange={(open) => {
          setImportDialogOpen(open);
          if (!open) {
            setImportFile(null);
            setImportResult(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Students</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import students in bulk
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* File upload area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" : "border-muted-foreground/25 hover:border-emerald-400 hover:bg-muted/50"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              {importFile ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className="h-10 w-10 text-emerald-600" />
                  <p className="text-sm font-medium text-foreground">
                    {importFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(importFile.size / 1024).toFixed(1)} KB — Click or drop to
                    replace
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Drop your CSV file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports .csv files only
                  </p>
                </div>
              )}
            </div>

            {/* CSV format guide */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">Expected CSV columns:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "name",
                  "email",
                  "phone",
                  "class (e.g. 10-A)",
                  "roll_number",
                  "gender",
                  "date_of_birth",
                ].map((col) => (
                  <Badge
                    key={col}
                    variant="secondary"
                    className="text-xs font-mono"
                  >
                    {col}
                  </Badge>
                ))}
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadSampleCSV();
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Download Sample CSV
              </button>
            </div>

            {/* Import result */}
            {importResult && (
              <div
                className={`rounded-lg p-4 flex items-start gap-3 ${importResult.success ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"}`}
              >
                {importResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="text-sm">
                  <p className="font-medium">
                    {importResult.success
                      ? "Import completed"
                      : "Import completed with issues"}
                  </p>
                  <p className="text-muted-foreground">
                    {importResult.imported} of {importResult.total} students
                    imported successfully
                    {importResult.errors > 0 &&
                      ` · ${importResult.errors} errors`}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleImport}
              disabled={!importFile || importing}
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Students
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingStudent(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student details below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  placeholder="john@school.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-rollNumber">Roll Number</Label>
                <Input
                  id="edit-rollNumber"
                  value={editFormData.rollNumber}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      rollNumber: e.target.value,
                    })
                  }
                  placeholder="001"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-classId">Class</Label>
                <Select
                  value={editFormData.classId}
                  onValueChange={(v) =>
                    setEditFormData({ ...editFormData, classId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}-{c.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-gender">Gender</Label>
                <Select
                  value={editFormData.gender}
                  onValueChange={(v) =>
                    setEditFormData({ ...editFormData, gender: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  placeholder="+1 234 567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-dob">Date of Birth</Label>
                <Input
                  id="edit-dob"
                  type="date"
                  value={editFormData.dateOfBirth}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      dateOfBirth: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleEditStudent}
              disabled={
                editSubmitting ||
                !editFormData.name ||
                !editFormData.email ||
                !editFormData.classId ||
                !editFormData.rollNumber
              }
            >
              {editSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Student"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Fill in the student details below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@school.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  value={formData.rollNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNumber: e.target.value })
                  }
                  placeholder="001"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="classId">Class</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, classId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}-{c.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 234 567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAddStudent}
              disabled={
                submitting ||
                !formData.name ||
                !formData.email ||
                !formData.classId ||
                !formData.rollNumber
              }
            >
              {submitting ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
