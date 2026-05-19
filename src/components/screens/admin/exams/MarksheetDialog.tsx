'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Printer, BookOpen, GraduationCap, Calendar, Clock, Loader2,
  AlertCircle, CheckCircle2, XCircle, Award, FileText, User, Search
} from 'lucide-react';
import { ExamRecord } from './types';
import { useMemo, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { goeyToast as toast } from 'goey-toast';

interface MarksheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  classNameStr: string; // e.g. "Grade 10"
  classSection: string; // e.g. "A"
  academicYear: string;
}

export function MarksheetDialog({
  open,
  onOpenChange,
  classId,
  classNameStr,
  classSection,
  academicYear
}: MarksheetDialogProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [marksheetType, setMarksheetType] = useState<'midterm' | 'final' | 'combined'>('combined');
  
  const [students, setStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [resultsMap, setResultsMap] = useState<Record<string, any[]>>({}); // examId -> results
  
  const [loading, setLoading] = useState<boolean>(false);
  const [printing, setPrinting] = useState<boolean>(false);

  // Load students, completed exams, and parallel results
  useEffect(() => {
    if (!open || !classId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Students & Completed Exams for this class
        const [studentsRes, examsRes] = await Promise.all([
          apiFetch(`/api/students?classId=${classId}&mode=min`),
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
  }, [open, classId, academicYear]);

  // Clean student selection state when closed/reopened
  useEffect(() => {
    if (open) {
      setSelectedStudentId('all');
      setMarksheetType('combined');
    }
  }, [open]);

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

  // Preview Student compile
  const previewStudent = useMemo(() => {
    if (students.length === 0) return null;
    if (selectedStudentId === 'all') {
      return compileMarksheet(students[0]);
    }
    const student = students.find(s => s.id === selectedStudentId);
    return student ? compileMarksheet(student) : null;
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
              font-size: 12px; 
            }
            
            /* Table design */
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              font-size: 11.5px; 
              position: relative;
              z-index: 2;
            }
            th, td { 
              border: 1.5px solid rgba(212, 175, 55, 0.15); 
              padding: 9px 12px; 
              text-align: left; 
            }
            th { 
              background: #1e3a8a; 
              color: #ffffff; 
              font-family: 'Montserrat', sans-serif;
              font-weight: 700; 
              font-size: 10px; 
              text-transform: uppercase; 
              letter-spacing: 1px; 
              border: 1.5px solid #1e3a8a; 
            }
            tr:nth-child(even) { background: rgba(248, 250, 252, 0.6); }
            td.center, th.center { text-align: center; }
            td.bold { font-weight: 700; }
            .font-mono { font-family: 'SFMono-Regular', Consolas, "Liberation Mono", Menlo, Courier, monospace; }
            
            /* Outcome badges */
            .badge { 
              display: inline-flex; 
              align-items: center; 
              justify-content: center;
              padding: 3px 8px; 
              font-size: 8.5px; 
              font-weight: 800; 
              border-radius: 4px; 
              text-transform: uppercase; 
              letter-spacing: 0.8px;
            }
            .badge-pass { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
            .badge-fail { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }
            .badge-pending { background: #fff8e1; color: #f57f17; border: 1px solid #ffe082; }
            
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
            
            /* Background Watermark Watermark */
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
              color: #475569; 
              padding-top: 30px; 
              border-top: 1.5px dashed #cbd5e1; 
              margin-top: auto; 
              position: relative;
              margin-bottom: 5px;
              z-index: 2;
            }
            .sig-line { width: 170px; border-top: 1.5px solid #475569; text-align: center; padding-top: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
            .seal-container {
              position: absolute;
              bottom: 0px;
              left: 50%;
              transform: translateX(-50%);
              width: 100px;
              height: 100px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .seal-placeholder {
              width: 85px;
              height: 85px;
              border: 2px solid #d4af37;
              border-radius: 50%;
              background: rgba(212, 175, 55, 0.03);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: #d4af37;
              font-weight: 800;
              text-transform: uppercase;
              text-align: center;
              line-height: 1.3;
              letter-spacing: 0.5px;
              box-shadow: 0 0 10px rgba(212, 175, 55, 0.1);
            }
            .seal-placeholder::before {
              content: "★ ★ ★";
              font-size: 6px;
              display: block;
              margin-bottom: 2px;
            }
            
            /* Grading Scale details */
            .grading-scale { 
              border: 1.5px solid #e2e8f0; 
              background: #f8fafc; 
              border-radius: 4px; 
              padding: 8px; 
              font-size: 8.5px; 
              text-align: center; 
              color: #64748b; 
              margin-bottom: 20px; 
              display: grid; 
              grid-template-columns: repeat(7, 1fr); 
              gap: 4px; 
              font-weight: 600;
              position: relative;
              z-index: 2;
            }
            .scale-item { border-right: 1.5px solid #e2e8f0; }
            .scale-item:last-child { border-right: none; }
            .scale-label { font-weight: 800; color: #1e3a8a; }
          </style>
        </head>
        <body>
    `;

    studentsToPrint.forEach(student => {
      const sheet = compileMarksheet(student);
      
      htmlContent += `
        <div class="marksheet-wrapper">
          <div class="corner-accent corner-tl"></div>
          <div class="corner-accent corner-tr"></div>
          <div class="corner-accent corner-bl"></div>
          <div class="corner-accent corner-br"></div>
          
          <div class="auth-watermark">
            <div class="auth-watermark-text">OFFICIAL RECORD</div>
          </div>
          
          <div>
            <div class="crest-container">
              <div class="academic-crest"></div>
            </div>
            
            <div class="letterhead">
              <h1 class="school-logo">School ERP Academy</h1>
              <h2 class="school-sub">Official Academic Transcript & Statement of Outcomes</h2>
            </div>
            
            <div class="title-box">
              <h2 class="report-title">
                ${marksheetType === 'midterm' ? 'Midterm Marksheet' : marksheetType === 'final' ? 'Final Marksheet' : 'Consolidated Report Card'}
              </h2>
            </div>
            
            <div class="student-info">
              <div class="info-item"><span class="info-label">Student Name:</span><span class="info-val">${sheet.studentName}</span></div>
              <div class="info-item"><span class="info-label">Roll Number:</span><span class="info-val">${sheet.rollNumber}</span></div>
              <div class="info-item"><span class="info-label">Class & Section:</span><span class="info-val">${classNameStr} - ${classSection}</span></div>
              <div class="info-item"><span class="info-label">Academic Cycle:</span><span class="info-val">${academicYear}</span></div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Subject Name</th>
                  ${marksheetType === 'combined' ? '<th class="center" style="width: 100px;">Midterm Exam</th>' : ''}
                  ${marksheetType === 'combined' ? '<th class="center" style="width: 100px;">Final Exam</th>' : ''}
                  <th class="center" style="width: 120px;">
                    ${marksheetType === 'combined' ? 'Combined Total' : 'Marks Obtained'}
                  </th>
                  <th class="center" style="width: 90px;">Percentage</th>
                  <th class="center" style="width: 90px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${sheet.subjects.map(sub => `
                  <tr>
                    <td><strong>${sub.subjectName}</strong></td>
                    ${marksheetType === 'combined' ? `<td class="center font-mono">${sub.midtermMarks}</td>` : ''}
                    ${marksheetType === 'combined' ? `<td class="center font-mono">${sub.finalMarks}</td>` : ''}
                    <td class="center font-mono bold">${sub.obtained}</td>
                    <td class="center font-mono bold" style="color: #1e3a8a;">${sub.percentage}%</td>
                    <td class="center">
                      <span class="badge ${
                        sub.status === 'pass' ? 'badge-pass' : sub.status === 'fail' ? 'badge-fail' : sub.status === 'pending' ? 'badge-pending' : ''
                      }">
                        ${sub.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="grading-scale">
              <div class="scale-item"><span class="scale-label">A+</span> (90%+)</div>
              <div class="scale-item"><span class="scale-label">A</span> (80-89%)</div>
              <div class="scale-item"><span class="scale-label">B</span> (70-79%)</div>
              <div class="scale-item"><span class="scale-label">C</span> (60-69%)</div>
              <div class="scale-item"><span class="scale-label">D</span> (50-59%)</div>
              <div class="scale-item"><span class="scale-label">E</span> (40-49%)</div>
              <div class="scale-item"><span class="scale-label">F</span> (&lt;40%)</div>
            </div>

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
            <div class="seal-container">
              <div class="seal-placeholder">
                OFFICIAL<br>ACADEMIC SEAL
              </div>
            </div>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl border border-gray-100 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="p-5 pb-3 border-b border-gray-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
            <div className="space-y-0.5">
              <DialogTitle className="text-lg font-extrabold flex items-center gap-2 text-foreground">
                <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                Exam Marksheet Generator
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Generate and print premium official statement of grades for {classNameStr} - {classSection}.
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={handlePrint}
                disabled={loading || printing || students.length === 0}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1.5 shadow-sm rounded-lg h-9 px-4 font-bold"
              >
                {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                Print {selectedStudentId === 'all' ? 'All Marksheets' : 'Marksheet'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Configurations Bar */}
        <div className="bg-zinc-50/80 dark:bg-zinc-900/40 p-4 border-b border-gray-100 dark:border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1 min-w-0">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Select Student</label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={loading || students.length === 0}>
                <SelectTrigger className="w-full h-9 rounded-lg text-xs font-semibold bg-card border-gray-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 min-w-0 w-full text-left">
                    <User className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate flex-1 text-left">
                      <SelectValue placeholder="All Students" />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60 rounded-lg">
                  <SelectItem value="all" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">All Students (Batch Print)</SelectItem>
                  {students.map((s: any) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs font-medium">
                      Roll {s.rollNumber || '-'} — {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 min-w-0">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Report Template Type</label>
              <Select value={marksheetType} onValueChange={(v: any) => setMarksheetType(v)} disabled={loading || exams.length === 0}>
                <SelectTrigger className="w-full h-9 rounded-lg text-xs font-semibold bg-card border-gray-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 min-w-0 w-full text-left">
                    <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate flex-1 text-left">
                      <SelectValue placeholder="Select Type" />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="midterm" className="text-xs font-medium">Midterm Marksheet</SelectItem>
                  <SelectItem value="final" className="text-xs font-medium">Final Marksheet</SelectItem>
                  <SelectItem value="combined" className="text-xs font-semibold text-emerald-600">Combined Marksheet (Midterm + Final)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 min-w-0">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Class Info</label>
              <div className="h-9 rounded-lg border border-gray-200 dark:border-zinc-800 px-3 bg-zinc-100/50 dark:bg-zinc-800/20 text-xs font-semibold flex items-center justify-between text-muted-foreground gap-2 min-w-0">
                <span className="truncate flex-1 text-left">{classNameStr} - {classSection}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-foreground font-mono shrink-0">{academicYear}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 overflow-y-auto p-5 bg-zinc-50/20 dark:bg-zinc-950/10">
          {loading ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              <Skeleton className="h-10 w-1/3 rounded mx-auto" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-[250px] w-full rounded-xl" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground max-w-sm mx-auto">
              <User className="h-12 w-12 mx-auto mb-3 opacity-30 text-zinc-400" />
              <h3 className="text-sm font-bold text-foreground">No Students Registered</h3>
              <p className="text-xs mt-1">There are no student accounts registered in this class to generate report cards for.</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground max-w-sm mx-auto">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30 text-zinc-400" />
              <h3 className="text-sm font-bold text-foreground">No Published Exams</h3>
              <p className="text-xs mt-1">There are no completed midterm or final exams published under the selected Academic Year for this class.</p>
            </div>
          ) : !previewStudent ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No records available</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {selectedStudentId === 'all' && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 p-3 rounded-lg text-[11px] text-blue-700 dark:text-blue-400 flex items-center gap-2 font-medium">
                  <Search className="h-4 w-4 shrink-0" />
                  <span>Showing preview for the first student. Clicking <strong>Print</strong> will generate a clean report packet containing all {students.length} students.</span>
                </div>
              )}

              {/* Google Fonts Preload for Preview Card */}
              <link 
                rel="stylesheet" 
                href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" 
              />

              {/* Sheet Preview Card */}
              <div className="relative bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-6 sm:p-8 md:p-10 border-[6px] border-[#1e3a8a] dark:border-blue-900 rounded-lg shadow-xl overflow-hidden select-none space-y-6">
                
                {/* Gold Inner Inset Border */}
                <div className="absolute inset-2 sm:inset-3 border border-[#d4af37] dark:border-amber-600/40 pointer-events-none rounded z-10" />

                {/* Decorative Corner Accents */}
                <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-[#d4af37] dark:border-amber-600/40 z-20" />
                <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-[#d4af37] dark:border-amber-600/40 z-20" />
                <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-[#d4af37] dark:border-amber-600/40 z-20" />
                <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-[#d4af37] dark:border-amber-600/40 z-20" />

                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                  <div className="transform -rotate-[25deg] border-[3px] border-double border-blue-950/[0.03] dark:border-amber-500/[0.02] rounded-full w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] flex items-center justify-center">
                    <span className="text-[18px] sm:text-[24px] font-black text-blue-950/[0.04] dark:text-amber-500/[0.03] tracking-[6px] uppercase whitespace-nowrap" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      OFFICIAL RECORD
                    </span>
                  </div>
                </div>

                {/* Crest & Logo Letterhead */}
                <div className="text-center pb-4 relative z-10">
                  <div className="flex justify-center mb-2.5">
                    <div className="w-12 h-12 bg-[#1e3a8a] dark:bg-[#1e293b] border-2 border-[#d4af37] rounded-full flex items-center justify-center shadow-md relative">
                      <span className="text-xl filter drop-shadow">🎓</span>
                      <span className="absolute bottom-0.5 text-[6px] text-[#d4af37] font-bold">★</span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-lg sm:text-2xl text-[#1e3a8a] dark:text-blue-400 tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
                    SCHOOL ERP ACADEMY
                  </h3>
                  <p className="text-[8px] sm:text-[9.5px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Official Academic Transcript & Statement of Outcomes
                  </p>
                  <div className="w-16 sm:w-20 h-0.5 bg-[#d4af37] mx-auto mt-2" />
                </div>

                {/* Title Box */}
                <div className="text-center relative z-10">
                  <h4 className="inline-block text-[10px] sm:text-xs font-black uppercase text-[#1e3a8a] dark:text-blue-300 tracking-widest border border-[#1e3a8a] dark:border-blue-900/50 border-x-[4px] py-1.5 px-6 rounded bg-blue-50/50 dark:bg-blue-950/20" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {marksheetType === 'midterm' ? 'Midterm Marksheet' : marksheetType === 'final' ? 'Final Marksheet' : 'Consolidated Report Card'}
                  </h4>
                </div>

                {/* Student Info Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border border-gray-200 dark:border-zinc-800 p-4 rounded-lg bg-zinc-50/60 dark:bg-zinc-900/30 relative z-10">
                  <div className="flex justify-between sm:justify-start gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider w-24 flex items-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>Student Name:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{previewStudent.studentName}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider w-24 flex items-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>Roll Number:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{previewStudent.rollNumber}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider w-24 flex items-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>Class & Section:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{classNameStr} - {classSection}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider w-24 flex items-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>Academic Cycle:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{academicYear}</span>
                  </div>
                </div>

                {/* Subject Table */}
                <div className="rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm bg-white dark:bg-zinc-950 relative z-10">
                  <Table className="w-full text-xs">
                    <TableHeader>
                      <TableRow className="bg-[#1e3a8a] dark:bg-blue-950 hover:bg-[#1e3a8a] dark:hover:bg-blue-950 border-none">
                        <TableHead className="font-bold px-3 py-2.5 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>Subject Name</TableHead>
                        {marksheetType === 'combined' && (
                          <TableHead className="text-center font-bold px-2 py-2.5 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>Midterm</TableHead>
                        )}
                        {marksheetType === 'combined' && (
                          <TableHead className="text-center font-bold px-2 py-2.5 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>Final</TableHead>
                        )}
                        <TableHead className="text-center font-bold px-3 py-2.5 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          {marksheetType === 'combined' ? 'Combined Total' : 'Marks Obtained'}
                        </TableHead>
                        <TableHead className="text-center font-bold px-3 py-2.5 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>Percentage</TableHead>
                        <TableHead className="text-center font-bold w-20 px-3 py-2.5 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewStudent.subjects.map((sub, i) => (
                        <TableRow key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 border-b border-gray-100 dark:border-zinc-800">
                          <TableCell className="font-bold text-zinc-900 dark:text-zinc-100 px-3 py-2.5">
                            {sub.subjectName}
                          </TableCell>
                          {marksheetType === 'combined' && (
                            <TableCell className="text-center font-mono text-zinc-500 dark:text-zinc-400 px-2 py-2.5">
                              {sub.midtermMarks}
                            </TableCell>
                          )}
                          {marksheetType === 'combined' && (
                            <TableCell className="text-center font-mono text-zinc-500 dark:text-zinc-400 px-2 py-2.5">
                              {sub.finalMarks}
                            </TableCell>
                          )}
                          <TableCell className="text-center font-black text-zinc-950 dark:text-white font-mono px-3 py-2.5">
                            {sub.obtained}
                          </TableCell>
                          <TableCell className="text-center font-black text-[#1e3a8a] dark:text-blue-400 font-mono px-3 py-2.5">
                            {sub.percentage}%
                          </TableCell>
                          <TableCell className="text-center px-3 py-2.5">
                            {sub.status === 'pass' && (
                              <span className="badge badge-pass inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30 uppercase">
                                pass
                              </span>
                            )}
                            {sub.status === 'fail' && (
                              <span className="badge badge-fail inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 uppercase">
                                fail
                              </span>
                            )}
                            {sub.status === 'pending' && (
                              <span className="badge badge-pending inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 uppercase">
                                pending
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Grading Scale Detail */}
                <div className="grid grid-cols-7 gap-1 border border-gray-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-2 text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400 text-center font-semibold relative z-10">
                  <div className="border-r border-gray-200 dark:border-zinc-800 last:border-none"><span className="font-bold text-[#1e3a8a] dark:text-blue-400">A+</span> (90%+)</div>
                  <div className="border-r border-gray-200 dark:border-zinc-800 last:border-none"><span className="font-bold text-[#1e3a8a] dark:text-blue-400">A</span> (80-89%)</div>
                  <div className="border-r border-gray-200 dark:border-zinc-800 last:border-none"><span className="font-bold text-[#1e3a8a] dark:text-blue-400">B</span> (70-79%)</div>
                  <div className="border-r border-gray-200 dark:border-zinc-800 last:border-none"><span className="font-bold text-[#1e3a8a] dark:text-blue-400">C</span> (60-69%)</div>
                  <div className="border-r border-gray-200 dark:border-zinc-800 last:border-none"><span className="font-bold text-[#1e3a8a] dark:text-blue-400">D</span> (50-59%)</div>
                  <div className="border-r border-gray-200 dark:border-zinc-800 last:border-none"><span className="font-bold text-[#1e3a8a] dark:text-blue-400">E</span> (40-49%)</div>
                  <div className="last:border-none"><span className="font-bold text-[#1e3a8a] dark:text-blue-400">F</span> (&lt;40%)</div>
                </div>

                {/* Remarks & Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 relative z-10">
                  <div className="md:col-span-7 p-4 border border-gray-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col justify-center">
                    <p className="text-[8px] sm:text-[9.5px] uppercase font-bold text-[#1e3a8a] dark:text-blue-400 tracking-wider mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>Principal Remarks & Evaluation</p>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                      "{previewStudent.remarks}" The student has demonstrated {previewStudent.status === 'pass' ? 'satisfactory academic standards.' : 'need for substantial core reinforcement.'}
                    </p>
                  </div>

                  <div className="md:col-span-5 p-4 border border-gray-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2">
                    <div className="flex justify-between text-xs font-semibold border-b border-gray-150 dark:border-zinc-850 pb-1.5 text-zinc-500 dark:text-zinc-400">
                      <span className="uppercase text-[9px] tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Aggregate Marks:</span>
                      <span className="text-zinc-900 dark:text-white font-bold font-mono">{previewStudent.totalObtainedMarks} / {previewStudent.totalMaxMarks}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold border-b border-gray-150 dark:border-zinc-850 pb-1.5 text-zinc-500 dark:text-zinc-400">
                      <span className="uppercase text-[9px] tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Percentage:</span>
                      <span className="text-[#1e3a8a] dark:text-blue-400 font-bold font-mono">{previewStudent.overallPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold border-b border-gray-150 dark:border-zinc-850 pb-1.5 text-zinc-500 dark:text-zinc-400">
                      <span className="uppercase text-[9px] tracking-wide flex items-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>Overall Grade:</span>
                      <span className={`font-black text-base ${previewStudent.color}`}>{previewStudent.grade}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      <span className="uppercase text-[9px] tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>Academic Standing:</span>
                      {previewStudent.status === 'pass' && (
                        <span className="badge badge-pass inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30 uppercase">PASS</span>
                      )}
                      {previewStudent.status === 'fail' && (
                        <span className="badge badge-fail inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 uppercase">FAIL</span>
                      )}
                      {previewStudent.status === 'pending' && (
                        <span className="badge badge-pending inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 uppercase">PENDING</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visual Signature & Seal Segment */}
                <div className="flex justify-between items-end pt-8 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 border-t border-dashed border-gray-200 dark:border-zinc-800 relative z-10 mt-6">
                  <div className="flex flex-col items-center">
                    <span>Date of Issue: {new Date().toLocaleDateString()}</span>
                  </div>
                  
                  {/* Digital Twin Academic Seal */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-20 h-20 flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-[#d4af37] dark:border-amber-600/40 rounded-full bg-amber-50/10 dark:bg-amber-950/5 flex flex-col items-center justify-center text-[6px] text-[#d4af37] dark:text-amber-500 font-extrabold uppercase text-center leading-tight tracking-wider shadow-inner">
                      <span className="text-[4px] block mb-0.5">★ ★ ★</span>
                      OFFICIAL<br />ACADEMIC SEAL
                    </div>
                  </div>

                  <div className="flex gap-6 sm:gap-12">
                    <div className="flex flex-col items-center">
                      <div className="w-20 sm:w-24 border-b border-zinc-300 dark:border-zinc-700 mb-1" />
                      <span>CLASS TEACHER</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-20 sm:w-24 border-b border-zinc-300 dark:border-zinc-700 mb-1" />
                      <span>PRINCIPAL</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
