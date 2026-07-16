'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { api, apiFetch, fetchAllStudents } from '@/lib/api';
import { toast } from "sonner";
import { useAcademicYears } from '@/hooks/use-academic-years';
import { 
  ExamRecord, ExamFormData, StudentResultRow, 
  ClassOption, SubjectOption 
} from './types';
import { emptyExamForm } from './utils';

export function useExamsState(initialTab = 'exams') {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { slug } = useParams();
  const searchParams = useSearchParams();

  // Academic Years
  const { academicYears } = useAcademicYears();
  const currentAcademicYear = useMemo(() => {
    return academicYears.find((ay: any) => ay.isCurrent)?.name || '2024-2025';
  }, [academicYears]);

  // Filters & Tabs
  const [classFilter, setClassFilter] = useState('all');
  const [publishedAcademicYearFilter, setPublishedAcademicYearFilter] = useState(currentAcademicYear);
  const [publishedClassFilter, setPublishedClassFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(() => initialTab);

  // Dialog States
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<ExamFormData>({ ...emptyExamForm, academicYear: currentAcademicYear });
  const [adding, setAdding] = useState(false);
  
  useEffect(() => {
    if (currentAcademicYear) {
      queueMicrotask(() => {
        setAddForm(prev => ({ ...prev, academicYear: prev.academicYear || currentAcademicYear }));
        setPublishedAcademicYearFilter(prev => prev === 'all' ? currentAcademicYear : prev);
      });
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

  useEffect(() => {
    queueMicrotask(() => {
      setActiveTab(initialTab);
      if (initialTab !== 'results') {
        setSelectedExam(null);
        setResultRows([]);
      }
    });
  }, [initialTab]);

  // View Results Dialog State
  const [viewResultsOpen, setViewResultsOpen] = useState(false);
  const [viewResultsExam, setViewResultsExam] = useState<ExamRecord | null>(null);
  const [viewResultsData, setViewResultsData] = useState<any[]>([]);
  const [loadingViewResults, setLoadingViewResults] = useState(false);

  // Bulk Mode Helpers
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkOverrides, setBulkOverrides] = useState<Record<string, Partial<ExamFormData>>>({});
  const [resultsClassId, setResultsClassId] = useState<string>('');
  
  const [printingLedgerClassId] = useState<string | null>(null);
  const [enableModalTabulationPreview, setEnableModalTabulationPreview] = useState<boolean>(true);

  useEffect(() => {
    const fetchTenantSettings = async () => {
      try {
        const res = await apiFetch('/api/tenant-settings');
        if (res.ok) {
          const data = await res.json();
          setEnableModalTabulationPreview(data.enableModalTabulationPreview === true);
        }
      } catch (err) {
        console.error("Failed to load tenant settings", err);
      }
    };
    fetchTenantSettings();
  }, []);

  const [previewingLedgerClass, setPreviewingLedgerClass] = useState<{
    id: string;
    name: string;
    section: string;
    templateId: string;
    examName?: string;
  } | null>(null);

  const handlePrintTabularLedger = async (
    classId: string, 
    className: string, 
    classSection: string, 
    templateId: string = 'classic',
    examName?: string,
    isDownload: boolean = false
  ) => {
    if (enableModalTabulationPreview) {
      setPreviewingLedgerClass({
        id: classId,
        name: className,
        section: classSection,
        templateId,
        examName
      });
    } else {
      toast.promise(
        (async () => {
          const { handleTabulationLedgerPreview } = await import('./tabulationLedgerPrinter');
          await handleTabulationLedgerPreview({
            classId,
            classNameStr: className,
            classSection,
            academicYear: publishedAcademicYearFilter || currentAcademicYear,
            templateId,
            examName,
            isDownload
          });
        })(),
        {
          loading: isDownload ? 'Generating PDF...' : 'Compiling tabulation ledger...',
          success: isDownload ? 'PDF generated!' : 'Tabulation ledger compiled and preview opened!',
          error: isDownload ? 'Failed to generate PDF' : 'Failed to compile tabulation ledger',
        }
      );
    }
  };

  // Queries
  const { data: examsData, isLoading: loadingExams } = useQuery({
    queryKey: ['exams', classFilter],
    queryFn: async () => {
      const url = classFilter && classFilter !== 'all' 
        ? `/api/exams?classId=${classFilter}&limit=50` 
        : '/api/exams?limit=50';
      const res = await apiFetch(url);
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

  const classes = (metadata?.classes || []) as ClassOption[];
  const subjects = (metadata?.subjects || []) as SubjectOption[];

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

  const openResultsEntry = async (exam: ExamRecord | null) => {
    setSelectedExam(exam);
    if (!exam) {
      setResultRows([]);
      return;
    }
    setResultsClassId(exam.classId);
    if (activeTab !== 'results') {
      router.push(`/${slug}/results-entry`);
    }
    setActiveTab('results');
    setLoadingStudents(true);
    try {
      const [students, rRes] = await Promise.all([
        fetchAllStudents({ classId: exam.classId }),
        apiFetch(`/api/exams/results?examId=${exam.id}`)
      ]);
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

  const handleResultsClassChange = (classId: string) => {
    setResultsClassId(classId);
    setSelectedExam(null);
    setResultRows([]);
  };

  const handleOpenViewResults = async (exam: ExamRecord) => {
    setViewResultsExam(exam);
    setViewResultsOpen(true);
    setLoadingViewResults(true);
    try {
      const [students, rRes] = await Promise.all([
        fetchAllStudents({ classId: exam.classId }),
        apiFetch(`/api/exams/results?examId=${exam.id}`)
      ]);
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
  const bulkSubjectsForClass = useMemo(() => {
    return subjects.filter((s: any) => s.classId === addForm.classId);
  }, [subjects, addForm.classId]);

  const bulkRows = useMemo(() => {
    return bulkSubjectsForClass.map(s => ({
      ...addForm, 
      ...bulkOverrides[s.id],
      subjectId: s.id, 
      subjectName: s.name, 
      selected: bulkSelected.has(s.id),
    }));
  }, [bulkSubjectsForClass, addForm, bulkOverrides, bulkSelected]);

  const toggleBulkSubject = (id: string) => {
    const next = new Set(bulkSelected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setBulkSelected(next);
  };

  const updateBulkField = (id: string, field: string, value: string) => {
    setBulkOverrides(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  return {
    academicYears,
    currentAcademicYear,
    classFilter,
    setClassFilter,
    publishedAcademicYearFilter,
    setPublishedAcademicYearFilter,
    publishedClassFilter,
    setPublishedClassFilter,
    activeTab,
    setActiveTab,
    addOpen,
    setAddOpen,
    addForm,
    setAddForm,
    adding,
    editOpen,
    setEditOpen,
    editForm,
    setEditForm,
    saving,
    deleting,
    selectedExam,
    setSelectedExam,
    resultRows,
    setResultRows,
    savingResults,
    loadingStudents,
    isPublishing,
    viewResultsOpen,
    setViewResultsOpen,
    viewResultsExam,
    viewResultsData,
    loadingViewResults,
    bulkSelected,
    setBulkSelected,
    bulkOverrides,
    resultsClassId,
    previewingLedgerClass,
    setPreviewingLedgerClass,
    printingLedgerClassId,
    handlePrintTabularLedger,
    loadingExams,
    exams,
    classes,
    subjects,
    resultsExams: resultsExamsData?.data || [],
    handleCreate,
    handleUpdate,
    handleDelete,
    openResultsEntry,
    handleResultsClassChange,
    handleOpenViewResults,
    handleSaveResults,
    handlePublish,
    backToExams,
    bulkSubjectsForClass,
    bulkRows,
    toggleBulkSubject,
    updateBulkField,
  };
}
