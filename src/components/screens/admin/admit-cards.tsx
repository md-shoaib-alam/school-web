'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText, Printer, Eye, Loader2, GraduationCap, Calendar,
  Phone, School, BookOpen, ClipboardList, AlertCircle,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { goeyToast as toast } from "goey-toast";
import { api, apiFetch } from '@/lib/api';

// ══════════════════════════════════════════════════════════════
// ── Types ──
// ══════════════════════════════════════════════════════════════

interface ClassOption {
  id: string;
  name: string;
  section: string;
  grade: string;
}

interface StudentInfo {
  id: string;
  rollNumber: string;
  name: string;
  avatar: string | null;
  initials: string;
  dateOfBirth: string | null;
  parentName: string;
}

interface ExamSchedule {
  id: string;
  name: string;
  examType: string;
  subjectName: string;
  subjectCode: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
}

interface AdmitCard {
  cardNumber: string;
  student: StudentInfo;
  class: { id: string; name: string; section: string; grade: string };
  school: {
    name: string;
    address: string | null;
    phone: string | null;
    logo: string | null;
  } | null;
  exams: ExamSchedule[];
  generatedAt: string;
}

interface ClassData {
  class: { id: string; name: string; section: string; grade: string };
  school: { name: string; address: string | null; phone: string | null; email: string | null } | null;
  examTypes: string[];
  exams: ExamSchedule[];
  students: { id: string; rollNumber: string; name: string; class: { id: string; name: string; section: string; grade: string } }[];
}

// ══════════════════════════════════════════════════════════════
// ── Helpers ──
// ══════════════════════════════════════════════════════════════

const examTypeLabels: Record<string, string> = {
  unit_test: 'Unit Test',
  midterm: 'Mid-Term',
  final: 'Final Exam',
  quiz: 'Quiz',
  practical: 'Practical',
};

