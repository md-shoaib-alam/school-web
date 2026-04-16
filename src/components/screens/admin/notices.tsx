"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Megaphone,
  Plus,
  Search,
  Calendar,
  User,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import type { NoticeInfo } from "@/lib/types";
import { goeyToast as toast } from "goey-toast";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useQueryClient } from "@tanstack/react-query";
import { useNotices } from "@/lib/graphql/hooks";

const priorityConfig: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  normal: {
    bg: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    text: "Normal",
    border: "border-l-gray-400 dark:border-l-gray-500",
  },
  important: {
    bg: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    text: "Important",
    border: "border-l-orange-500",
  },
  urgent: {
    bg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    text: "Urgent",
    border: "border-l-red-500",
  },
};

const roleConfig: Record<string, string> = {
  admin:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  teacher: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  student:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  parent:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  all: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
};

interface NoticeFormData {
  title: string;
  content: string;
  priority: string;
  targetRole: string;
}

const emptyForm: NoticeFormData = {
  title: "",
  content: "",
  priority: "normal",
  targetRole: "all",
};

export function AdminNotices() {
  const { canCreate, canEdit, canDelete } = useModulePermissions("notices");
  const queryClient = useQueryClient();
  const { data: noticesData, isLoading: noticesLoading } = useNotices();
  const notices = noticesData?.notices || [];
  const loading = noticesLoading && notices.length === 0;

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const refetchNotices = () =>
    queryClient.invalidateQueries({ queryKey: ["notices"] });

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<NoticeFormData>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeInfo | null>(null);
  const [editForm, setEditForm] = useState<NoticeFormData>({ ...emptyForm });
  const [editing, setEditing] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState(false);

  const filtered = notices.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchPriority =
      priorityFilter === "all" || n.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const handleCreate = async () => {
    if (!form.title || !form.content) {
      toast.error("Title and content are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Notice created successfully!");
        setCreateOpen(false);
        setForm({ ...emptyForm });
        refetchNotices();
      } else {
        toast.error("Failed to create notice");
      }
    } catch {
      toast.error("Error creating notice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (notice: NoticeInfo) => {
    setEditingNotice(notice);
    setEditForm({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      targetRole: notice.targetRole,
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingNotice || !editForm.title || !editForm.content) {
      toast.error("Title and content are required");
      return;
    }
    setEditing(true);
    try {
      const res = await apiFetch("/api/notices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingNotice.id, ...editForm }),
      });
      if (res.ok) {
        toast.success("Notice updated successfully!");
        setEditOpen(false);
        refetchNotices();
      } else {
        toast.error("Failed to update notice");
      }
    } catch {
      toast.error("Error updating notice");
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/notices?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Notice deleted successfully!");
        refetchNotices();
      } else {
        toast.error("Failed to delete notice");
      }
    } catch {
      toast.error("Error deleting notice");
    } finally {
      setDeleting(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notices..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canCreate && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            onClick={() => {
              setForm({ ...emptyForm });
              setCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Notice
          </Button>
        )}
      </div>

      {/* Notice Cards */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-48 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No notices found</p>
            <p className="text-sm">Create your first notice to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((notice) => {
            const priority =
              priorityConfig[notice.priority] || priorityConfig.normal;
            const roleClass = roleConfig[notice.targetRole] || roleConfig.all;

            return (
              <Card
                key={notice.id}
                className={`border-l-4 ${priority.border} hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {noticesLoading && notices.length === 0 ? <Skeleton className="h-5 w-48" /> : notice.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium capitalize ${priority.bg}`}
                        >
                          {priority.text}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium capitalize ${roleClass}`}
                        >
                          {notice.targetRole}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {notice.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{notice.authorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(notice.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                          onClick={() => handleEdit(notice)}
                          title="Edit"
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
                              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;
                                {notice.title}&quot;? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(notice.id)}
                                disabled={deleting}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
          Showing {filtered.length} of {notices.length} notices
        </p>
      )}

      {/* Create Notice Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Notice</DialogTitle>
            <DialogDescription>
              Write a new notice for the school community
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Notice title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-content">Content</Label>
              <Textarea
                id="create-content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your notice here..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Target Audience</Label>
                <Select
                  value={form.targetRole}
                  onValueChange={(v) => setForm({ ...form, targetRole: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="teacher">Teachers</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="parent">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleCreate}
              disabled={submitting || !form.title || !form.content}
            >
              {submitting ? "Creating..." : "Create Notice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Notice Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
            <DialogDescription>
              Update the notice content and settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                placeholder="Notice title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                placeholder="Write your notice here..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(v) =>
                    setEditForm({ ...editForm, priority: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Target Audience</Label>
                <Select
                  value={editForm.targetRole}
                  onValueChange={(v) =>
                    setEditForm({ ...editForm, targetRole: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="teacher">Teachers</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="parent">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleEditSave}
              disabled={editing || !editForm.title || !editForm.content}
            >
              {editing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
