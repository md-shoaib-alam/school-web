import { useMemo } from 'react';
import { ExamRecord } from '../types';
import { ProcessedExam, ProcessedExamSubject } from './ActiveExamTableRow';
import { TabType } from './ActiveExamsTabs';

interface UseActiveExamsDataProps {
  exams: ExamRecord[];
  activeTab: TabType;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
}

export function extractBaseExamName(rawName: string, subjectName?: string): string {
  if (!rawName) return '';
  let name = rawName.trim();
  if (subjectName && subjectName.trim()) {
    const sName = subjectName.trim().toLowerCase();
    const suffix = ` - ${sName}`;
    if (name.toLowerCase().endsWith(suffix)) {
      name = name.slice(0, name.length - suffix.length).trim();
      return name;
    }
    const parenSuffix = ` (${sName})`;
    if (name.toLowerCase().endsWith(parenSuffix)) {
      name = name.slice(0, name.length - parenSuffix.length).trim();
      return name;
    }
  }
  return name;
}

export function useActiveExamsData({
  exams,
  activeTab,
  searchQuery,
  currentPage,
  pageSize,
}: UseActiveExamsDataProps) {
  // Group multiple subject exams of same exam name & class into clean top-level exam cycles
  const processedExams = useMemo(() => {
    const groupedMap = new Map<string, ProcessedExam>();
    const todayStr = new Date().toISOString().split('T')[0];

    exams.forEach((exam) => {
      const baseName = extractBaseExamName(exam.cleanExamName || exam.name, exam.subjectName);

      let cleanClass = exam.className || 'Class 10';
      if (!cleanClass.toLowerCase().startsWith('class')) {
        cleanClass = cleanClass.replace(/^grade\s*/i, '');
        cleanClass = `Class ${cleanClass}`;
      } else {
        cleanClass = cleanClass.replace(/^class\s*grade\s*/i, 'Class ');
      }

      const totalStudents = exam.totalStudents ?? 0;
      const marksEnteredCount = exam.marksEnteredCount ?? 0;
      let subjectStatus: 'completed' | 'in_progress' | 'not_started' = 'not_started';
      if (
        exam.status === 'completed' ||
        exam.status === 'published' ||
        (totalStudents > 0 && marksEnteredCount >= totalStudents)
      ) {
        subjectStatus = 'completed';
      } else if (marksEnteredCount > 0) {
        subjectStatus = 'in_progress';
      } else {
        subjectStatus = 'not_started';
      }

      const subjectItem: ProcessedExamSubject = {
        id: exam.id,
        subjectId: exam.subjectId,
        subjectName: exam.subjectName || 'Subject',
        teacherName: exam.teacherName || 'Assigned Teacher',
        totalStudents,
        marksEnteredCount,
        status: subjectStatus,
        date: exam.date || todayStr,
        startTime: exam.startTime,
        endTime: exam.endTime,
        totalMarks: Number(exam.totalMarks) || 100,
        passingMarks: Number(exam.passingMarks) || 40,
        fullExam: exam,
      };

      // Group by base exam name and normalized class so all sections (A, B, etc.) merge into a single row
      const key = `${baseName.toLowerCase().trim()}___${cleanClass.toLowerCase().trim()}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: exam.id,
          rawIds: [exam.id],
          name: baseName,
          description: exam.subjectName ? `Exam for ${exam.subjectName}` : 'School examination',
          className: cleanClass,
          classSection: exam.classSection || '',
          classId: exam.classId,
          examType: exam.examType || 'unit_test',
          startDate: exam.date || todayStr,
          endDate: exam.date || todayStr,
          status: 'upcoming',
          subjectCount: 1,
          subjects: [subjectItem],
          completion: {
            total: 1,
            completed: subjectStatus === 'completed' ? 1 : 0,
            inProgress: subjectStatus === 'in_progress' ? 1 : 0,
            notStarted: subjectStatus === 'not_started' ? 1 : 0,
            percentage: subjectStatus === 'completed' ? 100 : 0,
          },
          totalStudents,
          totalMarks: Number(exam.totalMarks) || 100,
          isPublished: exam.status === 'published' || exam.isPublished === true,
        });
      } else {
        const item = groupedMap.get(key)!;
        item.rawIds.push(exam.id);
        item.subjects.push(subjectItem);
        // Compute unique distinct subjects across sections (e.g. 5 subjects across Section A & B)
        const uniqueSubjectNames = new Set(item.subjects.map((s) => s.subjectName.toLowerCase().trim()));
        item.subjectCount = uniqueSubjectNames.size;
        if (exam.date && exam.date < item.startDate) item.startDate = exam.date;
        if (exam.date && exam.date > item.endDate) item.endDate = exam.date;
        if (exam.totalMarks) item.totalMarks += Number(exam.totalMarks) || 100;
        if (exam.status === 'published' || exam.isPublished === true) {
          item.isPublished = true;
        }
      }
    });

    // Finalize completion stats and status for each grouped exam cycle
    groupedMap.forEach((item) => {
      const total = item.subjects.length;
      const completed = item.subjects.filter((s) => s.status === 'completed').length;
      const inProgress = item.subjects.filter((s) => s.status === 'in_progress').length;
      const notStarted = item.subjects.filter((s) => s.status === 'not_started').length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      item.completion = { total, completed, inProgress, notStarted, percentage };

      // Ensure distinct subjectCount is accurate
      const uniqueSubjectNames = new Set(item.subjects.map((s) => s.subjectName.toLowerCase().trim()));
      item.subjectCount = uniqueSubjectNames.size;

      if (item.isPublished || (total > 0 && completed === total)) {
        item.status = 'completed';
      } else if (inProgress > 0 || completed > 0 || item.startDate === todayStr) {
        item.status = 'in_progress';
      } else if (item.startDate && item.startDate > todayStr) {
        item.status = 'upcoming';
      } else {
        item.status = 'draft';
      }
    });

    return Array.from(groupedMap.values());
  }, [exams]);

  const filteredExams = useMemo(() => {
    let result = processedExams;
    if (activeTab !== 'all') {
      result = result.filter((exam) => exam.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (exam) =>
          exam.name.toLowerCase().includes(q) ||
          exam.className.toLowerCase().includes(q) ||
          exam.description.toLowerCase().includes(q) ||
          exam.examType.toLowerCase().includes(q)
      );
    }
    return result;
  }, [processedExams, activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize));

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExams.slice(start, start + pageSize);
  }, [filteredExams, currentPage, pageSize]);

  return {
    processedExams,
    filteredExams,
    paginatedExams,
    totalPages,
  };
}
