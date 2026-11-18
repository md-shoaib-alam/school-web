"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Mail, Pencil, Trash2 } from "lucide-react";
import { TeacherInfo } from "./types";

interface TeacherCardProps {
  teacher: TeacherInfo;
  canEdit: boolean;
  canDelete: boolean;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
  onEdit: (teacher: TeacherInfo) => void;
  onDelete: (id: string) => void;
  onView: (teacher: TeacherInfo) => void;
}

export function TeacherCard({
  teacher,
  canEdit,
  canDelete,
  deletingId,
  setDeletingId,
  onEdit,
  onDelete,
  onView,
}: TeacherCardProps) {
  const initials = teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  // Deduplicate subjects and classes to prevent repeated items
  const subjects = Array.from(new Set(teacher.subjects ?? []));
  const classes = Array.from(new Set(teacher.classes ?? []));

  return (
    <Card
      className="h-full rounded-[20px] border border-border bg-card shadow-sm cursor-pointer"
      onClick={() => onView(teacher)}
    >
      <CardContent className="flex flex-col gap-[18px] p-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="size-[34px] shrink-0">
            <AvatarFallback className="rounded-full bg-muted text-xs font-bold text-muted-foreground border-0">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-foreground truncate">
              {teacher.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-3 shrink-0" />
              <span className="truncate">{teacher.email}</span>
            </div>
          </div>
          {teacher.phone && (
            <span className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {teacher.phone}
            </span>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {canEdit && (
              <button
                type="button"
                aria-label={`Edit ${teacher.name}`}
                className="flex size-[30px] items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => onEdit(teacher)}
              >
                <Pencil className="size-[17px]" aria-hidden />
              </button>
            )}
              {canDelete && (
                <AlertDialog
                  open={deletingId === teacher.id}
                  onOpenChange={(open) => {
                    if (!open) setDeletingId(null);
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Delete ${teacher.name}`}
                      className="flex size-[30px] items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-red-400"
                      onClick={() => setDeletingId(teacher.id)}
                    >
                      <Trash2 className="size-[17px]" aria-hidden />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete <strong>{teacher.name}</strong>? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeletingId(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => onDelete(teacher.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
          </div>
        </div>

        {/* Experience & Qualification */}
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-1">Experience</p>
            <p className="text-sm font-semibold text-foreground">{teacher.experience || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-1">Qualification</p>
            <p className="text-sm font-semibold text-foreground">{teacher.qualification || "—"}</p>
          </div>
        </div>

        {/* Subjects & Classes */}
        <div className="space-y-3">
          {subjects.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-1.5">Subjects</p>
              <div className="flex flex-wrap gap-1.5">
                {subjects.slice(0, 3).map((subject, idx) => (
                  <span
                    key={`${subject}-${idx}`}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    {subject}
                  </span>
                ))}
                {subjects.length > 3 && (
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                    +{subjects.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {classes.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-1.5">Classes</p>
              <div className="flex flex-wrap gap-1.5">
                {classes.slice(0, 3).map((cls) => (
                  <span
                    key={cls}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    {cls}
                  </span>
                ))}
                {classes.length > 3 && (
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                    +{classes.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
