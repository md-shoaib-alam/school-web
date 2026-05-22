"use client";

import { AdmitCardVisual } from "./AdmitCardVisual";

interface BatchPrintContainersProps {
  preparingPrint: boolean;
  allCardsRef: React.RefObject<HTMLDivElement | null>;
  singleCardRef: React.RefObject<HTMLDivElement | null>;
  admitCards: any[];
  viewCard: any | null;
  selectedClassId: string;
}

export function BatchPrintContainers({
  preparingPrint,
  allCardsRef,
  singleCardRef,
  admitCards,
  viewCard,
}: BatchPrintContainersProps) {
  return (
    <>
      {/* Hidden Batch Print Container */}
      {preparingPrint && (
        <div className="hidden">
          <div ref={allCardsRef} className="print:block p-0">
            <style type="text/css" media="print">
              {"@page { size: A4; margin: 0mm; } body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .admit-card-page { page-break-after: always; }"}
            </style>
            {Array.from({ length: Math.ceil(admitCards.length / 4) }).map((_, pageIdx) => (
              <div key={`page-${pageIdx}`} className="grid grid-cols-2 gap-x-4 gap-y-6 p-[8mm] admit-card-page h-[29.7cm] content-start">
                {admitCards.slice(pageIdx * 4, (pageIdx + 1) * 4).map((card) => (
                  <div 
                    key={card.cardNumber} 
                    className="flex items-center justify-center h-[13.8cm] p-1 border border-dashed border-zinc-300 print:border-zinc-400"
                    style={{ 
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid'
                    }}
                  >
                    <div className="size-full flex items-center justify-center p-1">
                      <AdmitCardVisual card={card} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden Single Print Container */}
      <div className="hidden">
        <div ref={singleCardRef} className="print:block p-0 bg-white">
          <style type="text/css" media="print">
            {"@page { size: A4; margin: 0mm; } body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }"}
          </style>
          {viewCard && (
            <div className="w-[21cm] h-[29.7cm] p-[5mm] flex flex-wrap content-start">
              <div className="flex items-center justify-center h-[13.8cm] p-1 border border-dashed border-zinc-300 print:border-zinc-400 w-[10.5cm]">
                <div className="size-full flex items-center justify-center p-1">
                  <AdmitCardVisual card={viewCard} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
