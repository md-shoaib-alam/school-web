"use client";

import React, { memo, useMemo } from "react";
import { AdmitCard, formatDate, formatTime } from "./types";

export const MinimalTicketAdmitCard = memo(function MinimalTicketAdmitCard({ card }: { card: AdmitCard }) {
  const schoolName = card.school?.name || 'Global Academy';
  const todayDateString = useMemo(() => new Date().toISOString().split('T')[0], []);

  return (
    <div 
      className="w-[100%] h-[13cm] bg-white rounded-lg border  overflow-hidden shadow-sm flex relative h-[13cm] print:h-[13.5cm] print:w-[9.6cm]"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}
    >
      {/* LEFT SECTION (72%) */}
      <div className="w-[72%] p-3 flex flex-col justify-between h-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b  pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🎫</span>
              <h2 className="text-[10px] font-semibold tracking-wide text-foreground uppercase truncate max-w-[150px]">{schoolName}</h2>
            </div>
            <span className="text-[7.5px] uppercase font-mono tracking-widest text-muted-foreground font-bold bg-muted border px-1.5 py-0.5 rounded">
              ADMIT CARD
            </span>
          </div>

          {/* Student details block */}
          <div className="grid grid-cols-3 gap-2 my-2 text-[9px]">
            <div>
              <span className="text-[7px] text-muted-foreground uppercase font-semibold block">CANDIDATE</span>
              <span className="font-bold text-foreground truncate block">{card.student.name}</span>
            </div>
            <div>
              <span className="text-[7px] text-muted-foreground uppercase font-semibold block">ROLL NUMBER</span>
              <span className="font-mono font-bold text-foreground block">{card.student.rollNumber}</span>
            </div>
            <div>
              <span className="text-[7px] text-muted-foreground uppercase font-semibold block">CLASS & SEC</span>
              <span className="font-bold text-foreground block truncate">{card.class.grade} - {card.class.section}</span>
            </div>
          </div>

          {/* Timetable table */}
          <div className="mt-2 space-y-1">
            <span className="text-[7.5px] font-bold text-muted-foreground uppercase tracking-wider block">SUBJECT TIMETABLE</span>
            <table className="w-full text-[8.5px] border  rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted border-b  text-[7px] font-bold">
                  <th className="text-left py-1 px-2 text-muted-foreground">Date</th>
                  <th className="text-left py-1 px-2 text-muted-foreground">Subject</th>
                  <th className="text-center py-1 px-2 text-muted-foreground">Timing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {card.exams.reduce<React.ReactNode[]>((acc, exam) => {
                  const isScheduled = exam.status?.trim().toLowerCase() === 'scheduled';
                  const isUpcoming = exam.date >= todayDateString;
                  if ((isScheduled || isUpcoming) && !exam.resultPublished) {
                    acc.push(
                      <tr key={exam.id}>
                        <td className="py-1 px-2 font-medium text-foreground" suppressHydrationWarning>{formatDate(exam.date)}</td>
                        <td className="py-1 px-2 font-bold text-foreground">{exam.subjectName}</td>
                        <td className="py-1 px-2 text-center font-mono text-muted-foreground">
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

        {/* Footer info */}
        <div className="flex items-center justify-between border-t  pt-2 text-[7.5px] text-muted-foreground">
          <p suppressHydrationWarning>Date: {new Date(card.generatedAt).toLocaleDateString()}</p>
          <div className="size-fit font-mono font-bold text-foreground bg-muted px-1 rounded select-none">
            {card.cardNumber.split('-').pop()}
          </div>
        </div>
      </div>

      {/* DASHED SEPARATOR LINE */}
      <div className="absolute top-0 bottom-0 left-[72%] w-0 border-l border-dashed  flex flex-col justify-around items-center z-10 select-none no-print">
        <span className="text-[5.5px] text-muted-foreground font-bold tracking-widest uppercase origin-center -rotate-90">TEAR HERE</span>
      </div>

      {/* RIGHT SECTION: DESK SLIP / TEAR-OFF (28%) */}
      <div className="w-[28%] bg-muted p-3 flex flex-col justify-between h-full border-l  relative">
        <div className="space-y-3">
          <div className="text-center border-b  pb-2">
            <span className="text-[7.5px] font-black tracking-widest text-foreground uppercase block">DESK SLIP</span>
            <span className="text-[6.5px] text-muted-foreground block">Invigilator Copy</span>
          </div>

          <div className="space-y-2 text-[8px]">
            <div>
              <span className="text-[6.5px] text-muted-foreground uppercase font-semibold block">CANDIDATE</span>
              <span className="font-bold text-foreground truncate block">{card.student.name.split(' ')[0]}</span>
            </div>
            <div>
              <span className="text-[6.5px] text-muted-foreground uppercase font-semibold block">ROLL NUMBER</span>
              <span className="font-mono font-extrabold text-foreground block">{card.student.rollNumber}</span>
            </div>
            <div>
              <span className="text-[6.5px] text-muted-foreground uppercase font-semibold block">CLASS & SEC</span>
              <span className="font-bold text-foreground block">{card.class.grade} - {card.class.section}</span>
            </div>
          </div>
        </div>

        {/* Verification Barcode */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-[1px] h-5 bg-white border  p-0.5 rounded select-none">
            {[1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1].map((w, idx) => (
              <div key={idx} className="bg-zinc-800 h-full" style={{ width: `${w}px` }} />
            ))}
          </div>
          <div className="text-center">
            <span className="text-[6px] font-mono text-muted-foreground">{card.cardNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
