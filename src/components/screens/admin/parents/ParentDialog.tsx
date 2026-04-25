"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, GraduationCap, Link2, Loader2 } from "lucide-react";
import { ParentInfo, StudentInfo } from "./types";

interface EditParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: any;
  setEditForm: (form: any) => void;
  onSave: () => void;
  editing: boolean;
}

export function EditParentDialog({
  open,
  onOpenChange,
  editForm,
  setEditForm,
  onSave,
  editing,
}: EditParentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={onSave}
            disabled={editing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {editing ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CreateParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createForm: any;
  setCreateForm: (form: any) => void;
  onCreate: () => void;
  creating: boolean;
}

export function CreateParentDialog({
  open,
  onOpenChange,
  createForm,
  setCreateForm,
  onCreate,
  creating,
}: CreateParentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Label>Login Password</Label>
            <Input
              type="password"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm({ ...createForm, password: e.target.value })
              }
              placeholder="Set login password (default: changeme123)"
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
            onClick={onCreate}
            disabled={creating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {creating ? "Creating..." : "Create Parent"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface LinkChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedParent: ParentInfo | null;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  classes: { id: string; name: string; section: string }[];
  filteredStudents: StudentInfo[];
  linking: boolean;
  loading?: boolean; // New prop
  onLinkChild: (studentId: string) => void;
  onUnlinkChild: (parentId: string, studentId: string) => void;
}

export function LinkChildDialog({
  open,
  onOpenChange,
  selectedParent,
  selectedClass,
  setSelectedClass,
  classes,
  filteredStudents,
  linking,
  loading = false, // Default to false
  onLinkChild,
  onUnlinkChild,
}: LinkChildDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden flex flex-col h-[80vh]">
        <DialogHeader>
          <DialogTitle>Link Child to {selectedParent?.name}</DialogTitle>
          <DialogDescription>
            Select a student to link as a child. {selectedParent?.name}{" "}
            currently has {selectedParent?.children.length} children.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-2">
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
                        onClick={() =>
                          onUnlinkChild(selectedParent.id, child.id)
                        }
                        className="h-4 w-4 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 flex items-center justify-center transition-colors"
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

            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block font-semibold">
                Available Students
              </Label>
              {loading ? (
                <div className="text-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-gray-500">Searching for students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    No unlinked students found
                  </p>
                  <p className="text-[10px] mt-1 text-gray-400">
                    Try changing class filter or add new students
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {student.name}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            {student.className} • Roll {student.rollNumber}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                        onClick={() => onLinkChild(student.id)}
                        disabled={linking}
                      >
                        {linking ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Link2 className="h-3.5 w-3.5 mr-1" />
                        )}
                        Link
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
