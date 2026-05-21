'use client';

import { Cinzel, Montserrat, Inter } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

import { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '@/lib/api';
import { useAppStore } from '@/store/use-app-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, FileText, AlertCircle } from 'lucide-react';
import { useAcademicYears } from '@/hooks/use-academic-years';
import type { ExamRecord } from '@/components/screens/admin/exams/types';
import { MARKSHEET_TEMPLATES } from '@/components/screens/admin/exams/marksheet-templates';

export function StudentMarksheet() {
  const { currentUser } = useAppStore();
  const { academicYears } = useAcademicYears();

  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [resultsMap, setResultsMap] = useState<Record<string, any[]>>({});
  const [marksheetType, setMarksheetType] = useState<'midterm' | 'final' | 'combined'>('combined');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    if (academicYears.length > 0 && !selectedYear) {
      const current = academicYears.find((y: any) => y.isCurrent) || academicYears[0];
      if (current) setSelectedYear(current.name);
    }
  }, [academicYears, selectedYear]);

  const [templateId, setTemplateId] = useState<string>('classic');

  useEffect(() => {
    if (!selectedYear) return;
    const load = async () => {
      setLoading(true);
      try {
        const [meRes, settingsRes] = await Promise.all([
          apiFetch('/api/students/me'),
          apiFetch('/api/tenant-settings').catch(() => null)
        ]);

        if (!meRes.ok) throw new Error('Failed to fetch student info');
        const me = await meRes.json();
        setStudentInfo(me);

        if (settingsRes && settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData?.defaultMarksheetTemplateId) {
            setTemplateId(settingsData.defaultMarksheetTemplateId);
          }
        }

        const examsRes = await apiFetch(`/api/exams?classId=${me.classId}&limit=100`);
        const examsData = await examsRes.json();
        const completedExams = (examsData.data || examsData || []).filter(
          (e: ExamRecord) => e.status === 'completed' && e.academicYear === selectedYear
        );
        setExams(completedExams);

        if (completedExams.length > 0) {
          const resultsArr = await Promise.all(
            completedExams.map(async (exam: ExamRecord) => {
              try {
                const r = await apiFetch(`/api/exams/results?examId=${exam.id}`);
                const d = await r.json();
                return { examId: exam.id, results: d.results || [] };
              } catch { return { examId: exam.id, results: [] }; }
            })
          );
          const map: Record<string, any[]> = {};
          resultsArr.forEach(item => { map[item.examId] = item.results; });
          setResultsMap(map);
        } else setResultsMap({});
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedYear]);

  const subjectsList = useMemo(() => {
    const map: Record<string, { id: string; name: string }> = {};
    exams.forEach(e => { if (e.subjectId) map[e.subjectId] = { id: e.subjectId, name: e.subjectName }; });
    return Object.values(map);
  }, [exams]);

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', remarks: 'Outstanding performance!', color: 'text-emerald-600' };
    if (pct >= 80) return { grade: 'A',  remarks: 'Excellent work!', color: 'text-emerald-500' };
    if (pct >= 70) return { grade: 'B',  remarks: 'Very good effort.', color: 'text-blue-500' };
    if (pct >= 60) return { grade: 'C',  remarks: 'Good job, keep it up.', color: 'text-amber-500' };
    if (pct >= 50) return { grade: 'D',  remarks: 'Satisfactory performance.', color: 'text-orange-500' };
    if (pct >= 40) return { grade: 'E',  remarks: 'Pass, needs improvement.', color: 'text-zinc-600' };
    return { grade: 'F', remarks: 'Fail, needs significant improvement.', color: 'text-red-500' };
  };

  const marksheet = useMemo(() => {
    if (!studentInfo || subjectsList.length === 0) return null;
    const sid = studentInfo.id;
    let totalMax = 0, totalObtained = 0, hasFail = false, hasPending = false;

    const rows = subjectsList.map(sub => {
      const mid = exams.find(e => e.subjectId === sub.id && e.examType === 'midterm');
      const fin = exams.find(e => e.subjectId === sub.id && e.examType === 'final');
      const midRes = mid ? (resultsMap[mid.id] || []).find((r: any) => r.studentId === sid) : null;
      const finRes = fin ? (resultsMap[fin.id] || []).find((r: any) => r.studentId === sid) : null;

      const midM = midRes ? Number(midRes.marksObtained) : null;
      const finM = finRes ? Number(finRes.marksObtained) : null;
      const midMax = mid?.totalMarks || 0;
      const finMax = fin?.totalMarks || 0;

      let subMax = 0, subObt = 0, status: 'pass' | 'fail' | 'pending' = 'pending';
      if (marksheetType === 'midterm') {
        subMax = midMax; subObt = midM ?? 0; status = midRes ? midRes.status : 'pending';
      } else if (marksheetType === 'final') {
        subMax = finMax; subObt = finM ?? 0; status = finRes ? finRes.status : 'pending';
      } else {
        subMax = midMax + finMax; subObt = (midM ?? 0) + (finM ?? 0);
        if (midRes && finRes) {
          const passing = (mid?.passingMarks || 0) + (fin?.passingMarks || 0);
          status = subObt >= passing ? 'pass' : 'fail';
        } else if (midRes || finRes) status = 'pending';
      }

      if (subMax > 0) {
        totalMax += subMax; totalObtained += subObt;
        if (status === 'fail') hasFail = true;
        if (status === 'pending') hasPending = true;
      }
      const pct = subMax > 0 ? Math.round((subObt / subMax) * 100) : 0;
      return { subjectName: sub.name, midM, midMax, finM, finMax, subObt, subMax, pct, status };
    });

    const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const gradeInfo = getGrade(overallPct);
    const overallStatus: 'pass' | 'fail' | 'pending' = hasPending ? 'pending' : (hasFail || overallPct < 40) ? 'fail' : 'pass';
    return { rows, totalMax, totalObtained, overallPct, gradeInfo, overallStatus };
  }, [studentInfo, subjectsList, exams, resultsMap, marksheetType]);

  const remarks = useMemo(() => {
    if (!marksheet) return '';
    return marksheet.overallStatus === 'pending'
      ? 'Results pending for some subjects. Please check back once all results are published.'
      : marksheet.gradeInfo.remarks;
  }, [marksheet]);

  const compiledSheet = useMemo(() => {
    if (!marksheet || !studentInfo) return null;

    const subjectsData = marksheet.rows.map(row => {
      return {
        subjectName: row.subjectName,
        midtermMarks: row.midM !== null ? `${row.midM}/${row.midMax}` : '-',
        finalMarks: row.finM !== null ? `${row.finM}/${row.finMax}` : '-',
        obtained: row.subMax > 0 ? `${row.subObt}/${row.subMax}` : '-',
        percentage: row.pct,
        status: row.status
      };
    });

    return {
      studentName: studentInfo.name,
      rollNumber: studentInfo.rollNumber || '-',
      schoolName: studentInfo.schoolName || 'SCHOOL ERP ACADEMY',
      subjects: subjectsData,
      totalMaxMarks: marksheet.totalMax,
      totalObtainedMarks: marksheet.totalObtained,
      overallPercentage: marksheet.overallPct,
      grade: marksheet.gradeInfo.grade,
      remarks: remarks,
      color: marksheet.gradeInfo.color,
      status: marksheet.overallStatus
    };
  }, [marksheet, studentInfo, remarks]);

  const SelectedTemplate = useMemo(() => {
    return MARKSHEET_TEMPLATES.find(t => t.id === templateId)?.component || MARKSHEET_TEMPLATES[0].component;
  }, [templateId]);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-[600px] w-full rounded-xl" />
    </div>
  );

  if (!studentInfo) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <AlertCircle className="h-10 w-10 mb-3 opacity-50" />
      <p className="text-sm font-medium">Could not load student information.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-500" />
            My Marksheet
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {studentInfo.name} · {studentInfo.className} · Roll {studentInfo.rollNumber}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {academicYears.length > 0 && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((y: any) => (
                  <SelectItem key={y.id} value={y.name}>
                    {y.name}{y.isCurrent ? ' (Current)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={marksheetType} onValueChange={(v: any) => setMarksheetType(v)}>
            <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="combined">Combined</SelectItem>
              <SelectItem value="midterm">Midterm</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Sheet Preview ── */}
      {!compiledSheet || compiledSheet.subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 border-2 border-dashed rounded-xl">
          <GraduationCap className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm font-medium">No published exam results found for {selectedYear}</p>
          <p className="text-xs mt-1 opacity-60">Results will appear here once your teacher publishes them.</p>
        </div>
      ) : (
        <div className={`w-full overflow-x-auto pb-6 flex justify-center bg-zinc-50 dark:bg-zinc-950/20 p-4 sm:p-6 rounded-2xl ${cinzel.className} ${montserrat.className} ${inter.className}`}>
          <div 
            className="shrink-0 transition-all duration-300 shadow-2xl rounded-lg bg-white"
            style={{ 
              width: 794, 
              height: 1123 
            }}
          >
            {compiledSheet && (
              <SelectedTemplate 
                sheet={compiledSheet}
                classNameStr={studentInfo.className || ''}
                classSection={studentInfo.classSection || ''}
                academicYear={selectedYear}
                marksheetType={marksheetType}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
