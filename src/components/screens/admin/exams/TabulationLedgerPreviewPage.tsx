'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cinzel, Montserrat, Inter } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Printer, ArrowLeft, Search, Layout, AlertCircle, Loader2, Award
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { goeyToast as toast } from 'goey-toast';
import { compileTabularLedgerData, TabularLedgerPrint, LedgerData } from './tabulationLedgerPrinter';
import { LEDGER_TEMPLATES } from './ledger-templates';

interface TabulationLedgerPreviewPageProps {
  classId: string;
  classNameStr: string;
  classSection: string;
  academicYear: string;
  initialTemplateId?: string;
  examName?: string;
  onBack: () => void;
}

export function TabulationLedgerPreviewPage({
  classId,
  classNameStr,
  classSection,
  academicYear,
  initialTemplateId = 'classic',
  examName,
  onBack
}: TabulationLedgerPreviewPageProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId);
  const [state, setState] = useState<{
    loading: boolean;
    ledgerData: LedgerData | null;
  }>({
    loading: false,
    ledgerData: null,
  });
  const { loading, ledgerData } = state;
  const [printing, setPrinting] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(0.65); // Default to 65% zoom for landscape preview
  const [unscaledHeight, setUnscaledHeight] = useState<number>(794);

  const printContainerRef = useRef<HTMLDivElement>(null);
  const contentMeasureRef = useRef<HTMLDivElement>(null);

  // Load tabulation ledger data
  useEffect(() => {
    if (!classId) return;

    const loadData = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const compiled = await compileTabularLedgerData({
          classId,
          className: classNameStr,
          classSection,
          academicYear,
          examName
        });
        if (compiled) {
          setState({ loading: false, ledgerData: compiled });
        } else {
          toast.error("Failed to compile tabulation ledger data");
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error("Failed to load tabulation data:", err);
        toast.error("An error occurred while compiling tabulation data");
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, [classId, classNameStr, classSection, academicYear, examName]);

  // Measure the unscaled height of the printed component dynamically to prevent visual clipping
  useEffect(() => {
    if (!ledgerData || !contentMeasureRef.current) return;
    
    const updateHeight = () => {
      if (contentMeasureRef.current) {
        setUnscaledHeight(contentMeasureRef.current.scrollHeight || contentMeasureRef.current.offsetHeight || 794);
      }
    };

    updateHeight();
    
    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(contentMeasureRef.current);
    return () => observer.disconnect();
  }, [ledgerData, selectedTemplateId]);

  // react-to-print handler
  const handlePrintBase = useReactToPrint({
    contentRef: printContainerRef,
    documentTitle: `Tabulation_Ledger_${classNameStr}_${classSection}`,
    onAfterPrint: () => setPrinting(false),
  });

  const handlePrint = () => {
    if (!ledgerData) return;
    setPrinting(true);
    setTimeout(() => {
      handlePrintBase();
    }, 200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* toolbar */}
      <div className="bg-card border border-gray-150 dark:border-zinc-800/80 p-3 sm:px-4 rounded-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3 justify-between">
        
        {/* Left Side: Back button and details */}
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
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">
              Tabulation Ledger Preview {examName ? `(${examName})` : ''}
            </span>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          
          {/* Select Template Design */}
          <div className="w-full sm:w-[170px]">
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="w-full h-8 rounded-lg text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-900/30 border-gray-200 dark:border-zinc-800 py-1">
                <div className="flex items-center gap-1.5 min-w-0 w-full text-left">
                  <Layout className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate flex-1">
                    <SelectValue placeholder="Select Design" />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {LEDGER_TEMPLATES.map(tmpl => (
                  <SelectItem key={tmpl.id} value={tmpl.id} className="text-xs font-medium">
                    {tmpl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Zoom */}
          <div className="w-full sm:w-[100px]">
            <Select value={zoomScale.toString()} onValueChange={(v) => setZoomScale(parseFloat(v))}>
              <SelectTrigger className="w-full h-8 rounded-lg text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-900/30 border-gray-200 dark:border-zinc-800 py-1">
                <div className="flex items-center gap-1.5 min-w-0 w-full text-left">
                  <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate flex-1">
                    {Math.round(zoomScale * 100)}%
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="0.4" className="text-xs font-medium">40%</SelectItem>
                <SelectItem value="0.5" className="text-xs font-medium">50%</SelectItem>
                <SelectItem value="0.65" className="text-xs font-medium">65%</SelectItem>
                <SelectItem value="0.8" className="text-xs font-medium">80%</SelectItem>
                <SelectItem value="1" className="text-xs font-medium">100%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Print button */}
          <Button 
            onClick={handlePrint}
            disabled={loading || printing || !ledgerData}
            size="sm"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1.5 shadow-sm rounded-lg h-8 px-4 font-bold text-xs transition-all duration-300 transform active:scale-95 justify-center"
          >
            {printing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
            <span>Print Ledger</span>
          </Button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="bg-card border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px] items-center justify-center">
        {loading ? (
          <div className="w-full space-y-6 py-10 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-72" />
              </div>
            </div>
            <Skeleton className="h-[450px] w-full rounded-2xl" />
          </div>
        ) : !ledgerData ? (
          <div className="flex flex-col items-center justify-center text-center py-20 text-muted-foreground max-w-md mx-auto animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">No Ledger Compiled</h3>
            <p className="text-xs mt-1">
              Could not compile academic ledger data for this class. Make sure exams are completed and results are loaded properly.
            </p>
          </div>
        ) : (
          <div className={`w-full flex flex-col items-center ${cinzel.className} ${montserrat.className} ${inter.className}`}>
            {/* A4 Landscape parchment layout sheets preview container */}
            <div className="w-full max-h-[70vh] overflow-y-auto overflow-x-auto pb-6 flex flex-col items-center gap-8 bg-zinc-50 dark:bg-zinc-950/20 p-4 sm:p-6 rounded-2xl border border-gray-150 dark:border-zinc-800/50 shadow-inner">
              <div 
                className="shrink-0 transition-all duration-300 shadow-2xl rounded-lg bg-white overflow-hidden"
                style={{ 
                  width: 1123 * zoomScale, 
                  height: unscaledHeight * zoomScale, 
                }}
              >
                <div 
                  ref={contentMeasureRef}
                  style={{ 
                    width: 1123, 
                    transform: `scale(${zoomScale})`,
                    transformOrigin: 'top left'
                  }}
                >
                  <TabularLedgerPrint data={ledgerData} templateId={selectedTemplateId} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Print Wrapper */}
      {ledgerData && (
        <div className="hidden">
          <div ref={printContainerRef} className="print:block bg-white min-h-screen">
            <TabularLedgerPrint data={ledgerData} templateId={selectedTemplateId} />
          </div>
        </div>
      )}
    </div>
  );
}
