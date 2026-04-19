'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ClipboardList, Plus, Pencil, Trash2, FileText, CalendarDays,
  Clock, CheckCircle2, AlertCircle, BookOpen, Users, ArrowLeft, Save,
  GraduationCap, Trophy, Layers, Zap,
} from 'lucide-react';
import { goeyToast as toast } from 'goey-toast';
import { apiFetch } from '@/lib/api';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { parseISO } from 'date-fns';

// ── Types ────────────────────────────────────────────────────────────────────

interface ClassOption {
  id: string;
  name: string;
  section: string;
  grade: string;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
  classId: string;
}

interface StudentOption {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
}

interface ExamRecord {
  id: string;
  classId: string;
  className: string;
  classSection: string;
  subjectId: string;
  subjectName: string;
  teacherId?: string | null;
  teacherName?: string | null;
  name: string;
  examType: string;
  totalMarks: number;
  passingMarks: number;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StudentResultRow {
  studentId: string;
  studentName: string;
  rollNumber: string;
  marksObtained: string;
  remarks: string;
  status: 'pass' | 'fail' | 'pending';
}

// ── Configs ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { bg: string; label: string }> = {
  scheduled: {
    bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    label: 'Scheduled',
  },
  ongoing: {
    bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    label: 'Ongoing',
  },
  completed: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    label: 'Cancelled',
  },
};

const examTypeConfig: Record<string, { bg: string; label: string }> = {
  unit_test: {
    bg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    label: 'Unit Test',
  },
  midterm: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    label: 'Midterm',
  },
  final: {
    bg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    label: 'Final',
  },
  quiz: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    label: 'Quiz',
  },
  practical: {
    bg: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800',
    label: 'Practical',
  },
};

interface ExamFormData {
  classId: string;
  subjectId: string;
  examType: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks: string;
  passingMarks: string;
}

interface BulkSubjectRow {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  selected: boolean;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks: string;
  passingMarks: string;
}

const emptyExamForm: ExamFormData = {
  classId: '',
  subjectId: '',
  examType: 'unit_test',
  name: '',
  date: '',
  startTime: '',
  endTime: '',
  totalMarks: '100',
  passingMarks: '40',
};

// ── Component ────────────────────────────────────────────────────────────────

