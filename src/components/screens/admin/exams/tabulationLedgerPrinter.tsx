import React from 'react';
import { apiFetch } from '@/lib/api';
import { goeyToast as toast } from 'goey-toast';
import { ExamRecord } from './types';

export interface TabulationRow {
  id: string;
  name: string;
  rollNumber: string;
  subjectMarks: Record<string, { marksObtained: number; totalMarks: number; status: string }>;
  totalObtained: number;
  totalMax: number;
  percentage: string;
  percentageVal: number;
  grade: string;
  status: string;
}

export interface LedgerData {
  className: string;
  classSection: string;
  academicYear: string;
  schoolName: string;
  subjectsList: string[];
  subjectMaxMarks: Record<string, number>;
  studentsTabulation: TabulationRow[];
  totalStudents: number;
  passCount: number;
  failCount: number;
  pendingCount: number;
  classAverage: string;
  ledgerTitle: string;
}

interface ExamResultDetail {
  examId: string;
  examName: string;
  subjectName: string;
  totalMarks: number;
  results: any[];
}

const getGrade = (percentageVal: number, status: string): string => {
  if (status === 'PENDING') return 'PENDING';
  if (status === 'FAIL' || percentageVal < 40) return 'F';
  if (percentageVal >= 90) return 'A+';
  if (percentageVal >= 80) return 'A';
  if (percentageVal >= 70) return 'B';
  if (percentageVal >= 60) return 'C';
  if (percentageVal >= 50) return 'D';
  return 'E';
};

export const compileTabularLedgerData = async ({
  classId,
  className,
  classSection,
  academicYear,
}: {
  classId: string;
  className: string;
  classSection: string;
  academicYear: string;
}): Promise<LedgerData | null> => {
  try {
    // 1. Fetch students & exams
    const [studentsRes, examsRes] = await Promise.all([
      apiFetch(`/api/students?classId=${classId}&mode=min&limit=1000`),
      apiFetch(`/api/exams?classId=${classId}&limit=100`)
    ]);

    const studentData = await studentsRes.json();
    const examData = await examsRes.json();

    const loadedStudents = studentData.items || [];
    const completedExams = (examData.data || examData || []).filter(
      (e: ExamRecord) => e.status === 'completed' && e.academicYear === academicYear
    );

    if (loadedStudents.length === 0) {
      toast.error('No students found in this class.');
      return null;
    }

    if (completedExams.length === 0) {
      toast.error('No completed exams found for this academic cycle.');
      return null;
    }

    // 2. Fetch results for each completed exam in parallel
    const resultsPromises = completedExams.map(async (exam: ExamRecord): Promise<ExamResultDetail> => {
      try {
        const res = await apiFetch(`/api/exams/results?examId=${exam.id}`);
        const data = await res.json();
        return { 
          examId: exam.id, 
          examName: exam.name, 
          subjectName: exam.subjectName, 
          totalMarks: exam.totalMarks, 
          results: data.results || [] 
        };
      } catch (err) {
        console.error(`Error loading results for exam ${exam.id}:`, err);
        return { 
          examId: exam.id, 
          examName: exam.name, 
          subjectName: exam.subjectName, 
          totalMarks: exam.totalMarks, 
          results: [] 
        };
      }
    });

    const allExamResults: ExamResultDetail[] = await Promise.all(resultsPromises);

    // 3. Compile tabulation data
    const subjectMaxMarks: Record<string, number> = {};
    allExamResults.forEach((er: ExamResultDetail) => {
      subjectMaxMarks[er.subjectName] = er.totalMarks;
    });

    let totalStudents = loadedStudents.length;
    let passCount = 0;
    let failCount = 0;
    let pendingCount = 0;
    let sumPercentages = 0;

    const studentsTabulation: TabulationRow[] = loadedStudents.map((student: any) => {
      let totalObtained = 0;
      let totalMax = 0;
      const subjectMarks: Record<string, { marksObtained: number; totalMarks: number; status: string }> = {};

      allExamResults.forEach((er: ExamResultDetail) => {
        const res = er.results.find((r: any) => r.studentId === student.id);
        if (res) {
          const marks = res.marksObtained || 0;
          subjectMarks[er.subjectName] = {
            marksObtained: marks,
            totalMarks: er.totalMarks,
            status: res.status || 'pending'
          };
          totalObtained += marks;
          totalMax += er.totalMarks;
        } else {
          subjectMarks[er.subjectName] = {
            marksObtained: 0,
            totalMarks: er.totalMarks,
            status: 'pending'
          };
          totalMax += er.totalMarks;
        }
      });

      const percentageVal = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      sumPercentages += percentageVal;
      
      let hasFail = false;
      let hasPending = false;
      Object.values(subjectMarks).forEach(s => {
        if (s.status === 'fail') hasFail = true;
        if (s.status === 'pending' || s.status === 'absent') hasPending = true;
      });

      let overallStatus = 'PASS';
      if (hasPending) {
        overallStatus = 'PENDING';
        pendingCount++;
      } else if (hasFail || percentageVal < 40) {
        overallStatus = 'FAIL';
        failCount++;
      } else {
        passCount++;
      }

      const grade = getGrade(percentageVal, overallStatus);

      return {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber || '-',
        subjectMarks,
        totalObtained,
        totalMax,
        percentageVal,
        percentage: percentageVal.toFixed(1) + '%',
        grade,
        status: overallStatus
      };
    });

    const subjectsList: string[] = Array.from(new Set(allExamResults.map((er: ExamResultDetail) => er.subjectName)));
    const schoolName = loadedStudents[0]?.schoolName || 'SCHOOL ERP ACADEMY';
    const classAverage = totalStudents > 0 ? (sumPercentages / totalStudents).toFixed(1) + '%' : '0.0%';

    // Generate dynamic title based on the actual completed exams for this class
    const uniqueExamNames = Array.from(new Set(completedExams.map((e: ExamRecord) => {
      if (e.name) return e.name.trim();
      if (e.examType === 'midterm') return 'Mid-Term Exam';
      if (e.examType === 'final') return 'Final Exam';
      return e.examType;
    })));

    const ledgerTitle = uniqueExamNames.length > 0 
      ? `TABULATION SHEET - ${uniqueExamNames.join(' & ').toUpperCase()}`
      : 'CONSOLIDATED TABULAR RESULTS SHEET';

    return {
      className,
      classSection,
      academicYear,
      schoolName,
      subjectsList,
      subjectMaxMarks,
      studentsTabulation,
      totalStudents,
      passCount,
      failCount,
      pendingCount,
      classAverage,
      ledgerTitle,
    };
  } catch (err) {
    console.error('Error compiling tabulation data:', err);
    toast.error('Failed to compile tabulation data.');
    return null;
  }
};

