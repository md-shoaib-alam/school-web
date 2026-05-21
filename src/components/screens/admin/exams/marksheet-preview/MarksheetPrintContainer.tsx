'use client';

import { RefObject } from 'react';

interface MarksheetPrintContainerProps {
  printContainerRef: RefObject<HTMLDivElement | null>;
  previewStudents: any[];
  SelectedTemplate: React.ComponentType<any>;
  classNameStr: string;
  classSection: string;
  academicYear: string;
  marksheetType: 'midterm' | 'final' | 'combined';
}

export function MarksheetPrintContainer({
  printContainerRef,
  previewStudents,
  SelectedTemplate,
  classNameStr,
  classSection,
  academicYear,
  marksheetType
}: MarksheetPrintContainerProps) {
  return (
    <div className="hidden">
      <div ref={printContainerRef} className="print:block bg-white min-h-screen">
        <style type="text/css" media="print">
          {`
            @page { 
              size: portrait; 
              margin: 0mm; 
            } 
            body { 
              margin: 0; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
            .marksheet-page-break {
              page-break-after: always;
              break-after: page;
            }
            .marksheet-page-break:last-child {
              page-break-after: avoid;
              break-after: avoid;
            }
          `}
        </style>
        {previewStudents.map((sheet, index) => (
          <div key={index} className="marksheet-page-break">
            <SelectedTemplate 
              sheet={sheet}
              classNameStr={classNameStr}
              classSection={classSection}
              academicYear={academicYear}
              marksheetType={marksheetType}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
