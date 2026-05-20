import React from 'react';
import { LedgerTemplateProps } from './types';

export const ClassicAcademic: React.FC<LedgerTemplateProps> = ({ data }) => {
  return (
    <div 
      className="p-[6mm] bg-white text-slate-800 font-sans print:p-0 min-h-screen"
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

      {/* Header */}
      <div className="text-center mb-4 border-b-2 border-slate-200 pb-3">
        <h1 className="font-bold text-xl tracking-wider text-slate-900 uppercase font-serif">{data.schoolName}</h1>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{data.ledgerTitle}</h2>
        <div className="flex justify-center gap-10 mt-2 text-[10px] font-semibold text-slate-600">
          <div>CLASS: <span className="text-slate-900 font-bold">{data.className} - {data.classSection}</span></div>
          <div>ACADEMIC YEAR: <span className="text-slate-900 font-bold">{data.academicYear}</span></div>
          <div>DATE GENERATED: <span className="text-slate-900 font-bold">{new Date().toLocaleDateString()}</span></div>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded p-2 mb-3 text-[9.5px] text-slate-600 font-semibold">
        <div>TOTAL STUDENTS: <span className="text-slate-900">{data.totalStudents}</span></div>
        <div>PASSED: <span className="text-green-600">{data.passCount}</span></div>
        <div>FAILED: <span className="text-red-600">{data.failCount}</span></div>
        {data.pendingCount > 0 && <div>PENDING: <span className="text-amber-600">{data.pendingCount}</span></div>}
        <div>CLASS PASS RATE: <span className="text-slate-900">{data.totalStudents > 0 ? ((data.passCount / data.totalStudents) * 100).toFixed(1) + '%' : '0%'}</span></div>
        <div>CLASS AVERAGE: <span className="text-slate-900">{data.classAverage}</span></div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-slate-350 text-[9.5px]">
        <thead>
          <tr className="bg-slate-100/80 text-slate-900 border-b border-slate-350 font-bold">
            <th className="border border-slate-350 p-1 text-center w-[40px]">S.NO</th>
            <th className="border border-slate-350 p-1 text-center w-[60px]">ROLL</th>
            <th className="border border-slate-350 p-1 text-left">STUDENT NAME</th>
            {data.subjectsList.map(sub => (
              <th key={sub} className="border border-slate-350 p-1 text-center">
                {sub} <br />
                <span className="text-[7.5px] text-slate-500 font-normal">({data.subjectMaxMarks[sub] || 100})</span>
              </th>
            ))}
            <th className="border border-slate-350 p-1 text-center w-[70px]">TOTAL</th>
            <th className="border border-slate-350 p-1 text-center w-[80px]">PERCENTAGE</th>
            <th className="border border-slate-350 p-1 text-center w-[50px]">GRADE</th>
            <th className="border border-slate-350 p-1 text-center w-[70px]">RESULT</th>
          </tr>
        </thead>
        <tbody>
          {data.studentsTabulation.map((student, idx) => (
            <tr key={idx} className="hover:bg-slate-50 border-b border-slate-200">
              <td className="border border-slate-300 p-1 text-center font-normal">{idx + 1}</td>
              <td className="border border-slate-300 p-1 text-center font-normal">{student.rollNumber}</td>
              <td className="border border-slate-300 p-1 text-left font-medium">{student.name}</td>
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
                  <td key={sub} className={`border border-slate-300 p-1 text-center font-normal ${isFailed ? 'text-red-650 font-medium' : ''}`}>
                    {marks.marksObtained}/{marks.totalMarks}
                  </td>
                );
              })}
              <td className="border border-slate-300 p-1 text-center font-medium bg-slate-50/50">{student.totalObtained}/{student.totalMax}</td>
              <td className="border border-slate-300 p-1 text-center font-medium bg-slate-50/50">{student.percentage}</td>
              <td className={`border border-slate-300 p-1 text-center font-semibold ${
                student.grade === 'A+' || student.grade === 'A' ? 'text-blue-900' : student.grade === 'F' ? 'text-red-650' : 'text-slate-700'
              }`}>
                {student.grade}
              </td>
              <td className={`border border-slate-300 p-1 text-center font-bold ${
                student.status === 'PASS' ? 'text-green-700' : student.status === 'FAIL' ? 'text-red-650' : 'text-amber-600'
              }`}>
                {student.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Signatures */}
      <div className="flex justify-between mt-12 px-8 text-[10px] font-semibold text-slate-500">
        <div className="flex flex-col items-center">
          <div className="w-[120px] border-b border-slate-300 mb-1"></div>
          <span>CLASS TEACHER</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[120px] border-b border-slate-300 mb-1"></div>
          <span>EXAM CONTROLLER</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[120px] border-b border-slate-300 mb-1"></div>
          <span>PRINCIPAL</span>
        </div>
      </div>
    </div>
  );
};
