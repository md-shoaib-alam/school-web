import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { parseLocalDate } from '@/lib/utils';
import { ClassOption, SubjectOption } from '../types';
import { GradeGroup, BulkSubjectRow, CreatedExamSummary } from './wizardTypes';

interface UseCreateExamWizardProps {
  classes: ClassOption[];
  subjects: SubjectOption[];
  currentAcademicYear: string;
  teachers?: any[];
  onSuccess: () => void;
}

export function useCreateExamWizard({
  classes,
  subjects,
  currentAcademicYear,
  teachers = [],
  onSuccess,
}: UseCreateExamWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Selection Mode: default to 'grade' (Class-wise: All Sections)
  const [selectionMode, setSelectionMode] = useState<'section' | 'grade'>('grade');
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    return classes[0]?.grade || classes[0]?.name || '';
  });

  // Group classes by grade/level
  const gradeGroups: GradeGroup[] = useMemo(() => {
    const map = new Map<string, ClassOption[]>();
    classes.forEach((c) => {
      const key = c.grade || c.name || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries()).map(([gradeName, classList]) => ({
      gradeName,
      classList,
    }));
  }, [classes]);

  // Default selected classes to all sections of the first grade
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(() => {
    if (classes.length === 0) return [];
    const firstKey = classes[0]?.grade || classes[0]?.name || '';
    const matching = classes.filter((c) => (c.grade || c.name || '') === firstKey);
    return matching.length > 0 ? matching.map((c) => c.id) : [classes[0].id];
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
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');

  const handleSelectGrade = (gradeName: string) => {
    setSelectedGrade(gradeName);
    const targetGroup = gradeGroups.find((g) => g.gradeName === gradeName);
    if (targetGroup) {
      setSelectedClassIds(targetGroup.classList.map((c) => c.id));
    }
  };

  const handleSelectSectionClass = (cid: string) => {
    setSelectedClassIds([cid]);
  };

  const selectedClasses = useMemo(() => {
    return classes.filter((c) => selectedClassIds.includes(c.id));
  }, [classes, selectedClassIds]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isPastDate = useMemo(
    () => (date: Date) => {
      return date < today;
    },
    [today]
  );

  const isEndDateDisabled = useMemo(
    () => (date: Date) => {
      if (date < today) return true;
      if (startDate) {
        const parsedStart = parseLocalDate(startDate);
        if (parsedStart) {
          parsedStart.setHours(0, 0, 0, 0);
          return date < parsedStart;
        }
      }
      return false;
    },
    [today, startDate]
  );

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (endDate && newStart > endDate) {
      setEndDate(newStart);
    }
  };

  const isSubjectDateDisabled = useMemo(
    () => (date: Date) => {
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
    },
    [today, startDate, endDate]
  );

  // Subjects belonging to all selected classes
  const selectedClassesSubjects = useMemo(() => {
    return subjects.filter((s: any) => selectedClassIds.includes(s.classId));
  }, [subjects, selectedClassIds]);

  // Distinct subjects by name/code for step 2 schedule config
  const distinctSubjects = useMemo(() => {
    const map = new Map<string, { key: string; name: string; code?: string; sampleId: string }>();
    selectedClassesSubjects.forEach((s) => {
      const key = s.name.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: s.name.trim(),
          code: s.code,
          sampleId: s.id,
        });
      }
    });
    return Array.from(map.values());
  }, [selectedClassesSubjects]);

  const [selectedSubjectKeys, setSelectedSubjectKeys] = useState<Set<string>>(() => {
    return new Set(distinctSubjects.map((d) => d.key));
  });

  const [subjectConfig, setSubjectConfig] = useState<
    Record<
      string,
      {
        date: string;
        startTime: string;
        endTime: string;
        totalMarks: string;
        passingMarks: string;
      }
    >
  >({});

  const [classTeacherAssignments, setClassTeacherAssignments] = useState<Record<string, string>>(
    {}
  );

  const currentBulkRows: BulkSubjectRow[] = useMemo(() => {
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
        passingMarks: existing?.passingMarks || '40',
      };
    });
  }, [distinctSubjects, selectedSubjectKeys, subjectConfig, startDate]);

  const updateSubjectField = (key: string, field: string, val: string) => {
    setSubjectConfig((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {
          date: startDate,
          startTime: '09:00',
          endTime: '11:00',
          totalMarks: '100',
          passingMarks: '40',
        }),
        [field]: val,
      },
    }));
  };

  const toggleSelectSubject = (key: string) => {
    setSelectedSubjectKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAllSubjects = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedSubjectKeys(new Set(distinctSubjects.map((s) => s.key)));
    } else {
      setSelectedSubjectKeys(new Set());
    }
  };

  const selectedCount = selectedSubjectKeys.size;

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
    const missingDate = currentBulkRows.some((r) => r.selected && !r.date);
    if (missingDate) {
      toast.error('Please specify examination dates for all selected subjects');
      return false;
    }
    return true;
  };

  const [createdSummary, setCreatedSummary] = useState<CreatedExamSummary | null>(null);

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const chosenUniversalRows = currentBulkRows.filter((r) => r.selected);
      let totalCreatedCount = 0;

      for (const cls of selectedClasses) {
        const clsSubs = subjects.filter((s) => s.classId === cls.id);
        const examsPayload = chosenUniversalRows
          .map((row) => {
            const matchedSub = clsSubs.find((s) => s.name.trim().toLowerCase() === row.key);
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
              teacherId: assignedTeacherId || undefined,
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
            exams: examsPayload,
          };

          const res = await apiFetch('/api/exams/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || `Failed to create exams for ${cls.name} - ${cls.section}`);
          }
          totalCreatedCount += examsPayload.length;
        }
      }

      toast.success(
        `Successfully created ${totalCreatedCount} exam papers across ${selectedClasses.length} class(es)!`
      );

      const classLabel =
        selectionMode === 'grade'
          ? selectedGrade.toLowerCase().startsWith('grade') ||
            selectedGrade.toLowerCase().startsWith('class')
            ? selectedGrade
            : `Class ${selectedGrade}`
          : selectedClasses[0]
          ? `${selectedClasses[0].name} - ${selectedClasses[0].section}`
          : 'Selected Class';

      setCreatedSummary({
        examName: examName.trim(),
        className: classLabel,
        totalSubjects: chosenUniversalRows.length,
        startDate,
        endDate,
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error creating examination schedule');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    submitting,
    selectionMode,
    setSelectionMode,
    selectedGrade,
    handleSelectGrade,
    selectedClassIds,
    handleSelectSectionClass,
    gradeGroups,
    selectedClasses,
    examName,
    setExamName,
    examType,
    setExamType,
    academicYear,
    setAcademicYear,
    startDate,
    handleStartDateChange,
    endDate,
    setEndDate,
    description,
    setDescription,
    isPastDate,
    isEndDateDisabled,
    isSubjectDateDisabled,
    distinctSubjects,
    currentBulkRows,
    selectedCount,
    updateSubjectField,
    toggleSelectSubject,
    toggleAllSubjects,
    classTeacherAssignments,
    setClassTeacherAssignments,
    validateStep1,
    validateStep2,
    createdSummary,
    handleFinalSubmit,
  };
}
