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
  CheckCircle2, XCircle, AlertCircle, Loader2 
} from 'lucide-react';
import { ExamRecord, StudentResultRow } from './types';

interface ResultsViewProps {
  selectedExam: ExamRecord | null;
  exams: ExamRecord[];
  resultRows: StudentResultRow[];
  loadingStudents: boolean;
  savingResults: boolean;
  onBack: () => void;
  onSelectExam: (exam: ExamRecord) => void;
  onUpdateMark: (studentId: string, marks: string) => void;
  onUpdateRemark: (studentId: string, remarks: string) => void;
  onSave: () => void;
  formatDate: (date: string) => string;
  formatTime: (time: string | null | undefined) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getExamTypeBadge: (type: string) => React.ReactNode;
}

export function ResultsView({
  selectedExam,
  exams,
  resultRows,
  loadingStudents,
  savingResults,
  onBack,
  onSelectExam,
  onUpdateMark,
  onUpdateRemark,
  onSave,
  formatDate,
  formatTime,
  getStatusBadge,
  getExamTypeBadge,
}: ResultsViewProps) {
  
  const resultSummary = {
    total: resultRows.length,
    pass: resultRows.filter((r) => r.status === 'pass').length,
    fail: resultRows.filter((r) => r.status === 'fail').length,
    pending: resultRows.filter((r) => r.status === 'pending').length,
  };

  if (!selectedExam) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No Exam Selected</p>
          <p className="text-sm mt-1 mb-6 text-muted-foreground">Select an exam below or click "Results" in the exam list.</p>
          
          <div className="w-full max-w-xs mx-auto space-y-4">
            <Select onValueChange={(id) => {
              const exam = exams.find(e => e.id === id);
              if (exam) onSelectExam(exam);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an exam..." />
              </SelectTrigger>
              <SelectContent>
                {exams.filter(e => e.status !== 'cancelled').map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} ({e.subjectName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">or</span>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back to Exams
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button + Exam details header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Exams
        </Button>
      </div>

      {/* Exam info card */}
      <Card className="border-l-4 border-l-blue-500">
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Enter Results</CardTitle>
            <CardDescription>
              Enter marks for each student. Pass/fail is auto-calculated.
            </CardDescription>
          </div>
          <Button 
            onClick={onSave} 
            disabled={savingResults || resultRows.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {savingResults ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Results
          </Button>
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
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="hidden sm:table-cell w-20">Roll No</TableHead>
                    <TableHead className="w-28">Marks</TableHead>
                    <TableHead className="w-20 text-center">Status</TableHead>
                    <TableHead className="hidden md:table-cell w-36">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultRows.map((row, idx) => (
                    <TableRow key={row.studentId}>
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
                      <TableCell className="hidden md:table-cell">
                        <Input
                          value={row.remarks}
                          onChange={(e) => onUpdateRemark(row.studentId, e.target.value)}
                          placeholder="Optional remarks"
                          className="h-8 text-sm"
                        />
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
  );
}
