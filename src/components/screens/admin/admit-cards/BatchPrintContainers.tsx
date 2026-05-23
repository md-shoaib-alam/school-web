"use client";

import { AdmitCardVisual } from "./AdmitCardVisual";

interface BatchPrintContainersProps {
  preparingPrint: boolean;
  allCardsRef: React.RefObject<HTMLDivElement | null>;
  singleCardRef: React.RefObject<HTMLDivElement | null>;
  admitCards: any[];
  viewCard: any | null;
  selectedClassId: string;
  templateId?: string;
}

export function BatchPrintContainers({
  preparingPrint,
  allCardsRef,
  singleCardRef,
  admitCards,
  viewCard,
  templateId = 'classic_quad',
}: BatchPrintContainersProps) {
  const cardsPerPage = templateId === 'compact_dual' ? 2 : 4;

  return (
    <>
      {/* Hidden Batch Print Container */}
      {preparingPrint && (
        <div className="hidden">
          <div ref={allCardsRef} className="print:block p-0">
            <style type="text/css" media="print">
              {"@page { size: A4; margin: 0mm; } body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .admit-card-page { page-break-after: always; }"}
            </style>
            {Array.from({ length: Math.ceil(admitCards.length / cardsPerPage) }).map((_, pageIdx) => (
              <div 
                key={`page-${pageIdx}`} 
                className={templateId === 'compact_dual'
                  ? "grid grid-cols-1 gap-y-6 p-[12mm] admit-card-page h-[29.7cm] content-start bg-white"
                  : "grid grid-cols-2 gap-x-4 gap-y-6 p-[8mm] admit-card-page h-[29.7cm] content-start bg-white"
                }
              >
                {admitCards.slice(pageIdx * cardsPerPage, (pageIdx + 1) * cardsPerPage).map((card) => (
                  <div 
                    key={card.cardNumber} 
                    className={templateId === 'compact_dual'
                      ? "flex items-center justify-center h-[12.8cm] p-1 border border-dashed border-zinc-200"
                      : "flex items-center justify-center h-[13.8cm] p-1 border border-dashed border-zinc-300 print:border-zinc-400"
                    }
                    style={{ 
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid'
                    }}
                  >
                    <div className="size-full flex items-center justify-center p-1">
                      <AdmitCardVisual card={card} templateId={templateId} />
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
              <div 
                className={templateId === 'compact_dual'
                  ? "flex items-center justify-center h-[12.8cm] p-1 border border-dashed border-zinc-300 print:border-zinc-400 w-full"
                  : "flex items-center justify-center h-[13.8cm] p-1 border border-dashed border-zinc-300 print:border-zinc-400 w-[10.5cm]"
                }
              >
                <div className="size-full flex items-center justify-center p-1">
                  <AdmitCardVisual card={viewCard} templateId={templateId} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
