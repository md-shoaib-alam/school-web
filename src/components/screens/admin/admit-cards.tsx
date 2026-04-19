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
    <div className="w-[700px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-gray-400 print:rounded-none">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-white/15 flex items-center justify-center border-2 border-white/20">
              <GraduationCap className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide leading-tight">{schoolName.toUpperCase()}</h2>
              <p className="text-[11px] text-slate-300">{schoolAddress}</p>
              {schoolPhone && <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="h-2.5 w-2.5" />{schoolPhone}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">Examination</p>
            <p className="text-xl font-bold text-amber-300 leading-tight">ADMIT CARD</p>
            <p className="text-[10px] text-slate-400 font-mono">{card.cardNumber}</p>
          </div>
        </div>
      </div>

      {/* ── Academic Year Banner ── */}
      <div className="bg-amber-500/10 border-b-2 border-amber-400/30 px-6 py-1.5 flex items-center justify-between">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-500">
          <School className="h-3 w-3 inline mr-1" />
          Class: {card.class.grade} — {card.class.name} (Section {card.class.section})
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Academic Year 2024-2025
        </p>
      </div>

      {/* ── Student Info Section ── */}
      <div className="px-6 py-3">
        <div className="flex gap-4">
          {/* Photo */}
          <div className="shrink-0">
            <div className="h-24 w-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-400">{card.student.initials}</span>
              <span className="text-[8px] text-gray-400 mt-0.5">PHOTO</span>
            </div>
          </div>

          {/* Student Details */}
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Student Name</p>
              <p className="font-bold text-gray-900 text-base">{card.student.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Roll Number</p>
              <p className="font-bold text-gray-900 text-base">{card.student.rollNumber}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Father&apos;s / Guardian&apos;s Name</p>
              <p className="font-medium text-gray-800">{card.student.parentName || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Date of Birth</p>
              <p className="font-medium text-gray-800">{formatDate(card.student.dateOfBirth || '')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="h-px bg-gray-200" />
      </div>

      {/* ── Exam Schedule Table ── */}
      <div className="px-6 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
          <ClipboardList className="h-3.5 w-3.5" />
          Examination Schedule
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 rounded">
              <th className="text-left py-1.5 px-2 font-semibold text-gray-600 rounded-tl-md">Date</th>
              <th className="text-left py-1.5 px-2 font-semibold text-gray-600">Day</th>
              <th className="text-left py-1.5 px-2 font-semibold text-gray-600">Subject</th>
              <th className="text-center py-1.5 px-2 font-semibold text-gray-600">Time</th>
              <th className="text-center py-1.5 px-2 font-semibold text-gray-600">Max Marks</th>
              <th className="text-right py-1.5 px-2 font-semibold text-gray-600 rounded-tr-md">Pass Marks</th>
            </tr>
          </thead>
          <tbody>
            {card.exams.map((exam, idx) => {
              const dayName = exam.date ? new Date(exam.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' }) : '';
              return (
                <tr key={exam.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="py-1.5 px-2 font-medium text-gray-800">
                    {formatDate(exam.date)}
                  </td>
                  <td className="py-1.5 px-2 text-gray-500">
                    {dayName}
                  </td>
                  <td className="py-1.5 px-2">
                    <span className="font-semibold text-gray-800">{exam.subjectName}</span>
                    <span className="text-gray-400 ml-1">({exam.subjectCode})</span>
                  </td>
                  <td className="py-1.5 px-2 text-center text-gray-700 font-mono">
                    {formatTime(exam.startTime)} — {formatTime(exam.endTime)}
                  </td>
                  <td className="py-1.5 px-2 text-center font-bold text-gray-800">{exam.totalMarks}</td>
                  <td className="py-1.5 px-2 text-right font-medium text-gray-600">{exam.passingMarks}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Instructions ── */}
      <div className="px-6 py-2">
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-200/50">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500 mb-1.5">Instructions</h4>
          <ul className="text-[10px] text-gray-600 dark:text-gray-400 space-y-0.5">
            <li className="flex items-start gap-1"><span className="text-amber-500 font-bold">1.</span> Students must carry this admit card to the examination hall.</li>
            <li className="flex items-start gap-1"><span className="text-amber-500 font-bold">2.</span> Report 15 minutes before the exam starts.</li>
            <li className="flex items-start gap-1"><span className="text-amber-500 font-bold">3.</span> Carry your own pen, pencil, eraser, and other required stationery.</li>
            <li className="flex items-start gap-1"><span className="text-amber-500 font-bold">4.</span> Mobile phones, calculators, and electronic devices are not allowed.</li>
            <li className="flex items-start gap-1"><span className="text-amber-500 font-bold">5.</span> Any form of malpractice will result in disqualification.</li>
          </ul>
        </div>
      </div>

      {/* ── Signatures ── */}
      <div className="px-6 pb-4 pt-2">
        <div className="flex items-end justify-between gap-6">
          <div className="text-center flex-1">
            <div className="border-t-2 border-gray-300 pt-1 mt-10">
              <p className="text-[10px] text-gray-500 font-medium">Class Teacher</p>
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="border-t-2 border-gray-300 pt-1 mt-10">
              <p className="text-[10px] text-gray-500 font-medium">Parent / Guardian</p>
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="border-t-2 border-gray-800 pt-1 mt-10">
              <p className="text-[10px] text-gray-800 font-bold">Principal</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="bg-gray-100 px-6 py-1.5 flex items-center justify-between text-[9px] text-gray-400">
        <span>Generated: {new Date(card.generatedAt).toLocaleString('en-IN')}</span>
        <span className="font-mono">{card.cardNumber}</span>
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
    documentTitle: viewCard ? `AdmitCard-${viewCard.student.rollNumber}` : 'AdmitCard',
  });

  const handlePrintAll = useReactToPrint({
    contentRef: allCardsRef,
    documentTitle: `AdmitCards-${selectedClassId}-${new Date().toLocaleDateString()}`,
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
        <div ref={allCardsRef} className="p-8">
          {admitCards.map((card, idx) => (
            <div key={card.cardNumber} className={idx > 0 ? 'mt-8 pt-8 border-t-2 border-dashed border-gray-300 break-before-page' : ''}>
              <AdmitCardVisual card={card} />
            </div>
          ))}
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
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Select Students</label>
                    <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs gap-1">
                      {selectAll ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="max-h-52 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox checked={selectAll} onCheckedChange={toggleAll} />
                          </TableHead>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Student Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classData.students.map((student) => (
                          <TableRow key={student.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Checkbox
                                checked={selectedStudentIds.has(student.id)}
                                onCheckedChange={() => toggleStudent(student.id)}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                            <TableCell className="font-medium text-sm">{student.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={generating || selectedStudentIds.size === 0 || totalExams === 0}
                className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white h-11"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {generating ? 'Generating...' : `Generate ${selectedStudentIds.size} Admit Card${selectedStudentIds.size !== 1 ? 's' : ''}`}
              </Button>
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

      {/* View Admit Card Dialog */}
      <Dialog open={!!viewCard} onOpenChange={(open) => !open && setViewCard(null)}>
        <DialogContent className="max-w-[780px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              Admit Card — {viewCard?.student.name}
            </DialogTitle>
          </DialogHeader>
          {viewCard && (
            <div className="flex flex-col items-center gap-4">
              <div className="scale-[0.85] sm:scale-100 origin-top">
                <div ref={singleCardRef} className="p-4 bg-white">
                  <AdmitCardVisual card={viewCard} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePrintSingle()}
                  variant="outline"
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print This Card
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
