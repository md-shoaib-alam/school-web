"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
      onClick={() => onView(teacher)}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar className="size-14 shrink-0 ring-2 ring-white dark:ring-border shadow-sm">
            <AvatarFallback className="bg-muted text-foreground border border-border text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 
              className="font-semibold text-foreground truncate group-hover:underline transition-colors"
            >
              {teacher.name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <Mail className="size-3 shrink-0" />
              <span className="truncate">{teacher.email}</span>
            </div>
            {teacher.phone && (
              <p className="text-sm text-muted-foreground mt-0.5">{teacher.phone}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(teacher)}
              >
                <Pencil className="size-4" />
              </Button>
            )}
              {canDelete && (
                <AlertDialog
                  open={deletingId === teacher.id}
                  onOpenChange={(open) => {
                    if (!open) setDeletingId(null);
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-red-600"
                      onClick={() => setDeletingId(teacher.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
        <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-0.5">Experience</p>
            <p className="text-sm font-semibold text-foreground">{teacher.experience || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-0.5">Qualification</p>
            <p className="text-sm font-semibold text-foreground">{teacher.qualification || "—"}</p>
          </div>
        </div>

        {/* Subjects & Classes */}
        <div className="mt-3.5 space-y-3">
          {subjects.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5">Subjects</p>
              <div className="flex flex-wrap gap-1.5">
                {subjects.slice(0, 3).map((subject, idx) => (
                  <Badge
                    key={`${subject}-${idx}`}
                    variant="outline"
                    className="text-xs font-normal bg-muted/60 text-foreground border-border"
                  >
                    {subject}
                  </Badge>
                ))}
                {subjects.length > 3 && (
                  <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-border">
                    +{subjects.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {classes.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5">Classes</p>
              <div className="flex flex-wrap gap-1.5">
                {classes.slice(0, 3).map((cls) => (
                  <Badge
                    key={cls}
                    variant="outline"
                    className="text-xs font-normal bg-muted/60 text-foreground border-border"
                  >
                    {cls}
                  </Badge>
                ))}
                {classes.length > 3 && (
                  <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-border">
                    +{classes.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
