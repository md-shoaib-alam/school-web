"use client";

import React, { memo, useMemo } from "react";
import { AdmitCard, formatDate, formatTime } from "./types";

export const DetailedDualAdmitCard = memo(function DetailedDualAdmitCard({ card }: { card: AdmitCard }) {
  const schoolName = card.school?.name || 'Global Academy';
  const schoolAddress = card.school?.address || 'School Address';
  const todayDateString = useMemo(() => new Date().toISOString().split('T')[0], []);

  return (
    <div 
      className="w-[100%] h-[13.5cm] bg-white rounded-xl border-2  p-5 flex flex-col justify-between relative shadow-sm overflow-hidden print: print:shadow-none print:rounded-none"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}
    >
      <div className="flex gap-6 h-full">
        {/* Left Column: Student Detail Panel & Guidelines */}
        <div className="w-[38%] border-r border-dashed  pr-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* School Branding */}
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-bold text-sm">
                🎓
              </div>
              <div className="leading-tight">
                <h3 className="text-[11px] font-semibold text-foreground truncate max-w-[120px]">{schoolName}</h3>
                <p className="text-[7.5px] text-muted-foreground truncate max-w-[120px]">{schoolAddress}</p>
              </div>
            </div>

            {/* Photo & Roll Badge */}
            <div className="flex flex-col items-center py-2 bg-muted rounded-xl border ">
              <div className="size-20 rounded-lg border-2 border-dashed  bg-white flex flex-col items-center justify-center text-muted-foreground">
                <span className="text-lg font-bold">{card.student.initials}</span>
                <span className="text-[7px]">PHOTO</span>
              </div>
              <div className="mt-2 text-center">
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium block">Roll Number</span>
                <span className="text-sm font-mono font-extrabold text-foreground">{card.student.rollNumber}</span>
              </div>
            </div>

            {/* Main Student Fields */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[8px] font-semibold text-muted-foreground uppercase block">Student Name</span>
                <span className="font-bold text-foreground truncate block">{card.student.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-[8px] font-semibold text-muted-foreground uppercase block">Class</span>
                  <span className="font-bold text-foreground block">{card.class.grade}</span>
                </div>
                <div>
                  <span className="text-[8px] font-semibold text-muted-foreground uppercase block">Section</span>
                  <span className="font-bold text-foreground block">{card.class.section}</span>
                </div>
              </div>
              <div>
                <span className="text-[8px] font-semibold text-muted-foreground uppercase block">D.O.B</span>
                <span className="font-medium text-foreground block" suppressHydrationWarning>{formatDate(card.student.dateOfBirth || '')}</span>
              </div>
            </div>
          </div>

          {/* Rules / Candidate Instructions */}
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-2">
            <span className="text-[8px] font-bold text-amber-800 uppercase block">Instructions</span>
            <ul className="text-[7px] text-foreground list-disc list-inside space-y-0.5 mt-1 leading-tight">
              <li>Must carry printed Admit Card.</li>
              <li>Report 20 mins prior to schedule.</li>
              <li>No phones or calculators.</li>
              <li>Verified by Invigilator.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Title, Schedule, and Official Signatures */}
        <div className="flex-1 flex flex-col justify-between pl-1">
          <div>
            {/* Card Header Title */}
            <div className="flex justify-between items-start border-b  pb-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase">ADMIT CARD / HALL TICKET</h2>
                <p className="text-[8.5px] text-muted-foreground mt-0.5">Session 2024-2025 &bull; School Board Exam</p>
              </div>
              <div className="text-right">
                <span className="text-[8px] bg-zinc-800 text-muted-foreground font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider block">
                  {card.cardNumber}
                </span>
              </div>
            </div>

            {/* Exam Schedule Grid */}
            <div className="mt-4 space-y-1.5">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Subject Schedules</span>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted border-y  text-[8.5px] font-semibold">
                    <th className="text-left py-1.5 px-3 text-foreground">Date</th>
                    <th className="text-left py-1.5 px-3 text-foreground">Subject</th>
                    <th className="text-center py-1.5 px-3 text-foreground">Timing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {card.exams.reduce<React.ReactNode[]>((acc, exam) => {
                    const isScheduled = exam.status?.trim().toLowerCase() === 'scheduled';
                    const isUpcoming = exam.date >= todayDateString;
                    if ((isScheduled || isUpcoming) && !exam.resultPublished) {
                      acc.push(
                        <tr key={exam.id} className="hover:bg-muted">
                          <td className="py-2 px-3 font-medium text-foreground text-[10px]" suppressHydrationWarning>
                            {formatDate(exam.date)}
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-bold text-foreground text-[10px]">{exam.subjectName}</div>
                            <div className="text-[7.5px] font-mono text-muted-foreground">{exam.subjectCode}</div>
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-foreground text-[9.5px]">
                            {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                          </td>
                        </tr>
                      );
                    }
                    return acc;
                  }, [])}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end border-t  pt-4">
            <div className="text-center w-24">
              <div className="h-7 border-b  flex items-end justify-center pb-0.5">
                <span className="text-[7.5px] text-muted-foreground font-mono">SIGNATURE</span>
              </div>
              <p className="text-[7.5px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Student</p>
            </div>
            <div className="text-center w-24">
              <div className="h-7 border-b  flex items-end justify-center pb-0.5">
                <span className="text-[7.5px] text-muted-foreground font-mono font-semibold">APPROVED</span>
              </div>
              <p className="text-[7.5px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Invigilator</p>
            </div>
            <div className="text-center w-28">
              <div className="h-7 flex items-end justify-center pb-0.5">
                <span className="font-mono text-foreground text-[10px] italic font-bold">Principal Office</span>
              </div>
              <div className="border-t-2  w-full" />
              <p className="text-[7.5px] text-foreground uppercase tracking-wider font-bold mt-1">Principal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
