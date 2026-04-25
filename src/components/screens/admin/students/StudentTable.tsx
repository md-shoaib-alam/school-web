"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
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
import { GraduationCap, Pencil, Trash2 } from "lucide-react";
import type { StudentInfo } from "./types";

interface StudentTableProps {
  students: StudentInfo[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (student: StudentInfo) => void;
  onDelete: (id: string) => void;
}

export function StudentTable({
  students,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: StudentTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Roll No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">
              Class
            </TableHead>
            <TableHead className="hidden sm:table-cell">
              Gender
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              Parent
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              Phone
            </TableHead>
            {(canEdit || canDelete) && (
              <TableHead className="w-24 text-right">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {students.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit || canDelete ? 7 : 6}
                  className="text-center py-12 text-muted-foreground"
                >
                  <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No students found</p>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <motion.tr
                  key={student.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors border-b last:border-none group/row"
                >
                <TableCell className="font-mono text-sm">
                  {student.rollNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold shrink-0">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate md:hidden">
                        {student.className}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary" className="font-normal">
                    {student.className}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell capitalize">
                  {student.gender}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {student.parentName || "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {student.phone || "—"}
                </TableCell>
                {(canEdit || canDelete) && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
                          onClick={() => onEdit(student)}
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
                              className="h-8 w-8 text-muted-foreground hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Student
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{student.name}</strong>? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => onDelete(student.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                )}
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
