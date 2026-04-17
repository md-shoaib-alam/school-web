"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { goeyToast as toast } from "goey-toast";

interface ImportExportButtonsProps {
  canCreate: boolean;
  tenantId: string;
  onImportSuccess: () => void;
}

export function ImportExportButtons({
  canCreate,
  tenantId,
  onImportSuccess,
}: ImportExportButtonsProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: number;
    total: number;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSampleCSV = () => {
    const headers =
      "name,email,phone,class (e.g. 10-A),roll_number,gender,date_of_birth";
    const sampleRows = [
      "John Doe,john@school.com,+1 234 567 890,10-A,001,male,2010-05-15",
      "Jane Smith,jane@school.com,+1 234 567 891,10-A,002,female,2010-08-22",
    ];
    const csv = [headers, ...sampleRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_students.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importFile || !tenantId) {
      toast.error("Please select a file and ensure a tenant is selected.");
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("tenantId", tenantId);
      formData.append("dataType", "students");
      const res = await apiFetch("/api/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Import failed");
      const data = await res.json();
      setImportResult(data);
      if (data.success) {
        toast.success(`Successfully imported ${data.imported} of ${data.total} students.`);
        onImportSuccess();
      } else {
        toast.error(`${data.errors} of ${data.total} records had errors.`);
      }
    } catch {
      setImportResult({ success: false, imported: 0, errors: 0, total: 0 });
      toast.error("An error occurred while importing students.");
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      setImportFile(file);
      setImportResult(null);
    } else {
      toast.error("Please upload a CSV file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };

  if (!canCreate) return null;

  return (
    <>
      <Button
        variant="outline"
        className="text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
        onClick={() => {
          setImportDialogOpen(true);
          setImportFile(null);
          setImportResult(null);
        }}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import Students
      </Button>

      <Dialog
        open={importDialogOpen}
        onOpenChange={(open) => {
          setImportDialogOpen(open);
          if (!open) {
            setImportFile(null);
            setImportResult(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Students</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import students in bulk
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" : "border-muted-foreground/25 hover:border-emerald-400 hover:bg-muted/50"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              {importFile ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className="h-10 w-10 text-emerald-600" />
                  <p className="text-sm font-medium text-foreground">
                    {importFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(importFile.size / 1024).toFixed(1)} KB — Click or drop to
                    replace
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Drop your CSV file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports .csv files only
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">Expected CSV columns:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "name",
                  "email",
                  "phone",
                  "class (e.g. 10-A)",
                  "roll_number",
                  "gender",
                  "date_of_birth",
                ].map((col) => (
                  <Badge
                    key={col}
                    variant="secondary"
                    className="text-xs font-mono"
                  >
                    {col}
                  </Badge>
                ))}
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadSampleCSV();
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Download Sample CSV
              </button>
            </div>

            {importResult && (
              <div
                className={`rounded-lg p-4 flex items-start gap-3 ${importResult.success ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"}`}
              >
                {importResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="text-sm">
                  <p className="font-medium">
                    {importResult.success
                      ? "Import completed"
                      : "Import completed with issues"}
                  </p>
                  <p className="text-muted-foreground">
                    {importResult.imported} of {importResult.total} students
                    imported successfully
                    {importResult.errors > 0 &&
                      ` · ${importResult.errors} errors`}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleImport}
              disabled={!importFile || importing}
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Students
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
