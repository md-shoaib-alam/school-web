'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  ArrowRight, CheckCircle2, Clock, XCircle, Plus, Users, AlertTriangle, Loader2,
  GraduationCap, Zap,
} from 'lucide-react';
import { goeyToast as toast } from 'goey-toast';
import { apiFetch } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PromotionRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  fromClassId: string;
  fromClassName: string;
  fromClassGrade: string;
  toClassId: string;
  toClassName: string;
  toClassGrade: string;
  academicYear: string;
  status: string;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
  grade: string;
  capacity: number;
  studentCount: number;
  classTeacher: string;
}

interface StudentOption {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  classId: string;
}

interface PromotionFormData {
  studentId: string;
  fromClassId: string;
  toClassId: string;
  academicYear: string;
  remarks: string;
}

const emptyForm: PromotionFormData = {
  studentId: '',
  fromClassId: '',
  toClassId: '',
  academicYear: '',
  remarks: '',
};

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

const statusConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
  approved: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: 'Approved',
  },
  pending: {
    bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: <Clock className="h-3.5 w-3.5" />,
    label: 'Pending',
  },
  rejected: {
    bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    icon: <XCircle className="h-3.5 w-3.5" />,
    label: 'Rejected',
  },
  graduated: {
    bg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    icon: <GraduationCap className="h-3.5 w-3.5" />,
    label: 'Graduated',
  },
};

/* ------------------------------------------------------------------ */
/*  Helper: auto-detect academic year                                   */
/* ------------------------------------------------------------------ */

function getCurrentAcademicYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-based
  // Academic year runs Apr–Mar; if before Apr, use prev year
  return m >= 3 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AdminPromotions() {
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk' | 'graduated'>('individual');

  // Data
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
  const [graduations, setGraduations] = useState<PromotionRecord[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [academicYearFilter, setAcademicYearFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Individual promotion dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PromotionFormData>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  // Bulk promote dialog
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkFromClass, setBulkFromClass] = useState('');
  const [bulkToClass, setBulkToClass] = useState('');
  const [bulkAcademicYear, setBulkAcademicYear] = useState(getCurrentAcademicYear());
  const [bulkRemarks, setBulkRemarks] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Graduation dialog
  const [gradDialogOpen, setGradDialogOpen] = useState(false);
  const [gradClassId, setGradClassId] = useState('');
  const [gradAcademicYear, setGradAcademicYear] = useState(getCurrentAcademicYear());
  const [gradRemarks, setGradRemarks] = useState('');
  const [gradSelectedIds, setGradSelectedIds] = useState<Set<string>>(new Set());
  const [gradSubmitting, setGradSubmitting] = useState(false);

  // Reject confirmation dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingPromotion, setRejectingPromotion] = useState<PromotionRecord | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Approving state
  const [approvingId, setApprovingId] = useState<string | null>(null);

  /* ---- Fetch helpers ---- */

  const fetchPromotions = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type: 'promotion' });
      if (academicYearFilter && academicYearFilter !== 'all') params.set('academicYear', academicYearFilter);
      if (classFilter && classFilter !== 'all') params.set('classId', classFilter);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      const res = await apiFetch(`/api/promotions?${params.toString()}`);
      if (res.ok) setPromotions(await res.json());
    } catch { /* silent */ }
  }, [academicYearFilter, classFilter, statusFilter]);

  const fetchGraduations = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type: 'graduation' });
      if (academicYearFilter && academicYearFilter !== 'all') params.set('academicYear', academicYearFilter);
      const res = await apiFetch(`/api/promotions?${params.toString()}`);
      if (res.ok) setGraduations(await res.json());
    } catch { /* silent */ }
  }, [academicYearFilter]);

  const fetchClassesAndStudents = useCallback(async () => {
    try {
      const [classesRes, studentsRes] = await Promise.all([
        apiFetch('/api/classes'),
        apiFetch('/api/students'),
      ]);
      if (classesRes.ok) setClasses(await classesRes.json());
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(
          data.map((s: { id: string; name: string; rollNumber: string; className: string; classId: string; status?: string }) => ({
            id: s.id,
            name: s.name,
            rollNumber: s.rollNumber,
            className: s.className,
            classId: s.classId,
          }))
        );
      }
    } catch { /* silent */ }
  }, []);

  // Fetch graduations: include in init and on tab change
  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchPromotions(), fetchGraduations(), fetchClassesAndStudents()]);
      setLoading(false);
    }
    init();
  }, [fetchPromotions, fetchGraduations, fetchClassesAndStudents]);

  /* ---- Derived data ---- */

  const academicYears = Array.from(
    new Set([...promotions.map((p) => p.academicYear), ...graduations.map((g) => g.academicYear)]),
  ).sort();

  const summary = {
    total: promotions.length,
    pending: promotions.filter((p) => p.status === 'pending').length,
    approved: promotions.filter((p) => p.status === 'approved').length,
    graduated: graduations.length,
  };

  // Get next class in sequence (by grade number)
  const getNextClass = (fromClassId: string, allClasses: ClassOption[]): ClassOption | null => {
    const fromClass = allClasses.find((c) => c.id === fromClassId);
    if (!fromClass) return null;

    const fromGrade = parseInt(fromClass.grade) || 0;
    const nextClass = allClasses
      .filter((c) => parseInt(c.grade) === fromGrade + 1)
      .sort((a, b) => a.section.localeCompare(b.section))[0];

    return nextClass || null;
  };

  const isLastClass = (classId: string): boolean => {
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return false;
    const grade = parseInt(cls.grade) || 0;
    const maxGrade = Math.max(...classes.map((c) => parseInt(c.grade) || 0));
    return grade >= maxGrade;
  };

  /* ---- Handlers ---- */

  // Individual promotion
  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setForm({
        ...form,
        studentId,
        fromClassId: student.classId,
        toClassId: '',
      });
    }
  };

  const handleCreatePromotion = async () => {
    if (!form.studentId || !form.fromClassId || !form.toClassId || !form.academicYear) {
      toast.error('Validation Error', { description: 'Please fill all required fields' });
      return;
    }

    setSubmitting(true);
    const promise = (async () => {
      const res = await apiFetch('/api/promotions', {
        method: 'POST',
        body: JSON.stringify({
          studentId: form.studentId,
          fromClassId: form.fromClassId,
          toClassId: form.toClassId,
          academicYear: form.academicYear,
          remarks: form.remarks || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create promotion');
      }

      setDialogOpen(false);
      setForm({ ...emptyForm });
      await fetchPromotions();
    })();

    toast.promise(promise, {
      loading: 'Creating promotion request...',
      success: 'Promotion request created successfully',
      error: (err: any) => err.message || 'Error creating promotion',
    });

    try { await promise; } catch { /* handled by toast */ }
    setSubmitting(false);
  };

  // Bulk promote preview
  const openBulkDialog = () => {
    setBulkFromClass('');
    setBulkToClass('');
    setBulkAcademicYear(getCurrentAcademicYear());
    setBulkRemarks('');
    setBulkDialogOpen(true);
  };

  // Compute bulk preview as derived state
  const bulkPreview = bulkFromClass
    ? students.filter((s) => s.classId === bulkFromClass)
    : [];

  // Handle bulk from class change with auto-detect
  const handleBulkFromClassChange = (classId: string) => {
    setBulkFromClass(classId);
    const autoTo = classId ? getNextClass(classId, classes) : null;
    setBulkToClass(autoTo ? autoTo.id : '');
  };

  const handleBulkPromote = async () => {
    if (!bulkFromClass || !bulkToClass || !bulkAcademicYear) {
      toast.error('Validation Error', { description: 'Please fill all required fields' });
      return;
    }
    if (bulkPreview.length === 0) {
      toast.error('Validation Error', { description: 'No students found in the selected class' });
      return;
    }

    setBulkSubmitting(true);
    const promise = (async () => {
      const res = await apiFetch('/api/promotions', {
        method: 'POST',
        body: JSON.stringify({
          bulk: true,
          fromClassId: bulkFromClass,
          toClassId: bulkToClass,
          academicYear: bulkAcademicYear,
          remarks: bulkRemarks || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Bulk promotion failed');
      }

      const data = await res.json();
      setBulkDialogOpen(false);
      await Promise.all([fetchPromotions(), fetchClassesAndStudents()]);
      return data;
    })();

    toast.promise(promise, {
      loading: 'Bulk promoting students...',
      success: (data: any) => `${data.created} promotion(s) created successfully`,
      error: (err: any) => err.message || 'Error during bulk promotion',
    });

    try { await promise; } catch { /* handled by toast */ }
    setBulkSubmitting(false);
  };

  // Graduation
  const openGradDialog = () => {
    setGradClassId('');
    setGradAcademicYear(getCurrentAcademicYear());
    setGradRemarks('');
    setGradSelectedIds(new Set());
    setGradDialogOpen(true);
  };

  // Compute grad preview as derived state
  const gradPreview = gradClassId
    ? students.filter((s) => s.classId === gradClassId)
    : [];

  // Handle grad class change — select all by default
  const handleGradClassChange = (classId: string) => {
    setGradClassId(classId);
    const previewStudents = classId
      ? students.filter((s) => s.classId === classId)
      : [];
    setGradSelectedIds(new Set(previewStudents.map((s) => s.id)));
  };

  const toggleGradStudent = (id: string) => {
    setGradSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGraduate = async () => {
    if (!gradClassId || !gradAcademicYear) {
      toast.error('Validation Error', { description: 'Please fill all required fields' });
      return;
    }
    if (gradSelectedIds.size === 0) {
      toast.error('Validation Error', { description: 'No students selected for graduation' });
      return;
    }

    setGradSubmitting(true);
    const promise = (async () => {
      const body: Record<string, unknown> = {
        graduation: true,
        fromClassId: gradClassId,
        academicYear: gradAcademicYear,
        remarks: gradRemarks || undefined,
        studentIds: Array.from(gradSelectedIds),
      };
      const res = await apiFetch('/api/promotions', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Graduation failed');
      }

      setGradDialogOpen(false);
      await Promise.all([fetchClassesAndStudents(), fetchGraduations()]);
    })();

    toast.promise(promise, {
      loading: 'Graduating students...',
      success: 'Students graduated successfully',
      error: (err: any) => err.message || 'Error during graduation',
    });

    try { await promise; } catch { /* handled by toast */ }
    setGradSubmitting(false);
  };

  // Approve / Reject
  const handleApprove = async (promotion: PromotionRecord) => {
    setApprovingId(promotion.id);
    const promise = (async () => {
      const res = await apiFetch('/api/promotions', {
        method: 'PUT',
        body: JSON.stringify({ id: promotion.id, status: 'approved' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to approve promotion');
      }

      await Promise.all([fetchPromotions(), fetchClassesAndStudents()]);
    })();

    toast.promise(promise, {
      loading: `Approving promotion for ${promotion.studentName}...`,
      success: 'Promotion approved successfully',
      error: (err: any) => err.message || 'Error approving promotion',
    });

    try { await promise; } catch { /* handled by toast */ }
    setApprovingId(null);
  };

  const openRejectDialog = (promotion: PromotionRecord) => {
    setRejectingPromotion(promotion);
    setRejectRemarks('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingPromotion) return;
    setRejecting(true);
    try {
      const res = await apiFetch('/api/promotions', {
        method: 'PUT',
        body: JSON.stringify({
          id: rejectingPromotion.id,
          status: 'rejected',
          remarks: rejectRemarks || undefined,
        }),
      });
      if (res.ok) {
        toast.success('Rejected', { description: `Promotion for ${rejectingPromotion.studentName} rejected` });
        setRejectDialogOpen(false);
        setRejectingPromotion(null);
        await fetchPromotions();
      } else {
        const data = await res.json();
        toast.error('Error', { description: data.error || 'Failed to reject promotion' });
      }
    } catch {
      toast.error('System Error', { description: 'Error rejecting promotion' });
    }
    setRejecting(false);
  };

  /* ---- Render ---- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Promotion</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Promote students to next class, bulk promote a whole class, or graduate pass-out students.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-900/30"
            onClick={openGradDialog}
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Graduate</span>
          </Button>
          <Button
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={openBulkDialog}
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Promote</span>
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              setForm({ ...emptyForm, academicYear: getCurrentAcademicYear() });
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Promotion</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Promotions', value: summary.total, icon: <Users className="h-5 w-5" />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
          { label: 'Pending Review', value: summary.pending, icon: <Clock className="h-5 w-5" />, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
          { label: 'Approved', value: summary.approved, icon: <CheckCircle2 className="h-5 w-5" />, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
          { label: 'Graduated', value: summary.graduated, icon: <GraduationCap className="h-5 w-5" />, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
        ].map((card) => (
          <Card key={card.label} className={`hover:shadow-md transition-shadow border ${card.border}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/80 p-1 rounded-lg w-fit">
        {[
          { key: 'individual' as const, label: 'Promotions', icon: <ArrowRight className="h-4 w-4" /> },
          { key: 'bulk' as const, label: 'Bulk Promote', icon: <Zap className="h-4 w-4" /> },
          { key: 'graduated' as const, label: 'Graduated', icon: <GraduationCap className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════ INDIVIDUAL PROMOTIONS TAB ═══════ */}
      {activeTab === 'individual' && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}-{c.section} (Grade {c.grade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Promotions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Promotion Records</CardTitle>
              <CardDescription>{promotions.length} record{promotions.length !== 1 ? 's' : ''} found</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 w-full bg-muted animate-pulse rounded" />)}</div>
              ) : promotions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <ArrowRight className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No promotion records found</p>
                  <p className="text-xs mt-1">Click &quot;New Promotion&quot; to create one</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="hidden sm:table-cell">Roll No.</TableHead>
                        <TableHead>Class Transfer</TableHead>
                        <TableHead className="hidden md:table-cell">Academic Year</TableHead>
                        <TableHead className="w-28 text-center">Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Date</TableHead>
                        <TableHead className="w-36 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promotions.map((promo) => {
                        const config = statusConfig[promo.status] || statusConfig.pending;
                        return (
                          <TableRow key={promo.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold shrink-0">
                                  {promo.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-medium text-sm">{promo.studentName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">#{promo.rollNumber}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm">
                                <Badge variant="outline" className="font-normal whitespace-nowrap">{promo.fromClassName}</Badge>
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <Badge variant="outline" className="font-normal whitespace-nowrap">{promo.toClassName}</Badge>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{promo.academicYear}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={`${config.bg} font-medium`}>
                                {config.icon}
                                <span className="ml-1">{config.label}</span>
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                              {new Date(promo.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                              {promo.status === 'pending' ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(promo)} disabled={approvingId === promo.id}>
                                    {approvingId === promo.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30 dark:text-red-400" onClick={() => openRejectDialog(promo)}>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ═══════ BULK PROMOTE TAB ═══════ */}
      {activeTab === 'bulk' && (
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
                  {bulkFromClass && isLastClass(bulkFromClass) && (
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
      )}

      {/* ═══════ GRADUATED TAB ═══════ */}
      {activeTab === 'graduated' && (
        <div className="space-y-6">
          {/* Quick Graduate Card */}
          <Card className="border-violet-200 dark:border-violet-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-violet-500" />
                Quick Graduate / Pass-Out
              </CardTitle>
              <CardDescription>
                Select a class and mark students as graduated (passed out from school). Use this for students in the final/highest class.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class *</label>
                  <Select value={gradClassId} onValueChange={handleGradClassChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class to graduate from" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes
                        .sort((a, b) => (parseInt(b.grade) || 0) - (parseInt(a.grade) || 0))
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}-{c.section} (Grade {c.grade}) — {c.studentCount} students
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Academic Year *</label>
                  <Input
                    placeholder="e.g. 2024-2025"
                    value={gradAcademicYear}
                    onChange={(e) => setGradAcademicYear(e.target.value)}
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Remarks (optional)</label>
                <Textarea
                  placeholder="e.g. Batch of 2025, Passed out with distinction"
                  value={gradRemarks}
                  onChange={(e) => setGradRemarks(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Student Selection */}
              {gradPreview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      <span>Select students to graduate</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setGradSelectedIds(new Set(gradPreview.map((s) => s.id)))}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setGradSelectedIds(new Set())}>
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox
                              checked={gradSelectedIds.size === gradPreview.length && gradPreview.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked) setGradSelectedIds(new Set(gradPreview.map((s) => s.id)));
                                else setGradSelectedIds(new Set());
                              }}
                            />
                          </TableHead>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Roll No.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gradPreview.map((s, i) => (
                          <TableRow key={s.id} className={gradSelectedIds.has(s.id) ? 'bg-violet-50/50 dark:bg-violet-900/20' : ''}>
                            <TableCell>
                              <Checkbox
                                checked={gradSelectedIds.has(s.id)}
                                onCheckedChange={() => toggleGradStudent(s.id)}
                              />
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                            <TableCell className="text-sm font-medium">{s.name}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">#{s.rollNumber}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                className="bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handleGraduate}
                disabled={gradSubmitting || !gradClassId || !gradAcademicYear || gradSelectedIds.size === 0}
              >
                {gradSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <GraduationCap className="h-4 w-4 mr-2" />}
                {gradSubmitting ? 'Graduating...' : `Graduate ${gradSelectedIds.size} Student(s)`}
              </Button>
            </CardContent>
          </Card>

          {/* Graduation History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Graduation History</CardTitle>
              <CardDescription>{graduations.length} record{graduations.length !== 1 ? 's' : ''} found</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {graduations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <GraduationCap className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No graduation records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="hidden sm:table-cell">Roll No.</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead className="hidden md:table-cell">Academic Year</TableHead>
                        <TableHead className="w-28 text-center">Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Graduated On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {graduations.map((grad) => (
                        <TableRow key={grad.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 flex items-center justify-center text-xs font-semibold shrink-0">
                                {grad.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-sm">{grad.studentName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">#{grad.rollNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">{grad.fromClassName}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{grad.academicYear}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`${statusConfig.graduated.bg} font-medium`}>
                              {statusConfig.graduated.icon}
                              <span className="ml-1">Graduated</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {new Date(grad.createdAt).toLocaleDateString()}
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

      {/* ═══════ INDIVIDUAL NEW PROMOTION DIALOG ═══════ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Promotion</DialogTitle>
            <DialogDescription>
              Create a promotion request for a single student. The student will be moved to the target class once approved.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Student *</label>
              <Select value={form.studentId} onValueChange={handleStudentChange}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — Roll #{s.rollNumber} ({s.className})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">From Class *</label>
                <Select value={form.fromClassId} onValueChange={(v) => setForm({ ...form, fromClassId: v })} disabled>
                  <SelectTrigger><SelectValue placeholder="Auto-filled" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">To Class *</label>
                <Select value={form.toClassId} onValueChange={(v) => setForm({ ...form, toClassId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.filter((c) => c.id !== form.fromClassId).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}-{c.section} (Grade {c.grade})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Academic Year *</label>
              <Input placeholder="e.g. 2025-2026" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Remarks</label>
              <Textarea placeholder="Optional remarks..." value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={3} />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleCreatePromotion}
              disabled={submitting || !form.studentId || !form.fromClassId || !form.toClassId || !form.academicYear}
            >
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : 'Submit Promotion'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════ BULK PROMOTE DIALOG ═══════ */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Bulk Promotion
            </DialogTitle>
            <DialogDescription>
              All students in the selected class will be promoted to the next class in one go.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">From Class *</label>
                <Select value={bulkFromClass} onValueChange={handleBulkFromClassChange}>
                  <SelectTrigger><SelectValue placeholder="Current class" /></SelectTrigger>
                  <SelectContent>
                    {classes.sort((a, b) => (parseInt(a.grade) || 0) - (parseInt(b.grade) || 0)).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}-{c.section} (Grade {c.grade})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">To Class *</label>
                <Select value={bulkToClass} onValueChange={setBulkToClass}>
                  <SelectTrigger><SelectValue placeholder="Auto-detected" /></SelectTrigger>
                  <SelectContent>
                    {classes.filter((c) => c.id !== bulkFromClass).sort((a, b) => (parseInt(a.grade) || 0) - (parseInt(b.grade) || 0)).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}-{c.section} (Grade {c.grade})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Academic Year *</label>
              <Input value={bulkAcademicYear} onChange={(e) => setBulkAcademicYear(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Remarks</label>
              <Textarea value={bulkRemarks} onChange={(e) => setBulkRemarks(e.target.value)} placeholder="Optional..." rows={2} />
            </div>
            {bulkFromClass && isLastClass(bulkFromClass) && (
              <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-lg px-3 py-2 border border-violet-200 dark:border-violet-800">
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span>This is the highest class. Consider using <strong>Graduate</strong> instead.</span>
              </div>
            )}
            {bulkPreview.length > 0 && (
              <p className="text-sm text-muted-foreground">{bulkPreview.length} student(s) will be promoted</p>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleBulkPromote}
              disabled={bulkSubmitting || !bulkFromClass || !bulkToClass || !bulkAcademicYear || bulkPreview.length === 0}
            >
              {bulkSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : `Promote ${bulkPreview.length} Students`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════ REJECT DIALOG ═══════ */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Reject Promotion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the promotion for{' '}
              <span className="font-semibold text-foreground">{rejectingPromotion?.studentName}</span>{' '}
              from {rejectingPromotion?.fromClassName} to {rejectingPromotion?.toClassName}?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <label className="text-sm font-medium">Reason for rejection (optional)</label>
            <Textarea placeholder="Provide reason..." value={rejectRemarks} onChange={(e) => setRejectRemarks(e.target.value)} rows={3} />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleReject} disabled={rejecting}>
              {rejecting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Rejecting...</> : 'Confirm Reject'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
