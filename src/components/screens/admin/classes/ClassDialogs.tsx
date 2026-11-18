"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, ChevronsUpDown, Search, X, UserRound } from "lucide-react";
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
import type { ClassInfo } from "@/types";

// ==========================================
// Helper Components
// ==========================================

function initialsOf(name: string) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TeacherPicker({
  value,
  onChange,
  teachers,
  open,
  onOpenChange,
}: {
  value?: string;
  onChange: (id: string) => void;
  teachers: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = teachers.find((t) => t.id === value);
  const q = query.trim().toLowerCase();
  const rank = (name: string) => {
    const n = (name || "").toLowerCase();
    if (n === q) return 0;
    if (n.startsWith(q)) return 1;
    return 2;
  };
  const shown = useMemo(
    () =>
      q
        ? teachers
            .filter((t) => (t.name || "").toLowerCase().includes(q))
            .sort((a, b) => rank(a.name) - rank(b.name))
        : teachers,
    [query, teachers],
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (fieldRef.current && !fieldRef.current.contains(e.target as Node)) onOpenChange(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  const [fit, setFit] = useState({ above: false, listMax: 292 });
  const measureFit = () => {
    const r = fieldRef.current?.getBoundingClientRect();
    if (!r) return;
    const chrome = 160; // header + pinned none + hints + gap
    const below = window.innerHeight - r.bottom - 8;
    const above = r.top - 8;
    if (below >= 292 + chrome || below >= above) {
      setFit({ above: false, listMax: Math.max(96, Math.min(292, below - chrome)) });
    } else {
      setFit({ above: true, listMax: Math.max(96, Math.min(292, above - chrome)) });
    }
  };

  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open, shown.length]);

  const pick = (id: string) => {
    onChange(id);
    onOpenChange(false);
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (shown.length) setActive((a) => (a + 1) % shown.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (shown.length) setActive((a) => (a - 1 + shown.length) % shown.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (shown[active]) pick(shown[active].id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onOpenChange(false);
    } else if (e.key === "Tab") {
      onOpenChange(false);
    }
  };

  const Highlight = ({ text }: { text: string }) => {
    const i = q ? (text || "").toLowerCase().indexOf(q) : -1;
    if (i < 0) return <>{text}</>;
    return (
      <>
        {text.slice(0, i)}
        <mark className="bg-transparent text-emerald-600 dark:text-emerald-400">{text.slice(i, i + q.length)}</mark>
        {text.slice(i + q.length)}
      </>
    );
  };

  const avatar = (name: string, isSelected: boolean, size = "size-9 text-xs") => (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${size} ${
        isSelected
          ? "bg-emerald-600 text-white"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {initialsOf(name)}
    </span>
  );

  return (
    <div ref={fieldRef} className="relative">
      {!open ? (
        <button
          type="button"
          role="combobox"
          aria-expanded={false}
          aria-controls="teacher-list"
          onClick={() => {
            setQuery("");
            setActive(Math.max(0, teachers.findIndex((t) => t.id === value)));
            measureFit();
            onOpenChange(true);
          }}
          className="flex h-12 w-full items-center gap-3 rounded-xl border border-border bg-muted pl-2 pr-3.5 text-left text-[15px] font-medium text-foreground hover:bg-accent/60"
        >
          {selected ? (
            avatar(selected.name, true)
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              –
            </span>
          )}
          <span className={`flex-1 truncate ${selected ? "" : "text-muted-foreground"}`}>
            {selected ? selected.name : "Unassigned / None"}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </button>
      ) : (
        <div className="flex h-12 items-center gap-3 rounded-xl border border-emerald-500/60 bg-muted px-3 ring-4 ring-emerald-500/15">
          <Search className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded
            aria-controls="teacher-list"
            aria-label="Search teachers"
            placeholder="Search teachers…"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setActive(0);
                inputRef.current?.focus();
              }}
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-border/60 text-muted-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      )}

      {open && (
        <div className={`absolute left-0 right-0 z-50 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl ${fit.above ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"}`}>
          <div className="flex items-center justify-between px-4 pb-2 pt-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>{q ? "Best matches" : "All teachers"}</span>
            <span>{q ? `${shown.length} of ${teachers.length}` : teachers.length}</span>
          </div>
          <ul id="teacher-list" ref={listRef} role="listbox" aria-label="Teachers" style={{ maxHeight: fit.listMax }} className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-1">
            {shown.length === 0 ? (
              <li className="px-3 py-5 text-center text-sm text-muted-foreground">
                No teachers match “{query.trim()}”
              </li>
            ) : (
              shown.map((t, i) => (
                <li
                  key={t.id}
                  role="option"
                  aria-selected={t.id === value}
                  onMouseMove={() => i !== active && setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(t.id)}
                  className={`flex h-14 flex-none cursor-pointer items-center gap-3 rounded-xl px-3 ${
                    i === active ? "bg-emerald-500/10" : ""
                  }`}
                >
                  {avatar(t.name, t.id === value)}
                  <span className="flex-1 truncate text-[15px] font-semibold text-foreground">
                    <Highlight text={t.name} />
                  </span>
                  {t.id === value ? (
                    <Check className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        (t.classes || []).length > 0
                          ? "border border-border text-muted-foreground"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {(t.classes || []).length > 0 ? "Has class" : "Free"}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
          <div className="mt-2 border-t border-border bg-muted/40 p-2">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick("")}
              className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-accent/50 ${
                !value ? "bg-accent" : ""
              }`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-muted-foreground/50 text-muted-foreground">
                <UserRound className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium text-muted-foreground">Unassigned / None</span>
              {!value && <Check className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
            </button>
          </div>
          <div className="hidden gap-4 border-t border-border px-4 py-2.5 text-xs text-muted-foreground sm:flex">
            <span>↑↓ navigate</span>
            <span>Enter select</span>
            <span>Esc close</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface ClassFormProps {
  value: {
    name: string;
    section: string;
    grade: string;
    capacity: string;
    classTeacherId?: string;
    id?: string;
  };
  onChange: (v: any) => void;
  enableGradeSelection?: boolean;
  teachers?: any[];
}

function getMappedGradeFromName(name: string): string {
  if (!name) return "";
  const normalized = name.trim().toLowerCase();
  if (normalized === "pre-nursery" || normalized === "prenursery" || normalized === "pre nursery") return "Pre-Nursery";
  if (normalized === "nursery") return "Nursery";
  if (normalized === "lkg") return "LKG";
  if (normalized === "ukg") return "UKG";
  const numMatch = name.match(/\d+/);
  return numMatch ? numMatch[0] : "";
}

function ClassForm({ value, onChange, enableGradeSelection = false, teachers = [] }: ClassFormProps) {
  const [teacherOpen, setTeacherOpen] = useState(false);
  // Opening any Radix select must collapse the teacher panel, whose absolute
  // list would otherwise sit under the select popup.
  const closeTeacherOnOpen = (o: boolean) => { if (o) setTeacherOpen(false); };
  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label className="text-sm font-semibold text-foreground">Class Name</Label>
          <Select
            value={value.name}
            onOpenChange={closeTeacherOnOpen}
            onValueChange={(v) => {
              const mappedGrade = getMappedGradeFromName(v);
              onChange({
                ...value,
                name: v,
                grade: !enableGradeSelection ? mappedGrade : value.grade,
              });
            }}
          >
            <SelectTrigger className="h-12 w-full rounded-xl border-border bg-muted px-4 text-[15px] font-medium">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Pre-Nursery", "Nursery", "LKG", "UKG",
                "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6",
                "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12",
              ].map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-semibold text-foreground">Section</Label>
          <Select
            value={value.section}
            onOpenChange={closeTeacherOnOpen}
            onValueChange={(v) => onChange({ ...value, section: v })}
          >
            <SelectTrigger className="h-12 w-full rounded-xl border-border bg-muted px-4 text-[15px] font-medium">
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
      {enableGradeSelection && (
        <div className="grid gap-2">
          <Label className="text-sm font-semibold text-foreground">Class Level</Label>
          <Select
            value={value.grade}
            onOpenChange={closeTeacherOnOpen}
            onValueChange={(v) => onChange({ ...value, grade: v })}
          >
            <SelectTrigger className="h-12 w-full rounded-xl border-border bg-muted px-4 text-[15px] font-medium">
              <SelectValue placeholder="Select class level" />
            </SelectTrigger>
            <SelectContent>
              {["Pre-Nursery", "Nursery", "LKG", "UKG"].map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  Class {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid gap-2">
        <Label className="text-sm font-semibold text-foreground">Class Teacher</Label>
        <TeacherPicker
          value={value.classTeacherId}
          onChange={(id) => onChange({ ...value, classTeacherId: id })}
          teachers={teachers}
          open={teacherOpen}
          onOpenChange={setTeacherOpen}
        />
      </div>
      <div className="grid gap-2">
        <Label className="text-sm font-semibold text-foreground">Capacity</Label>
        <Input
          type="number"
          value={value.capacity}
          onChange={(e) => onChange({ ...value, capacity: e.target.value })}
          placeholder="40"
          className="h-12 rounded-xl border-border bg-muted text-[15px] font-medium"
        />
      </div>
    </div>
  );
}

// ==========================================
// Main Dialogs Component
// ==========================================

interface ClassDialogsProps {
  addOpen: boolean;
  setAddOpen: (open: boolean) => void;
  addFormData: any;
  setAddFormData: (data: any) => void;
  adding: boolean;
  onAdd: () => void;

  editOpen: boolean;
  setEditOpen: (open: boolean) => void;
  editData: any;
  setEditData: (data: any) => void;
  editing: boolean;
  onEdit: () => void;

  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  deleteTarget: ClassInfo | null;
  deleting: boolean;
  onDelete: () => void;

  enableGradeSelection?: boolean;
  teachers?: any[];
}

export function ClassDialogs({
  addOpen, setAddOpen, addFormData, setAddFormData, adding, onAdd,
  editOpen, setEditOpen, editData, setEditData, editing, onEdit,
  deleteOpen, setDeleteOpen, deleteTarget, deleting, onDelete,
  enableGradeSelection = false,
  teachers = [],
}: ClassDialogsProps) {
  return (
    <>
      {/* Add Class Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-card p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-[22px] font-bold">Add New Class</DialogTitle>
            <DialogDescription>Create a new class section</DialogDescription>
          </DialogHeader>
          <ClassForm value={addFormData} onChange={setAddFormData} enableGradeSelection={enableGradeSelection} teachers={teachers} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="h-12 rounded-xl px-6 bg-muted font-semibold text-[15px]">
              Cancel
            </Button>
            <Button
              className="h-12 rounded-xl px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[15px]"
              onClick={onAdd}
              disabled={adding || !addFormData.name || !addFormData.section || (!enableGradeSelection ? !getMappedGradeFromName(addFormData.name) : !addFormData.grade)}
            >
              {adding && <Loader2 className="size-4 mr-2 animate-spin" />}
              {adding ? "Adding..." : "Add Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-card p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-[22px] font-bold">Edit Class</DialogTitle>
            <DialogDescription>Update class details</DialogDescription>
          </DialogHeader>
          <ClassForm value={editData} onChange={setEditData} enableGradeSelection={enableGradeSelection} teachers={teachers} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="h-12 rounded-xl px-6 bg-muted font-semibold text-[15px]">
              Cancel
            </Button>
            <Button
              className="h-12 rounded-xl px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[15px]"
              onClick={onEdit}
              disabled={editing || !editData.name || !editData.section || (!enableGradeSelection ? !getMappedGradeFromName(editData.name) : !editData.grade)}
            >
              {editing && <Loader2 className="size-4 mr-2 animate-spin" />}
              {editing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
              onClick={onDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting && <Loader2 className="size-4 mr-2 animate-spin" />}
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
