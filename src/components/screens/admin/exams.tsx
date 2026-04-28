'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, FileText, GraduationCap, Plus, 
  CalendarDays, CheckCircle2, Clock, RefreshCw
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiFetch } from '@/lib/api';
import { goeyToast as toast } from 'goey-toast';
import { Button } from '@/components/ui/button';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';

// Sub-components
import { ExamDialogs } from './exams/ExamDialogs';
import { 
  ExamRecord, ExamFormData, StudentResultRow, 
  ClassOption, SubjectOption, StudentOption 
} from './exams/types';

const statusConfig: Record<string, { bg: string; label: string }> = {
  scheduled: { bg: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Scheduled' },
  ongoing: { bg: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Ongoing' },
  completed: { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Completed' },
  cancelled: { bg: 'bg-red-100 text-red-700 border-red-200', label: 'Cancelled' },
};

const examTypeConfig: Record<string, { bg: string; label: string }> = {
  unit_test: { bg: 'bg-violet-100 text-violet-700 border-violet-200', label: 'Unit Test' },
  midterm: { bg: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Midterm' },
  final: { bg: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Final' },
  quiz: { bg: 'bg-cyan-100 text-cyan-700 border-cyan-200', label: 'Quiz' },
  practical: { bg: 'bg-pink-100 text-pink-700 border-pink-200', label: 'Practical' },
};

const emptyExamForm: ExamFormData = {
  classId: '', subjectId: '', examType: 'unit_test', name: '',
  date: '', startTime: '', endTime: '', totalMarks: '100', passingMarks: '40',
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

export function AdminExams() {
  const queryClient = useQueryClient();

  // Filters & Tabs
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [activeTab, setActiveTab] = useState('exams');

  // Dialog States
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<ExamFormData>({ ...emptyExamForm });
  const [adding, setAdding] = useState(false);
  
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<ExamFormData & { id: string }>({ ...emptyExamForm, id: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Results State
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);
  const [resultRows, setResultRows] = useState<StudentResultRow[]>([]);
  const [savingResults, setSavingResults] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Bulk Mode Helpers
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkOverrides, setBulkOverrides] = useState<Record<string, Partial<ExamFormData>>>({});

  // Queries
  const { data: examsData, isLoading: loadingExams } = useQuery({
    queryKey: ['exams', classFilter, statusFilter],
    queryFn: async () => {
      const res = await apiFetch('/api/exams');
      return res.json();
    }
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
    return data as ExamRecord[];
  }, [examsData]);

  const classes = metadata?.classes || [];
  const subjects = metadata?.subjects || [];

  const filtered = exams.filter(exam => {
    const matchClass = classFilter === 'all' || exam.classId === classFilter;
    const matchStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchSearch = exam.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                       exam.subjectName.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchClass && matchStatus && matchSearch;
  });

  const summaryCards = [
    { label: 'Total Exams', value: exams.length, icon: <ClipboardList />, color: 'bg-blue-100' },
    { label: 'Scheduled', value: exams.filter(e => e.status === 'scheduled').length, icon: <CalendarDays />, color: 'bg-amber-100' },
    { label: 'Completed', value: exams.filter(e => e.status === 'completed').length, icon: <CheckCircle2 />, color: 'bg-emerald-100' },
    { label: 'Upcoming', value: exams.filter(e => e.date >= new Date().toISOString().split('T')[0]).length, icon: <Clock />, color: 'bg-violet-100' },
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

  const backToExams = () => { setSelectedExam(null); setActiveTab('exams'); };

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
  const formatDate = (d: string) => new Date(d).toLocaleDateString();
  const formatTime = (t: any) => t || '--:--';
  const getStatusBadge = (s: string) => <Badge className={statusConfig[s]?.bg}>{statusConfig[s]?.label || s}</Badge>;
  const getExamTypeBadge = (t: string) => <Badge className={examTypeConfig[t]?.bg}>{examTypeConfig[t]?.label || t}</Badge>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-600" />
            Exam Management
          </h2>
          <p className="text-muted-foreground">Schedule exams and enter results.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> New Exam
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => v === 'exams' ? backToExams() : setActiveTab(v)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="exams" className="gap-2"><ClipboardList className="h-4 w-4" /> Exams</TabsTrigger>
          <TabsTrigger value="results" className="gap-2"><FileText className="h-4 w-4" /> Results Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <ExamTable
            exams={filtered} loading={loadingExams} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            onOpenResults={openResultsEntry} onOpenEdit={(e) => { setEditForm({ ...e, totalMarks: String(e.totalMarks), passingMarks: String(e.passingMarks) }); setEditOpen(true); }}
            onDelete={handleDelete} deleting={deleting} formatDate={formatDate} formatTime={formatTime}
            getStatusBadge={getStatusBadge} getExamTypeBadge={getExamTypeBadge}
          />
        </TabsContent>

        <TabsContent value="results">
          <ResultsView
            selectedExam={selectedExam} exams={exams} resultRows={resultRows}
            loadingStudents={loadingStudents} savingResults={savingResults}
            onBack={backToExams} onSelectExam={openResultsEntry}
            onUpdateMark={(id, m) => setResultRows(prev => prev.map(r => r.studentId === id ? { ...r, marksObtained: m, status: Number(m) >= (selectedExam?.passingMarks || 40) ? 'pass' : 'fail' } : r))}
            onUpdateRemark={(id, rm) => setResultRows(prev => prev.map(r => r.studentId === id ? { ...r, remarks: rm } : r))}
            onSave={handleSaveResults} formatDate={formatDate} formatTime={formatTime}
            getStatusBadge={getStatusBadge} getExamTypeBadge={getExamTypeBadge}
          />
        </TabsContent>
      </Tabs>

      <ExamDialogs
        addOpen={addOpen} setAddOpen={setAddOpen} addForm={addForm} setAddForm={setAddForm} adding={adding} onAdd={handleCreate}
        editOpen={editOpen} setEditOpen={setEditOpen} editForm={editForm} setEditForm={setEditForm} saving={saving} onSave={handleUpdate}
        classes={classes} subjects={subjects} subjectsForClass={bulkSubjectsForClass} editSubjectsForClass={[]}
        bulkRows={bulkRows} selectedBulkCount={bulkSelected.size}
        toggleAllBulk={(c) => setBulkSelected(c ? new Set(bulkSubjectsForClass.map(s => s.id)) : new Set())}
        toggleBulkSubject={toggleBulkSubject} updateBulkField={updateBulkField}
      />
    </div>
  );
}
