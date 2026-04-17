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
import { Eye, Pencil, Phone, Trash2 } from "lucide-react";
import type { StudentInfo } from "./types";

interface StudentTableProps {
  students: StudentInfo[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (student: StudentInfo) => void;
  onDelete: (id: string) => void;
  onView: (student: StudentInfo) => void;
}

export function StudentTable({
  students,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onView,
}: StudentTableProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
          <TableRow>
            <TableHead className="font-semibold">Student</TableHead>
            <TableHead className="font-semibold">Class</TableHead>
            <TableHead className="font-semibold">Roll No.</TableHead>
            <TableHead className="font-semibold">Guardian</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                No students found.
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {student.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {student.admissionNumber || "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {student.class ? (
                    <Badge variant="secondary" className="font-normal">
                      {student.class.name}-{student.class.section}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {student.rollNumber || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {student.guardianName || "—"}
                    </span>
                    {student.guardianPhone && (
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Phone className="h-2.5 w-2.5" />
                        {student.guardianPhone}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => onView(student)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
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
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the student
                              record for <strong>{student.name}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(student.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
