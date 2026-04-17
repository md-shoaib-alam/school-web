"use client";

import { Button } from "@/components/ui/button";
import { Download, Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { useRef } from "react";

interface ImportExportButtonsProps {
  onExport: () => void;
  onImport: (file: File) => void;
  importing: boolean;
}

export function ImportExportButtons({
  onExport,
  onImport,
  importing,
}: ImportExportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="text-gray-600 dark:text-gray-400"
        onClick={onExport}
      >
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
          disabled={importing}
        />
        <Button
          variant="outline"
          size="sm"
          className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
        >
          {importing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Import CSV
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hidden sm:flex"
        onClick={() => {
          // Trigger sample download
          window.open("/sample-students.csv", "_blank");
        }}
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Sample
      </Button>
    </div>
  );
}
