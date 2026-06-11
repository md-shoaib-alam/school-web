"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import { X, GraduationCap, Link2, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
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
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  unlinkedOnly?: boolean;
  onUnlinkedOnlyChange?: (val: boolean) => void;
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
  searchQuery,
  onSearchQueryChange: setSearchQuery,
  hasNextPage = false,
  fetchNextPage,
  isFetchingNextPage = false,
  unlinkedOnly = true,
  onUnlinkedOnlyChange: setUnlinkedOnly,
}: LinkChildDialogProps) {
  const [linkingStudentId, setLinkingStudentId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll trigger using IntersectionObserver
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !fetchNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    const target = triggerRef.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Reset search and toggle when dialog open state changes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setLinkingStudentId(null);
    }
  }, [open]);

  // Reset local linking student ID when global linking state turns false
  useEffect(() => {
    if (!linking) {
      setLinkingStudentId(null);
    }
  }, [linking]);

  const searchedStudents = useMemo(() => {
    let list = filteredStudents;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((s) => s.name.toLowerCase().includes(q));
  }, [filteredStudents, searchQuery]);

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      if (nameCompare !== 0) return nameCompare;
      return a.section.localeCompare(b.section, undefined, { sensitivity: 'base' });
    });
  }, [classes]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] xs:max-w-[380px] sm:max-w-lg overflow-hidden flex flex-col h-[75vh] sm:h-[80vh] p-4 sm:p-6 gap-3 sm:gap-4">
        <DialogHeader>
          <DialogTitle>Link Child to {selectedParent?.name}</DialogTitle>
          <DialogDescription className="hidden sm:block">
            Select a student to link as a child.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 pr-3">
          <div className="space-y-4 sm:space-y-6 py-1">
            {selectedParent && selectedParent.children && selectedParent.children.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Currently Linked Children
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedParent.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/20 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <GraduationCap className="size-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                              {child.name}
                            </p>
                            <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                              {child.className || "No Class"} • Roll {child.rollNumber || "N/A"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onUnlinkChild(selectedParent.id, child.id)}
                          className="size-6 rounded-md hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 text-zinc-400 flex items-center justify-center transition-colors shrink-0"
                          title="Unlink child"
                          disabled={linking}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="my-1" />
              </>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 sm:flex-none">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-9 w-full sm:w-[180px]">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {sortedClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} - {c.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5 h-9 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 select-none shrink-0">
                <Switch
                  id="unlinked-only"
                  checked={unlinkedOnly}
                  onCheckedChange={setUnlinkedOnly}
                  className="scale-90"
                />
                <Label
                  htmlFor="unlinked-only"
                  className="text-xs text-zinc-600 dark:text-zinc-400 font-medium cursor-pointer"
                >
                  Unlinked<span className="hidden sm:inline"> Only</span>
                </Label>
              </div>
            </div>

            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name…"
                  className="pl-9 h-9 text-xs sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block font-semibold">
                Available Students
              </Label>
              {loading ? (
                <div className="text-center py-10">
                  <Loader2 className="size-8 animate-spin mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-zinc-500">Searching for students...</p>
                </div>
              ) : searchedStudents.length === 0 ? (
                <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-900/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                    No unlinked students found
                  </p>
                  <p className="text-[10px] mt-1 text-zinc-400">
                    Try changing class filter or search query
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 pr-1 pb-8">
                  {searchedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-blue-50/80 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all group cursor-pointer"
                      onClick={() => {
                        if (student.parentId) {
                          toast.info(`${student.name} is currently linked to parent: ${student.parentName || "Unknown Parent"}`);
                        } else {
                          toast.info(`${student.name} is currently unlinked.`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="size-7 sm:size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <GraduationCap className="size-3.5 sm:size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[130px] xs:max-w-[160px] sm:max-w-xs">
                            {student.name}
                          </p>
                          <p className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                            {student.className} • Roll {student.rollNumber}
                            {student.parentName && ` • Parent: ${student.parentName}`}
                          </p>
                        </div>
                      </div>
                      {student.parentId ? (
                        <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 select-none shrink-0">
                          Linked
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 sm:h-8 text-[11px] sm:text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md sm:rounded-lg shadow-sm shrink-0 px-2.5 sm:px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLinkingStudentId(student.id);
                            onLinkChild(student.id);
                          }}
                          disabled={linking}
                        >
                          {linking && linkingStudentId === student.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Link2 className="size-3 sm:size-3.5 mr-1" />
                          )}
                          Link
                        </Button>
                      )}
                    </div>
                  ))}
                  {hasNextPage && (
                    <div ref={triggerRef} className="py-4 flex justify-center items-center gap-2">
                      <Loader2 className="size-4 animate-spin text-blue-500" />
                      <span className="text-xs text-zinc-500">Loading more students...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
