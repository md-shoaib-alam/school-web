"use client";

import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { X, GraduationCap, Link2, Loader2 } from "lucide-react";
import { ParentInfo, StudentInfo } from "./types";

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
                <Label className="text-xs text-zinc-500 dark:text-zinc-400">
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
                        type="button"
                        onClick={() =>
                          onUnlinkChild(selectedParent.id, child.id)
                        }
                        className="size-4 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 flex items-center justify-center transition-colors"
                        disabled={linking}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <Label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block">
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
              <Label className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 block font-semibold">
                Available Students
              </Label>
              {loading ? (
                <div className="text-center py-10">
                  <Loader2 className="size-8 animate-spin mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-zinc-500">Searching for students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-900/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                    No unlinked students found
                  </p>
                  <p className="text-[10px] mt-1 text-zinc-400">
                    Try changing class filter or add new students
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <GraduationCap className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                            {student.name}
                          </p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
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
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Link2 className="size-3.5 mr-1" />
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
