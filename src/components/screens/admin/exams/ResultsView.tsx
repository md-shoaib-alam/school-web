'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, ArrowLeft, BookOpen, Users, CalendarDays, Clock, Trophy, Save, 
  CheckCircle2, XCircle, AlertCircle, Loader2, School, ChevronRight
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { ExamRecord, StudentResultRow } from './types';

interface ResultsViewProps {
  selectedExam: ExamRecord | null;
  exams: ExamRecord[];
  classes: any[];
  resultsClassId: string;
  onResultsClassChange: (classId: string) => void;
  resultRows: StudentResultRow[];
  loadingStudents: boolean;
  savingResults: boolean;
  onBack: () => void;
  onSelectExam: (exam: ExamRecord | null) => void;
  onUpdateMark: (studentId: string, marks: string) => void;
  onSave: () => void;
  onPublish: () => void;
  isPublishing: boolean;
  formatDate: (date: string) => string;
  formatTime: (time: string | null | undefined) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getExamTypeBadge: (type: string) => React.ReactNode;
}

export function ResultsView({
  selectedExam,
  exams,
  classes,
  resultsClassId,
  onResultsClassChange,
  resultRows,
  loadingStudents,
  savingResults,
  onBack,
  onSelectExam,
  onUpdateMark,
  onSave,
  onPublish,
  isPublishing,
  formatDate,
  formatTime,
  getStatusBadge,
  getExamTypeBadge,
}: ResultsViewProps) {
  const filteredExams = useMemo(() => {
    if (!resultsClassId) return [];
    // The exams prop is already filtered by the parent query
    return exams.filter(e => e.status !== 'cancelled' && e.status !== 'completed');
  }, [exams, resultsClassId]);

  const [selectedExamGroup, setSelectedExamGroup] = useState<string>('');

  // Sync selectedExamGroup with selectedExam
  useEffect(() => {
    if (selectedExam) {
      const groupName = selectedExam.name.includes(' - ') ? selectedExam.name.split(' - ')[0] : selectedExam.name;
      queueMicrotask(() => setSelectedExamGroup(groupName));
    } else {
      queueMicrotask(() => setSelectedExamGroup(''));
    }
  }, [selectedExam]);

  // Group active exams to get unique base names (e.g. "testing", "2022")
  const examGroups = useMemo(() => {
    const groups = new Set<string>();
    filteredExams.forEach(e => {
      const groupName = e.name.includes(' - ') ? e.name.split(' - ')[0] : e.name;
      groups.add(groupName);
    });
    return Array.from(groups);
  }, [filteredExams]);

  // Filter subjects belonging to the selected exam group
  const subjectsInGroup = useMemo(() => {
    if (!selectedExamGroup) return [];
    return filteredExams.filter(e => {
      const groupName = e.name.includes(' - ') ? e.name.split(' - ')[0] : e.name;
      return groupName === selectedExamGroup;
    });
  }, [filteredExams, selectedExamGroup]);
  
  const resultSummary = {
    total: resultRows.length,
    pass: resultRows.filter((r) => r.status === 'pass').length,
    fail: resultRows.filter((r) => r.status === 'fail').length,
    pending: resultRows.filter((r) => r.status === 'pending').length,
  };


  return (
    <div className="space-y-6">
      {/* Persistent Selectors */}
      <Card className="border-orange-500/20 dark:border-orange-500/10 shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 flex items-center justify-center text-sm font-bold">
              {selectedExam ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </div>
            Select Class & Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            
            {/* Dropdown 1: Select Class */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Class</label>
              <Select value={resultsClassId} onValueChange={onResultsClassChange}>
                <SelectTrigger className="w-full h-10">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-orange-500 shrink-0" />
                    <SelectValue placeholder="Choose a class..." />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.grade} - {c.section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dropdown 2: Select Exam Group */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Exam</label>
              <Select 
                value={selectedExamGroup} 
                onValueChange={(val) => {
                  setSelectedExamGroup(val);
                  onSelectExam(null); // Clear subject selection when changing exam group
                }}
                disabled={!resultsClassId}
              >
                <SelectTrigger className={`w-full h-10 ${resultsClassId ? 'border-orange-200 dark:border-orange-900/50' : 'opacity-50'}`}>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-500 shrink-0" />
                    <SelectValue placeholder="Select Exam..." />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {examGroups.length > 0 ? (
                    examGroups.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No active exams</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Dropdown 3: Select Subject */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Subject</label>
              <Select 
                value={selectedExam?.id || ''} 
                onValueChange={(id) => {
                  const exam = exams.find(e => e.id === id);
                  if (exam) onSelectExam(exam);
                }}
                disabled={!selectedExamGroup}
              >
                <SelectTrigger className={`w-full h-10 ${selectedExamGroup ? 'border-emerald-200 dark:border-emerald-900/50' : 'opacity-50'}`}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-500 shrink-0" />
                    <SelectValue placeholder="Select Subject..." />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {subjectsInGroup.length > 0 ? (
                    subjectsInGroup.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.subjectName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No subjects found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end self-end h-10 lg:ml-auto">
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedExam ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="py-20 text-center text-muted-foreground">
            {resultsClassId ? (
              <>
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Please select a subject to continue</p>
                <p className="text-sm">Pick a subject from the dropdown above to start entering results.</p>
              </>
            ) : (
              <>
                <School className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No Class Selected</p>
                <p className="text-sm">Choose a class at the top to see available exams.</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Exam info card */}
          <Card className="border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {selectedExam.name}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {selectedExam.subjectName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {selectedExam.className} - {selectedExam.classSection}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(selectedExam.date)}
                    </span>
                    {selectedExam.startTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(selectedExam.startTime)} – {formatTime(selectedExam.endTime)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getExamTypeBadge(selectedExam.examType)}
                  {getStatusBadge(selectedExam.status)}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm">
                <span className="font-medium">
                  Total Marks: <span className="text-blue-600">{selectedExam.totalMarks}</span>
                </span>
                <span className="font-medium">
                  Passing Marks: <span className="text-emerald-600">{selectedExam.passingMarks}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Results summary mini cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Students</p>
                <p className="text-xl font-bold">{resultSummary.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Passed</p>
                <p className="text-xl font-bold text-emerald-600">{resultSummary.pass}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
                <p className="text-xl font-bold text-red-600">{resultSummary.fail}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-amber-600 dark:text-amber-400">Pending</p>
                <p className="text-xl font-bold text-amber-600">{resultSummary.pending}</p>
              </CardContent>
            </Card>
          </div>

          {/* Results Entry Table */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base">Enter Results</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Enter marks for each student. Pass/fail is auto-calculated.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={onSave} 
                  disabled={savingResults || isPublishing || resultRows.length === 0}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  {savingResults ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Draft
                </Button>
                <Button 
                  onClick={onPublish} 
                  disabled={savingResults || isPublishing || resultRows.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Publish Results
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingStudents ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : resultRows.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No students found for this class</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="hidden sm:table-cell w-20">Roll No</TableHead>
                        <TableHead className="w-28">Marks</TableHead>
                        <TableHead className="w-20 text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultRows.map((row, idx) => (
                        <TableRow key={row.studentId} className="hover:bg-transparent">
                          <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium text-sm">{row.studentName}</TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono">
                            {row.rollNumber}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={row.marksObtained}
                              onChange={(e) => onUpdateMark(row.studentId, e.target.value)}
                              placeholder="0"
                              className="h-8 text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {row.status === 'pass' && (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 h-5">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Pass
                              </Badge>
                            )}
                            {row.status === 'fail' && (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 py-0 h-5">
                                <XCircle className="h-3 w-3 mr-1" /> Fail
                              </Badge>
                            )}
                            {row.status === 'pending' && (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 h-5">
                                <AlertCircle className="h-3 w-3 mr-1" /> Pending
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
