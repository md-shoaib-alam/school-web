import { apiFetch } from '@/lib/api';
import { goeyToast as toast } from 'goey-toast';
import { ExamRecord } from './types';

export const handlePrintTabularLedger = async ({
  classId,
  className,
  classSection,
  academicYear,
  setPrintingLedgerClassId,
}: {
  classId: string;
  className: string;
  classSection: string;
  academicYear: string;
  setPrintingLedgerClassId: (id: string | null) => void;
}) => {
  setPrintingLedgerClassId(classId);
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
      setPrintingLedgerClassId(null);
      return;
    }

    if (completedExams.length === 0) {
      toast.error('No completed exams found for this academic cycle.');
      setPrintingLedgerClassId(null);
      return;
    }

    // 2. Fetch results for each completed exam in parallel
    const resultsPromises = completedExams.map(async (exam: ExamRecord) => {
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

    const allExamResults = await Promise.all(resultsPromises);

    // 3. Compile tabulation data
    // For each student, calculate marks for each subject (completed exam)
    const studentsTabulation = loadedStudents.map((student: any) => {
      let totalObtained = 0;
      let totalMax = 0;
      const subjectMarks: Record<string, { marksObtained: number; totalMarks: number; status: string }> = {};

      allExamResults.forEach(er => {
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

      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      
      let hasFail = false;
      let hasPending = false;
      Object.values(subjectMarks).forEach(s => {
        if (s.status === 'fail') hasFail = true;
        if (s.status === 'pending' || s.status === 'absent') hasPending = true;
      });

      let overallStatus = 'PASS';
      if (hasPending) overallStatus = 'PENDING';
      else if (hasFail || percentage < 40) overallStatus = 'FAIL';

      return {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber || '-',
        subjectMarks,
        totalObtained,
        totalMax,
        percentage: percentage.toFixed(1) + '%',
        status: overallStatus
      };
    });

    // Get unique subjects list
    const subjectsList = Array.from(new Set(allExamResults.map(er => er.subjectName)));

    // 4. Generate beautiful A4 landscape HTML print document
    const schoolName = loadedStudents[0]?.schoolName || 'SCHOOL ERP ACADEMY';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tabulation Ledger - ${className} ${classSection}</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          body {
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #cbd5e1;
            padding-bottom: 15px;
          }
          .school-title {
            font-family: 'Montserrat', sans-serif;
            font-size: 22px;
            font-weight: 800;
            color: #1e3a8a;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .ledger-subtitle {
            font-size: 13px;
            font-weight: 700;
            color: #64748b;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .meta-grid {
            display: flex;
            justify-content: center;
            gap: 40px;
            font-size: 11px;
            font-weight: 600;
            color: #334155;
          }
          .meta-item span {
            color: #1e3a8a;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 10.5px;
          }
          th, td {
            border: 1px solid #94a3b8;
            padding: 7px 8px;
            text-align: center;
          }
          th {
            background-color: #f1f5f9;
            color: #0f172a;
            font-weight: 700;
            font-family: 'Montserrat', sans-serif;
            text-transform: uppercase;
            font-size: 9.5px;
          }
          .student-info {
            text-align: left;
            font-weight: 600;
          }
          .roll-col {
            width: 50px;
          }
          .name-col {
            text-align: left;
            padding-left: 10px;
          }
          .marks-cell {
            font-weight: 500;
          }
          .fail-marks {
            color: #dc2626;
            font-weight: 700;
          }
          .total-cell {
            font-weight: 700;
            background-color: #f8fafc;
          }
          .status-pass {
            color: #16a34a;
            font-weight: 750;
          }
          .status-fail {
            color: #dc2626;
            font-weight: 750;
          }
          .status-pending {
            color: #d97706;
            font-weight: 750;
          }
          .footer-signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            padding: 0 30px;
          }
          .signature-line {
            width: 150px;
            border-bottom: 1.5px solid #94a3b8;
            margin-bottom: 6px;
          }
          .signature-box {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="school-title">${schoolName}</h1>
          <h2 class="ledger-subtitle">Consolidated Tabular Results Sheet</h2>
          <div class="meta-grid">
            <div class="meta-item">CLASS: <span>${className} - ${classSection}</span></div>
            <div class="meta-item">ACADEMIC YEAR: <span>${academicYear}</span></div>
            <div class="meta-item">DATE GENERATED: <span>${new Date().toLocaleDateString()}</span></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="roll-col">ROLL</th>
              <th class="name-col">STUDENT NAME</th>
              ${subjectsList.map(sub => `<th>${sub}</th>`).join('')}
              <th>TOTAL</th>
              <th>PERCENTAGE</th>
              <th>RESULT</th>
            </tr>
          </thead>
          <tbody>
            ${studentsTabulation.map(student => `
              <tr>
                <td class="roll-col">${student.rollNumber}</td>
                <td class="name-col">${student.name}</td>
                ${subjectsList.map(sub => {
                  const marks = student.subjectMarks[sub];
                  if (!marks) return '<td>-</td>';
                  if (marks.status === 'pending') {
                    return `<td class="marks-cell" style="color: #64748b; font-style: italic; font-size: 9px; font-weight: 500;">PENDING</td>`;
                  }
                  if (marks.status === 'absent') {
                    return `<td class="marks-cell" style="color: #dc2626; font-style: italic; font-weight: 700;">ABSENT</td>`;
                  }
                  const isFailed = marks.status === 'fail';
                  return `<td class="marks-cell ${isFailed ? 'fail-marks' : ''}">${marks.marksObtained}/${marks.totalMarks}</td>`;
                }).join('')}
                <td class="total-cell">${student.totalObtained}/${student.totalMax}</td>
                <td class="total-cell">${student.percentage}</td>
                <td class="${student.status === 'PASS' ? 'status-pass' : student.status === 'FAIL' ? 'status-fail' : 'status-pending'}">${student.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer-signatures">
          <div class="signature-box">
            <div class="signature-line"></div>
            <span>CLASS TEACHER</span>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <span>EXAM CONTROLLER</span>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <span>PRINCIPAL</span>
          </div>
        </div>
      </body>
      </html>
    `;

    // 5. Create sandboxed print iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) {
      setPrintingLedgerClassId(null);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        setPrintingLedgerClassId(null);
      }, 1000);
    }, 300);

  } catch (err) {
    console.error('Error generating tabulation ledger:', err);
    toast.error('Failed to generate tabulation ledger.');
    setPrintingLedgerClassId(null);
  }
};
