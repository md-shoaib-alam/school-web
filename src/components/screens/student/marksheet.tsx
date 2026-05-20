'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '@/lib/api';
import { useAppStore } from '@/store/use-app-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, FileText, AlertCircle } from 'lucide-react';
import { useAcademicYears } from '@/hooks/use-academic-years';
import type { ExamRecord } from '@/components/screens/admin/exams/types';

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

  useEffect(() => {
    if (!selectedYear) return;
    const load = async () => {
      setLoading(true);
      try {
        const meRes = await apiFetch('/api/students/me');
        if (!meRes.ok) throw new Error('Failed to fetch student info');
        const me = await meRes.json();
        setStudentInfo(me);

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
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
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
      {!marksheet || marksheet.rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 border-2 border-dashed rounded-xl">
          <GraduationCap className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm font-medium">No published exam results found for {selectedYear}</p>
          <p className="text-xs mt-1 opacity-60">Results will appear here once your teacher publishes them.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-6 flex justify-center bg-zinc-150/40 dark:bg-zinc-950/20 p-4 sm:p-6 rounded-2xl">
          {/* Google Fonts Preload for Preview Card */}
          <link 
            rel="stylesheet" 
            href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" 
          />

          {/* Sheet Preview Card in True A4 dimensions: 794px width x 1123px height */}
          <div 
            className="relative bg-white text-slate-900 px-9 py-10 border-[6px] border-[#1e3a8a] rounded shadow-2xl overflow-hidden select-none flex flex-col justify-between shrink-0"
            style={{ width: 794, height: 1123 }}
          >
            
            {/* Gold Inner Inset Border */}
            <div className="absolute inset-2 border border-[#d4af37] pointer-events-none rounded z-10" />

            {/* Decorative Corner Accents */}
            <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t-2 border-l-2 border-[#d4af37] z-20" />
            <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t-2 border-r-2 border-[#d4af37] z-20" />
            <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b-2 border-l-2 border-[#d4af37] z-20" />
            <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b-2 border-r-2 border-[#d4af37] z-20" />

            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
              <div className="transform -rotate-[25deg] border-[3px] border-double border-blue-950/[0.015] rounded-full w-[450px] h-[450px] flex items-center justify-center">
                <span className="text-[26px] font-black text-blue-950/[0.03] tracking-[8px] uppercase whitespace-nowrap" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  OFFICIAL RECORD
                </span>
              </div>
            </div>

            {/* Core Document Content Flow */}
            <div className="space-y-5 relative z-10">
              
              {/* Crest & Logo Letterhead */}
              <div className="text-center pb-1">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-[#1e3a8a] border-2 border-[#d4af37] rounded-full flex items-center justify-center shadow-md relative">
                    <span className="text-xl filter drop-shadow">🎓</span>
                    <span className="absolute bottom-0.5 text-[6px] text-[#d4af37] font-bold">★</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-xl text-[#1e3a8a] tracking-wider leading-none" style={{ fontFamily: "'Cinzel', serif" }}>
                  {studentInfo.schoolName || 'SCHOOL ERP ACADEMY'}
                </h3>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Official Academic Transcript & Statement of Outcomes
                </p>
                <div className="w-16 h-0.5 bg-[#d4af37] mx-auto mt-2" />
              </div>

              {/* Title Box */}
              <div className="text-center">
                <h4 className="inline-block text-[11px] font-black uppercase text-[#1e3a8a] tracking-widest border border-[#1e3a8a] border-x-[4px] py-1.5 px-6 rounded bg-blue-50/50" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {marksheetType === 'midterm' ? 'Midterm Marksheet' : marksheetType === 'final' ? 'Final Marksheet' : 'Consolidated Report Card'}
                </h4>
              </div>

              {/* Student Info Block */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs border border-gray-200 p-4 rounded bg-zinc-50/70">
                <div className="flex gap-2">
                  <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider w-24 flex items-center shrink-0" style={{ fontFamily: "'Montserrat', sans-serif" }}>Student Name:</span>
                  <span className="font-bold text-zinc-900 truncate">{studentInfo.name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider w-24 flex items-center shrink-0" style={{ fontFamily: "'Montserrat', sans-serif" }}>Roll Number:</span>
                  <span className="font-bold text-zinc-900 font-mono">{studentInfo.rollNumber || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider w-24 flex items-center shrink-0" style={{ fontFamily: "'Montserrat', sans-serif" }}>Class & Section:</span>
                  <span className="font-bold text-zinc-900 truncate">{studentInfo.className || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider w-24 flex items-center shrink-0" style={{ fontFamily: "'Montserrat', sans-serif" }}>Academic Cycle:</span>
                  <span className="font-bold text-zinc-900">{selectedYear}</span>
                </div>
              </div>

              {/* Subject Table */}
              <div className="rounded border border-gray-200 overflow-hidden shadow-sm bg-white">
                <table className="w-full text-xs border-collapse table-fixed">
                  <thead>
                    <tr className="bg-[#1e3a8a] border-none text-white">
                      <th className={`font-bold px-3 py-2.5 text-left whitespace-normal ${marksheetType === 'combined' ? 'w-[28%]' : 'w-[45%]'}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>Subject Name</th>
                      {marksheetType === 'combined' && (
                        <th className="text-center font-bold px-2 py-2.5 whitespace-normal w-[12%]" style={{ fontFamily: "'Montserrat', sans-serif" }}>Midterm</th>
                      )}
                      {marksheetType === 'combined' && (
                        <th className="text-center font-bold px-2 py-2.5 whitespace-normal w-[12%]" style={{ fontFamily: "'Montserrat', sans-serif" }}>Final</th>
                      )}
                      <th className={`text-center font-bold px-3 py-2.5 whitespace-normal ${marksheetType === 'combined' ? 'w-[18%]' : 'w-[22%]'}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {marksheetType === 'combined' ? 'Combined Total' : 'Marks Obtained'}
                      </th>
                      <th className={`text-center font-bold px-3 py-2.5 whitespace-normal ${marksheetType === 'combined' ? 'w-[15%]' : 'w-[16%]'}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>Percentage</th>
                      <th className={`text-center font-bold px-3 py-2.5 whitespace-normal ${marksheetType === 'combined' ? 'w-[15%]' : 'w-[17%]'}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marksheet.rows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-150 hover:bg-zinc-50/50 transition-colors">
                        <td className="font-bold text-zinc-800 px-3 py-2.5 truncate text-left">
                          {row.subjectName}
                        </td>
                        {marksheetType === 'combined' && (
                          <td className="text-center font-mono text-zinc-500 px-2 py-2.5">
                            {row.midM !== null ? `${row.midM}/${row.midMax}` : '—'}
                          </td>
                        )}
                        {marksheetType === 'combined' && (
                          <td className="text-center font-mono text-zinc-500 px-2 py-2.5">
                            {row.finM !== null ? `${row.finM}/${row.finMax}` : '—'}
                          </td>
                        )}
                        <td className="text-center font-black text-zinc-950 font-mono px-3 py-2.5">
                          {row.subMax > 0 ? `${row.subObt}/${row.subMax}` : '—'}
                        </td>
                        <td className="text-center font-black text-[#1e3a8a] font-mono px-3 py-2.5">
                          {row.subMax > 0 ? `${row.pct}%` : '—'}
                        </td>
                        <td className="text-center px-3 py-2.5">
                          {row.status === 'pass' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                              pass
                            </span>
                          )}
                          {row.status === 'fail' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider bg-red-50 text-red-700 border border-red-200 uppercase">
                              fail
                            </span>
                          )}
                          {row.status === 'pending' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                              pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Grading Scale Detail */}
              <div className="grid grid-cols-7 gap-1 border border-gray-200 bg-zinc-50 rounded p-2 text-[9px] text-zinc-500 text-center font-semibold">
                <div className="border-r border-gray-200 last:border-none"><span className="font-bold text-[#1e3a8a]">A+</span> (90%+)</div>
                <div className="border-r border-gray-200 last:border-none"><span className="font-bold text-[#1e3a8a]">A</span> (80-89%)</div>
                <div className="border-r border-gray-200 last:border-none"><span className="font-bold text-[#1e3a8a]">B</span> (70-79%)</div>
                <div className="border-r border-gray-200 last:border-none"><span className="font-bold text-[#1e3a8a]">C</span> (60-69%)</div>
                <div className="border-r border-gray-200 last:border-none"><span className="font-bold text-[#1e3a8a]">D</span> (50-59%)</div>
                <div className="border-r border-gray-200 last:border-none"><span className="font-bold text-[#1e3a8a]">E</span> (40-49%)</div>
                <div className="last:border-none"><span className="font-bold text-[#1e3a8a]">F</span> (&lt;40%)</div>
              </div>

              {/* Remarks & Stats Grid */}
              <div className="grid grid-cols-12 gap-4 pt-1">
                <div className="col-span-7 p-4 border border-gray-200 rounded bg-zinc-50/50 flex flex-col justify-center">
                  <p className="text-[9.5px] uppercase font-bold text-[#1e3a8a] tracking-wider mb-1.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>Teacher Remarks & Evaluation</p>
                  <p className="text-xs font-semibold text-zinc-700 italic leading-relaxed">
                    "{remarks}" The student has demonstrated {marksheet.overallStatus === 'pass' ? 'satisfactory academic standards.' : 'need for substantial core reinforcement.'}
                  </p>
                </div>

                <div className="col-span-5 p-4 border border-gray-200 rounded bg-zinc-50/50 space-y-2.5">
                  <div className="flex justify-between text-xs font-semibold border-b border-gray-200 pb-1.5 text-zinc-500">
                    <span className="uppercase text-[9px] tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Aggregate Marks:</span>
                    <span className="text-zinc-900 font-bold font-mono">{marksheet.totalObtained} / {marksheet.totalMax}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold border-b border-gray-200 pb-1.5 text-zinc-500">
                    <span className="uppercase text-[9px] tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Percentage:</span>
                    <span className="text-[#1e3a8a] font-bold font-mono">{marksheet.overallPct}%</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold border-b border-gray-200 pb-1.5 text-zinc-500">
                    <span className="uppercase text-[9px] tracking-wide flex items-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>Overall Grade:</span>
                    <span className={`font-black text-sm ${marksheet.gradeInfo.color}`}>{marksheet.gradeInfo.grade}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                    <span className="uppercase text-[9px] tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Academic Standing:</span>
                    {marksheet.overallStatus === 'pass' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">PASS</span>
                    )}
                    {marksheet.overallStatus === 'fail' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider bg-red-50 text-red-700 border border-red-200 uppercase">FAIL</span>
                    )}
                    {marksheet.overallStatus === 'pending' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider bg-amber-50 text-amber-700 border border-amber-200 uppercase">PENDING</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Visual Signature & Seal Segment - Pinned to the bottom margin */}
            <div className="relative z-10 flex justify-between items-end text-[9.5px] font-bold text-zinc-500 border-t border-dashed border-gray-200 pt-6">
              <div className="flex flex-col items-center">
                <span>Date of Issue: {new Date().toLocaleDateString()}</span>
              </div>

              <div className="flex gap-10">
                <div className="flex flex-col items-center">
                  <div className="w-20 border-b border-zinc-300 mb-1" />
                  <span>CLASS TEACHER</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 border-b border-zinc-300 mb-1" />
                  <span>PRINCIPAL</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