export function AdminExams() {
  // Data
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [examTypeFilter, setExamTypeFilter] = useState('all');

  // Tabs
  const [activeTab, setActiveTab] = useState('exams');

  // New Exam dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<ExamFormData>({ ...emptyExamForm });
  const [adding, setAdding] = useState(false);

  // Edit Exam dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<ExamFormData & { id: string }>({ ...emptyExamForm, id: '' });
  const [saving, setSaving] = useState(false);

  // Bulk mode
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkOverrides, setBulkOverrides] = useState<Record<string, { 
    date?: string; 
    startTime?: string; 
    endTime?: string;
    totalMarks?: string;
    passingMarks?: string;
  }>>({});

  // Delete
  const [deleting, setDeleting] = useState(false);

  // Results entry
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);
  const [resultRows, setResultRows] = useState<StudentResultRow[]>([]);
  const [savingResults, setSavingResults] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ── Data fetching ───────────────────────────────────────────────────────

  const fetchExams = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (classFilter !== 'all') params.set('classId', classFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await apiFetch(`/api/exams?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setExams(Array.isArray(json) ? json : (json.data || []));
      }
    } catch {
      console.error('Error fetching exams');
    }
  }, [classFilter, statusFilter]);

  const fetchClassesSubjects = useCallback(async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        apiFetch('/api/classes?mode=min'),
        apiFetch('/api/subjects?mode=min'),
      ]);
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data.map((c: ClassOption) => ({ id: c.id, name: c.name, section: c.section, grade: c.grade })));
      }
      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data.map((s: SubjectOption) => ({ id: s.id, name: s.name, code: s.code, classId: s.classId })));
      }
    } catch {
      console.error('Error fetching classes/subjects');
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchExams(), fetchClassesSubjects()]);
      setLoading(false);
    }
    init();
  }, [fetchExams, fetchClassesSubjects]);

  // ── Filtering ───────────────────────────────────────────────────────────

  const examsList = Array.isArray(exams) ? exams : [];

  const filtered = examsList.filter((exam) => {
    const matchClass = classFilter === 'all' || exam.classId === classFilter;
    const matchStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchType = examTypeFilter === 'all' || exam.examType === examTypeFilter;
    return matchClass && matchStatus && matchType;
  });

  // ── Summary stats ──────────────────────────────────────────────────────

  const today = new Date().toISOString().split('T')[0];
  const totalExams = examsList.length;
  const scheduledCount = examsList.filter((e) => e.status === 'scheduled').length;
  const completedCount = examsList.filter((e) => e.status === 'completed').length;
  const upcomingCount = examsList.filter((e) => e.date >= today && e.status !== 'cancelled' && e.status !== 'completed').length;

  const summaryCards = [
    {
      label: 'Total Exams',
      value: totalExams,
      icon: <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Scheduled',
      value: scheduledCount,
      icon: <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Upcoming',
      value: upcomingCount,
      icon: <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />,
      color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    },
  ];

  // ── Subjects filtered by selected class ────────────────────────────────

  const subjectsForClass = subjects.filter((s) => s.classId === addForm.classId);
  const editSubjectsForClass = subjects.filter((s) => s.classId === editForm.classId);

  // ── Bulk mode helpers ───────────────────────────────────────────────

  const bulkSubjectsForClass = addForm.classId
    ? subjects.filter((s) => s.classId === addForm.classId)
    : [];

  // All selected by default, toggle with the Set
  const bulkRows = bulkSubjectsForClass.map((s) => {
    const override = bulkOverrides[s.id] || {};
    return {
      subjectId: s.id,
      subjectName: s.name,
      subjectCode: s.code,
      selected: bulkSelected.has(s.id),
      date: override.date || addForm.date || '',
      startTime: override.startTime || addForm.startTime || '09:00',
      endTime: override.endTime || addForm.endTime || '12:00',
      totalMarks: override.totalMarks || addForm.totalMarks || '100',
      passingMarks: override.passingMarks || addForm.passingMarks || '40',
    };
  });
  const selectedBulkCount = bulkRows.filter((r) => r.selected).length;
  const toggleAllBulk = (checked: boolean) => {
    if (checked) {
      setBulkSelected(new Set(bulkSubjectsForClass.map((s) => s.id)));
    } else {
      setBulkSelected(new Set());
    }
  };
  const toggleBulkRow = (subjectId: string, checked: boolean) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(subjectId);
      else next.delete(subjectId);
      return next;
    });
  };

  // ── CRUD: Create Exam (single or bulk) ─────────────────────────────────

  const handleCreate = async () => {
    const selectedRows = bulkRows.filter((r) => r.selected && r.date);
    if (selectedRows.length === 0) {
      toast.error('Select at least one subject with a date');
      return;
    }
    if (!addForm.classId || !addForm.name || !addForm.examType) {
      toast.error('Class, exam name, and exam type are required');
      return;
    }
    setAdding(true);
    try {
      const res = await apiFetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulk: true,
          classId: addForm.classId,
          examType: addForm.examType,
          name: addForm.name,
          exams: selectedRows.map((r) => ({
            subjectId: r.subjectId,
            subjectName: r.subjectName,
            date: r.date,
            startTime: r.startTime || null,
            endTime: r.endTime || null,
            totalMarks: Number(r.totalMarks) || 100,
            passingMarks: Number(r.passingMarks) || 40,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.totalCreated} exam(s) created successfully!`);
        setAddOpen(false);
        setAddForm({ ...emptyExamForm });
        setBulkSelected(new Set());
        await fetchExams();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to create exams');
      }
    } catch {
      toast.error('Error creating exams');
    }
    setAdding(false);
  };

  // ── CRUD: Edit Exam ────────────────────────────────────────────────────

  const openEdit = (exam: ExamRecord) => {
    setEditForm({
      id: exam.id,
      classId: exam.classId,
      subjectId: exam.subjectId,
      examType: exam.examType,
      name: exam.name,
      date: exam.date?.split('T')[0] ?? '',
      startTime: exam.startTime?.slice(0, 5) ?? '',
      endTime: exam.endTime?.slice(0, 5) ?? '',
      totalMarks: String(exam.totalMarks),
      passingMarks: String(exam.passingMarks),
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editForm.id) return;
    setSaving(true);
    try {
      const res = await apiFetch('/api/exams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editForm.id,
          classId: editForm.classId,
          subjectId: editForm.subjectId,
          name: editForm.name,
          examType: editForm.examType,
          date: editForm.date,
          startTime: editForm.startTime || null,
          endTime: editForm.endTime || null,
          totalMarks: Number(editForm.totalMarks) || 100,
          passingMarks: Number(editForm.passingMarks) || 40,
        }),
      });
      if (res.ok) {
        toast.success('Exam updated successfully!');
        setEditOpen(false);
        await fetchExams();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to update exam');
      }
    } catch {
      toast.error('Error updating exam');
    }
    setSaving(false);
  };

  // ── CRUD: Delete Exam ──────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/exams?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Exam deleted successfully!');
        setExams(exams.filter((e) => e.id !== id));
      } else {
        toast.error('Failed to delete exam');
      }
    } catch {
      toast.error('Error deleting exam');
    }
    setDeleting(false);
  };

  // ── Results Entry ──────────────────────────────────────────────────────

  const openResultsEntry = async (exam: ExamRecord) => {
    setSelectedExam(exam);
    setActiveTab('results');
    setLoadingStudents(true);

    try {
      // Fetch students for this class (minimal mode for performance)
      const studentsRes = await apiFetch(`/api/students?classId=${exam.classId}&mode=min`);
      if (studentsRes.ok) {
        const data = (await studentsRes.json()).items || [];
        setStudents(data);

        // Fetch existing results
        const resultsRes = await apiFetch(`/api/exams/results?examId=${exam.id}`);
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json();
          const existingResults = resultsData.results || [];

          const rows: StudentResultRow[] = data.map((s: StudentOption) => {
            const existing = existingResults.find(
              (r: { studentId: string; marksObtained: number; remarks: string | null; status: string }) => r.studentId === s.id,
            );
            const marks = existing ? String(existing.marksObtained) : '';
            const remarks = existing?.remarks || '';
            const status: 'pass' | 'fail' | 'pending' = existing
              ? (existing.status as 'pass' | 'fail' | 'pending')
              : 'pending';
            return {
              studentId: s.id,
              studentName: s.name,
              rollNumber: s.rollNumber || '',
              marksObtained: marks,
              remarks,
              status,
            };
          });

          setResultRows(rows);
        } else {
          setResultRows(
            data.map((s: StudentOption) => ({
              studentId: s.id,
              studentName: s.name,
              rollNumber: s.rollNumber || '',
              marksObtained: '',
              remarks: '',
              status: 'pending' as const,
            })),
          );
        }
      }
    } catch {
      toast.error('Error loading students for this class');
    }

    setLoadingStudents(false);
  };

  const updateResultMark = (studentId: string, marks: string) => {
    const passing = Number(selectedExam?.passingMarks) || 40;
    const marksNum = Number(marks);
    const status: 'pass' | 'fail' | 'pending' = marks === '' ? 'pending' : marksNum >= passing ? 'pass' : 'fail';

    setResultRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, marksObtained: marks, status } : r)),
    );
  };

  const updateResultRemark = (studentId: string, remarks: string) => {
    setResultRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, remarks } : r)),
    );
  };

  const handleSaveResults = async () => {
    if (!selectedExam) return;
    setSavingResults(true);
    try {
      const resultsPayload = resultRows.map((r) => ({
        studentId: r.studentId,
        marksObtained: r.marksObtained === '' ? 0 : Number(r.marksObtained),
        status: r.status,
        remarks: r.remarks || null,
      }));

      const res = await apiFetch('/api/exams/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExam.id,
          results: resultsPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Results saved! ${data.created}/${data.total} records saved.`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to save results');
      }
    } catch {
      toast.error('Error saving results');
    }
    setSavingResults(false);
  };

  const backToExams = () => {
    setSelectedExam(null);
    setActiveTab('exams');
  };

  // ── Result summary for entry view ──────────────────────────────────────

  const resultSummary = {
    total: resultRows.length,
    pass: resultRows.filter((r) => r.status === 'pass').length,
    fail: resultRows.filter((r) => r.status === 'fail').length,
    pending: resultRows.filter((r) => r.status === 'pending').length,
  };

  // ── Render helpers ─────────────────────────────────────────────────────

  const formatTime = (time: string | null | undefined) => {
    if (!time) return '—';
    try {
      return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return time;
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date + 'T00:00:00').toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status];
    if (!config) return <Badge variant="outline" className="capitalize">{status}</Badge>;
    return (
      <Badge variant="outline" className={`${config.bg} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getExamTypeBadge = (type: string) => {
    const config = examTypeConfig[type];
    if (!config) return <Badge variant="outline" className="capitalize">{type}</Badge>;
    return (
      <Badge variant="outline" className={`${config.bg} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  // ── JSX ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-600" />
            Exam Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Create, schedule, and manage exams. Enter student results and track performance.
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
          onClick={() => {
            setAddForm({ ...emptyExamForm });
            setAddOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Exam
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => {
        if (v === 'exams') backToExams();
        else setActiveTab(v);
      }}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="exams" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Exams
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2" disabled={!selectedExam}>
            <FileText className="h-4 w-4" />
            Results Entry
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* EXAMS TAB                                                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="exams" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <Card key={card.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} - {c.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="unit_test">Unit Test</SelectItem>
                <SelectItem value="midterm">Midterm</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="practical">Practical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Exams Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Exams</CardTitle>
              <CardDescription>{filtered.length} exam{filtered.length !== 1 ? 's' : ''} found</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="hidden md:table-cell">Class</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="hidden lg:table-cell">Time</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                            <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p>No exams found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((exam) => (
                          <TableRow key={exam.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                            <TableCell>
                              <div className="font-medium text-sm">{exam.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Total: {exam.totalMarks} | Pass: {exam.passingMarks}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                {exam.subjectName}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm">
                              {exam.className} - {exam.classSection}
                            </TableCell>
                            <TableCell>{getExamTypeBadge(exam.examType)}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                              {formatDate(exam.date)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                              {formatTime(exam.startTime)} – {formatTime(exam.endTime)}
                            </TableCell>
                            <TableCell className="text-center">{getStatusBadge(exam.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                  onClick={() => openResultsEntry(exam)}
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Results
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                                  onClick={() => openEdit(exam)}
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete &quot;{exam.name}&quot;? All associated results will also be deleted. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(exam.id)}
                                        disabled={deleting}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {deleting ? 'Deleting...' : 'Delete'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RESULTS ENTRY TAB                                            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="results" className="space-y-6">
          {selectedExam ? (
            <>
              {/* Back button + Exam details header */}
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={backToExams}>
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
                <CardHeader>
                  <CardTitle className="text-base">Enter Results</CardTitle>
                  <CardDescription>
                    Enter marks for each student. Pass/fail is auto-calculated based on {selectedExam.passingMarks} passing marks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingStudents ? (
                    <div className="p-6 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
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
                              <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-semibold shrink-0">
                                    {row.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-sm">{row.studentName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                {row.rollNumber || '—'}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max={selectedExam.totalMarks}
                                  className="h-8 text-sm w-24"
                                  placeholder="0"
                                  value={row.marksObtained}
                                  onChange={(e) => updateResultMark(row.studentId, e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                {row.status === 'pass' && (
                                  <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-medium">
                                    Pass
                                  </Badge>
                                )}
                                {row.status === 'fail' && (
                                  <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 font-medium">
                                    Fail
                                  </Badge>
                                )}
                                {row.status === 'pending' && (
                                  <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 font-medium">
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Input
                                  type="text"
                                  className="h-8 text-sm w-32"
                                  placeholder="Optional"
                                  value={row.remarks}
                                  onChange={(e) => updateResultRemark(row.studentId, e.target.value)}
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

              {/* Save Results Button */}
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={backToExams}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Exams
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleSaveResults}
                  disabled={savingResults || resultRows.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savingResults ? 'Saving...' : 'Save Results'}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">No Exam Selected</p>
                <p className="text-sm mt-1">Click &quot;Results&quot; on an exam to enter student marks.</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={backToExams}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Exams
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* NEW EXAM DIALOG                                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={addOpen} onOpenChange={(open) => {
        if (!open) { 
          setBulkSelected(new Set()); 
          setBulkOverrides({});
        }
        setAddOpen(open);
      }}>
        <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
            <DialogDescription>Schedule a new exam for your students.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">

            {/* Common fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Class *</Label>
                <Select
                  value={addForm.classId}
                  onValueChange={(v) => setAddForm({ ...addForm, classId: v, subjectId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} - {c.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Exam Type *</Label>
                <Select
                  value={addForm.examType}
                  onValueChange={(v) => setAddForm({ ...addForm, examType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit_test">Unit Test</SelectItem>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            {/* ── BULK MODE: All Subjects Table ── */}
              <div className="grid gap-2">
                <Label>Exam Name * <span className="text-xs text-muted-foreground font-normal">(e.g. &quot;Final Exam 2025&quot; — subject name will be appended)</span></Label>
                <Input
                  placeholder="e.g. Final Exam 2025"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>

                {bulkRows.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                    <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Select a class first to see its subjects</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-80 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-8 px-2">
                              <Checkbox
                                checked={selectedBulkCount === bulkRows.length && bulkRows.length > 0}
                                onCheckedChange={(checked) => toggleAllBulk(!!checked)}
                              />
                            </TableHead>
                            <TableHead className="px-2 w-[150px]">Subject</TableHead>
                            <TableHead className="w-[140px] px-2">Date *</TableHead>
                            <TableHead className="hidden sm:table-cell w-[120px] px-2 text-center">Start</TableHead>
                            <TableHead className="hidden sm:table-cell w-[120px] px-2 text-center">End</TableHead>
                            <TableHead className="hidden md:table-cell w-[80px] px-2 text-center">Total</TableHead>
                            <TableHead className="hidden md:table-cell w-[80px] px-2 text-center">Pass</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkRows.map((row) => (
                            <TableRow key={row.subjectId} className={row.selected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
                              <TableCell>
                                <Checkbox
                                  checked={row.selected}
                                  onCheckedChange={(checked) => toggleBulkRow(row.subjectId, !!checked)}
                                />
                              </TableCell>
                              <TableCell className="px-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[11px] font-bold truncate">{row.subjectName}</span>
                                  {row.subjectCode && (
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">({row.subjectCode})</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-2">
                                <DatePicker
                                  className="h-8 text-[11px] px-2 w-full"
                                  date={row.date ? parseISO(row.date) : undefined}
                                  onChange={(d) => {
                                    if (!d) return;
                                    const yyyy = d.getFullYear();
                                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                                    const dd = String(d.getDate()).padStart(2, '0');
                                    const dateStr = `${yyyy}-${mm}-${dd}`;
                                    
                                    // Update ONLY this subject's date
                                    setBulkOverrides(prev => ({
                                      ...prev,
                                      [row.subjectId]: { ...prev[row.subjectId], date: dateStr }
                                    }));
                                  }}
                                />
                              </TableCell>
                              <TableCell className="hidden sm:table-cell px-2">
                                <TimePicker
                                  className="justify-center"
                                  value={row.startTime}
                                  onChange={(v) => {
                                    setBulkOverrides(prev => ({
                                      ...prev,
                                      [row.subjectId]: { ...prev[row.subjectId], startTime: v }
                                    }));
                                  }}
                                />
                              </TableCell>
                              <TableCell className="hidden sm:table-cell px-2">
                                <TimePicker
                                  className="justify-center"
                                  value={row.endTime}
                                  onChange={(v) => {
                                    setBulkOverrides(prev => ({
                                      ...prev,
                                      [row.subjectId]: { ...prev[row.subjectId], endTime: v }
                                    }));
                                  }}
                                />
                              </TableCell>
                              <TableCell className="hidden md:table-cell px-2 text-center">
                                <Input
                                  type="number"
                                  className="h-9 w-full text-center text-[12px] font-bold"
                                  value={row.totalMarks}
                                  onChange={(e) => {
                                    setBulkOverrides(prev => ({
                                      ...prev,
                                      [row.subjectId]: { ...prev[row.subjectId], totalMarks: e.target.value }
                                    }));
                                  }}
                                />
                              </TableCell>
                              <TableCell className="hidden md:table-cell px-2 text-center">
                                <Input
                                  type="number"
                                  className="h-9 w-full text-center text-[12px] font-bold"
                                  value={row.passingMarks}
                                  onChange={(e) => {
                                    setBulkOverrides(prev => ({
                                      ...prev,
                                      [row.subjectId]: { ...prev[row.subjectId], passingMarks: e.target.value }
                                    }));
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="px-4 py-2 bg-muted/50 border-t text-xs text-muted-foreground flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5" />
                      <span><strong>{selectedBulkCount}</strong> of {bulkRows.length} subjects selected — {selectedBulkCount} exam(s) will be created</span>
                    </div>
                  </div>
                )}
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setBulkSelected(new Set()); }}>Cancel</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              onClick={handleCreate}
              disabled={adding || selectedBulkCount === 0 || !addForm.classId || !addForm.name}
            >
              <Layers className="h-4 w-4" />
              {adding ? 'Creating...' : `Create ${selectedBulkCount} Exam(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* EDIT EXAM DIALOG                                            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>Update the exam details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Class *</Label>
                <Select
                  value={editForm.classId}
                  onValueChange={(v) => setEditForm({ ...editForm, classId: v, subjectId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} - {c.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Subject *</Label>
                <Select
                  value={editForm.subjectId}
                  onValueChange={(v) => setEditForm({ ...editForm, subjectId: v })}
                  disabled={!editForm.classId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={editForm.classId ? 'Select subject' : 'Select class first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {editSubjectsForClass.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} {s.code ? `(${s.code})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Exam Type *</Label>
                <Select
                  value={editForm.examType}
                  onValueChange={(v) => setEditForm({ ...editForm, examType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit_test">Unit Test</SelectItem>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Exam Name *</Label>
                <Input
                  placeholder="e.g. Chapter 1 Test"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
            </div>
              <div className="grid gap-2">
                <Label>Date *</Label>
                <DatePicker
                  date={editForm.date ? parseISO(editForm.date) : undefined}
                  onChange={(d) => {
                    if (d) {
                      const yyyy = d.getFullYear();
                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                      const dd = String(d.getDate()).padStart(2, '0');
                      setEditForm({ ...editForm, date: `${yyyy}-${mm}-${dd}` });
                    }
                  }}
                />
              </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <TimePicker
                  value={editForm.startTime}
                  onChange={(v) => setEditForm({ ...editForm, startTime: v })}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <TimePicker
                  value={editForm.endTime}
                  onChange={(v) => setEditForm({ ...editForm, endTime: v })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  min="1"
                  value={editForm.totalMarks}
                  onChange={(e) => setEditForm({ ...editForm, totalMarks: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Passing Marks</Label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.passingMarks}
                  onChange={(e) => setEditForm({ ...editForm, passingMarks: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleEditSave}
              disabled={saving || !editForm.classId || !editForm.subjectId || !editForm.name || !editForm.date}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
