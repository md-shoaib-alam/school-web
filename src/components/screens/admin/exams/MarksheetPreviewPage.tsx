'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Printer, BookOpen, GraduationCap, Calendar, Clock, Loader2,
  AlertCircle, CheckCircle2, XCircle, Award, FileText, User, Search, ArrowLeft
} from 'lucide-react';
import { ExamRecord } from './types';
import { useMemo, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { goeyToast as toast } from 'goey-toast';

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
  
  const [students, setStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [resultsMap, setResultsMap] = useState<Record<string, any[]>>({}); // examId -> results
  
  const [loading, setLoading] = useState<boolean>(false);
  const [printing, setPrinting] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(0.6); // Default to 60% zoom so one full A4 sheet fits perfectly on screen!

  // Load students, completed exams, and parallel results
  useEffect(() => {
    if (!classId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Students & Completed Exams for this class
        const [studentsRes, examsRes] = await Promise.all([
          apiFetch(`/api/students?classId=${classId}&mode=min&limit=1000`),
          apiFetch(`/api/exams?classId=${classId}&limit=100`)
        ]);

        const studentData = await studentsRes.json();
        const examData = await examsRes.json();

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

  // Standard printing action
  const handlePrint = () => {
    if (students.length === 0) return;
    setPrinting(true);

    // Filter students to print
    const studentsToPrint = selectedStudentId === 'all' 
      ? students 
      : students.filter(s => s.id === selectedStudentId);

    // Create an invisible iframe for print sandboxing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) {
      setPrinting(false);
      return;
    }

    // Build print HTML content
    let htmlContent = `
      <html>
        <head>
          <title>Student Marksheets</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@500;600;700;800&display=swap');
            
            @page { size: A4; margin: 8mm; }
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
              color: #0f172a; 
              line-height: 1.4; 
              margin: 0; 
              padding: 0; 
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .marksheet-wrapper { 
              page-break-after: always; 
              break-after: page; 
              position: relative; 
              min-height: 278mm; 
              box-sizing: border-box; 
              display: flex; 
              flex-direction: column; 
              justify-content: space-between; 
              padding: 35px 30px;
              background: #ffffff;
              border: 5px solid #1e3a8a; /* Deep Navy Outer Border */
              outline: 2px solid #d4af37; /* Metallic Gold Inner Border */
              outline-offset: -12px;
              box-shadow: inset 0 0 50px rgba(212, 175, 55, 0.02);
            }
            .marksheet-wrapper:last-child { page-break-after: avoid; break-after: avoid; }
            
            /* Decorative Corner Accents */
            .corner-accent {
              position: absolute;
              width: 16px;
              height: 16px;
              border: 2px solid #d4af37;
              z-index: 10;
              pointer-events: none;
            }
            .corner-tl { top: 16px; left: 16px; border-right: none; border-bottom: none; }
            .corner-tr { top: 16px; right: 16px; border-left: none; border-bottom: none; }
            .corner-bl { bottom: 16px; left: 16px; border-right: none; border-top: none; }
            .corner-br { bottom: 16px; right: 16px; border-left: none; border-top: none; }

            /* Crest styling */
            .crest-container {
              display: flex;
              justify-content: center;
              margin-bottom: 8px;
              position: relative;
              z-index: 2;
            }
            .academic-crest {
              width: 55px;
              height: 55px;
              background: #1e3a8a;
              border: 3px solid #d4af37;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 10px rgba(30, 58, 138, 0.2);
              position: relative;
            }
            .academic-crest::before {
              content: "🎓";
              font-size: 26px;
              filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.15));
            }
            .academic-crest::after {
              content: "★";
              position: absolute;
              font-size: 8px;
              color: #d4af37;
              bottom: 2px;
            }

            /* Letterhead Header */
            .letterhead { 
              text-align: center; 
              border-bottom: 2px solid #e2e8f0; 
              padding-bottom: 12px; 
              margin-bottom: 15px; 
              position: relative;
              z-index: 2;
            }
            .letterhead::after {
              content: "";
              position: absolute;
              bottom: -2px;
              left: 50%;
              transform: translateX(-50%);
              width: 80px;
              height: 2px;
              background: #d4af37;
            }
            .school-logo { 
              font-family: 'Cinzel', serif; 
              font-size: 24px; 
              font-weight: 900; 
              text-transform: uppercase; 
              color: #1e3a8a; 
              letter-spacing: 2px; 
              margin: 4px 0 0 0; 
            }
            .school-sub { 
              font-family: 'Montserrat', sans-serif; 
              font-size: 9.5px; 
              color: #475569; 
              font-weight: 700; 
              margin: 5px 0 0 0; 
              text-transform: uppercase; 
              letter-spacing: 2px; 
            }
            
            .title-box { text-align: center; margin: 12px 0 16px 0; position: relative; z-index: 2; }
            .report-title { 
              font-family: 'Montserrat', sans-serif;
              font-size: 13px; 
              font-weight: 800; 
              text-transform: uppercase; 
              color: #1e3a8a; 
              letter-spacing: 2.5px; 
              border: 1.5px solid #1e3a8a;
              border-left: 5px solid #1e3a8a;
              border-right: 5px solid #1e3a8a;
              display: inline-block; 
              padding: 6px 24px; 
              background: rgba(30, 58, 138, 0.03);
              border-radius: 4px;
            }
            
            /* Student info grid */
            .student-info { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 12px 20px; 
              border: 1.5px solid #e2e8f0; 
              border-left: 5px solid #d4af37; 
              border-radius: 4px; 
              padding: 15px; 
              background: rgba(248, 250, 252, 0.75); 
              margin-bottom: 20px; 
              font-size: 12px; 
              position: relative;
              z-index: 2;
            }
            .info-item { display: flex; align-items: center; }
            .info-label { 
              font-family: 'Montserrat', sans-serif;
              font-weight: 700; 
              color: #475569; 
              width: 125px; 
              text-transform: uppercase; 
              font-size: 9px; 
              letter-spacing: 0.8px; 
            }
            .info-val { 
              color: #0f172a; 
              font-weight: 700; 
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            /* Table design */
            .grades-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 22px; 
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
              position: relative;
              z-index: 2;
            }
            .grades-table th { 
              background: #1e3a8a; 
              color: #ffffff; 
              font-family: 'Montserrat', sans-serif;
              font-weight: 700; 
              font-size: 10px; 
              text-transform: uppercase; 
              letter-spacing: 0.5px; 
              padding: 10px 12px;
              border: none;
            }
            .grades-table td { 
              padding: 10px 12px; 
              border-bottom: 1px solid #e2e8f0; 
              font-size: 11px; 
            }
            .grades-table tr:hover { background: #f8fafc; }
            .sub-name { font-weight: 700; color: #1e293b; }
            .marks-col { font-family: monospace; font-weight: 700; text-align: center; font-size: 11px; }
            .total-obt { font-weight: 900; color: #0f172a; font-family: monospace; }
            .pct-col { font-weight: 900; color: #1e3a8a; text-align: center; font-family: monospace; }
            
            /* Status Badges */
            .badge-col { text-align: center; }
            .badge { 
              display: inline-block; 
              padding: 3px 8px; 
              border-radius: 4px; 
              font-size: 9px; 
              font-weight: 800; 
              text-transform: uppercase; 
              letter-spacing: 0.8px; 
            }
            .badge-pass { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
            .badge-fail { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
            .badge-pending { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
            
            /* Grading Scale */
            .grading-legend { 
              display: grid; 
              grid-template-columns: repeat(7, 1fr); 
              gap: 4px; 
              border: 1.5px solid #e2e8f0; 
              background: #f8fafc; 
              border-radius: 4px; 
              padding: 6px; 
              font-size: 8.5px; 
              text-align: center; 
              font-weight: 600; 
              color: #64748b;
              margin-bottom: 22px;
              position: relative;
              z-index: 2;
            }
            .legend-item { border-right: 1px solid #e2e8f0; }
            .legend-item:last-child { border-right: none; }
            .legend-grade { font-weight: 800; color: #1e3a8a; }
            
            /* Summary Grid */
            .summary-container { 
              display: grid; 
              grid-template-columns: 1.25fr 1fr; 
              gap: 20px; 
              margin-bottom: 20px; 
              position: relative; 
              z-index: 2;
            }
            .remarks-box { 
              border: 1.5px solid #e2e8f0; 
              border-left: 4px solid #d4af37; 
              border-radius: 4px; 
              padding: 12px 14px; 
              background: rgba(248, 250, 252, 0.8); 
              font-size: 11px; 
            }
            .remarks-title { 
              font-family: 'Montserrat', sans-serif;
              font-weight: 800; 
              color: #1e3a8a; 
              margin-bottom: 6px; 
              text-transform: uppercase; 
              font-size: 9.5px; 
              letter-spacing: 0.8px; 
            }
            .remarks-text { font-style: italic; color: #334155; font-weight: 600; line-height: 1.5; }
            
            .stats-table { width: 100%; margin: 0; }
            .stats-table td { padding: 6px 10px; border: none; font-size: 11px; }
            .stats-table tr { border-bottom: 1.5px dashed #e2e8f0; }
            .stats-table tr:last-child { border-bottom: none; }
            .stats-lbl { 
              font-family: 'Montserrat', sans-serif;
              font-weight: 700; 
              color: #475569; 
              text-transform: uppercase; 
              font-size: 9px; 
              letter-spacing: 0.5px; 
            }
            .stats-val { font-weight: 800; text-align: right; color: #0f172a; }
            .stats-grade { font-size: 14px; font-weight: 900; }
            
            /* Background Watermark */
            .auth-watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-25deg);
              width: 450px;
              height: 450px;
              border: 3px double rgba(30, 58, 138, 0.015);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              pointer-events: none;
              user-select: none;
              z-index: 0;
            }
            .auth-watermark-text {
              font-size: 32px;
              font-weight: 900;
              color: rgba(30, 58, 138, 0.022);
              text-transform: uppercase;
              letter-spacing: 8px;
              white-space: nowrap;
            }
            
            /* Signature flow */
            .footer-sig { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-end; 
              font-size: 9.5px; 
              font-weight: 700; 
              color: #64748b;
              border-top: 1.5px dashed #e2e8f0; 
              padding-top: 15px; 
              margin-top: 10px;
              position: relative;
              z-index: 2;
            }
            .sig-line { 
              border-top: 1.5px solid #cbd5e1; 
              width: 100px; 
              text-align: center; 
              padding-top: 4px; 
              margin-top: 25px; 
              text-transform: uppercase;
              font-size: 8px;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
    `;

    studentsToPrint.forEach(student => {
      const sheet = compileMarksheet(student);
      
      htmlContent += `
        <div class="marksheet-wrapper">
          <!-- Decorative Corners -->
          <div class="corner-accent corner-tl"></div>
          <div class="corner-accent corner-tr"></div>
          <div class="corner-accent corner-bl"></div>
          <div class="corner-accent corner-br"></div>

          <!-- Watermark -->
          <div class="auth-watermark">
            <div class="auth-watermark-text">OFFICIAL RECORD</div>
          </div>

          <div style="flex-grow: 1;">
            <!-- Letterhead -->
            <div class="crest-container">
              <div class="academic-crest"></div>
            </div>
            <div class="letterhead">
              <h1 class="school-logo">${classNameStr.toUpperCase()} ACADEMY</h1>
              <div class="school-sub">Official Academic Transcript & Statement of Grades</div>
            </div>

            <!-- Title -->
            <div class="title-box">
              <div class="report-title">
                ${marksheetType === 'midterm' ? 'Midterm Marksheet' : marksheetType === 'final' ? 'Final Marksheet' : 'Consolidated Report Card'}
              </div>
            </div>

            <!-- Student Info Block -->
            <div class="student-info">
              <div class="info-item">
                <span class="info-label">Student Name:</span>
                <span class="info-val">${sheet.studentName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Roll Number:</span>
                <span class="info-val" style="font-family: monospace;">${sheet.rollNumber}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Class & Section:</span>
                <span class="info-val">${classNameStr} - ${classSection}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Academic Cycle:</span>
                <span class="info-val">${academicYear}</span>
              </div>
            </div>

            <!-- Subject Table -->
            <table class="grades-table">
              <thead>
                <tr>
                  <th style="text-align: left; ${marksheetType === 'combined' ? 'width: 30%;' : 'width: 48%;'}">Subject Name</th>
                  ${marksheetType === 'combined' ? '<th style="width: 13%;">Midterm</th>' : ''}
                  ${marksheetType === 'combined' ? '<th style="width: 13%;">Final</th>' : ''}
                  <th style="${marksheetType === 'combined' ? 'width: 18%;' : 'width: 22%;'}">Total Marks</th>
                  <th style="${marksheetType === 'combined' ? 'width: 13%;' : 'width: 15%;'}">Percentage</th>
                  <th style="${marksheetType === 'combined' ? 'width: 13%;' : 'width: 15%;'}">Status</th>
                </tr>
              </thead>
              <tbody>
      `;

      sheet.subjects.forEach(sub => {
        htmlContent += `
          <tr>
            <td class="sub-name">${sub.subjectName}</td>
            ${marksheetType === 'combined' ? `<td class="marks-col">${sub.midtermMarks}</td>` : ''}
            ${marksheetType === 'combined' ? `<td class="marks-col">${sub.finalMarks}</td>` : ''}
            <td class="marks-col total-obt">${sub.obtained}</td>
            <td class="pct-col">${sub.percentage}%</td>
            <td class="badge-col">
              <span class="badge ${
                sub.status === 'pass' ? 'badge-pass' : sub.status === 'fail' ? 'badge-fail' : 'badge-pending'
              }">
                ${sub.status}
              </span>
            </td>
          </tr>
        `;
      });

      htmlContent += `
              </tbody>
            </table>

            <!-- Legend -->
            <div class="grading-legend">
              <div class="legend-item"><span class="legend-grade">A+</span> (90%+)</div>
              <div class="legend-item"><span class="legend-grade">A</span> (80-89%)</div>
              <div class="legend-item"><span class="legend-grade">B</span> (70-79%)</div>
              <div class="legend-item"><span class="legend-grade">C</span> (60-69%)</div>
              <div class="legend-item"><span class="legend-grade">D</span> (50-59%)</div>
              <div class="legend-item"><span class="legend-grade">E</span> (40-49%)</div>
              <div><span class="legend-grade">F</span> (&lt;40%)</div>
            </div>

            <!-- Remarks & Statistics -->
            <div class="summary-container">
              <div class="remarks-box">
                <div class="remarks-title">Principal Remarks & Evaluation</div>
                <div class="remarks-text">"${sheet.remarks}" The student has demonstrated ${sheet.status === 'pass' ? 'satisfactory academic standards.' : 'need for substantial core reinforcement.'}</div>
              </div>
              <div>
                <table class="stats-table">
                  <tbody>
                    <tr>
                      <td class="stats-lbl">Aggregate Marks</td>
                      <td class="stats-val">${sheet.totalObtainedMarks} / ${sheet.totalMaxMarks}</td>
                    </tr>
                    <tr>
                      <td class="stats-lbl">Percentage</td>
                      <td class="stats-val" style="color: #1e3a8a;">${sheet.overallPercentage}%</td>
                    </tr>
                    <tr>
                      <td class="stats-lbl">Overall Grade</td>
                      <td class="stats-val stats-grade" style="color: ${sheet.status === 'pass' ? '#15803d' : '#b91c1c'};">${sheet.grade}</td>
                    </tr>
                    <tr>
                      <td class="stats-lbl">Academic Standing</td>
                      <td class="stats-val">
                        <span class="badge ${
                          sheet.status === 'pass' ? 'badge-pass' : sheet.status === 'fail' ? 'badge-fail' : sheet.status === 'pending' ? 'badge-pending' : ''
                        }">
                          ${sheet.status}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="footer-sig">
            <div>Date of Issue: ${new Date().toLocaleDateString()}</div>
            <div style="display: flex; gap: 40px;">
              <div class="sig-line">Class Teacher</div>
              <div class="sig-line">Principal</div>
            </div>
          </div>
        </div>
      `;
    });

    htmlContent += `
        </body>
      </html>
    `;

    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Print sandbox execution
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Clean sandbox iframe
      setTimeout(() => {
        document.body.removeChild(iframe);
        setPrinting(false);
      }, 1000);
    }, 300);
  };

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
        <div className="flex flex-wrap items-center gap-3">
          {/* Select Student */}
          <div className="w-[170px]">
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

          {/* Report Template Type */}
          <div className="w-[160px]">
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

          {/* Preview Zoom */}
          <div className="w-[120px]">
            <Select value={zoomScale.toString()} onValueChange={(v) => setZoomScale(parseFloat(v))}>
              <SelectTrigger className="w-full h-8 rounded-lg text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-900/30 border-gray-200 dark:border-zinc-800 py-1">
                <div className="flex items-center gap-1.5 min-w-0 w-full text-left">
                  <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate flex-1">
                    {Math.round(zoomScale * 100)}% Size
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="0.5" className="text-xs font-medium">50% Size</SelectItem>
                <SelectItem value="0.6" className="text-xs font-medium">60% Size</SelectItem>
                <SelectItem value="0.75" className="text-xs font-medium">75% Size</SelectItem>
                <SelectItem value="1" className="text-xs font-medium">100% Size</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Print button */}
          <Button 
            onClick={handlePrint}
            disabled={loading || printing || students.length === 0}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1.5 shadow-sm rounded-lg h-8 px-4 font-bold text-xs transition-all duration-300 transform active:scale-95"
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
          <div className="w-full max-w-4xl mx-auto space-y-4">
            {selectedStudentId === 'all' && (
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/40 p-4 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-3 font-medium shadow-sm animate-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>Showing previews for <strong>all {students.length} students</strong>. Scroll down to inspect. Clicking <strong>Print</strong> will generate the clean print packet.</span>
              </div>
            )}

            {/* Google Fonts Preload for Preview Card */}
            <link 
              rel="stylesheet" 
              href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" 
            />

            {/* True A4 parchment layout sheets preview vertical stack with premium scrollbar */}
            <div className="w-full max-h-[75vh] overflow-y-auto pb-6 flex flex-col items-center gap-8 bg-zinc-50 dark:bg-zinc-950/20 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-zinc-800/50 shadow-inner">
              
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
                    className="relative bg-white text-slate-900 px-9 py-10 border-[6px] border-[#1e3a8a] rounded overflow-hidden select-none flex flex-col justify-between shrink-0 text-left"
                    style={{ 
                      width: 794, 
                      height: 1123,
                      transform: `scale(${zoomScale})`,
                      transformOrigin: 'top left'
                    }}
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

                  {/* Core Document Flow */}
                  <div className="space-y-5">
                    
                    {/* Crest & Logo Letterhead */}
                    <div className="text-center pb-1">
                      <div className="flex justify-center mb-2">
                        <div className="w-12 h-12 bg-[#1e3a8a] border-2 border-[#d4af37] rounded-full flex items-center justify-center shadow-md relative">
                          <span className="text-xl filter drop-shadow">🎓</span>
                          <span className="absolute bottom-0.5 text-[6px] text-[#d4af37] font-bold">★</span>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-xl text-[#1e3a8a] tracking-wider leading-none" style={{ fontFamily: "'Cinzel', serif" }}>
                        {classNameStr.toUpperCase()} ACADEMY
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
                        <span className="font-bold text-zinc-900 truncate">{sheet.studentName}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider w-24 flex items-center shrink-0" style={{ fontFamily: "'Montserrat', sans-serif" }}>Roll Number:</span>
                        <span className="font-bold text-zinc-900 font-mono">{sheet.rollNumber}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider w-24 flex items-center shrink-0" style={{ fontFamily: "'Montserrat', sans-serif" }}>Class & Section:</span>
                        <span className="font-bold text-zinc-900 truncate">{classNameStr} - {classSection}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider w-24 flex items-center shrink-0" style={{ fontFamily: "'Montserrat', sans-serif" }}>Academic Cycle:</span>
                        <span className="font-bold text-zinc-900">{academicYear}</span>
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
                          {sheet.subjects.map((sub: any, i: number) => (
                            <tr key={i} className="border-b border-gray-150 hover:bg-zinc-50/50 transition-colors">
                              <td className="font-bold text-zinc-800 px-3 py-2.5 truncate text-left">
                                {sub.subjectName}
                              </td>
                              {marksheetType === 'combined' && (
                                <td className="text-center font-mono text-zinc-500 px-2 py-2.5">
                                  {sub.midtermMarks}
                                </td>
                              )}
                              {marksheetType === 'combined' && (
                                <td className="text-center font-mono text-zinc-500 px-2 py-2.5">
                                  {sub.finalMarks}
                                </td>
                              )}
                              <td className="text-center font-black text-zinc-950 font-mono px-3 py-2.5">
                                {sub.obtained}
                              </td>
                              <td className="text-center font-black text-[#1e3a8a] font-mono px-3 py-2.5">
                                {sub.percentage}%
                              </td>
                              <td className="text-center px-3 py-2.5">
                                {sub.status === 'pass' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                                    pass
                                  </span>
                                )}
                                {sub.status === 'fail' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider bg-red-50 text-red-700 border border-red-200 uppercase">
                                    fail
                                  </span>
                                )}
                                {sub.status === 'pending' && (
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
                        <p className="text-[9.5px] uppercase font-bold text-[#1e3a8a] tracking-wider mb-1.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>Principal Remarks & Evaluation</p>
                        <p className="text-xs font-semibold text-zinc-700 italic leading-relaxed">
                          "{sheet.remarks}" The student has demonstrated {sheet.status === 'pass' ? 'satisfactory academic standards.' : 'need for substantial core reinforcement.'}
                        </p>
                      </div>

                      <div className="col-span-5 p-4 border border-gray-200 rounded bg-zinc-50/50 space-y-2.5">
                        <div className="flex justify-between text-xs font-semibold border-b border-gray-200 pb-1.5 text-zinc-500">
                          <span className="uppercase text-[9px] tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Aggregate Marks:</span>
                          <span className="text-zinc-900 font-bold font-mono">{sheet.totalObtainedMarks} / {sheet.totalMaxMarks}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold border-b border-gray-200 pb-1.5 text-zinc-500">
                          <span className="uppercase text-[9px] tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Percentage:</span>
                          <span className="text-[#1e3a8a] font-bold font-mono">{sheet.overallPercentage}%</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold border-b border-gray-200 pb-1.5 text-zinc-500">
                          <span className="uppercase text-[9px] tracking-wide flex items-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>Overall Grade:</span>
                          <span className={`font-black text-sm ${sheet.color}`}>{sheet.grade}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                          <span className="uppercase text-[9px] tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Academic Standing:</span>
                          {sheet.status === 'pass' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">PASS</span>
                          )}
                          {sheet.status === 'fail' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider bg-red-50 text-red-700 border border-red-200 uppercase">FAIL</span>
                          )}
                          {sheet.status === 'pending' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider bg-amber-50 text-amber-700 border border-amber-200 uppercase">PENDING</span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Visual Signature Segment - Pinned to the bottom margin */}
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
