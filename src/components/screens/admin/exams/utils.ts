import { ExamRecord } from './types';

export const getGroupedExams = (examsList: ExamRecord[]) => {
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