export const TabularLedgerPrint = React.forwardRef<HTMLDivElement, { data: LedgerData }>((props, ref) => {
  const { data } = props;
  return (
    <div 
      ref={ref} 
      className="p-[5mm] bg-white text-slate-800 font-sans print:p-0 min-h-screen" 
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      <style type="text/css" media="print">
        {`
          @page { 
            size: landscape; 
            margin: 8mm 6mm 8mm 6mm; 
          } 
          body { 
            margin: 0; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
        `}
      </style>

      <div className="text-center mb-4 border-b-2 border-slate-200 pb-3">
        <h1 className="font-medium text-lg tracking-wider text-blue-900 uppercase">{data.schoolName}</h1>
        <h2 className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">{data.ledgerTitle}</h2>
        <div className="flex justify-center gap-10 mt-2 text-[10.5px] font-medium text-slate-600">
          <div>CLASS: <span className="text-blue-955">{data.className} - {data.classSection}</span></div>
          <div>ACADEMIC YEAR: <span className="text-blue-955">{data.academicYear}</span></div>
          <div>DATE GENERATED: <span className="text-blue-955">{new Date().toLocaleDateString()}</span></div>
        </div>
      </div>

      {/* Class performance statistics snapshot */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded p-2 mb-3 text-[9.5px] text-slate-600 font-medium">
        <div>TOTAL STUDENTS: <span className="text-blue-900">{data.totalStudents}</span></div>
        <div>PASSED: <span className="text-green-600">{data.passCount}</span></div>
        <div>FAILED: <span className="text-red-600">{data.failCount}</span></div>
        {data.pendingCount > 0 && <div>PENDING: <span className="text-amber-600">{data.pendingCount}</span></div>}
        <div>CLASS PASS RATE: <span className="text-blue-900">{data.totalStudents > 0 ? ((data.passCount / data.totalStudents) * 100).toFixed(1) + '%' : '0%'}</span></div>
        <div>CLASS AVERAGE: <span className="text-blue-900">{data.classAverage}</span></div>
      </div>

      <table className="w-full border-collapse border border-slate-300 text-[9.5px]">
        <thead>
          <tr className="bg-slate-100/60 text-slate-800 border-b border-slate-300 font-medium">
            <th className="border border-slate-300 p-1 text-center w-[40px] font-medium">S.NO</th>
            <th className="border border-slate-300 p-1 text-center w-[60px] font-medium">ROLL</th>
            <th className="border border-slate-300 p-1 text-left font-medium">STUDENT NAME</th>
            {data.subjectsList.map(sub => (
              <th key={sub} className="border border-slate-300 p-1 text-center font-medium">
                {sub} <br />
                <span className="text-[7.5px] text-slate-400 font-normal">({data.subjectMaxMarks[sub] || 100})</span>
              </th>
            ))}
            <th className="border border-slate-300 p-1 text-center w-[70px] font-medium">TOTAL</th>
            <th className="border border-slate-300 p-1 text-center w-[80px] font-medium">PERCENTAGE</th>
            <th className="border border-slate-300 p-1 text-center w-[50px] font-medium">GRADE</th>
            <th className="border border-slate-300 p-1 text-center w-[70px] font-medium">RESULT</th>
          </tr>
        </thead>
        <tbody>
          {data.studentsTabulation.map((student, idx) => (
            <tr key={idx} className="hover:bg-slate-50 border-b border-slate-200">
              <td className="border border-slate-300 p-1 text-center font-normal">{idx + 1}</td>
              <td className="border border-slate-300 p-1 text-center font-normal">{student.rollNumber}</td>
              <td className="border border-slate-300 p-1 text-left font-normal">{student.name}</td>
              {data.subjectsList.map(sub => {
                const marks = student.subjectMarks[sub];
                if (!marks) return <td key={sub} className="border border-slate-300 p-1 text-center text-slate-400 font-normal">-</td>;
                if (marks.status === 'pending') {
                  return (
                    <td key={sub} className="border border-slate-300 p-1 text-center text-slate-500 italic text-[9px] font-normal">
                      PENDING
                    </td>
                  );
                }
                if (marks.status === 'absent') {
                  return (
                    <td key={sub} className="border border-slate-300 p-1 text-center text-red-600 italic font-normal">
                      ABSENT
                    </td>
                  );
                }
                const isFailed = marks.status === 'fail';
                return (
                  <td key={sub} className={`border border-slate-300 p-1 text-center font-normal ${isFailed ? 'text-red-600' : ''}`}>
                    {marks.marksObtained}/{marks.totalMarks}
                  </td>
                );
              })}
              <td className="border border-slate-300 p-1 text-center font-normal bg-slate-50">{student.totalObtained}/{student.totalMax}</td>
              <td className="border border-slate-300 p-1 text-center font-normal bg-slate-50">{student.percentage}</td>
              <td className={`border border-slate-300 p-1 text-center font-medium ${
                student.grade === 'A+' || student.grade === 'A' ? 'text-blue-900 font-medium' : student.grade === 'F' ? 'text-red-600 font-medium' : 'text-slate-700'
              }`}>
                {student.grade}
              </td>
              <td className={`border border-slate-300 p-1 text-center font-medium ${
                student.status === 'PASS' ? 'text-green-600' : student.status === 'FAIL' ? 'text-red-600' : 'text-amber-600'
              }`}>
                {student.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-12 px-8 text-[10px] font-medium text-slate-400">
        <div className="flex flex-col items-center">
          <div className="w-[120px] border-b border-slate-200 mb-1"></div>
          <span>CLASS TEACHER</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[120px] border-b border-slate-200 mb-1"></div>
          <span>EXAM CONTROLLER</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[120px] border-b border-slate-200 mb-1"></div>
          <span>PRINCIPAL</span>
        </div>
      </div>
    </div>
  );
});

TabularLedgerPrint.displayName = 'TabularLedgerPrint';
