'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, FileText, GraduationCap, Plus, 
  CalendarDays, CheckCircle2, Clock, RefreshCw,
  Trophy, ArrowLeft, ChevronRight, ChevronDown,
  Search, Filter
} from 'lucide-react';
import { parseLocalDate } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { api, apiFetch } from '@/lib/api';
import { goeyToast as toast } from 'goey-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { useAcademicYears } from '@/hooks/use-academic-years';

// Sub-components
import { ExamDialogs } from './exams/ExamDialogs';
import { ViewResultsDialog } from './exams/ViewResultsDialog';
import { MarksheetDialog } from './exams/MarksheetDialog';
import { 
  ExamRecord, ExamFormData, StudentResultRow, 
  ClassOption, SubjectOption, StudentOption 
} from './exams/types';

const statusConfig: Record<string, { bg: string; label: string }> = {
  scheduled: { bg: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800', label: 'Scheduled' },
  ongoing: { bg: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800', label: 'Ongoing' },
  completed: { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800', label: 'Published' },
  cancelled: { bg: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', label: 'Cancelled' },
};

const examTypeConfig: Record<string, { bg: string; label: string }> = {
  unit_test: { bg: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800', label: 'Unit Test' },
  midterm: { bg: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800', label: 'Midterm' },
  final: { bg: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800', label: 'Final' },
  quiz: { bg: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800', label: 'Quiz' },
  practical: { bg: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800', label: 'Practical' },
};

const getGroupedExams = (examsList: ExamRecord[]) => {
  const groups: Record<string, { cycleName: string; academicYear: string; exams: ExamRecord[] }> = {};
  
  examsList.forEach(exam => {
    const cycleName = exam.name.includes(' - ') ? exam.name.split(' - ')[0] : exam.name;
    const academicYear = exam.academicYear || '2024-2025';
    const key = `${cycleName}::${academicYear}`;
    
    if (!groups[key]) {
      groups[key] = {
        cycleName,
        academicYear,
        exams: []
      };
    }
    groups[key].exams.push(exam);
  });
  
  return Object.values(groups).sort((a, b) => {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear.localeCompare(a.academicYear);
    }
    return a.cycleName.localeCompare(b.cycleName);
  });
};

const emptyExamForm: ExamFormData = {
  classId: '', subjectId: '', examType: 'midterm', name: '',
  date: '', startTime: '', endTime: '', totalMarks: '100', passingMarks: '40',
  academicYear: ''
};

// Dynamic loading for "Low Stack" performance optimization
const ExamTable = dynamic(() => import('./exams/ExamTable').then(m => m.ExamTable), {
  loading: () => <TabLoadingSkeleton />
});
const ResultsView = dynamic(() => import('./exams/ResultsView').then(m => m.ResultsView), {
  loading: () => <TabLoadingSkeleton />
});

function TabLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <Skeleton className="h-[500px] w-full rounded-xl" />
    </div>
  );
}

export function AdminExams({ initialTab = 'exams' }: { initialTab?: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { slug } = useParams();

  // Academic Years
  const { academicYears } = useAcademicYears();
  const currentAcademicYear = useMemo(() => {
    return academicYears.find((ay: any) => ay.isCurrent)?.name || '2024-2025';
  }, [academicYears]);

  // Filters & Tabs
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [publishedAcademicYearFilter, setPublishedAcademicYearFilter] = useState(currentAcademicYear);
  const [publishedClassFilter, setPublishedClassFilter] = useState('all');
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
    setActiveTab(initialTab);
    if (initialTab !== 'results') {
      setSelectedExam(null);
      setResultRows([]);
    }
  }, [initialTab]);

  // Dialog States
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<ExamFormData>({ ...emptyExamForm, academicYear: currentAcademicYear });
  const [adding, setAdding] = useState(false);
  
  useEffect(() => {
    if (currentAcademicYear) {
      setAddForm(prev => ({ ...prev, academicYear: prev.academicYear || currentAcademicYear }));
      setPublishedAcademicYearFilter(prev => prev === 'all' ? currentAcademicYear : prev);
    }
  }, [currentAcademicYear]);
  
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<ExamFormData & { id: string }>({ ...emptyExamForm, id: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Results State
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);
  const [resultRows, setResultRows] = useState<StudentResultRow[]>([]);
  const [savingResults, setSavingResults] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // View Results Dialog State
  const [viewResultsOpen, setViewResultsOpen] = useState(false);
  const [viewResultsExam, setViewResultsExam] = useState<ExamRecord | null>(null);
  const [viewResultsData, setViewResultsData] = useState<any[]>([]);
  const [loadingViewResults, setLoadingViewResults] = useState(false);

  // Marksheets Dialog State
  const [marksheetOpen, setMarksheetOpen] = useState(false);
  const [marksheetClass, setMarksheetClass] = useState<{ id: string; name: string; section: string } | null>(null);

  // Bulk Mode Helpers
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkOverrides, setBulkOverrides] = useState<Record<string, Partial<ExamFormData>>>({});
  const [resultsClassId, setResultsClassId] = useState<string>('');

  // Queries
  const { data: examsData, isLoading: loadingExams } = useQuery({
    queryKey: ['exams', classFilter, statusFilter],
    queryFn: async () => {
      const res = await apiFetch('/api/exams');
      return res.json();
    }
  });

  const { data: resultsExamsData } = useQuery({
    queryKey: ['results-exams', resultsClassId],
    queryFn: async () => {
      const res = await apiFetch(`/api/exams?classId=${resultsClassId}&limit=100`);
      return res.json();
    },
    enabled: !!resultsClassId
  });

  const { data: metadata } = useQuery({
    queryKey: ['classes-subjects-min'],
    queryFn: async () => {
      const [classes, subjects] = await Promise.all([
        api.get('/classes?mode=min'),
        api.get('/subjects?mode=min')
      ]);
      return { classes, subjects };
    },
    staleTime: 10 * 60 * 1000,
  });

  const exams = useMemo(() => {
    const data = examsData?.data || (Array.isArray(examsData) ? examsData : []);
    return (data as ExamRecord[]).filter(
      (e) => e.examType === "midterm" || e.examType === "final"
    );
  }, [examsData]);

  const classStats = useMemo(() => {
    const stats: Record<string, { total: number; scheduled: number; completed: number }> = {};
    exams.forEach(exam => {
      if (!stats[exam.classId]) {
        stats[exam.classId] = { total: 0, scheduled: 0, completed: 0 };
      }
      stats[exam.classId].total++;
      if (exam.status === 'scheduled') stats[exam.classId].scheduled++;
      if (exam.status === 'completed') stats[exam.classId].completed++;
    });
    return stats;
  }, [exams]);

  const classes = metadata?.classes || [];
  const subjects = metadata?.subjects || [];

  const filtered = exams.filter(exam => {
    const matchClass = classFilter === 'all' || exam.classId === classFilter;
    const matchStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchSearch = exam.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                       exam.subjectName.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchClass && matchStatus && matchSearch;
  });

  const currentExamsForSummary = classFilter === 'all' 
    ? exams 
    : exams.filter(e => e.classId === classFilter);

  const classesWithActiveExams = useMemo(() => {
    return classes.filter(c => 
      filtered.some(e => e.classId === c.id && e.status !== 'completed')
    );
  }, [classes, filtered]);

  const publishedFiltered = useMemo(() => {
    return exams.filter(exam => {
      if (exam.status !== 'completed') return false;
      const matchAcademicYear = !publishedAcademicYearFilter || exam.academicYear === publishedAcademicYearFilter;
      const matchClass = publishedClassFilter === 'all' || exam.classId === publishedClassFilter;
      return matchAcademicYear && matchClass;
    });
  }, [exams, publishedAcademicYearFilter, publishedClassFilter]);

  const classesWithCompletedExams = useMemo(() => {
    return classes.filter(c => 
      publishedFiltered.some(e => e.classId === c.id)
    );
  }, [classes, publishedFiltered]);

  const summaryCards = [
    { label: 'Total Exams', value: currentExamsForSummary.length, icon: <ClipboardList />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: 'Scheduled', value: currentExamsForSummary.filter(e => e.status === 'scheduled').length, icon: <CalendarDays />, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
    { label: 'Completed', value: currentExamsForSummary.filter(e => e.status === 'completed').length, icon: <CheckCircle2 />, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
    { label: 'Upcoming', value: currentExamsForSummary.filter(e => e.date && e.date >= new Date().toISOString().split('T')[0]).length, icon: <Clock />, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  ];

  // Logic Handlers
  const handleCreate = async () => {
    setAdding(true);
    try {
      const selectedSubjects = subjects.filter(s => bulkSelected.has(s.id));
      const examsPayload = selectedSubjects.map(s => ({
        subjectId: s.id,
        subjectName: s.name,
        date: bulkOverrides[s.id]?.date || addForm.date,
        startTime: bulkOverrides[s.id]?.startTime || addForm.startTime || '09:00',
        endTime: bulkOverrides[s.id]?.endTime || addForm.endTime || '10:00',
        totalMarks: Number(bulkOverrides[s.id]?.totalMarks || addForm.totalMarks || 100),
        passingMarks: Number(bulkOverrides[s.id]?.passingMarks || addForm.passingMarks || 40),
      }));

      const payload = {
        classId: addForm.classId,
        examType: addForm.examType,
        name: addForm.name,
        academicYear: addForm.academicYear || currentAcademicYear,
        exams: examsPayload
      };

      const res = await apiFetch('/api/exams/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Exams created successfully!');
        setAddOpen(false);
        queryClient.invalidateQueries({ queryKey: ['exams'] });
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create exams');
      }
    } catch (err) { 
      console.error('Error creating exams:', err);
      toast.error('Error creating exams'); 
    }
    setAdding(false);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/exams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, totalMarks: Number(editForm.totalMarks), passingMarks: Number(editForm.passingMarks) }),
      });
      if (res.ok) {
        toast.success('Updated!');
        setEditOpen(false);
        queryClient.invalidateQueries({ queryKey: ['exams'] });
      }
    } catch { toast.error('Update failed'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/exams?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted');
        queryClient.invalidateQueries({ queryKey: ['exams'] });
      }
    } catch { toast.error('Delete failed'); }
    setDeleting(false);
  };

  const openResultsEntry = async (exam: ExamRecord) => {
    setSelectedExam(exam);
    setResultsClassId(exam.classId);
    if (activeTab !== 'results') {
      router.push(`/${slug}/results-entry`);
    }
    setActiveTab('results');
    setLoadingStudents(true);
    try {
      const [sRes, rRes] = await Promise.all([
        apiFetch(`/api/students?classId=${exam.classId}&mode=min`),
        apiFetch(`/api/exams/results?examId=${exam.id}`)
      ]);
      const students = (await sRes.json()).items || [];
      const results = (await rRes.json()).results || [];
      
      setResultRows(students.map((s: any) => {
        const res = results.find((r: any) => r.studentId === s.id);
        return {
          studentId: s.id, studentName: s.name, rollNumber: s.rollNumber || '',
          marksObtained: res ? String(res.marksObtained) : '',
          remarks: res?.remarks || '',
          status: res ? res.status : 'pending'
        };
      }));
    } catch { toast.error('Failed to load results'); }
    setLoadingStudents(false);
  };

  const handleOpenViewResults = async (exam: ExamRecord) => {
    setViewResultsExam(exam);
    setViewResultsOpen(true);
    setLoadingViewResults(true);
    try {
      const [sRes, rRes] = await Promise.all([
        apiFetch(`/api/students?classId=${exam.classId}&mode=min`),
        apiFetch(`/api/exams/results?examId=${exam.id}`)
      ]);
      const students = (await sRes.json()).items || [];
      const results = (await rRes.json()).results || [];
      
      setViewResultsData(students.map((s: any) => {
        const res = results.find((r: any) => r.studentId === s.id);
        return {
          studentId: s.id,
          studentName: s.name,
          rollNumber: s.rollNumber || '',
          marksObtained: res ? String(res.marksObtained) : '-',
          status: res ? res.status : 'pending',
          remarks: res?.remarks || ''
        };
      }));
    } catch {
      toast.error('Failed to load results');
    }
    setLoadingViewResults(false);
  };

  const handleSaveResults = async () => {
    if (!selectedExam) return;
    setSavingResults(true);
    try {
      const res = await apiFetch('/api/exams/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExam.id,
          results: resultRows.map(r => ({
            studentId: r.studentId,
            marksObtained: Number(r.marksObtained) || 0,
            status: r.status,
            remarks: r.remarks || null
          }))
        }),
      });
      if (res.ok) toast.success('Results saved!');
    } catch { toast.error('Save failed'); }
    setSavingResults(false);
  };

  const handlePublish = async () => {
    if (!selectedExam) return;
    setIsPublishing(true);
    try {
      // 1. Save Results
      const res = await apiFetch('/api/exams/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExam.id,
          results: resultRows.map(r => ({
            studentId: r.studentId,
            marksObtained: Number(r.marksObtained) || 0,
            status: r.status,
            remarks: r.remarks || null
          }))
        }),
      });

      if (res.ok) {
        // 2. Update Exam Status to 'completed'
        const statusRes = await apiFetch('/api/exams', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedExam.id,
            status: 'completed'
          }),
        });

        if (statusRes.ok) {
          toast.success('Results published successfully!');
          queryClient.invalidateQueries({ queryKey: ['exams'] });
          setSelectedExam(null);
          setResultRows([]);
        } else {
          toast.error('Failed to update exam status');
        }
      } else {
        toast.error('Failed to save results');
      }
    } catch {
      toast.error('Publishing failed');
    }
    setIsPublishing(false);
  };

  const backToExams = () => { 
    setSelectedExam(null); 
    if (activeTab !== 'exams') {
      router.push(`/${slug}/exams`);
    }
    setActiveTab('exams'); 
  };

  // Bulk Mode Helpers
  const bulkSubjectsForClass = subjects.filter((s: any) => s.classId === addForm.classId);
  const bulkRows = bulkSubjectsForClass.map(s => ({
    ...addForm, 
    ...bulkOverrides[s.id],
    subjectId: s.id, 
    subjectName: s.name, 
    selected: bulkSelected.has(s.id),
  }));

  const toggleBulkSubject = (id: string) => {
    const next = new Set(bulkSelected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setBulkSelected(next);
  };

  const updateBulkField = (id: string, field: string, value: string) => {
    setBulkOverrides(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  // Render Helpers
  const formatDate = (d: string) => {
    if (!d) return '--';
    const parsed = parseLocalDate(d);
    return parsed ? parsed.toLocaleDateString() : d || '--';
  };
  const formatTime = (t: any) => t || '--:--';
  const getStatusBadge = (s: string) => <Badge className={statusConfig[s]?.bg}>{statusConfig[s]?.label || s}</Badge>;
  const getExamTypeBadge = (t: string) => <Badge className={examTypeConfig[t]?.bg}>{examTypeConfig[t]?.label || t}</Badge>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            {activeTab === 'exams' && <GraduationCap className="h-6 w-6 sm:h-7 sm:h-7 text-blue-600" />}
            {activeTab === 'results' && <FileText className="h-6 w-6 sm:h-7 sm:h-7 text-orange-600" />}
            {activeTab === 'published' && <Trophy className="h-6 w-6 sm:h-7 sm:h-7 text-yellow-600" />}
            <span className="truncate">
              {activeTab === 'exams' && "Scheduled Exams"}
              {activeTab === 'results' && "Results Entry"}
              {activeTab === 'published' && "Published Results"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1 sm:line-clamp-none">
            {activeTab === 'exams' && "Manage and schedule upcoming school examinations."}
            {activeTab === 'results' && "Input and update student marks for completed exams."}
            {activeTab === 'published' && "View and review finalized exam outcomes."}
          </p>
        </div>
        {activeTab === 'exams' && (
          <Button onClick={() => setAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 px-3 sm:px-4 shrink-0 gap-2">
            <Plus className="h-4 w-4" /> 
            <span className="text-sm font-medium">New Exam</span>
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => v === 'exams' ? backToExams() : setActiveTab(v)}>

        <TabsContent value="exams" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">{card.label}</p>
                    <h4 className="text-2xl font-bold mt-1">{card.value}</h4>
                  </div>
                  <div className={`p-3 rounded-xl ${card.color}`}>{card.icon}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {classFilter === 'all' ? (
            exams.filter(e => e.status !== 'completed').length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-card text-center text-muted-foreground animate-in fade-in duration-300">
                <ClipboardList className="h-16 w-16 mb-4 text-blue-500/40" />
                <h3 className="text-lg font-bold text-foreground">No Active Exams Scheduled</h3>
                <p className="text-sm mt-1 max-w-md">There are no midterm or final exams currently scheduled for any class. Click "New Exam" to start scheduling!</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Global Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card p-3 rounded-xl border border-gray-100 dark:border-zinc-800/80 shadow-sm">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search exams by subject or name..."
                      className="pl-9 h-9 border-gray-200 dark:border-zinc-800 text-sm focus-visible:ring-blue-500 rounded-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-[150px]">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 border-gray-200 dark:border-zinc-800 rounded-lg text-xs font-semibold">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                          <SelectItem value="all" className="text-xs font-medium">All Statuses</SelectItem>
                          <SelectItem value="scheduled" className="text-xs font-medium">Scheduled</SelectItem>
                          <SelectItem value="ongoing" className="text-xs font-medium">Ongoing</SelectItem>
                          <SelectItem value="completed" className="text-xs font-medium">Published</SelectItem>
                          <SelectItem value="cancelled" className="text-xs font-medium">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(searchTerm || statusFilter !== 'all') && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                        className="text-xs text-muted-foreground hover:text-foreground h-9 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors shrink-0"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>

                {classesWithActiveExams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-card text-center text-muted-foreground animate-in fade-in duration-300">
                    <Search className="h-12 w-12 mb-3 text-zinc-300 dark:text-zinc-700" />
                    <h3 className="text-base font-bold text-foreground">No matching exams found</h3>
                    <p className="text-xs mt-1 max-w-md">No exams match your search text or status filter. Try clearing or modifying your filter criteria.</p>
                    <Button 
                      onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold tracking-tight text-foreground/80">Select a Class to View Exams</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                      {classesWithActiveExams.map((c: any) => {
                        const isExpanded = !!expandedClasses[c.id];
                        const classExams = filtered.filter(e => e.classId === c.id && e.status !== 'completed');
                        const stats = classStats[c.id] || { total: 0, scheduled: 0, completed: 0 };
                        
                        return (
                          <Card 
                            key={c.id} 
                            className={`border dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md bg-card relative py-0 gap-0 ${isExpanded ? 'border-l-4 border-l-blue-600 dark:border-l-blue-500 border-gray-200' : 'border-gray-100'}`}
                          >
                            <div 
                              onClick={() => setExpandedClasses(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                              className={`py-2.5 px-4 flex items-center justify-between cursor-pointer hover:bg-accent/40 transition-colors select-none ${isExpanded ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg transition-all duration-300 ${isExpanded ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'}`}>
                                  <GraduationCap className="h-5 w-5 animate-pulse" />
                                </div>
                                <div>
                                  <h3 className="text-base font-bold text-foreground leading-tight">
                                    {c.name} - {c.section}
                                  </h3>
                                  <p className="text-[11px] text-muted-foreground mt-0 font-medium">
                                    {classExams.length} active exam{classExams.length !== 1 ? 's' : ''} scheduled
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                                    {stats.completed} Completed
                                  </span>
                                </div>
                                <div className={`p-1.5 rounded-full transition-all duration-300 ${isExpanded ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' : 'bg-gray-50 dark:bg-zinc-900 text-muted-foreground'}`}>
                                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                              </div>
                            </div>

                            {/* Collapsible Content */}
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2500px] border-t border-gray-100 dark:border-zinc-800' : 'max-h-0'}`}>
                              <div className="p-4 bg-zinc-50/30 dark:bg-zinc-950/10 space-y-4">
                                {getGroupedExams(classExams).map((group) => {
                                  const groupKey = `${group.cycleName}::${group.academicYear}`;
                                  return (
                                    <Card key={groupKey} className="border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden bg-card">
                                      <div className="px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <ClipboardList className="h-4.5 w-4.5 text-blue-500" />
                                          <span className="font-bold text-sm text-foreground">{group.cycleName}</span>
                                          <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0 border-zinc-200 dark:border-zinc-800 text-muted-foreground bg-zinc-100/50 dark:bg-zinc-900/50">
                                            {group.academicYear}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground font-medium">
                                            {group.exams.length} subject{group.exams.length !== 1 ? 's' : ''}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="p-0">
                                        <ExamTable
                                          exams={group.exams} loading={loadingExams} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                                          onOpenEdit={(e) => { setEditForm({ ...e, totalMarks: String(e.totalMarks), passingMarks: String(e.passingMarks) }); setEditOpen(true); }}
                                          onDelete={handleDelete} deleting={deleting} formatDate={formatDate} formatTime={formatTime}
                                          getStatusBadge={getStatusBadge} getExamTypeBadge={getExamTypeBadge}
                                          onViewResults={handleOpenViewResults}
                                          classFilter={c.id} setClassFilter={setClassFilter}
                                          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                                          classes={classes}
                                          hideClassFilter={true}
                                          flat={true}
                                          hideSearchAndFilter={true}
                                        />
                                      </div>
                                    </Card>
                                  );
                                })}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setClassFilter('all')}
                  className="gap-1.5 px-3 py-1.5 h-8 text-xs font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Classes
                </Button>
                <h3 className="text-lg font-bold text-foreground">
                  Exams for {classes.find((c: any) => c.id === classFilter)?.name} - {classes.find((c: any) => c.id === classFilter)?.section}
                </h3>
              </div>
              <ExamTable
                exams={filtered.filter(e => e.status !== 'completed')} loading={loadingExams} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                onOpenEdit={(e) => { setEditForm({ ...e, totalMarks: String(e.totalMarks), passingMarks: String(e.passingMarks) }); setEditOpen(true); }}
                onDelete={handleDelete} deleting={deleting} formatDate={formatDate} formatTime={formatTime}
                getStatusBadge={getStatusBadge} getExamTypeBadge={getExamTypeBadge}
                onViewResults={handleOpenViewResults}
                classFilter={classFilter} setClassFilter={setClassFilter}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                classes={classes}
                hideClassFilter={true}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="results">
          <ResultsView
            selectedExam={selectedExam} 
            exams={resultsExamsData?.data || []} 
            classes={metadata?.classes || []} 
            resultsClassId={resultsClassId}
            onResultsClassChange={setResultsClassId}
            resultRows={resultRows}
            loadingStudents={loadingStudents} savingResults={savingResults}
            onBack={backToExams} onSelectExam={openResultsEntry}
            onSave={handleSaveResults} onPublish={handlePublish} isPublishing={isPublishing}
            onUpdateMark={(id, m) => setResultRows(prev => prev.map(r => r.studentId === id ? { ...r, marksObtained: m, status: Number(m) >= (selectedExam?.passingMarks || 40) ? 'pass' : 'fail' } : r))}
            formatDate={formatDate} formatTime={formatTime}
            getStatusBadge={getStatusBadge} getExamTypeBadge={getExamTypeBadge}
          />
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-xl flex items-center gap-3">
            <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Finalized Results</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">These exams have been officially published and results are visible to students.</p>
            </div>
          </div>
          
          {exams.filter(e => e.status === 'completed').length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-card text-center text-muted-foreground animate-in fade-in duration-300">
              <Trophy className="h-16 w-16 mb-4 text-emerald-500/40" />
              <h3 className="text-lg font-bold text-foreground">No Published Results</h3>
              <p className="text-sm mt-1 max-w-md">There are no finalized or completed exams to view results for yet.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Dual Filter Selectors for Published Results */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-card p-3 rounded-xl border border-gray-100 dark:border-zinc-800/80 shadow-sm">
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="w-full sm:w-[260px]">
                    <Select value={publishedAcademicYearFilter} onValueChange={setPublishedAcademicYearFilter}>
                      <SelectTrigger className="w-full h-9 border-gray-200 dark:border-zinc-800 rounded-lg text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-normal">Academic Year:</span>
                          <SelectValue placeholder="Select Academic Year" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {academicYears.map((ay: any) => (
                          <SelectItem key={ay.id} value={ay.name} className="text-xs font-medium">
                            {ay.name} {ay.isCurrent ? '(Current)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-[220px]">
                    <Select value={publishedClassFilter} onValueChange={setPublishedClassFilter}>
                      <SelectTrigger className="w-full h-9 border-gray-200 dark:border-zinc-800 rounded-lg text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-normal">Class:</span>
                          <SelectValue placeholder="All Classes" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="all" className="text-xs font-medium">All Classes</SelectItem>
                        {classes.map((c: any) => (
                          <SelectItem key={c.id} value={c.id} className="text-xs font-medium">
                            {c.name} - {c.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(publishedAcademicYearFilter !== currentAcademicYear || publishedClassFilter !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setPublishedAcademicYearFilter(currentAcademicYear); setPublishedClassFilter('all'); }}
                    className="text-xs text-muted-foreground hover:text-foreground h-9 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors shrink-0"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {classesWithCompletedExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-card text-center text-muted-foreground animate-in fade-in duration-300">
                  <Trophy className="h-12 w-12 mb-3 text-zinc-300 dark:text-zinc-700" />
                  <h3 className="text-base font-bold text-foreground">No matching published exams found</h3>
                  <p className="text-xs mt-1 max-w-md">No finalized exams match your selected filters. Try clearing or modifying your selections.</p>
                  <Button 
                    onClick={() => { setPublishedAcademicYearFilter(currentAcademicYear); setPublishedClassFilter('all'); }}
                    variant="outline" 
                    size="sm" 
                    className="mt-4 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground/80">Select a Class to View Published Results</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    {classesWithCompletedExams.map((c: any) => {
                      const isExpanded = !!expandedClasses[c.id];
                      const classExams = publishedFiltered.filter(e => e.classId === c.id);
                      
                      return (
                        <Card 
                          key={c.id} 
                          className={`border dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md bg-card relative py-0 gap-0 ${isExpanded ? 'border-l-4 border-l-emerald-600 dark:border-l-emerald-500 border-gray-200' : 'border-gray-100'}`}
                        >
                          <div 
                            onClick={() => setExpandedClasses(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                            className={`py-2.5 px-4 flex items-center justify-between cursor-pointer hover:bg-accent/40 transition-colors select-none ${isExpanded ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg transition-all duration-300 ${isExpanded ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'}`}>
                                <Trophy className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-foreground leading-tight">
                                  {c.name} - {c.section}
                                </h3>
                                <p className="text-[11px] text-muted-foreground mt-0 font-medium">
                                  {classExams.length} published exam{classExams.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMarksheetClass(c);
                                  setMarksheetOpen(true);
                                }}
                                className="h-8 border-emerald-200 hover:border-emerald-300 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 gap-1.5 rounded-lg text-xs font-semibold px-2.5 shadow-sm transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span className="hidden xs:inline">Generate Marksheets</span>
                              </Button>
                              <div className={`p-1.5 rounded-full transition-all duration-300 ${isExpanded ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-zinc-900 text-muted-foreground'}`}>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>
                          </div>

                          {/* Collapsible Content */}
                          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2500px] border-t border-gray-100 dark:border-zinc-800' : 'max-h-0'}`}>
                            <div className="p-4 bg-zinc-50/30 dark:bg-zinc-950/10 space-y-4">
                              {getGroupedExams(classExams).map((group) => {
                                const groupKey = `${group.cycleName}::${group.academicYear}`;
                                return (
                                  <Card key={groupKey} className="border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden bg-card">
                                    <div className="px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <ClipboardList className="h-4.5 w-4.5 text-blue-500" />
                                        <span className="font-bold text-sm text-foreground">{group.cycleName}</span>
                                        <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0 border-zinc-200 dark:border-zinc-800 text-muted-foreground bg-zinc-100/50 dark:bg-zinc-900/50">
                                          {group.academicYear}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground font-medium">
                                          {group.exams.length} subject{group.exams.length !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="p-0">
                                      <ExamTable
                                        exams={group.exams} loading={loadingExams} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                                        onOpenEdit={(e) => { setEditForm({ ...e, totalMarks: String(e.totalMarks), passingMarks: String(e.passingMarks) }); setEditOpen(true); }}
                                        onDelete={handleDelete} deleting={deleting} formatDate={formatDate} formatTime={formatTime}
                                        getStatusBadge={getStatusBadge} getExamTypeBadge={getExamTypeBadge}
                                        onViewResults={handleOpenViewResults}
                                        classFilter={c.id} setClassFilter={setClassFilter}
                                        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                                        classes={classes}
                                        hideClassFilter={true}
                                        flat={true}
                                        hideSearchAndFilter={true}
                                      />
                                    </div>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ExamDialogs
        addOpen={addOpen} setAddOpen={setAddOpen} addForm={addForm} setAddForm={setAddForm} adding={adding} onAdd={handleCreate}
        editOpen={editOpen} setEditOpen={setEditOpen} editForm={editForm} setEditForm={setEditForm} saving={saving} onSave={handleUpdate}
        classes={classes} subjects={subjects} subjectsForClass={bulkSubjectsForClass} editSubjectsForClass={[]}
        bulkRows={bulkRows} selectedBulkCount={bulkSelected.size}
        toggleAllBulk={(c) => setBulkSelected(c ? new Set(bulkSubjectsForClass.map(s => s.id)) : new Set())}
        toggleBulkSubject={toggleBulkSubject} updateBulkField={updateBulkField}
        academicYears={academicYears}
        currentAcademicYear={currentAcademicYear}
      />

      <ViewResultsDialog
        open={viewResultsOpen}
        onOpenChange={setViewResultsOpen}
        exam={viewResultsExam}
        results={viewResultsData}
        loading={loadingViewResults}
        formatDate={formatDate}
        formatTime={formatTime}
      />

      {marksheetClass && (
        <MarksheetDialog
          open={marksheetOpen}
          onOpenChange={setMarksheetOpen}
          classId={marksheetClass.id}
          classNameStr={marksheetClass.name}
          classSection={marksheetClass.section}
          academicYear={publishedAcademicYearFilter || currentAcademicYear}
        />
      )}
    </div>
  );
}
