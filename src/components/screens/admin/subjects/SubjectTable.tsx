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
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import type { SubjectInfo } from "./types";

interface SubjectTableProps {
  subjects: SubjectInfo[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (subject: SubjectInfo) => void;
  onDelete: (id: string) => void;
}

export function SubjectTable({
  subjects,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: SubjectTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject Code</TableHead>
            <TableHead>Subject Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Teacher</TableHead>
            {(canEdit || canDelete) && (
              <TableHead className="text-center">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={canEdit || canDelete ? 5 : 4}
                className="text-center py-12 text-muted-foreground"
              >
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No subjects found</p>
              </TableCell>
            </TableRow>
          ) : (
            subjects.map((subject) => (
              <TableRow
                key={subject.id}
                className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <TableCell className="font-mono text-sm">
                  <Badge variant="outline" className="font-mono">
                    {subject.code}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                  {subject.name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {subject.className}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {subject.teacherName || "Unassigned"}
                </TableCell>
                {(canEdit || canDelete) && (
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                          onClick={() => onEdit(subject)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                          onClick={() => onDelete(subject.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
