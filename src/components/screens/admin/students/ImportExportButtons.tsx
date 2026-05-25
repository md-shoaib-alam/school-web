"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// Sub-components
import { FileUploadZone } from "./import/FileUploadZone";
import { ExpectedColumnsInfo } from "./import/ExpectedColumnsInfo";
import { ImportResultAlert } from "./import/ImportResultAlert";

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

  const downloadSampleTemplate = () => {
    const data = [
      {
        "name": "John Doe",
        "email": "john@school.com",
        "phone": "+91 98765 43210",
        "class (e.g. 10-A)": "10-A",
        "roll_number": "001",
        "gender": "male",
        "date_of_birth": "2010-05-15",
        "blood_group": "O+",
        "admission_date": "2024-04-01",
        "transport_route": "Route 1",
        "pickup_point": "Sector 4 Main Gate"
      },
      {
        "name": "Jane Smith",
        "email": "jane@school.com",
        "phone": "+91 98765 43211",
        "class (e.g. 10-A)": "10-A",
        "roll_number": "002",
        "gender": "female",
        "date_of_birth": "2010-08-22",
        "blood_group": "A-",
        "admission_date": "2024-04-01",
        "transport_route": "",
        "pickup_point": ""
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set custom column widths (in characters) to make every column spacious and easy to read
    worksheet["!cols"] = [
      { wch: 20 }, // name
      { wch: 25 }, // email
      { wch: 18 }, // phone
      { wch: 20 }, // class (e.g. 10-A)
      { wch: 15 }, // roll_number
      { wch: 12 }, // gender
      { wch: 16 }, // date_of_birth
      { wch: 14 }, // blood_group
      { wch: 16 }, // admission_date
      { wch: 20 }, // transport_route
      { wch: 25 }  // pickup_point
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students Template");

    // Write workbook to array buffer and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_students.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Excel template downloaded successfully.");
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
    const extension = file?.name.split('.').pop()?.toLowerCase();
    if (file && ["xlsx", "xls", "csv"].includes(extension || "")) {
      setImportFile(file);
      setImportResult(null);
    } else {
      toast.error("Please upload an Excel (.xlsx, .xls) or CSV file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (["xlsx", "xls", "csv"].includes(extension || "")) {
        setImportFile(file);
        setImportResult(null);
      } else {
        toast.error("Please upload an Excel (.xlsx, .xls) or CSV file.");
      }
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
        <Upload className="size-4 mr-2" />
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
              Upload an Excel (.xlsx, .xls) or CSV (.csv) file to import students in bulk
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FileUploadZone 
              dragOver={dragOver}
              setDragOver={setDragOver}
              onDrop={handleDrop}
              onFileClick={() => fileInputRef.current?.click()}
              importFile={importFile}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
            />

            <ExpectedColumnsInfo 
              onDownloadSample={(e) => {
                e.stopPropagation();
                downloadSampleTemplate();
              }}
            />

            <ImportResultAlert result={importResult} />
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
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
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
