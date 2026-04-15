"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  UserPlus,
  Link2,
  Unlink,
  Trash2,
  Search,
  GraduationCap,
  Phone,
  Mail,
  Briefcase,
  Baby,
  X,
  Plus,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useParents, useStudents, useClasses } from "@/lib/graphql/hooks";
import { useQueryClient } from "@tanstack/react-query";

interface ChildInfo {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  className: string;
  classId: string;
  gender: string;
  dateOfBirth?: string;
}

interface ParentInfo {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  occupation?: string;
  children: ChildInfo[];
}

interface StudentInfo {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  classId: string;
}

const AVATAR_COLORS = [
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-lime-500",
  "bg-fuchsia-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
];

export function AdminParents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // ⚡ TanStack Query with GraphQL Group-wise hooks
  const { data: parents = [], isLoading: parentsLoading } = useParents();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: classData = [], isLoading: classesLoading } = useClasses();

  const loading = parentsLoading || studentsLoading || classesLoading;
  const classes = classData as any[]; // Map to avoid type error if needed

  const refetchParents = () =>
    queryClient.invalidateQueries({ queryKey: ["parents"] });

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    occupation: "",
  });
  const [creating, setCreating] = useState(false);

  // Link child dialog
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentInfo | null>(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [linking, setLinking] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentInfo | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    occupation: "",
  });
  const [editing, setEditing] = useState(false);

  const filtered = parents.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.children.some((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  const filteredStudents = selectedClass
    ? students.filter(
        (s) =>
          s.classId === selectedClass &&
          !selectedParent?.children.some((c) => c.id === s.id),
      )
    : students.filter(
        (s) => !selectedParent?.children.some((c) => c.id === s.id),
      );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const getAvatarColor = (name: string) =>
    AVATAR_COLORS[name.length % AVATAR_COLORS.length];

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email) {
      toast.error("Name and email are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...createForm }),
      });
      if (res.ok) {
        toast.success("Parent created successfully!");
        setCreateOpen(false);
        setCreateForm({ name: "", email: "", phone: "", occupation: "" });
        refetchParents();
      } else {
        toast.error("Failed to create parent");
      }
    } catch {
      toast.error("Error creating parent");
    }
    setCreating(false);
  };

  const handleLinkChild = async (studentId: string) => {
    if (!selectedParent) return;
    setLinking(true);
    try {
      const res = await fetch("/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "link-child",
          parentId: selectedParent.id,
          studentId,
        }),
      });
      if (res.ok) {
        toast.success("Child linked successfully!");
        refetchParents();
        // Optimistically update local selectedParent state manually or just let component re-render
        // with the fresh query. To preserve local selection correctly during closing:
        const updatedParents = await fetch("/api/parents").then((r) =>
          r.json(),
        ); // we can use invalidateQueries but here keeping local consistency
        setSelectedParent(
          updatedParents.find((p: ParentInfo) => p.id === selectedParent.id) ||
            null,
        );
      }
    } catch {
      toast.error("Failed to link child");
    }
    setLinking(false);
  };

  const handleUnlinkChild = async (studentId: string) => {
    if (!selectedParent) return;
    setLinking(true);
    try {
      const res = await fetch("/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "link-child",
          parentId: selectedParent.id,
          studentId,
          unlink: true,
        }),
      });
      if (res.ok) {
        toast.success("Child unlinked");
        refetchParents();
        const updatedParents = await fetch("/api/parents").then((r) =>
          r.json(),
        );
        setSelectedParent(
          updatedParents.find((p: ParentInfo) => p.id === selectedParent.id) ||
            null,
        );
      }
    } catch {
      toast.error("Failed to unlink child");
    }
    setLinking(false);
  };

  const handleEdit = (parent: ParentInfo) => {
    setEditingParent(parent);
    setEditForm({
      name: parent.name,
      email: parent.email,
      phone: parent.phone || "",
      occupation: parent.occupation || "",
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingParent || !editForm.name || !editForm.email) {
      toast.error("Name and email are required");
      return;
    }
    setEditing(true);
    try {
      const res = await fetch("/api/parents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingParent.id, ...editForm }),
      });
      if (res.ok) {
        toast.success("Parent updated successfully!");
        setEditOpen(false);
        refetchParents();
      } else {
        toast.error("Failed to update parent");
      }
    } catch {
      toast.error("Error updating parent");
    }
    setEditing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/parents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Parent deleted");
        refetchParents();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Parents
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {parents.length} parents registered •{" "}
            {parents.reduce((s, p) => s + p.children.length, 0)} children linked
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" /> Add Parent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Parent</DialogTitle>
              <DialogDescription>
                Create a new parent account in the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder="e.g. Robert Anderson"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  placeholder="parent@sigel.edu"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, phone: e.target.value })
                  }
                  placeholder="555-0201"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Occupation</Label>
                <Input
                  value={createForm.occupation}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, occupation: e.target.value })
                  }
                  placeholder="e.g. Engineer"
                  className="mt-1.5"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {creating ? "Creating..." : "Create Parent"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Input
          placeholder="Search parents or children..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Parent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((parent) => (
          <Card
            key={parent.id}
            className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              {/* Parent Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback
                      className={`${getAvatarColor(parent.name)} text-white text-sm font-semibold`}
                    >
                      {getInitials(parent.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {parent.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mail className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {parent.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                    onClick={() => handleEdit(parent)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    onClick={() => {
                      setSelectedParent(parent);
                      setLinkOpen(true);
                      setSelectedClass("");
                    }}
                    title="Link Child"
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Parent</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {parent.name}? Their
                          children will be unlinked but not deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(parent.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Parent Details */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                {parent.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {parent.phone}
                  </span>
                )}
                {parent.occupation && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> {parent.occupation}
                  </span>
                )}
              </div>

              {/* Children */}
              <Separator className="mb-3" />
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Baby className="h-3 w-3" /> Children (
                    {parent.children.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2"
                    onClick={() => {
                      setSelectedParent(parent);
                      setLinkOpen(true);
                      setSelectedClass("");
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Link Child
                  </Button>
                </div>

                {parent.children.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <GraduationCap className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      No children linked yet
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      onClick={() => {
                        setSelectedParent(parent);
                        setLinkOpen(true);
                        setSelectedClass("");
                      }}
                    >
                      <Link2 className="h-3 w-3 mr-1" /> Link a Child
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {parent.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {child.gender === "male" ? "👦" : "👧"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                              {child.name}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                              {child.className} • Roll {child.rollNumber}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0"
                          onClick={() => handleUnlinkChild(child.id)}
                          disabled={linking}
                          title="Unlink"
                        >
                          <Unlink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No parents found</p>
          <p className="text-sm mt-1">Add a parent or adjust your search</p>
        </div>
      )}

      {/* Edit Parent Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Parent</DialogTitle>
            <DialogDescription>Update parent information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="e.g. Robert Anderson"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="parent@sigel.edu"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="555-0201"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Occupation</Label>
              <Input
                value={editForm.occupation}
                onChange={(e) =>
                  setEditForm({ ...editForm, occupation: e.target.value })
                }
                placeholder="e.g. Engineer"
                className="mt-1.5"
              />
            </div>
            <Button
              onClick={handleEditSave}
              disabled={editing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {editing ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Child Dialog */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Link Child to {selectedParent?.name}</DialogTitle>
            <DialogDescription>
              Select a student to link as a child. {selectedParent?.name}{" "}
              currently has {selectedParent?.children.length} children.
            </DialogDescription>
          </DialogHeader>

          {/* Already linked children */}
          {selectedParent && selectedParent.children.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 dark:text-gray-400">
                Currently Linked
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedParent.children.map((child) => (
                  <Badge
                    key={child.id}
                    variant="secondary"
                    className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1 pr-1"
                  >
                    {child.name}
                    <button
                      onClick={() => handleUnlinkChild(child.id)}
                      className="h-4 w-4 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 flex items-center justify-center"
                      disabled={linking}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Class filter */}
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
              Filter by Class
            </Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} - {c.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Available students list */}
          <div className="max-h-64 overflow-y-auto">
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
              Available Students
            </Label>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
                <p>No unlinked students found</p>
                <p className="text-xs mt-1">
                  All students may already be linked
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {student.name}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {student.className} • Roll {student.rollNumber}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleLinkChild(student.id)}
                      disabled={linking}
                    >
                      <Link2 className="h-3 w-3 mr-1" /> Link
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