const examTypeColors: Record<string, string> = {
  unit_test: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  midterm: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  final: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  quiz: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  practical: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function formatTime(time: string): string {
  if (!time) return '—';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getExamTypeColor(type: string): string {
  return examTypeColors[type] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
}

// ══════════════════════════════════════════════════════════════
// ── Admit Card Visual Component (Hall Ticket) ──
// ══════════════════════════════════════════════════════════════

function AdmitCardVisual({ card }: { card: AdmitCard }) {
  const schoolName = card.school?.name || 'Global Academy';
  const schoolAddress = card.school?.address || 'School Address';
  const schoolPhone = card.school?.phone || '';

  return (
    <div className="w-[100%] max-w-[750px] mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-gray-400 print:rounded-none print:max-w-none h-[13cm] flex flex-col justify-between">
      <div>
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white px-5 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center border-2 border-white/20">
                <GraduationCap className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wide leading-tight">{schoolName.toUpperCase()}</h2>
                <p className="text-[9px] text-slate-300 truncate max-w-[300px]">{schoolAddress}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] uppercase tracking-[0.2em] text-slate-400 font-medium">Examination</p>
              <p className="text-lg font-bold text-amber-300 leading-tight">ADMIT CARD</p>
              <p className="text-[9px] text-slate-400 font-mono">{card.cardNumber}</p>
            </div>
          </div>
        </div>

        {/* ── Academic Year Banner ── */}
        <div className="bg-amber-500/5 border-b border-amber-400/20 px-5 py-1 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-500">
            <School className="h-2.5 w-2.5 inline mr-1" />
            Class: {card.class.grade} — {card.class.name} ({card.class.section})
          </p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5" />
            Session 2024-25
          </p>
        </div>

        {/* ── Student Info Section ── */}
        <div className="px-5 py-2">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="h-20 w-16 rounded border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-300">{card.student.initials}</span>
                <span className="text-[7px] text-gray-300 mt-0.5">PHOTO</span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>
                <p className="text-[9px] text-gray-400 uppercase font-medium">Student Name</p>
                <p className="font-bold text-gray-900 truncate">{card.student.name}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase font-medium">Roll Number</p>
                <p className="font-bold text-gray-900">{card.student.rollNumber}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase font-medium">Guardian Name</p>
                <p className="font-medium text-gray-800 truncate">{card.student.parentName || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase font-medium">Class</p>
                <p className="font-bold text-gray-900">{card.class.grade} - {card.class.name}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase font-medium">D.O.B</p>
                <p className="font-medium text-gray-800">{formatDate(card.student.dateOfBirth || '')}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase font-medium">Section</p>
                <p className="font-medium text-gray-800">{card.class.section}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Exam Schedule Table ── */}
        <div className="px-5 py-1">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200">
                <th className="text-left py-1 px-1.5 font-bold text-slate-700 w-[110px]">Date</th>
                <th className="text-left py-1 px-1.5 font-bold text-slate-700">Subject</th>
                <th className="text-center py-1 px-1.5 font-bold text-slate-700 w-[140px]">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {card.exams.map((exam) => {
                return (
                  <tr key={exam.id}>
                    <td className="py-1 px-1.5 font-medium text-slate-800">
                      {formatDate(exam.date)}
                    </td>
                    <td className="py-1 px-1.5">
                      <span className="font-bold text-slate-800">{exam.subjectName}</span>
                      <span className="text-[8px] text-slate-400 ml-1">({exam.subjectCode})</span>
                    </td>
                    <td className="py-1 px-1.5 text-center font-mono text-slate-600">
                      {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        {/* ── Footer / Signatures ── */}
        <div className="px-5 py-2 border-t border-dashed border-gray-200">
          <div className="flex items-end justify-between gap-4">
            <div className="text-center border-t border-gray-300 pt-0.5 mt-4 flex-1">
              <p className="text-[8px] text-gray-500">Teacher</p>
            </div>
            <div className="text-center border-t border-gray-300 pt-0.5 mt-4 flex-1">
              <p className="text-[8px] text-gray-500">Parent</p>
            </div>
            <div className="text-center border-t-2 border-slate-800 pt-0.5 mt-4 flex-1">
              <p className="text-[9px] text-slate-800 font-bold">Principal</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Main Component ──
// ══════════════════════════════════════════════════════════════

export function AdminAdmitCards() {
  const queryClient = useQueryClient();
  const singleCardRef = useRef<HTMLDivElement>(null);
  const allCardsRef = useRef<HTMLDivElement>(null);

  // Step 1: Select class
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Step 2: Select exam type
  const [selectedExamType, setSelectedExamType] = useState<string>('all');

  // Step 3: Generate
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(true);

  // View dialog
  const [viewCard, setViewCard] = useState<AdmitCard | null>(null);

  // Print mode
  const [printMode, setPrintMode] = useState(false);

  // ── Queries ──

  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['classes-min'],
    queryFn: async () => {
      const data = await api.get('/classes?mode=min');
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        section: c.section,
        grade: c.grade,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: classData, isLoading: loadingClassData } = useQuery({
    queryKey: ['admit-card-data', selectedClassId],
    queryFn: () => api.get(`/admit-cards?classId=${selectedClassId}`),
    enabled: !!selectedClassId,
  });

  // Reset selection when class data loads
  useEffect(() => {
    if (classData?.students) {
      setSelectedStudentIds(new Set(classData.students.map((s: any) => s.id)));
      setSelectAll(true);
    }
  }, [classData]);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setAdmitCards([]);
    setSelectedExamType('all');
  };

  // ── Generate Admit Cards ──
  const handleGenerate = async () => {
    if (!selectedClassId) {
      toast.error('Please select a class');
      return;
    }
    if (selectedStudentIds.size === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setGenerating(true);
    try {
      const res = await apiFetch('/api/admit-cards', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClassId,
          examType: selectedExamType,
          studentIds: Array.from(selectedStudentIds),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdmitCards(data.admitCards);
        toast.success(`${data.totalGenerated} admit card${data.totalGenerated !== 1 ? 's' : ''} generated successfully!`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to generate admit cards');
      }
    } catch {
      toast.error('Error generating admit cards');
    }
    setGenerating(false);
  };

  // ── Select/Deselect Students ──
  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectAll(classData ? next.size === classData.students.length : false);
      return next;
    });
  };

  const toggleAll = () => {
    if (!classData) return;
    if (selectAll) {
      setSelectedStudentIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedStudentIds(new Set(classData.students.map((s) => s.id)));
      setSelectAll(true);
    }
  };

  const handlePrintSingle = useReactToPrint({
    contentRef: singleCardRef,
    documentTitle: "",
  });

  const handlePrintAll = useReactToPrint({
    contentRef: allCardsRef,
    documentTitle: "",
  });

  // ── Summary ──
  const totalStudents = classData?.students.length || 0;
  const totalExams = classData ? (selectedExamType === 'all'
    ? classData.exams.length
    : classData.exams.filter((e) => e.examType === selectedExamType).length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-amber-600" />
            Admit Cards
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Generate exam admit cards (hall tickets) for students
          </p>
        </div>
        {admitCards.length > 0 && (
          <Button onClick={handlePrintAll} className="gap-2 bg-slate-800 hover:bg-slate-900 text-white">
            <Printer className="h-4 w-4" />
            Print All ({admitCards.length})
          </Button>
        )}
      </div>

      {/* Hidden Batch Print Container */}
      <div className="hidden">
        <div ref={allCardsRef} className="print:block p-0">
          <style type="text/css" media="print">
            {"@page { size: A4; margin: 0mm; } body { margin: 0; } .admit-card-page { page-break-after: always; }"}
          </style>
          {Array.from({ length: Math.ceil(admitCards.length / 4) }).map((_, pageIdx) => (
            <div key={pageIdx} className="grid grid-cols-2 gap-0 p-[5mm] admit-card-page h-[29.7cm] content-start">
              {admitCards.slice(pageIdx * 4, (pageIdx + 1) * 4).map((card) => (
                <div 
                  key={card.cardNumber} 
                  className="flex items-center justify-center h-[13.8cm] p-1 border border-dashed border-gray-300 print:border-gray-400"
                  style={{ 
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center p-1">
                    <AdmitCardVisual card={card} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hidden Single Print Container */}
      <div className="hidden">
        <div ref={singleCardRef} className="print:block p-0 bg-white">
          <style type="text/css" media="print">
            {"@page { size: A4; margin: 0mm; } body { margin: 0; }"}
          </style>
          {viewCard && (
            <div className="w-[21cm] h-[29.7cm] p-[5mm] flex flex-wrap content-start">
              <div className="flex items-center justify-center h-[13.8cm] p-1 border border-dashed border-gray-300 print:border-gray-400 w-[10.5cm]">
                <div className="w-full h-full flex items-center justify-center p-1">
                  <AdmitCardVisual card={viewCard} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Normal Mode: Step-by-step generation */}
      <div className="space-y-6">
        {/* Step 1: Select Class */}
        <Card className="border-2 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center text-sm font-bold">1</div>
              Select Class
            </CardTitle>
            <CardDescription>Choose the class for which you want to generate admit cards</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Select value={selectedClassId} onValueChange={handleClassChange}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder={loadingClasses ? 'Loading classes...' : 'Select a class'} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {c.grade} — {c.name} (Section {c.section})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Step 2: Select Exam Type & Students */}
        {classData && (
          <Card className="border-2 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center text-sm font-bold">2</div>
                Configure Admit Card
              </CardTitle>
              <CardDescription>
                Filter by exam type and select students
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {/* Exam Type Filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Exam Type</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedExamType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedExamType('all')}
                    className="gap-1.5"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    All Exams
                  </Button>
                  {classData.examTypes.map((type) => (
                    <Button
                      key={type}
                      variant={selectedExamType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedExamType(type)}
                      className="gap-1.5"
                    >
                      {examTypeLabels[type] || type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Students</p>
                  <p className="text-xl font-bold">{totalStudents}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Exams</p>
                  <p className="text-xl font-bold">{totalExams}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Selected</p>
                  <p className="text-xl font-bold text-amber-600">{selectedStudentIds.size}</p>
                </div>
              </div>

              {totalExams === 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-500">No exams found</p>
                    <p className="text-xs text-muted-foreground">Create exams for this class first in the Exams section before generating admit cards.</p>
                  </div>
                </div>
              )}

              {/* Student Selection */}
              {totalExams > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Select Students</h3>
                    <Button variant="link" size="sm" onClick={toggleAll} className="text-xs h-auto p-0 font-semibold text-amber-600 hover:text-amber-700">
                      {selectAll ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="max-h-52 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="w-12 px-4">
                            <Checkbox checked={selectAll} onCheckedChange={toggleAll} />
                          </TableHead>
                          <TableHead className="w-[40%] px-4">Roll No</TableHead>
                          <TableHead className="w-[40%] px-4">Student Name</TableHead>
                          <TableHead className="w-[20%] px-4 text-center">Section</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classData.students.map((student) => (
                          <TableRow key={student.id} className="hover:bg-muted/50 border-slate-100 dark:border-slate-800">
                            <TableCell className="px-4 text-center">
                              <Checkbox
                                checked={selectedStudentIds.has(student.id)}
                                onCheckedChange={() => toggleStudent(student.id)}
                              />
                            </TableCell>
                            <TableCell className="w-[40%] px-4 font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{student.rollNumber}</TableCell>
                            <TableCell className="w-[40%] px-4 font-bold text-sm text-slate-800 dark:text-slate-200">{student.name}</TableCell>
                            <TableCell className="w-[20%] px-4 text-center text-xs font-medium text-slate-500">{student.section || 'A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Generate & Print Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={generating || selectedStudentIds.size === 0 || totalExams === 0}
                  className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-white h-11"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {generating ? 'Generating...' : `Generate ${selectedStudentIds.size} Admit Card${selectedStudentIds.size !== 1 ? 's' : ''}`}
                </Button>

                <Button
                  onClick={handlePrintAll}
                  disabled={admitCards.length === 0 || generating}
                  className={`flex-1 gap-2 h-11 border-none ${admitCards.length > 0 ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'}`}
                >
                  <Printer className="h-4 w-4" />
                  Print All {admitCards.length > 0 && `(${admitCards.length})`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading state for class data */}
        {loadingClassData && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {/* Step 3: Generated Admit Cards */}
        {admitCards.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">3</div>
                Generated Admit Cards
              </CardTitle>
              <CardDescription>
                {admitCards.length} admit card{admitCards.length !== 1 ? 's' : ''} ready — view, print, or download
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card No</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Class</TableHead>
                      <TableHead className="hidden md:table-cell">Exams</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admitCards.map((card) => (
                      <TableRow key={card.cardNumber} className="hover:bg-muted/50">
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">{card.cardNumber}</span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{card.student.rollNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {card.student.initials}
                            </div>
                            <span className="font-medium text-sm">{card.student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {card.class.grade} — {card.class.name} ({card.class.section})
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {card.exams.slice(0, 2).map((exam) => (
                              <Badge key={exam.id} variant="outline" className={`text-[10px] gap-0.5 ${getExamTypeColor(exam.examType)}`}>
                                {exam.subjectName}
                              </Badge>
                            ))}
                            {card.exams.length > 2 && (
                              <Badge variant="secondary" className="text-[10px]">+{card.exams.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewCard(card)}
                            className="gap-1.5 text-amber-600 hover:text-amber-700"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No data states */}
        {!loadingClasses && classes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <School className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No classes found</p>
              <p className="text-sm">Create classes first in the Classes section</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!viewCard} onOpenChange={(open) => !open && setViewCard(null)}>
        <DialogContent className="max-w-[850px] max-h-[95vh] overflow-y-auto bg-slate-950 border-slate-800 p-0">
          <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <DialogTitle className="text-white flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <span>Admit Card — <span className="text-amber-400">{viewCard?.student.name}</span></span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Preview and print student admit card.
            </DialogDescription>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewCard(null)}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <AlertCircle className="h-5 w-5 rotate-45" />
            </Button>
          </div>

          {viewCard && (
            <div className="p-8 flex flex-col items-center gap-6 bg-slate-950/50">
              <div className="scale-[0.8] sm:scale-100 origin-top shadow-2xl shadow-black/50">
                <div className="bg-white p-4 rounded-lg">
                  <AdmitCardVisual card={viewCard} />
                </div>
              </div>
              
              <Button
                onClick={() => handlePrintSingle()}
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20 px-8 h-12 text-base font-semibold"
              >
                <Printer className="h-5 w-5" />
                Print This Card
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
