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

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Printer, BookOpen, GraduationCap, Calendar, Clock, Loader2,
  AlertCircle, CheckCircle2, XCircle, Award, FileText, User, Search, ArrowLeft, Layout
} from 'lucide-react';
import { ExamRecord } from './types';
import { useMemo, useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { goeyToast as toast } from 'goey-toast';
import { useReactToPrint } from 'react-to-print';
import { MARKSHEET_TEMPLATES } from './marksheet-templates';

interface MarksheetPreviewPageProps {
  classId: string;
  classNameStr: string; // e.g. "Grade 10"
  classSection: string; // e.g. "A"
  academicYear: string;
  onBack: () => void;
}

export function MarksheetPreviewPage({
  classId,
  classNameStr,
  classSection,
  academicYear,
  onBack
}: MarksheetPreviewPageProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [marksheetType, setMarksheetType] = useState<'midterm' | 'final' | 'combined'>('combined');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('classic');
  
  const [students, setStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [resultsMap, setResultsMap] = useState<Record<string, any[]>>({}); // examId -> results
  
  const [loading, setLoading] = useState<boolean>(false);
  const [printing, setPrinting] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(0.6); // Default to 60% zoom so one full A4 sheet fits perfectly on screen!

  const printContainerRef = useRef<HTMLDivElement>(null);

  // Load students, completed exams, and parallel results
  useEffect(() => {
    if (!classId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Students & Completed Exams for this class, and Tenant Settings
        const [studentsRes, examsRes, settingsRes] = await Promise.all([
          apiFetch(`/api/students?classId=${classId}&mode=min&limit=1000`),
          apiFetch(`/api/exams?classId=${classId}&limit=100`),
          apiFetch(`/api/tenant-settings`).catch(() => null)
        ]);

        const studentData = await studentsRes.json();
        const examData = await examsRes.json();
        if (settingsRes && settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData?.defaultMarksheetTemplateId) {
            setSelectedTemplateId(settingsData.defaultMarksheetTemplateId);
          }
        }

        const loadedStudents = studentData.items || [];
        // Only consider completed (published) exams
        const completedExams = (examData.data || examData || []).filter(
          (e: ExamRecord) => e.status === 'completed' && e.academicYear === academicYear
        );

        setStudents(loadedStudents);
        setExams(completedExams);

        // 2. Fetch results in parallel for each completed exam
        if (completedExams.length > 0) {
          const resultsPromises = completedExams.map(async (exam: ExamRecord) => {
            try {
              const res = await apiFetch(`/api/exams/results?examId=${exam.id}`);
              const data = await res.json();
              return { examId: exam.id, results: data.results || [] };
            } catch (err) {
              console.error(`Error loading results for exam ${exam.id}:`, err);
              return { examId: exam.id, results: [] };
            }
          });

          const allResults = await Promise.all(resultsPromises);
          const map: Record<string, any[]> = {};
          allResults.forEach(item => {
            map[item.examId] = item.results;
          });
          setResultsMap(map);
        } else {
          setResultsMap({});
        }
      } catch (err) {
        console.error("Failed to load marksheet data:", err);
        toast.error("Failed to fetch exam results data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [classId, academicYear]);

  // Clean student selection state when opened
  useEffect(() => {
    setSelectedStudentId('all');
    setMarksheetType('combined');
  }, [classId]);

  // Extract unique subjects from exams
  const subjectsList = useMemo(() => {
    const map: Record<string, { id: string; name: string }> = {};
    exams.forEach(e => {
      if (e.subjectId) {
        map[e.subjectId] = { id: e.subjectId, name: e.subjectName };
      }
    });
    return Object.values(map);
  }, [exams]);

  // Grade Boundaries Helper
  const getGradeAndRemarks = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', remarks: 'Outstanding performance!', color: 'text-emerald-600 dark:text-emerald-400' };
    if (percentage >= 80) return { grade: 'A', remarks: 'Excellent work!', color: 'text-emerald-500 dark:text-emerald-300' };
    if (percentage >= 70) return { grade: 'B', remarks: 'Very good effort.', color: 'text-blue-500 dark:text-blue-400' };
    if (percentage >= 60) return { grade: 'C', remarks: 'Good job, keep it up.', color: 'text-amber-500 dark:text-amber-400' };
    if (percentage >= 50) return { grade: 'D', remarks: 'Satisfactory performance.', color: 'text-orange-500 dark:text-orange-400' };
    if (percentage >= 40) return { grade: 'E', remarks: 'Pass, needs improvement.', color: 'text-zinc-600 dark:text-zinc-400' };
    return { grade: 'F', remarks: 'Fail, needs significant improvement.', color: 'text-red-500 dark:text-red-400' };
  };

  // Compile a student's marksheet statistics
  const compileMarksheet = (student: any) => {
    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;
    let subjectsCount = 0;
    let hasFail = false;
    let hasPending = false;

    const subjectsData = subjectsList.map(sub => {
      // Find matching midterm exam
      const midtermExam = exams.find(e => e.subjectId === sub.id && e.examType === 'midterm');
      const midtermResults = midtermExam ? resultsMap[midtermExam.id] : null;
      const midtermStudentResult = midtermResults ? midtermResults.find(r => r.studentId === student.id) : null;
      
      // Find matching final exam
      const finalExam = exams.find(e => e.subjectId === sub.id && e.examType === 'final');
      const finalResults = finalExam ? resultsMap[finalExam.id] : null;
      const finalStudentResult = finalResults ? finalResults.find(r => r.studentId === student.id) : null;

      // Extract marks
      const midtermMarks = midtermStudentResult ? Number(midtermStudentResult.marksObtained) : null;
      const finalMarks = finalStudentResult ? Number(finalStudentResult.marksObtained) : null;

      const midtermMax = midtermExam ? midtermExam.totalMarks : 0;
      const finalMax = finalExam ? finalExam.totalMarks : 0;

      let subMax = 0;
      let subObtained = 0;
      let status: 'pass' | 'fail' | 'pending' = 'pending';

      if (marksheetType === 'midterm') {
        subMax = midtermMax;
        subObtained = midtermMarks || 0;
        status = midtermStudentResult ? midtermStudentResult.status : 'pending';
      } else if (marksheetType === 'final') {
        subMax = finalMax;
        subObtained = finalMarks || 0;
        status = finalStudentResult ? finalStudentResult.status : 'pending';
      } else {
        // Combined
        subMax = midtermMax + finalMax;
        subObtained = (midtermMarks || 0) + (finalMarks || 0);
        
        // Pass if combined percentage is >= 40% (or pass both)
        if (midtermStudentResult && finalStudentResult) {
          const passMarks = (midtermExam?.passingMarks || 0) + (finalExam?.passingMarks || 0);
          status = subObtained >= passMarks ? 'pass' : 'fail';
        } else if (midtermStudentResult || finalStudentResult) {
          status = 'pending';
        }
      }

      if (subMax > 0) {
        totalMaxMarks += subMax;
        totalObtainedMarks += subObtained;
        subjectsCount++;
        if (status === 'fail') hasFail = true;
        if (status === 'pending') hasPending = true;
      }

      return {
        subjectName: sub.name,
        midtermMarks: midtermMarks !== null ? `${midtermMarks}/${midtermMax}` : '-',
        finalMarks: finalMarks !== null ? `${finalMarks}/${finalMax}` : '-',
        obtained: subMax > 0 ? `${subObtained}/${subMax}` : '-',
        percentage: subMax > 0 ? Math.round((subObtained / subMax) * 100) : 0,
        status
      };
    });

    const overallPercentage = totalMaxMarks > 0 ? Math.round((totalObtainedMarks / totalMaxMarks) * 100) : 0;
    const gradeDetails = getGradeAndRemarks(overallPercentage);
    
    let overallStatus: 'pass' | 'fail' | 'pending' = 'pass';
    if (hasPending) overallStatus = 'pending';
    else if (hasFail || overallPercentage < 40) overallStatus = 'fail';

    return {
      studentName: student.name,
      rollNumber: student.rollNumber || '-',
      schoolName: student.schoolName || 'SCHOOL ERP ACADEMY',
      subjects: subjectsData,
      totalMaxMarks,
      totalObtainedMarks,
      overallPercentage,
      grade: gradeDetails.grade,
      remarks: gradeDetails.remarks,
      color: gradeDetails.color,
      status: overallStatus
    };
  };

  // Preview Students compile
  const previewStudents = useMemo(() => {
    if (students.length === 0) return [];
    if (selectedStudentId === 'all') {
      return students.map(student => compileMarksheet(student));
    }
    const student = students.find(s => s.id === selectedStudentId);
    return student ? [compileMarksheet(student)] : [];
  }, [students, selectedStudentId, exams, resultsMap, marksheetType]);

  // Modern print handler using react-to-print
  const handlePrintBase = useReactToPrint({
    contentRef: printContainerRef,
    documentTitle: selectedStudentId === 'all' 
      ? `Marksheets_${classNameStr}_${classSection}` 
      : `Marksheet_${students.find(s => s.id === selectedStudentId)?.name || 'Student'}`,
    onAfterPrint: () => setPrinting(false),
  });

  const handlePrint = () => {
    if (students.length === 0) return;
    setPrinting(true);
    // Give react brief window to mount print contents
    setTimeout(() => {
      handlePrintBase();
    }, 200);
  };

  const SelectedTemplate = MARKSHEET_TEMPLATES.find(t => t.id === selectedTemplateId)?.component || MARKSHEET_TEMPLATES[0].component;

  return (
    <div className="space-y-6">
      {/* Sleek, Compact Header & Control Toolbar */}
      <div className="bg-card border border-gray-150 dark:border-zinc-800/80 p-3 sm:px-4 rounded-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3 justify-between">
        {/* Left Side: Back & Class Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack}
            className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground h-8 px-2 rounded-lg transition-colors border border-gray-100 dark:border-zinc-800"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 leading-none">
              <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
              <span className="truncate">{classNameStr} - {classSection}</span>
            </h2>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">Marksheet Preview</span>
          </div>
        </div>

        {/* Center/Right controls row */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Select Student */}
          <div className="w-full sm:w-[150px]">
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={loading || students.length === 0}>
              <SelectTrigger className="w-full h-8 rounded-lg text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-900/30 border-gray-200 dark:border-zinc-800 py-1">
                <div className="flex items-center gap-1.5 min-w-0 w-full text-left">
                  <User className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate flex-1">
                    <SelectValue placeholder="All Students" />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-60 rounded-xl">
                <SelectItem value="all" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">All Students</SelectItem>
                {students.map((s: any) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs font-medium">
                    Roll {s.rollNumber || '-'} — {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select Marks Type */}
          <div className="w-full sm:w-[110px]">
            <Select value={marksheetType} onValueChange={(v: any) => setMarksheetType(v)} disabled={loading || exams.length === 0}>
              <SelectTrigger className="w-full h-8 rounded-lg text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-900/30 border-gray-200 dark:border-zinc-800 py-1">
                <div className="flex items-center gap-1.5 min-w-0 w-full text-left">
                  <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate flex-1">
                    <SelectValue placeholder="Select Type" />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="midterm" className="text-xs font-medium">Midterm</SelectItem>
                <SelectItem value="final" className="text-xs font-medium">Final</SelectItem>
                <SelectItem value="combined" className="text-xs font-semibold text-emerald-600">Combined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Select Template Design - Modern Dropdown! */}
          <div className="w-full sm:w-[150px]">
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="w-full h-8 rounded-lg text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-900/30 border-gray-200 dark:border-zinc-800 py-1">
                <div className="flex items-center gap-1.5 min-w-0 w-full text-left">
                  <Layout className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate flex-1">
                    <SelectValue placeholder="Select Design" />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {MARKSHEET_TEMPLATES.map(tmpl => (
                  <SelectItem key={tmpl.id} value={tmpl.id} className="text-xs font-medium">
                    {tmpl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Zoom */}
          <div className="w-full sm:w-[100px]">
            <Select value={zoomScale.toString()} onValueChange={(v) => setZoomScale(parseFloat(v))}>
              <SelectTrigger className="w-full h-8 rounded-lg text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-900/30 border-gray-200 dark:border-zinc-800 py-1">
                <div className="flex items-center gap-1.5 min-w-0 w-full text-left">
                  <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate flex-1">
                    {Math.round(zoomScale * 100)}%
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="0.5" className="text-xs font-medium">50%</SelectItem>
                <SelectItem value="0.6" className="text-xs font-medium">60%</SelectItem>
                <SelectItem value="0.75" className="text-xs font-medium">75%</SelectItem>
                <SelectItem value="1" className="text-xs font-medium">100%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Print button */}
          <Button 
            onClick={handlePrint}
            disabled={loading || printing || students.length === 0}
            size="sm"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1.5 shadow-sm rounded-lg h-8 px-4 font-bold text-xs transition-all duration-300 transform active:scale-95 justify-center"
          >
            {printing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
            <span>Print {selectedStudentId === 'all' ? 'All' : 'Student'}</span>
          </Button>
        </div>
      </div>

      {/* Main Preview scroll wrapper */}
      <div className="bg-card border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px] items-center justify-center">
        {loading ? (
          <div className="w-full max-w-4xl space-y-6 py-10 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-72" />
              </div>
            </div>
            <Skeleton className="h-[550px] w-full rounded-2xl" />
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 text-muted-foreground max-w-md mx-auto animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">No Published Exams</h3>
            <p className="text-xs mt-1">
              There are no completed midterm or final exams published under the selected Academic Cycle for this class. Please verify the academic stand or exam configuration.
            </p>
          </div>
        ) : previewStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 text-muted-foreground max-w-md mx-auto animate-in fade-in duration-300">
            <AlertCircle className="h-10 w-10 mb-3 opacity-30 animate-bounce" />
            <p className="text-xs">No student records available</p>
          </div>
        ) : (
          <div className={`w-full max-w-4xl mx-auto space-y-4 ${cinzel.className} ${montserrat.className} ${inter.className}`}>
            {selectedStudentId === 'all' && (
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/40 p-4 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-3 font-medium shadow-sm animate-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>Showing previews for <strong>all {students.length} students</strong>. Scroll down to inspect. Clicking <strong>Print</strong> will generate the clean print packet.</span>
              </div>
            )}

            {/* True A4 parchment layout sheets preview vertical stack with premium scrollbar */}
            <div className="w-full max-h-[75vh] overflow-y-auto overflow-x-auto pb-6 flex flex-col items-center gap-8 bg-zinc-50 dark:bg-zinc-950/20 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-zinc-800/50 shadow-inner">
              
              {previewStudents.map((sheet, index) => (
                <div 
                  key={index}
                  className="shrink-0 transition-all duration-300 shadow-2xl rounded-lg"
                  style={{ 
                    width: 794 * zoomScale, 
                    height: 1123 * zoomScale, 
                    overflow: 'hidden' 
                  }}
                >
                  <div 
                    style={{ 
                      width: 794, 
                      height: 1123,
                      transform: `scale(${zoomScale})`,
                      transformOrigin: 'top left'
                    }}
                  >
                    <SelectedTemplate 
                      sheet={sheet}
                      classNameStr={classNameStr}
                      classSection={classSection}
                      academicYear={academicYear}
                      marksheetType={marksheetType}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden Print Wrapper for react-to-print */}
      <div className="hidden">
        <div ref={printContainerRef} className="print:block bg-white min-h-screen">
          <style type="text/css" media="print">
            {`
              @page { 
                size: portrait; 
                margin: 0mm; 
              } 
              body { 
                margin: 0; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
              }
              .marksheet-page-break {
                page-break-after: always;
                break-after: page;
              }
              .marksheet-page-break:last-child {
                page-break-after: avoid;
                break-after: avoid;
              }
            `}
          </style>
          {previewStudents.map((sheet, index) => (
            <div key={index} className="marksheet-page-break">
              <SelectedTemplate 
                sheet={sheet}
                classNameStr={classNameStr}
                classSection={classSection}
                academicYear={academicYear}
                marksheetType={marksheetType}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
