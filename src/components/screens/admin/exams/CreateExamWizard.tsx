'use client';

import { useState, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  Users, 
  Trophy, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Layers,
  Clock,
  Info,
  CheckCircle2,
  CalendarDays,
  GraduationCap,
  Loader2,
  UserCheck,
  X,
  BookOpen,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { formatLocalDate, parseLocalDate } from '@/lib/utils';
import { ExamFormData, ClassOption, SubjectOption } from './types';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

interface CreateExamWizardProps {
  onCancel: () => void;
  classes: ClassOption[];
  subjects: SubjectOption[];
  academicYears: any[];
  currentAcademicYear: string;
  onSuccess: () => void;
  teachers?: any[];
}

export function CreateExamWizard({
  onCancel,
  classes,
  subjects,
  academicYears,
  currentAcademicYear,
  onSuccess,
  teachers = []
}: CreateExamWizardProps) {
  // Step State: 1 = Basic Details, 2 = Select Subjects, 3 = Assign Teachers, 4 = Review & Create
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Selection Mode: default to 'grade' (Class-wise: All Sections)
  const [selectionMode, setSelectionMode] = useState<'section' | 'grade'>('grade');
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    return classes[0]?.grade || classes[0]?.name || '';
  });

  // Group classes by grade/level
  const gradeGroups = useMemo(() => {
    const map = new Map<string, ClassOption[]>();
    classes.forEach(c => {
      const key = c.grade || c.name || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries()).map(([gradeName, classList]) => ({
      gradeName,
      classList
    }));
  }, [classes]);

  // Default selected classes to all sections of the first grade
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(() => {
    if (classes.length === 0) return [];
    const firstKey = classes[0]?.grade || classes[0]?.name || '';
    const matching = classes.filter(c => (c.grade || c.name || '') === firstKey);
    return matching.length > 0 ? matching.map(c => c.id) : [classes[0].id];
  });

  // Form State
  const [examName, setExamName] = useState('');
  const [examType, setExamType] = useState('midterm');
  const [academicYear, setAcademicYear] = useState(() => {
    if (currentAcademicYear) return currentAcademicYear;
    const y = new Date().getFullYear();
    return `${y}-${y + 1}`;
  });
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  // When switching to grade mode or picking a grade, select all sections of that grade
  const handleSelectGrade = (gradeName: string) => {
    setSelectedGrade(gradeName);
    const targetGroup = gradeGroups.find(g => g.gradeName === gradeName);
    if (targetGroup) {
      setSelectedClassIds(targetGroup.classList.map(c => c.id));
    }
  };

  const handleSelectSectionClass = (cid: string) => {
    setSelectedClassIds([cid]);
  };

  // Selected classes objects
  const selectedClasses = useMemo(() => {
    return classes.filter(c => selectedClassIds.includes(c.id));
  }, [classes, selectedClassIds]);

  // Disable past dates calculation
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isPastDate = useMemo(() => (date: Date) => {
    return date < today;
  }, [today]);

  // Disable end date if it is before start date or in the past
  const isEndDateDisabled = useMemo(() => (date: Date) => {
    if (date < today) return true;
    if (startDate) {
      const parsedStart = parseLocalDate(startDate);
      if (parsedStart) {
        parsedStart.setHours(0, 0, 0, 0);
        return date < parsedStart;
      }
    }
    return false;
  }, [today, startDate]);

  // When Start Date changes, ensure End Date is at least Start Date
  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (endDate && newStart > endDate) {
      setEndDate(newStart);
    }
  };

  // Restrict subject exam dates to be between Start Date and End Date (and not in past)
  const isSubjectDateDisabled = useMemo(() => (date: Date) => {
    if (date < today) return true;
    if (startDate) {
      const parsedStart = parseLocalDate(startDate);
      if (parsedStart) {
        parsedStart.setHours(0, 0, 0, 0);
        if (date < parsedStart) return true;
      }
    }
    if (endDate) {
      const parsedEnd = parseLocalDate(endDate);
      if (parsedEnd) {
        parsedEnd.setHours(23, 59, 59, 999);
        if (date > parsedEnd) return true;
      }
    }
    return false;
  }, [today, startDate, endDate]);

  // Subjects belonging to all selected classes
  const selectedClassesSubjects = useMemo(() => {
    return subjects.filter((s: any) => selectedClassIds.includes(s.classId));
  }, [subjects, selectedClassIds]);

  // Distinct subjects by name/code for step 2 schedule config
  const distinctSubjects = useMemo(() => {
    const map = new Map<string, { key: string; name: string; code?: string; sampleId: string }>();
    selectedClassesSubjects.forEach(s => {
      const key = s.name.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: s.name.trim(),
          code: s.code,
          sampleId: s.id
        });
      }
    });
    return Array.from(map.values());
  }, [selectedClassesSubjects]);

  // Selected subject keys (by lowercased name)
  const [selectedSubjectKeys, setSelectedSubjectKeys] = useState<Set<string>>(() => {
    return new Set(distinctSubjects.map(d => d.key));
  });

  // Track universal schedule settings per distinct subject key
  const [subjectConfig, setSubjectConfig] = useState<Record<string, {
    date: string;
    startTime: string;
    endTime: string;
    totalMarks: string;
    passingMarks: string;
  }>>({});

  // Specific teacher assignments per class and per subject: record of `${classId}_${subjectNameLower}` -> teacherId
  const [classTeacherAssignments, setClassTeacherAssignments] = useState<Record<string, string>>({});

  // Rows for Step 2
  const currentBulkRows = useMemo(() => {
    return distinctSubjects.map((s) => {
      const existing = subjectConfig[s.key];
      const defaultDate = existing?.date || startDate;
      return {
        key: s.key,
        subjectName: s.name,
        code: s.code,
        selected: selectedSubjectKeys.has(s.key),
        date: defaultDate,
        startTime: existing?.startTime || '09:00',
        endTime: existing?.endTime || '11:00',
        totalMarks: existing?.totalMarks || '100',
        passingMarks: existing?.passingMarks || '40'
      };
    });
  }, [distinctSubjects, selectedSubjectKeys, subjectConfig, startDate]);

  const updateSubjectField = (key: string, field: string, val: string) => {
    setSubjectConfig(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {
          date: startDate,
          startTime: '09:00',
          endTime: '11:00',
          totalMarks: '100',
          passingMarks: '40'
        }),
        [field]: val
      }
    }));
  };

  const toggleSelectSubject = (key: string) => {
    setSelectedSubjectKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAllSubjects = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedSubjectKeys(new Set(distinctSubjects.map(s => s.key)));
    } else {
      setSelectedSubjectKeys(new Set());
    }
  };

  const selectedCount = selectedSubjectKeys.size;

  // Validation
  const validateStep1 = () => {
    if (!examName.trim()) {
      toast.error('Please enter an exam name');
      return false;
    }
    if (selectedClassIds.length === 0) {
      toast.error('Please select at least one class');
      return false;
    }
    if (startDate && endDate && startDate > endDate) {
      toast.error('End date cannot be earlier than start date');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (selectedCount === 0) {
      toast.error('Please select at least one subject for the exam');
      return false;
    }
    const missingDate = currentBulkRows.some(r => r.selected && !r.date);
    if (missingDate) {
      toast.error('Please specify examination dates for all selected subjects');
      return false;
    }
    return true;
  };

  // Success Dialog State
  const [createdSummary, setCreatedSummary] = useState<{
    examName: string;
    className: string;
    totalSubjects: number;
    startDate: string;
    endDate: string;
  } | null>(null);

  // Submit Handler: Submits bulk exams for every selected class
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const chosenUniversalRows = currentBulkRows.filter(r => r.selected);
      let totalCreatedCount = 0;

      for (const cls of selectedClasses) {
        // Find matching subjects for this specific class
        const clsSubs = subjects.filter(s => s.classId === cls.id);
        const examsPayload = chosenUniversalRows
          .map(row => {
            const matchedSub = clsSubs.find(
              s => s.name.trim().toLowerCase() === row.key
            );
            if (!matchedSub) return null;

            const teacherKey = `${cls.id}_${row.key}`;
            const assignedTeacherId = classTeacherAssignments[teacherKey] ?? matchedSub.teacherId;

            return {
              subjectId: matchedSub.id,
              subjectName: matchedSub.name,
              date: row.date,
              startTime: row.startTime,
              endTime: row.endTime,
              totalMarks: Number(row.totalMarks) || 100,
              passingMarks: Number(row.passingMarks) || 40,
              teacherId: assignedTeacherId || undefined
            };
          })
          .filter(Boolean);

        if (examsPayload.length > 0) {
          const payload = {
            classId: cls.id,
            examType,
            name: examName.trim(),
            academicYear: academicYear || currentAcademicYear,
            description: description.trim() || undefined,
            startDate,
            endDate,
            exams: examsPayload
          };

          const res = await apiFetch('/api/exams/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || `Failed to create exams for ${cls.name} - ${cls.section}`);
          }
          totalCreatedCount += examsPayload.length;
        }
      }

      toast.success(`Successfully created ${totalCreatedCount} exam papers across ${selectedClasses.length} class(es)!`);
      
      const classLabel = selectionMode === 'grade'
        ? (selectedGrade.toLowerCase().startsWith('grade') || selectedGrade.toLowerCase().startsWith('class') 
            ? selectedGrade 
            : `Class ${selectedGrade}`)
        : (selectedClasses[0] ? `${selectedClasses[0].name} - ${selectedClasses[0].section}` : 'Selected Class');

      setCreatedSummary({
        examName: examName.trim(),
        className: classLabel,
        totalSubjects: chosenUniversalRows.length,
        startDate,
        endDate
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error creating examination schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Details', subtitle: 'Exam information' },
    { number: 2, title: 'Select Subjects', subtitle: 'Choose subjects' },
    { number: 3, title: 'Assign Teachers', subtitle: 'Review or modify' },
    { number: 4, title: 'Review & Create', subtitle: 'Confirm and create' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in-50 duration-300 pb-12">
      {/* Top Header: Desktop has standard icon + title; Mobile has circular back button + right orange icon */}
      <div className="flex items-center justify-between sm:justify-start gap-3">
        <div className="flex items-center gap-3">
          {/* Circular Back button visible only on mobile */}
          <button
            type="button"
            onClick={onCancel}
            className="sm:hidden size-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-zinc-700/60 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="size-5 stroke-[2.2]" />
          </button>

          {/* Desktop Orange Document Icon */}
          <div className="hidden sm:flex size-11 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 items-center justify-center shrink-0 border border-orange-200 dark:border-orange-900/30">
            <FileText className="size-6 stroke-[2.2]" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Create Exam</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Set up a new examination with basic details.</p>
          </div>
        </div>

        {/* Mobile Orange Document Icon on far right */}
        <div className="sm:hidden size-10 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/80 dark:border-orange-900/30">
          <FileText className="size-5 stroke-[2.2]" />
        </div>
      </div>

      {/* Stepper Progress Bar: Desktop keeps original stepper with subtitles; Mobile uses compact stepper */}
      {/* Desktop Stepper */}
      <div className="hidden sm:block py-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto gap-2">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            return (
              <div key={s.number} className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (s.number < currentStep) setCurrentStep(s.number);
                  }}
                  className={`size-9 sm:size-10 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-4 ring-blue-100 dark:ring-blue-900/30'
                      : isCompleted
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500 border border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  {isCompleted ? <Check className="size-4 sm:size-5 stroke-[2.5]" /> : s.number}
                </button>
                <div className="text-left">
                  <div className={`text-xs font-semibold leading-tight whitespace-nowrap ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-zinc-300'}`}>
                    {s.title}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 leading-tight whitespace-nowrap">
                    {s.subtitle}
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-6 sm:w-10 lg:w-16 h-0.5 bg-slate-200 dark:bg-zinc-800 mx-1 sm:mx-2 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper matching screenshot */}
      <div className="sm:hidden py-2 px-1">
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            const label = s.number === 1 ? 'Basic Details' : s.number === 2 ? 'Subjects' : s.number === 3 ? 'Teachers' : 'Review';
            return (
              <div key={s.number} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (s.number < currentStep) setCurrentStep(s.number);
                    }}
                    className={`size-9 rounded-full font-semibold text-xs flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-4 ring-blue-100 dark:ring-blue-900/30'
                        : isCompleted
                        ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500 border border-slate-200/80 dark:border-zinc-700'
                    }`}
                  >
                    {isCompleted ? <Check className="size-4 stroke-[2.5]" /> : s.number}
                  </button>
                  <span className={`text-[11px] font-medium text-center leading-tight whitespace-nowrap ${
                    isCurrent ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-zinc-400'
                  }`}>
                    {label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-slate-200 dark:bg-zinc-800 mx-2 -mt-4.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Basic Details */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl sm:rounded-2xl p-5 sm:p-8 shadow-xs space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold flex items-center justify-center text-sm shrink-0">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Basic Details</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Enter the general information for this exam.</p>
              </div>
            </div>

            {/* Desktop Toggle in Top Right Corner */}
            <div className="hidden sm:inline-flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium border border-slate-200/80 dark:border-zinc-700/80 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectionMode('section');
                  setSelectedClassIds([classes[0]?.id || '']);
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectionMode === 'section'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                Section-wise
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionMode('grade');
                  const firstGrade = gradeGroups[0]?.gradeName || '';
                  if (firstGrade) {
                    handleSelectGrade(firstGrade);
                  }
                }}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectionMode === 'grade'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                <span>Class-wise</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                  All Sections
                </Badge>
              </button>
            </div>
          </div>

          {/* Mobile Segmented Control: Class-wise vs Section-wise */}
          <div className="grid sm:hidden grid-cols-2 bg-slate-100/80 dark:bg-zinc-800/70 p-1 rounded-2xl text-xs font-semibold border border-slate-200/50 dark:border-zinc-700/50">
            <button
              type="button"
              onClick={() => {
                setSelectionMode('grade');
                const firstGrade = gradeGroups[0]?.gradeName || '';
                if (firstGrade) {
                  handleSelectGrade(firstGrade);
                }
              }}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                selectionMode === 'grade'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold border border-blue-100/70 dark:border-zinc-700'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Class-wise
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectionMode('section');
                setSelectedClassIds([classes[0]?.id || '']);
              }}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                selectionMode === 'section'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold border border-blue-100/70 dark:border-zinc-700'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Section-wise
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1">
            {/* Row 1, Col 1: Exam Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium sm:font-medium text-slate-700 dark:text-zinc-300">
                Exam Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-blue-500" />
                <Input
                  className="pl-10 h-11 bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 rounded-xl sm:rounded-xl text-sm font-normal text-slate-800 dark:text-zinc-200 focus-visible:ring-blue-500"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. Midterm Examination 2026 or Annual Final Exam"
                />
              </div>
            </div>

            {/* Row 1, Col 2: Exam Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Exam Type <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger className="w-full h-11 bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-normal text-slate-800 dark:text-zinc-200 pl-10">
                    <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-blue-500" />
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="midterm" className="text-xs sm:text-sm">Midterm</SelectItem>
                    <SelectItem value="final" className="text-xs sm:text-sm">Final Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2, Col 1: Class Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                {selectionMode === 'grade' ? 'Select Class (All Sections)' : 'Select Class & Section'} <span className="text-red-500">*</span>
              </Label>

              {selectionMode === 'section' ? (
                /* Section-wise Single Class Dropdown Selector */
                <div className="relative">
                  <Select
                    value={selectedClassIds[0] || ''}
                    onValueChange={(val) => handleSelectSectionClass(val)}
                  >
                    <SelectTrigger className="w-full h-11 bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-normal text-slate-800 dark:text-zinc-200 pl-10">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-blue-500" />
                      <SelectValue placeholder="Select class section" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-60">
                      {classes.map(c => {
                        const cleanName = c.name.toLowerCase().startsWith('class') || c.name.toLowerCase().startsWith('grade')
                          ? c.name.replace(/^grade/i, 'Class')
                          : `Class ${c.name}`;
                        return (
                          <SelectItem key={c.id} value={c.id} className="text-xs sm:text-sm">
                            {cleanName} - Section {c.section}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                /* Class-wise Dropdown Selector (e.g. Class 1, Class 2) */
                <div className="space-y-2">
                  <div className="relative">
                    <Select
                      value={selectedGrade || gradeGroups[0]?.gradeName || ''}
                      onValueChange={(val) => handleSelectGrade(val)}
                    >
                      <SelectTrigger className="w-full h-11 bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-normal text-slate-800 dark:text-zinc-200 pl-10">
                        <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-blue-500" />
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-60">
                        {gradeGroups.map(g => {
                          const displayGrade = g.gradeName.replace(/^grade/i, 'Class').trim();
                          const formattedName = displayGrade.toLowerCase().startsWith('class')
                            ? displayGrade
                            : `Class ${displayGrade}`;
                          return (
                            <SelectItem key={g.gradeName} value={g.gradeName} className="text-xs sm:text-sm">
                              {formattedName} ({g.classList.length} sections: {g.classList.map(c => c.section).join(', ')})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Subtle single section list tags matching mockup */}
                  <div className="flex items-center gap-1.5 px-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="text-[11px] text-slate-400">Sections included:</span>
                    <div className="flex flex-wrap items-center gap-1">
                      {selectedClasses.map(c => (
                        <span key={c.id} className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
                          {c.section}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Row 2, Col 2: Academic Year */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Academic Year <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger className="w-full h-11 bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-normal text-slate-800 dark:text-zinc-200 pl-10">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-blue-500" />
                    <SelectValue placeholder="Academic Year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {academicYears.length > 0 ? (
                      academicYears.map(ay => (
                        <SelectItem key={ay.id} value={ay.name} className="text-xs sm:text-sm">
                          {ay.name} {ay.isCurrent && '(Current)'}
                        </SelectItem>
                      ))
                    ) : (
                      (() => {
                        const y = new Date().getFullYear();
                        return [
                          <SelectItem key={`${y-1}-${y}`} value={`${y-1}-${y}`} className="text-xs sm:text-sm">{y-1}-{y}</SelectItem>,
                          <SelectItem key={`${y}-${y+1}`} value={`${y}-${y+1}`} className="text-xs sm:text-sm">{y}-{y+1} (Current)</SelectItem>,
                          <SelectItem key={`${y+1}-${y+2}`} value={`${y+1}-${y+2}`} className="text-xs sm:text-sm">{y+1}-{y+2}</SelectItem>
                        ];
                      })()
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Start Date & End Date - side by side on mobile (grid-cols-2) and desktop */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:col-span-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <DatePicker 
                  date={parseLocalDate(startDate)} 
                  onChange={(d) => handleStartDateChange(formatLocalDate(d))} 
                  disabled={isPastDate}
                  className="w-full h-11 rounded-xl text-xs sm:text-sm bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <DatePicker 
                  date={parseLocalDate(endDate)} 
                  onChange={(d) => setEndDate(formatLocalDate(d))} 
                  disabled={isEndDateDisabled}
                  className="w-full h-11 rounded-xl text-xs sm:text-sm bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Description (Optional)</Label>
              <span className="text-[11px] text-slate-400">{description.length}/500</span>
            </div>
            <div className="relative">
              <textarea
                value={description}
                maxLength={500}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details or guidelines for this examination..."
                rows={3}
                className="w-full rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-3 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-zinc-100 resize-none"
              />
            </div>
          </div>

          {/* Next Step Info Banner matching mobile mockup */}
          <div className="bg-sky-50/70 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3">
            <Info className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <span className="font-bold">Next Step: </span>
              Configure common subject schedules and then review/assign teachers per class section.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <Button variant="outline" onClick={onCancel} className="h-10 px-5 rounded-xl border-slate-200 dark:border-zinc-700 flex-1 sm:flex-initial">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (validateStep1()) setCurrentStep(2);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 sm:px-6 rounded-xl font-medium gap-2 shadow-sm shadow-blue-500/20 flex-1 sm:flex-initial justify-center"
            >
              <span>Next</span>
              <span className="hidden xs:inline">: Select Subjects</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Subjects & Timetable */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-start sm:items-center gap-3">
              <div className="size-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold flex items-center justify-center text-sm shrink-0 mt-0.5 sm:mt-0">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Select Subjects & Schedule</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Select examination papers for {selectedClasses.map(c => `${c.name} - ${c.section}`).join(', ')} and set universal time and marks.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <Badge variant="outline" className="px-2.5 sm:px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-semibold whitespace-nowrap">
                {selectedCount} of {distinctSubjects.length} Selected
              </Badge>
            </div>
          </div>

          {/* Desktop Subjects Table */}
          <div className="hidden sm:block border border-slate-200 dark:border-zinc-800 rounded-xl overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-zinc-900/60">
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={selectedCount === distinctSubjects.length && distinctSubjects.length > 0}
                      onCheckedChange={(c) => toggleAllSubjects(!!c)}
                    />
                  </TableHead>
                  <TableHead className="min-w-[160px]">Subject Name</TableHead>
                  <TableHead className="min-w-[150px]">Date *</TableHead>
                  <TableHead className="w-28 text-center">Start Time</TableHead>
                  <TableHead className="w-28 text-center">End Time</TableHead>
                  <TableHead className="w-24 text-center">Total Marks</TableHead>
                  <TableHead className="w-24 text-center">Passing Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBulkRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      No subjects configured for the selected classes yet. Please add subjects first in Subject management.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentBulkRows.map((row) => (
                    <TableRow key={row.key} className={row.selected ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={row.selected}
                          onCheckedChange={() => toggleSelectSubject(row.key)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800 dark:text-zinc-200">
                        {row.subjectName}
                        {row.code && <span className="text-xs text-slate-400 font-normal ml-1.5">({row.code})</span>}
                      </TableCell>
                      <TableCell>
                        <DatePicker
                          date={parseLocalDate(row.date)}
                          onChange={(d) => updateSubjectField(row.key, 'date', formatLocalDate(d))}
                          disabled={isSubjectDateDisabled}
                          className="h-9 w-full rounded-lg"
                        />
                      </TableCell>
                      <TableCell>
                        <TimePicker
                          value={row.startTime}
                          onChange={(v) => updateSubjectField(row.key, 'startTime', v)}
                          className="h-9 text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <TimePicker
                          value={row.endTime}
                          onChange={(v) => updateSubjectField(row.key, 'endTime', v)}
                          className="h-9 text-xs"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          value={row.totalMarks}
                          onChange={(e) => updateSubjectField(row.key, 'totalMarks', e.target.value)}
                          className="h-9 w-18 mx-auto text-center font-medium rounded-lg"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          value={row.passingMarks}
                          onChange={(e) => updateSubjectField(row.key, 'passingMarks', e.target.value)}
                          className="h-9 w-18 mx-auto text-center font-medium rounded-lg"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards View matching screenshot */}
          <div className="sm:hidden space-y-3.5">
            {currentBulkRows.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No subjects configured for the selected classes yet.
              </div>
            ) : (
              currentBulkRows.map((row) => (
                <div
                  key={row.key}
                  className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                    row.selected
                      ? 'border-blue-100 bg-white dark:bg-zinc-900/90 shadow-2xs'
                      : 'border-slate-100 bg-slate-50/50 dark:bg-zinc-900/40 opacity-70'
                  }`}
                >
                  {/* Card Header: Checkbox + Subject Icon + Name */}
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      checked={row.selected}
                      onCheckedChange={() => toggleSelectSubject(row.key)}
                      className="size-5 rounded-md"
                    />
                    <div className="size-8 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/30">
                      <Layers className="size-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {row.subjectName}
                    </span>
                  </div>

                  {/* Date, Start Time & End Time */}
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-slate-400">Date</span>
                      <DatePicker
                        date={parseLocalDate(row.date)}
                        onChange={(d) => updateSubjectField(row.key, 'date', formatLocalDate(d))}
                        disabled={isSubjectDateDisabled}
                        className="h-10 w-full rounded-xl text-xs bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-slate-400">Start Time</span>
                        <TimePicker
                          value={row.startTime}
                          onChange={(v) => updateSubjectField(row.key, 'startTime', v)}
                          className="h-10 w-full rounded-xl text-xs bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-slate-400">End Time</span>
                        <TimePicker
                          value={row.endTime}
                          onChange={(v) => updateSubjectField(row.key, 'endTime', v)}
                          className="h-10 w-full rounded-xl text-xs bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Marks & Passing Marks */}
                  <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-slate-400">Total Marks</span>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                        <Input
                          type="number"
                          value={row.totalMarks}
                          onChange={(e) => updateSubjectField(row.key, 'totalMarks', e.target.value)}
                          className="pl-8.5 h-10 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-slate-400">Passing Marks</span>
                      <div className="relative">
                        <Star className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                        <Input
                          type="number"
                          value={row.passingMarks}
                          onChange={(e) => updateSubjectField(row.key, 'passingMarks', e.target.value)}
                          className="pl-8.5 h-10 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="h-11 px-5 rounded-2xl border-slate-200 dark:border-zinc-700 gap-2 shrink-0 flex-1 sm:flex-initial"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
              <Button variant="outline" onClick={onCancel} className="hidden sm:inline-flex h-11 px-5 rounded-xl border-slate-200 dark:border-zinc-700">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-5 sm:px-6 rounded-2xl font-semibold gap-2 shadow-sm shadow-blue-500/20 flex-1 sm:flex-initial justify-center"
              >
                <span>Next</span>
                <span className="hidden sm:inline">: Assign Teachers</span>
                <span className="sm:hidden">: Assign Teachers</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Assign Teachers - Categorized / Grouped per Class Section */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Assign Teachers</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Teachers are categorized below by class section. Each class has its own subject teachers assigned.
                </p>
              </div>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <UserCheck className="size-4" />
              <span>{currentBulkRows.filter(r => r.selected).length * selectedClasses.length} Exam Papers Across {selectedClasses.length} Class(es)</span>
            </div>
          </div>

          {/* Grouped Tables by Class Section */}
          <div className="space-y-6">
            {selectedClasses.map((cls, classIndex) => {
              const clsSubjects = subjects.filter(s => s.classId === cls.id);
              const chosenUniversalRows = currentBulkRows.filter(r => r.selected);

              return (
                <div key={cls.id} className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
                  {/* Class Category Header */}
                  <div className="bg-slate-100/80 dark:bg-zinc-800/80 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {cls.section || (classIndex + 1)}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-800 dark:text-zinc-100">
                          {cls.name} - Section {cls.section}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 text-[11px]">
                      Class {classIndex + 1} of {selectedClasses.length}
                    </Badge>
                  </div>

                  {/* Class Subjects & Teachers Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/60 dark:bg-zinc-900/60">
                        <TableRow className="border-b border-slate-200/80 dark:border-zinc-800">
                          <TableHead className="w-12 text-center text-xs font-bold text-slate-700 dark:text-zinc-300">#</TableHead>
                          <TableHead className="min-w-[180px] text-xs font-bold text-slate-700 dark:text-zinc-300">Subject</TableHead>
                          <TableHead className="min-w-[200px] text-xs font-bold text-slate-700 dark:text-zinc-300">Current Teacher</TableHead>
                          <TableHead className="min-w-[220px] text-xs font-bold text-slate-700 dark:text-zinc-300">Change Teacher (Optional)</TableHead>
                          <TableHead className="min-w-[220px] text-xs font-bold text-slate-700 dark:text-zinc-300">Schedule Preview</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chosenUniversalRows.map((univRow, idx) => {
                          const matchedSub = clsSubjects.find(
                            s => s.name.trim().toLowerCase() === univRow.key
                          );

                          const teacherKey = `${cls.id}_${univRow.key}`;
                          const currentTeacherId = matchedSub?.teacherId;
                          const currentTeacherObj = teachers.find(t => t.id === currentTeacherId);
                          const currentTeacherName = currentTeacherObj?.name || (matchedSub as any)?.teacherName || 'Not Assigned';
                          const assignedTeacherId = classTeacherAssignments[teacherKey] ?? currentTeacherId ?? '';

                          const initials = currentTeacherName
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase();

                          const colors = [
                            { bg: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400' },
                            { bg: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
                            { bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
                            { bg: 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400' },
                            { bg: 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' },
                            { bg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400' }
                          ];
                          const colorScheme = colors[idx % colors.length];

                          return (
                            <TableRow key={univRow.key} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 border-b border-slate-100 dark:border-zinc-800">
                              {/* # */}
                              <TableCell className="text-center font-medium text-slate-500 text-xs">
                                {idx + 1}
                              </TableCell>

                              {/* Subject */}
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className={`size-8 rounded-lg ${colorScheme.bg} flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs`}>
                                    <Layers className="size-4" />
                                  </div>
                                  <div>
                                    <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200">
                                      {univRow.subjectName}
                                    </span>
                                    {univRow.code && (
                                      <span className="text-[11px] text-slate-400 ml-1.5">({univRow.code})</span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>

                              {/* Current Teacher */}
                              <TableCell>
                                <div className="flex items-center gap-2.5">
                                  <div className="size-7 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                                    {initials || 'NA'}
                                  </div>
                                  <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                                    {currentTeacherName}
                                  </span>
                                </div>
                              </TableCell>

                              {/* Change Teacher (Optional) */}
                              <TableCell>
                                <Select
                                  value={assignedTeacherId || 'none'}
                                  onValueChange={(v) => {
                                    setClassTeacherAssignments(prev => ({
                                      ...prev,
                                      [teacherKey]: v === 'none' ? '' : v
                                    }));
                                  }}
                                >
                                  <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 font-medium">
                                    <SelectValue placeholder="Keep current teacher" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl max-h-56">
                                    <SelectItem value="none">
                                      {currentTeacherName !== 'Not Assigned' ? `${currentTeacherName} (Current)` : 'Keep Unassigned'}
                                    </SelectItem>
                                    {teachers.map(t => (
                                      <SelectItem key={t.id} value={t.id}>
                                        {t.name || t.fullName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>

                              {/* Schedule Preview */}
                              <TableCell>
                                <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-zinc-400">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="size-3.5 text-slate-400" />
                                    <span>{univRow.date || 'TBD'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="size-3.5 text-slate-400" />
                                    <span>{univRow.startTime} - {univRow.endTime}</span>
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
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="h-10 px-3 sm:px-5 rounded-xl border-slate-200 dark:border-zinc-700 gap-1.5 shrink-0"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onCancel} className="h-10 px-3 sm:px-5 rounded-xl border-slate-200 dark:border-zinc-700">
                Cancel
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-3.5 sm:px-6 rounded-xl font-medium gap-1.5 sm:gap-2 shadow-sm shadow-blue-500/20"
              >
                <span>Next</span>
                <span className="hidden sm:inline">: Review & Create</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Create */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-2">
            <div className="size-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold flex items-center justify-center text-sm">
              4
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Review & Create Exam</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Confirm all exam details and schedule before publishing.</p>
            </div>
          </div>

          {/* Summary Box */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Exam Name</p>
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{examName}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Class</p>
              {(() => {
                const rawName = selectedClasses[0]?.name || selectedGrade || 'Class 1';
                const cleanName = rawName.toLowerCase().startsWith('class') 
                  ? rawName 
                  : `Class ${rawName.replace(/^grade\s*/i, '')}`;
                const sectionsList = selectedClasses.map(c => c.section).filter(Boolean);
                const sectionsDisplay = sectionsList.length > 0 ? sectionsList.join(', ') : 'All';
                
                return (
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                      {cleanName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Section: <span className="font-medium text-slate-700 dark:text-zinc-300">{sectionsDisplay}</span>
                    </p>
                  </div>
                );
              })()}
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Academic Year</p>
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{academicYear}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Duration</p>
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{startDate} to {endDate}</p>
            </div>
          </div>

          {/* Summary of Papers */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Exam Papers to Schedule ({currentBulkRows.filter(r => r.selected).length * selectedClasses.length} total across {selectedClasses.length} class{selectedClasses.length > 1 ? 'es' : ''})
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
              {currentBulkRows.filter(r => r.selected).map(row => (
                <div key={row.key} className="p-3.5 flex items-center justify-between bg-white dark:bg-zinc-900 text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">{row.subjectName}</span>
                      <span className="text-slate-400 ml-2">({row.totalMarks} Marks)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 dark:text-zinc-400 font-medium">
                    <span>{row.date}</span>
                    <span>{row.startTime} - {row.endTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(3)}
              disabled={submitting}
              className="h-10 px-3 sm:px-5 rounded-xl border-slate-200 dark:border-zinc-700 gap-1.5 shrink-0"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onCancel} disabled={submitting} className="h-10 px-3 sm:px-5 rounded-xl border-slate-200 dark:border-zinc-700">
                Cancel
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-3.5 sm:px-7 rounded-xl font-bold gap-1.5 sm:gap-2 shadow-md shadow-blue-500/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span className="hidden sm:inline">Create Exam Schedule</span>
                    <span className="sm:hidden">Create</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal: "Exam Created Successfully!" matching mockup */}
      {createdSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center space-y-6 animate-in zoom-in-95 duration-200">
            {/* Close X Button */}
            <button
              type="button"
              onClick={onSuccess}
              className="absolute top-4 right-4 size-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-600 dark:text-zinc-400 flex items-center justify-center transition-colors"
            >
              <X className="size-4" />
            </button>

            {/* Confetti & Success Checkmark Icon */}
            <div className="relative mx-auto size-24 flex items-center justify-center">
              {/* Confetti dots / accents */}
              <div className="absolute top-1 left-2 size-2 rounded-full bg-blue-500 animate-bounce delay-100" />
              <div className="absolute top-0 right-4 size-2.5 rounded-sm bg-blue-600 rotate-45" />
              <div className="absolute bottom-2 left-3 size-2 rounded-full bg-pink-500" />
              <div className="absolute top-6 right-0 size-2 rounded-full bg-amber-400" />
              <div className="absolute bottom-1 right-3 size-2 rounded-sm bg-emerald-400 rotate-12" />
              <div className="absolute -top-1 left-8 size-2 rounded-sm bg-orange-500 rotate-45" />

              {/* Main Green Checkmark Circle */}
              <div className="size-20 rounded-full bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-8 ring-emerald-50 dark:ring-emerald-950/30">
                <Check className="size-10 stroke-[3.5]" />
              </div>
            </div>

            {/* Heading & Subtitle */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Exam Created Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-zinc-200">{createdSummary.examName}</span> has been created for{' '}
                <span className="font-semibold text-slate-700 dark:text-zinc-200">{createdSummary.className}</span> with{' '}
                <span className="font-semibold text-slate-700 dark:text-zinc-200">{createdSummary.totalSubjects} subjects</span>.
              </p>
            </div>

            {/* Info Badges Card */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Calendar className="size-3.5 shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Start Date</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">
                  {createdSummary.startDate}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Calendar className="size-3.5 shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">End Date</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">
                  {createdSummary.endDate}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <BookOpen className="size-3.5 shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Subjects</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                  {createdSummary.totalSubjects}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onSuccess}
                className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-medium border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
              >
                View Exam Details
              </Button>
              <Button
                onClick={onSuccess}
                className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
              >
                Go to Exams
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
