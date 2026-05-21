'use client';

import { Cinzel, Montserrat, Inter } from 'next/font/google';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ExamRecord } from '../types';

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

interface MarksheetSheetsPreviewProps {
  loading: boolean;
  exams: ExamRecord[];
  students: any[];
  previewStudents: any[];
  zoomScale: number;
  SelectedTemplate: React.ComponentType<any>;
  classNameStr: string;
  classSection: string;
  academicYear: string;
  marksheetType: 'midterm' | 'final' | 'combined';
  selectedStudentId: string;
}

export function MarksheetSheetsPreview({
  loading,
  exams,
  students,
  previewStudents,
  zoomScale,
  SelectedTemplate,
  classNameStr,
  classSection,
  academicYear,
  marksheetType,
  selectedStudentId
}: MarksheetSheetsPreviewProps) {
  return (
    <div className="bg-card border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px] items-center justify-center">
      {loading ? (
        <div className="w-full max-w-4xl space-y-6 py-10 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-72" />
            </div>
          </div>
          <Skeleton className="h-[550px] w-full rounded-2xl" />
        </div>
      ) : exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 text-muted-foreground max-w-md mx-auto animate-in fade-in duration-300">
          <div className="size-16 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="size-8" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Published Exams</h3>
          <p className="text-xs mt-1">
            There are no completed midterm or final exams published under the selected Academic Cycle for this class. Please verify the academic stand or exam configuration.
          </p>
        </div>
      ) : previewStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 text-muted-foreground max-w-md mx-auto animate-in fade-in duration-300">
          <AlertCircle className="size-10 mb-3 opacity-30 animate-in fade-in slide-in-from-top-3 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
          <p className="text-xs">No student records available</p>
        </div>
      ) : (
        <div className={`w-full max-w-4xl mx-auto space-y-4 ${cinzel.className} ${montserrat.className} ${inter.className}`}>
          {selectedStudentId === 'all' && (
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/40 p-4 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-3 font-medium shadow-sm animate-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
              <span>Showing previews for <strong>all {students.length} students</strong>. Scroll down to inspect. Clicking <strong>Print</strong> will generate the clean print packet.</span>
            </div>
          )}

          {/* True A4 parchment layout sheets preview vertical stack with premium scrollbar */}
          <div className="w-full max-h-[75vh] overflow-y-auto overflow-x-auto pb-6 flex flex-col items-center gap-8 bg-zinc-50 dark:bg-zinc-950/20 p-4 sm:p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-inner">
            
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
                  style={{ 
                    width: 794, 
                    height: 1123,
                    transform: `scale(${zoomScale})`,
                    transformOrigin: 'top left'
                  }}
                >
                  <SelectedTemplate 
                    sheet={sheet}
                    classNameStr={classNameStr}
                    classSection={classSection}
                    academicYear={academicYear}
                    marksheetType={marksheetType}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
