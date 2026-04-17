"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Link2, X, Search, GraduationCap } from "lucide-react";
import { useState, useMemo } from "react";
import type { ParentInfo, StudentInfo, ParentFormData } from "./types";

interface ParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingParent: ParentInfo | null;
  formData: ParentFormData;
  setFormData: (data: ParentFormData) => void;
  submitting: boolean;
  onSubmit: () => void;
  allStudents: StudentInfo[];
  onLinkChild: (parentId: string, childId: string) => void;
  linking: boolean;
}

export function ParentDialog({
  open,
  onOpenChange,
  editingParent,
  formData,
  setFormData,
  submitting,
  onSubmit,
  allStudents,
  onLinkChild,
  linking,
}: ParentDialogProps) {
  const [studentSearch, setStudentSearch] = useState("");
  const title = editingParent ? "Edit Parent Profile" : "Add New Parent";

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return [];
    return allStudents
      .filter(
        (s) =>
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
      )
      .slice(0, 5);
  }, [allStudents, studentSearch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-amber-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {editingParent
              ? "Update parent account details and manage linked children."
              : "Create a new parent account to link with students."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Parent Full Name *</Label>
                <Input
                  placeholder="e.g. Michael Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="m.smith@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+1 234 567 890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input
                    placeholder="e.g. Engineer"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  />
                </div>
              </div>
              {!editingParent && (
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    placeholder="Set login password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}
            </div>

            {editingParent && (
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Link New Child
                  </Label>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students by name or roll no..."
                    className="pl-9"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                {studentSearch && (
                  <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className="p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <GraduationCap className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-[10px] text-gray-500">
                                Roll: {student.rollNumber} • {student.className}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            disabled={linking || editingParent.children.some((c) => c.id === student.id)}
                            onClick={() => {
                              onLinkChild(editingParent.id, student.id);
                              setStudentSearch("");
                            }}
                          >
                            {linking ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : editingParent.children.some((c) => c.id === student.id) ? (
                              "Linked"
                            ) : (
                              <>
                                <Link2 className="h-3 w-3 mr-1" /> Link
                              </>
                            )}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-500 italic">
                        No matching students found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t bg-gray-50/50 dark:bg-gray-900/50">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editingParent ? "Save Changes" : "Create Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
