"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Zap, GraduationCap, Users, Loader2 } from "lucide-react";
import { ClassOption, StudentOption } from "./types";
import { isLastClass } from "./utils";

interface BulkPromoteTabProps {
  classes: ClassOption[];
  bulkFromClass: string;
  handleBulkFromClassChange: (classId: string) => void;
  bulkToClass: string;
  setBulkToClass: (classId: string) => void;
  bulkAcademicYear: string;
  setBulkAcademicYear: (year: string) => void;
  bulkRemarks: string;
  setBulkRemarks: (remarks: string) => void;
  bulkPreview: StudentOption[];
  handleBulkPromote: () => void;
  bulkSubmitting: boolean;
}

export function BulkPromoteTab({
  classes,
  bulkFromClass,
  handleBulkFromClassChange,
  bulkToClass,
  setBulkToClass,
  bulkAcademicYear,
  setBulkAcademicYear,
  bulkRemarks,
  setBulkRemarks,
  bulkPreview,
  handleBulkPromote,
  bulkSubmitting,
}: BulkPromoteTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Bulk Class Promotion
          </CardTitle>
          <CardDescription>
            Select a source class and all its students will be promoted to the next class. The target class is auto-detected based on grade sequence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* From Class */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Class (Current) *</label>
              <Select value={bulkFromClass} onValueChange={handleBulkFromClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class to promote from" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .sort((a, b) => (parseInt(a.grade) || 0) - (parseInt(b.grade) || 0))
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}-{c.section} (Grade {c.grade}) — {c.studentCount} students
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {bulkFromClass && isLastClass(bulkFromClass, classes) && (
                <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-lg px-3 py-2 border border-violet-200 dark:border-violet-800">
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  <span>This is the highest class — students should be <strong>graduated</strong> instead.</span>
                </div>
              )}
            </div>
            {/* To Class */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Class (Next) *</label>
              <Select value={bulkToClass} onValueChange={setBulkToClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detected or select manually" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .filter((c) => c.id !== bulkFromClass)
                    .sort((a, b) => (parseInt(a.grade) || 0) - (parseInt(b.grade) || 0))
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}-{c.section} (Grade {c.grade})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Academic Year */}
          <div className="space-y-2 max-w-xs">
            <label className="text-sm font-medium">Academic Year *</label>
            <Input
              placeholder="e.g. 2025-2026"
              value={bulkAcademicYear}
              onChange={(e) => setBulkAcademicYear(e.target.value)}
            />
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks (optional)</label>
            <Textarea
              placeholder="e.g. Annual promotion 2025-2026"
              value={bulkRemarks}
              onChange={(e) => setBulkRemarks(e.target.value)}
              rows={2}
            />
          </div>

          {/* Preview */}
          {bulkPreview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                <span>{bulkPreview.length} student(s) will be promoted</span>
              </div>
              <div className="max-h-52 overflow-y-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Roll No.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkPreview.slice(0, 30).map((s, i) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                        <TableCell className="text-sm font-medium">{s.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">#{s.rollNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {bulkPreview.length > 30 && (
                  <p className="text-xs text-muted-foreground text-center py-2">... and {bulkPreview.length - 30} more students</p>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleBulkPromote}
            disabled={bulkSubmitting || !bulkFromClass || !bulkToClass || !bulkAcademicYear || bulkPreview.length === 0}
          >
            {bulkSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
            {bulkSubmitting ? 'Creating Promotions...' : `Promote ${bulkPreview.length} Student(s)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
