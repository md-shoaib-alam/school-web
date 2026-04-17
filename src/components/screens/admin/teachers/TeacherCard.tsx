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
import { Mail, GraduationCap, BookOpen, Award, Briefcase, Pencil, Trash2 } from "lucide-react";
import { TeacherInfo, avatarColors } from "./types";

interface TeacherCardProps {
  teacher: TeacherInfo;
  index: number;
  canEdit: boolean;
  canDelete: boolean;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
  onEdit: (teacher: TeacherInfo) => void;
  onDelete: (id: string) => void;
}

export function TeacherCard({
  teacher,
  index,
  canEdit,
  canDelete,
  deletingId,
  setDeletingId,
  onEdit,
  onDelete,
}: TeacherCardProps) {
  const initials = teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = avatarColors[index % avatarColors.length];

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-sm">
            <AvatarFallback className={`${color} text-white text-sm font-bold`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {teacher.name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{teacher.email}</span>
            </div>
            {teacher.phone && (
              <p className="text-sm text-muted-foreground mt-0.5">{teacher.phone}</p>
            )}
          </div>

          {/* Action buttons */}
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1 shrink-0">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
                  onClick={() => onEdit(teacher)}
                >
                  <Pencil className="h-4 w-4" />
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
                      className="h-8 w-8 text-muted-foreground hover:text-red-600"
                      onClick={() => setDeletingId(teacher.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
          )}
        </div>

        {/* Info */}
        <div className="mt-5 space-y-3">
          {/* Subjects */}
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {(teacher.subjects || []).map((subject, idx) => (
                <Badge
                  key={`${subject}-${idx}`}
                  variant="secondary"
                  className="text-xs font-normal bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          {/* Classes */}
          <div className="flex items-start gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {(teacher.classes || []).map((cls) => (
                <Badge key={cls} variant="outline" className="text-xs font-normal">
                  {cls}
                </Badge>
              ))}
            </div>
          </div>

          {/* Experience & Qualification */}
          <div className="flex items-center gap-4 pt-2 border-t dark:border-gray-700">
            {teacher.experience && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{teacher.experience} exp</span>
              </div>
            )}
            {teacher.qualification && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Award className="h-3.5 w-3.5" />
                <span>{teacher.qualification}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
