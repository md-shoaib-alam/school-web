import React, { useState, useRef } from 'react';
import { createRoot } from "react-dom/client";
import { goeyToast as toast } from "goey-toast";
import { useReactToPrint } from 'react-to-print';
import { Printer, Loader2 } from 'lucide-react';
import { AdmitCardVisual } from './AdmitCardVisual';

interface AdmitCardPrintPreviewProps {
  admitCards: any[];
  classNameStr: string;
  classSection: string;
  onBack: () => void;
}

function AdmitCardPrintPreview({
  admitCards,
  classNameStr,
  classSection,
  onBack
}: AdmitCardPrintPreviewProps) {
  const [zoomScale, setZoomScale] = useState<number>(0.6);
  const [printing, setPrinting] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic_quad');
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrintBase = useReactToPrint({
    contentRef: printContainerRef,
    documentTitle: `Admit_Cards_${classNameStr}_${classSection}`,
    onAfterPrint: () => setPrinting(false),
  });

  const handlePrint = () => {
    if (admitCards.length === 0) return;
    setPrinting(true);
    setTimeout(() => {
      handlePrintBase();
    }, 200);
  };

  const cardsPerPage = selectedTemplate === 'compact_dual' ? 2 : 4;
  const totalPages = Math.ceil(admitCards.length / cardsPerPage);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans">
      {/* Custom Standalone Toolbar */}
      <div className="toolbar no-print">
        <div className="toolbar-title flex items-center gap-2">
          <span style={{ fontSize: "1.1rem" }}>🎫</span>
          <span className="font-bold tracking-tight text-white">Admit Card Workspace</span>
          <span className="toolbar-badge select-none">{classNameStr} - {classSection}</span>
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider ml-2 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
            {admitCards.length} Cards
          </span>
        </div>
        
        <div className="toolbar-actions flex items-center gap-3">
          {/* Template Switcher */}
          <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
            <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">Style:</span>
            <select 
              value={selectedTemplate} 
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="bg-zinc-800 text-white text-xs font-bold border-none rounded px-2 py-1 outline-none cursor-pointer focus:ring-1 focus:ring-amber-500"
              style={{ colorScheme: 'dark' }}
            >
              <option value="classic_quad">Classic Quad (4 per A4)</option>
              <option value="premium_modern">Premium Modern (4 per A4)</option>
              <option value="compact_dual">Detailed Dual (2 per A4)</option>
              <option value="minimal_ticket">Minimalist Ticket (4 per A4)</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="zoom-controls">
            <button 
              type="button"
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
              type="button"
              className="zoom-btn" 
              onClick={() => setZoomScale(Math.min(zoomScale + 0.1, 1.5))}
              title="Zoom In"
            >
              +
            </button>
          </div>
          
          <button type="button" className="action-btn bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handlePrint} disabled={printing}>
            {printing ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Printing...
              </>
            ) : (
              <>
                <Printer className="size-3.5 mr-1.5" />
                Print Cards
              </>
            )}
          </button>
          
          <button type="button" className="action-btn action-btn-secondary" onClick={onBack}>
            Close Preview
          </button>
        </div>
      </div>
      
      {/* Scrollable grid pattern viewport */}
      <div className="viewer-container overflow-y-auto flex-1 flex flex-col items-center justify-start">
        <div className="flex flex-col items-center gap-8 py-10 w-full animate-in fade-in duration-300">
          {Array.from({ length: totalPages }).map((_, pageIdx) => (
            <div 
              key={`page-${pageIdx}`}
              className="shrink-0 transition-all duration-300 paper-shadow bg-white flex flex-col justify-start"
              style={{ 
                width: 794 * zoomScale, 
                height: 1123 * zoomScale, 
                overflow: 'hidden' 
              }}
            >
              <div 
                className={selectedTemplate === 'compact_dual' 
                  ? "grid grid-cols-1 gap-y-6 p-[12mm] content-start bg-white"
                  : "grid grid-cols-2 gap-x-4 gap-y-6 p-[8mm] content-start bg-white"
                }
                style={{ 
                  width: 794, 
                  height: 1123,
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top left'
                }}
              >
                {admitCards.slice(pageIdx * cardsPerPage, (pageIdx + 1) * cardsPerPage).map((card) => (
                  <div 
                    key={card.cardNumber} 
                    className={selectedTemplate === 'compact_dual'
                      ? "flex items-center justify-center h-[12.8cm] p-1 border border-dashed border-zinc-200"
                      : "flex items-center justify-center h-[13.8cm] p-1 border border-dashed border-zinc-300"
                    }
                  >
                    <div className="size-full flex items-center justify-center p-1">
                      <AdmitCardVisual card={card} templateId={selectedTemplate} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden high-fidelity print container */}
      <div className="hidden">
        <div ref={printContainerRef} className="print:block p-0">
          <style type="text/css" media="print">
            {"@page { size: A4; margin: 0mm; } body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .admit-card-page { page-break-after: always; }"}
          </style>
          {Array.from({ length: totalPages }).map((_, pageIdx) => (
            <div 
              key={`page-print-${pageIdx}`} 
              className={selectedTemplate === 'compact_dual'
                ? "grid grid-cols-1 gap-y-6 p-[12mm] admit-card-page h-[29.7cm] content-start bg-white"
                : "grid grid-cols-2 gap-x-4 gap-y-6 p-[8mm] admit-card-page h-[29.7cm] content-start bg-white"
              }
            >
              {admitCards.slice(pageIdx * cardsPerPage, (pageIdx + 1) * cardsPerPage).map((card) => (
                <div 
                  key={`print-${card.cardNumber}`} 
                  className={selectedTemplate === 'compact_dual'
                    ? "flex items-center justify-center h-[12.8cm] p-1 border border-dashed border-zinc-200"
                    : "flex items-center justify-center h-[13.8cm] p-1 border border-dashed border-zinc-300"
                  }
                  style={{ 
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                  }}
                >
                  <div className="size-full flex items-center justify-center p-1">
                    <AdmitCardVisual card={card} templateId={selectedTemplate} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function handleAdmitCardPreviewNewTab({
  admitCards,
  classNameStr,
  classSection,
}: {
  admitCards: any[];
  classNameStr: string;
  classSection: string;
}) {
  const previewWindow = window.open("", "_blank");
  if (!previewWindow) {
    toast.error("Popup blocked! Please allow popups to view the admit card preview.");
    return;
  }

  // Build standard document structure with custom viewer styling
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Admit Card Preview - ${classNameStr} (${classSection})</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          color: #0f172a;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        /* Top bar styling */
        .toolbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #065f46 0%, #0f172a 100%); /* Warm Emerald to Slate */
          color: #ffffff;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .toolbar-title {
          font-size: 0.875rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          letter-spacing: 0.025em;
        }
        
        .toolbar-badge {
          font-size: 0.7rem;
          font-weight: 600;
          color: #a7f3d0; /* emerald-200 */
          background-color: rgba(16, 185, 129, 0.15); /* emerald-500 */
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .zoom-controls {
          display: flex;
          align-items: center;
          background-color: rgba(15, 23, 42, 0.6);
          padding: 0.25rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .zoom-btn {
          background: none;
          border: none;
          color: #94a3b8;
          padding: 0.25rem 0.625rem;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border-radius: 0.25rem;
          transition: all 0.15s ease;
        }
        
        .zoom-btn:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.08);
        }
        
        .zoom-btn.active {
          color: #ffffff;
          background-color: #10b981; /* emerald-500 */
        }
        
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
          color: #ffffff;
          padding: 0.45rem 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        }
        
        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        }
        
        .action-btn-secondary {
          background-color: rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
          box-shadow: none;
        }
        
        .action-btn-secondary:hover {
          background-color: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          box-shadow: none;
        }
        
        .viewer-container {
          flex: 1;
          overflow: auto;
          padding: 2.5rem;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          background-color: #f1f5f9;
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 16px 16px;
        }
        
        .paper-shadow {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-radius: 0.5rem;
          background-color: #ffffff;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
          }
          .viewer-container {
            padding: 0 !important;
            background: none !important;
            overflow: visible !important;
          }
          .paper-shadow {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            width: 794px !important;
            height: 1123px !important;
            transform: none !important;
          }
          #preview-root {
            transform: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div id="preview-root"></div>
    </body>
    </html>
  `);
  previewWindow.document.close();

  // Copy CSS and stylesheets
  // 1. Copy link and style elements
  Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).forEach((styleNode) => {
    previewWindow.document.head.appendChild(styleNode.cloneNode(true));
  });

  // 2. Clone active stylesheets directly
  try {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        if (sheet.href) {
          const link = previewWindow.document.createElement('link');
          link.rel = 'stylesheet';
          link.href = sheet.href;
          previewWindow.document.head.appendChild(link);
        } else if (sheet.cssRules) {
          const style = previewWindow.document.createElement('style');
          Array.from(sheet.cssRules).forEach((rule) => {
            style.appendChild(previewWindow.document.createTextNode(rule.cssText));
          });
          previewWindow.document.head.appendChild(style);
        }
      } catch (e) {
        // Ignore cross-origin rules access restrictions
      }
    });
  } catch (e) {
    console.warn("Failed to copy stylesheet rules directly:", e);
  }

  // Mount React Component
  const container = previewWindow.document.getElementById("preview-root");
  if (container) {
    const root = createRoot(container);
    root.render(
      React.createElement(AdmitCardPrintPreview, {
        admitCards,
        classNameStr,
        classSection,
        onBack: () => previewWindow.close(),
      })
    );
  }
}
