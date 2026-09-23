import { useMemo } from 'react';
import { ExamRecord } from '../types';
import { ProcessedExam } from './ActiveExamTableRow';
import { TabType } from './ActiveExamsTabs';

interface UseActiveExamsDataProps {
  exams: ExamRecord[];
  activeTab: TabType;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
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
      let examStatus: 'upcoming' | 'in_progress' | 'completed' | 'draft' = 'upcoming';
      if (exam.status === 'completed') {
        examStatus = 'completed';
      } else if (exam.date && exam.date < todayStr) {
        examStatus = 'completed';
      } else if (exam.date && exam.date === todayStr) {
        examStatus = 'in_progress';
      } else if (exam.status === 'scheduled') {
        examStatus = 'upcoming';
      } else {
        examStatus = 'draft';
      }

      let cleanClass = exam.className || 'Class 10';
      if (!cleanClass.toLowerCase().startsWith('class')) {
        cleanClass = cleanClass.replace(/^grade\s*/i, '');
        cleanClass = `Class ${cleanClass}`;
      } else {
        cleanClass = cleanClass.replace(/^class\s*grade\s*/i, 'Class ');
      }

      const key = `${exam.name}___${exam.classId || exam.className}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: exam.id,
          rawIds: [exam.id],
          name: exam.name,
          description: exam.subjectName ? `Exam for ${exam.subjectName}` : 'School examination',
          className: cleanClass,
          classId: exam.classId,
          examType: exam.examType || 'unit_test',
          startDate: exam.date || todayStr,
          endDate: exam.date || todayStr,
          status: examStatus,
          subjectCount: 1,
        });
      } else {
        const item = groupedMap.get(key)!;
        item.rawIds.push(exam.id);
        item.subjectCount += 1;
        if (exam.date && exam.date < item.startDate) item.startDate = exam.date;
        if (exam.date && exam.date > item.endDate) item.endDate = exam.date;
        if (examStatus === 'in_progress' && item.status !== 'in_progress') {
          item.status = 'in_progress';
        }
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
