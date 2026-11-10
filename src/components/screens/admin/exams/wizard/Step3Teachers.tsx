'use client';

import { ArrowLeft, ArrowRight, UserCheck, Layers, Calendar, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatToDdMmYyyy } from '@/lib/date';
import { ClassOption, SubjectOption } from '../types';
import { BulkSubjectRow } from './wizardTypes';

interface Step3TeachersProps {
  selectedClasses: ClassOption[];
  subjects: SubjectOption[];
  currentBulkRows: BulkSubjectRow[];
  teachers: any[];
  classTeacherAssignments: Record<string, string>;
  setClassTeacherAssignments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onBack: () => void;
  onCancel: () => void;
  onNext: () => void;
}

export function Step3Teachers({
  selectedClasses,
  subjects,
  currentBulkRows,
  teachers,
  classTeacherAssignments,
  setClassTeacherAssignments,
  onBack,
  onCancel,
  onNext,
}: Step3TeachersProps) {
  const chosenUniversalRows = currentBulkRows.filter((r) => r.selected);

  const colors = [
    { bg: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400' },
    { bg: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
    { bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
    { bg: 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400' },
    { bg: 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' },
    { bg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400' },
  ];

  return (
    <div className="bg-card border  rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b ">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold flex items-center justify-center text-sm">
            3
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">Assign Teachers</h2>
            <p className="text-xs text-muted-foreground">
              Teachers are categorized below by class section. Each class has its own subject teachers assigned.
            </p>
          </div>
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
          <UserCheck className="size-4" />
          <span>
            {chosenUniversalRows.length * selectedClasses.length} Exam Papers Across {selectedClasses.length} Class(es)
          </span>
        </div>
      </div>

      {/* Grouped Tables by Class Section */}
      <div className="space-y-6">
        {selectedClasses.map((cls, classIndex) => {
          const clsSubjects = subjects.filter((s) => s.classId === cls.id);

          return (
            <div key={cls.id} className="border  rounded-xl overflow-hidden shadow-2xs">
              {/* Class Category Header */}
              <div className="bg-muted px-4 py-3 border-b  flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {cls.section || classIndex + 1}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-foreground">
                      {cls.name} - Section {cls.section}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="bg-card text-foreground text-[11px]">
                  Class {classIndex + 1} of {selectedClasses.length}
                </Badge>
              </div>

              {/* Class Subjects & Teachers Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow className="border-b ">
                      <TableHead className="w-12 text-center text-xs font-bold text-foreground">#</TableHead>
                      <TableHead className="min-w-[180px] text-xs font-bold text-foreground">Subject</TableHead>
                      <TableHead className="min-w-[200px] text-xs font-bold text-foreground">Current Teacher</TableHead>
                      <TableHead className="min-w-[220px] text-xs font-bold text-foreground">Change Teacher (Optional)</TableHead>
                      <TableHead className="min-w-[220px] text-xs font-bold text-foreground">Schedule Preview</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chosenUniversalRows.map((univRow, idx) => {
                      const matchedSub = clsSubjects.find(
                        (s) => s.name.trim().toLowerCase() === univRow.key
                      );

                      const teacherKey = `${cls.id}_${univRow.key}`;
                      const currentTeacherId = matchedSub?.teacherId;
                      const currentTeacherObj = teachers.find((t) => t.id === currentTeacherId);
                      const currentTeacherName = currentTeacherObj?.name || (matchedSub as any)?.teacherName || 'Not Assigned';
                      const assignedTeacherId = classTeacherAssignments[teacherKey] ?? currentTeacherId ?? '';

                      const initials = currentTeacherName
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      const colorScheme = colors[idx % colors.length];

                      return (
                        <TableRow key={univRow.key} className="hover:bg-muted border-b ">
                          {/* # */}
                          <TableCell className="text-center font-medium text-muted-foreground text-xs">
                            {idx + 1}
                          </TableCell>

                          {/* Subject */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`size-8 rounded-lg ${colorScheme.bg} flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs`}>
                                <Layers className="size-4" />
                              </div>
                              <div>
                                <span className="font-semibold text-sm text-foreground">
                                  {univRow.subjectName}
                                </span>
                                {univRow.code && (
                                  <span className="text-[11px] text-muted-foreground ml-1.5">({univRow.code})</span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Current Teacher */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-full bg-muted dark:bg-zinc-700 text-foreground font-bold text-[10px] flex items-center justify-center shrink-0">
                                {initials || 'NA'}
                              </div>
                              <div className="text-xs">
                                <p className="font-medium text-foreground leading-tight">
                                  {currentTeacherName}
                                </p>
                                <p className="text-[10px] text-muted-foreground">Class Assigned</p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Change Teacher Dropdown */}
                          <TableCell>
                            <Select
                              value={assignedTeacherId}
                              onValueChange={(val) => {
                                setClassTeacherAssignments((prev) => ({
                                  ...prev,
                                  [teacherKey]: val,
                                }));
                              }}
                            >
                              <SelectTrigger className="h-9 w-full rounded-lg text-xs bg-card ">
                                <SelectValue placeholder="Keep Assigned Teacher" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl max-h-56">
                                <SelectItem value={currentTeacherId || 'unassigned'} className="text-xs font-semibold text-blue-600">
                                  {currentTeacherName} (Default)
                                </SelectItem>
                                {teachers
                                  .filter((t) => t.id !== currentTeacherId)
                                  .map((t) => (
                                    <SelectItem key={t.id} value={t.id} className="text-xs">
                                      {t.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          {/* Schedule Preview */}
                          <TableCell>
                            <div className="flex flex-col text-xs text-muted-foreground gap-1">
                              <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <Calendar className="size-3 text-blue-500" />
                                <span>{formatToDdMmYyyy(univRow.date)}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3 text-muted-foreground" />
                                  {univRow.startTime} - {univRow.endTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="size-3 text-amber-500" />
                                  {univRow.totalMarks} Marks
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t ">
        <Button
          variant="outline"
          onClick={onBack}
          className="h-10 px-5 rounded-xl  gap-2 shrink-0 flex-1 sm:flex-initial"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </Button>
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <Button variant="outline" onClick={onCancel} className="hidden sm:inline-flex h-10 px-5 rounded-xl ">
            Cancel
          </Button>
          <Button
            onClick={onNext}
            className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 rounded-xl font-medium gap-2 shadow-sm shadow-blue-500/20 flex-1 sm:flex-initial justify-center"
          >
            <span>Next</span>
            <span className="hidden xs:inline">: Review & Create</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
