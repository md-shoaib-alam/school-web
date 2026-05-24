'use client';

import { ExamRecord } from './types';
import { useMemo, useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { goeyToast as toast } from 'goey-toast';
import { useReactToPrint } from 'react-to-print';
import { Printer, Loader2 } from 'lucide-react';
import { MARKSHEET_TEMPLATES } from './marksheet-templates';
import { MarksheetControls } from './marksheet-preview/MarksheetControls';
import { MarksheetSheetsPreview } from './marksheet-preview/MarksheetSheetsPreview';
import { MarksheetPrintContainer } from './marksheet-preview/MarksheetPrintContainer';

interface MarksheetPreviewPageProps {
  classId: string;
  classNameStr: string; // e.g. "Grade 10"
  classSection: string; // e.g. "A"
  academicYear: string;
  onBack: () => void;
  isStandalone?: boolean;
}

export function MarksheetPreviewPage({
  classId,
  classNameStr,
  classSection,
  academicYear,
  onBack,
  isStandalone = false
}: MarksheetPreviewPageProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [marksheetType, setMarksheetType] = useState<'midterm' | 'final'>('midterm');
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
        // 1. Fetch Students & Completed Exams for this class, and Tenant Settings in parallel
        const [studentData, examData, settingsData] = await Promise.all([
          apiFetch(`/api/students?classId=${classId}&mode=min&limit=1000`).then((res) => res.json()),
          apiFetch(`/api/exams?classId=${classId}&limit=100`).then((res) => res.json()),
          apiFetch(`/api/tenant-settings`)
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        ]);

        if (settingsData?.defaultMarksheetTemplateId) {
          setSelectedTemplateId(settingsData.defaultMarksheetTemplateId);
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
          const allResults = await Promise.all(
            completedExams.map(async (exam: ExamRecord) => {
              try {
                const res = await apiFetch(`/api/exams/results?examId=${exam.id}`);
                const data = await res.json();
                return { examId: exam.id, results: data.results || [] };
              } catch (err) {
                console.error(`Error loading results for exam ${exam.id}:`, err);
                return { examId: exam.id, results: [] };
              }
            })
          );
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
    setMarksheetType('midterm');
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
      id: student.id,
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

  if (isStandalone) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
        {/* Custom Standalone Toolbar */}
        <div className="toolbar no-print">
          <div className="toolbar-title">
            <span style={{ fontSize: "1.1rem" }}>📄</span>
            <span>Marksheet Preview</span>
            <span className="toolbar-badge select-none">{classNameStr} - {classSection}</span>
            
            {/* Student Dropdown Selector */}
            <select 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={loading || students.length === 0}
              className="ml-4 bg-slate-900 text-white border border-white/10 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer outline-none hover:bg-slate-800 transition-colors"
            >
              <option value="all">All Students</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>
                  Roll {s.rollNumber || '-'}: {s.name}
                </option>
              ))}
            </select>

            {/* Marksheet Type Dropdown Selector */}
            <select 
              value={marksheetType} 
              onChange={(e) => setMarksheetType(e.target.value as any)}
              disabled={loading || exams.length === 0}
              className="ml-2 bg-slate-900 text-white border border-white/10 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer outline-none hover:bg-slate-800 transition-colors"
            >
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
            </select>

            {/* Template Dropdown Selector */}
            <select 
              value={selectedTemplateId} 
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="ml-2 bg-slate-900 text-white border border-white/10 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer outline-none hover:bg-slate-800 transition-colors"
            >
              {MARKSHEET_TEMPLATES.map(tmpl => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="toolbar-actions">
            <div className="zoom-controls">
              <button 
                className="zoom-btn" 
                onClick={() => setZoomScale(Math.max(zoomScale - 0.1, 0.4))}
                title="Zoom Out"
              >
                −
              </button>
              <span className="zoom-btn active" style={{ cursor: "default" }}>
                {Math.round(zoomScale * 100)}%
              </span>
              <button 
                className="zoom-btn" 
                onClick={() => setZoomScale(Math.min(zoomScale + 0.1, 1.5))}
                title="Zoom In"
              >
                +
              </button>
            </div>
            
            <button className="action-btn" onClick={handlePrint} disabled={loading || printing}>
              {printing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1" />
                  Printing...
                </>
              ) : (
                <>
                  <Printer className="size-3.5 mr-1" />
                  Print
                </>
              )}
            </button>
            
            <button className="action-btn action-btn-secondary" onClick={onBack}>
              Close Preview
            </button>
          </div>
        </div>
        
        {/* Standalone View Container */}
        <div className="viewer-container">
          <MarksheetSheetsPreview
            loading={loading}
            exams={exams}
            students={students}
            previewStudents={previewStudents}
            zoomScale={zoomScale}
            SelectedTemplate={SelectedTemplate}
            classNameStr={classNameStr}
            classSection={classSection}
            academicYear={academicYear}
            marksheetType={marksheetType}
            selectedStudentId={selectedStudentId}
            isStandalone={true}
          />
        </div>

        {/* Hidden Print Container */}
        <MarksheetPrintContainer
          printContainerRef={printContainerRef}
          previewStudents={previewStudents}
          SelectedTemplate={SelectedTemplate}
          classNameStr={classNameStr}
          classSection={classSection}
          academicYear={academicYear}
          marksheetType={marksheetType}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MarksheetControls
        classNameStr={classNameStr}
        classSection={classSection}
        onBack={onBack}
        selectedStudentId={selectedStudentId}
        setSelectedStudentId={setSelectedStudentId}
        marksheetType={marksheetType}
        setMarksheetType={setMarksheetType}
        selectedTemplateId={selectedTemplateId}
        setSelectedTemplateId={setSelectedTemplateId}
        zoomScale={zoomScale}
        setZoomScale={setZoomScale}
        handlePrint={handlePrint}
        students={students}
        exams={exams}
        loading={loading}
        printing={printing}
      />

      <MarksheetSheetsPreview
        loading={loading}
        exams={exams}
        students={students}
        previewStudents={previewStudents}
        zoomScale={zoomScale}
        SelectedTemplate={SelectedTemplate}
        classNameStr={classNameStr}
        classSection={classSection}
        academicYear={academicYear}
        marksheetType={marksheetType}
        selectedStudentId={selectedStudentId}
      />

      <MarksheetPrintContainer
        printContainerRef={printContainerRef}
        previewStudents={previewStudents}
        SelectedTemplate={SelectedTemplate}
        classNameStr={classNameStr}
        classSection={classSection}
        academicYear={academicYear}
        marksheetType={marksheetType}
      />
    </div>
  );
}
