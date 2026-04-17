"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";
import type { TeacherInfo } from "./types";

const avatarColors = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-lime-500",
];

interface TeacherCardProps {
  teacher: TeacherInfo;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (teacher: TeacherInfo) => void;
  onDelete: (id: string) => void;
  index: number;
}

export function TeacherCard({
  teacher,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  index,
}: TeacherCardProps) {
  const avatarColor = avatarColors[index % avatarColors.length];
  const initials = teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group bg-white dark:bg-gray-900">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className={`h-14 w-14 rounded-2xl ${avatarColor} text-white font-bold text-xl shadow-inner`}>
              <AvatarFallback className="bg-transparent">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {teacher.name}
              </h3>
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{teacher.email}</span>
              </div>
            </div>
          </div>

          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  onClick={() => onEdit(teacher)}
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
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete <strong>{teacher.name}</strong>? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
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

        <div className="mt-5 space-y-3">
          {/* Subjects */}
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {(teacher.subjects || []).length > 0 ? (
                (teacher.subjects || []).map((subject, idx) => (
                  <Badge
                    key={`${subject}-${idx}`}
                    variant="secondary"
                    className="text-xs font-normal bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  >
                    {subject}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">No subjects</span>
              )}
            </div>
          </div>

          {/* Classes */}
          <div className="flex items-start gap-2">
            <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {(teacher.classes || []).length > 0 ? (
                (teacher.classes || []).map((cls) => (
                  <Badge
                    key={cls}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {cls}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">No classes</span>
              )}
            </div>
          </div>

          {/* Experience & Qualification */}
          <div className="flex items-center gap-4 pt-3 mt-4 border-t border-gray-100 dark:border-gray-800">
            {teacher.experience && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{teacher.experience} exp</span>
              </div>
            )}
            {teacher.qualification && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
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
