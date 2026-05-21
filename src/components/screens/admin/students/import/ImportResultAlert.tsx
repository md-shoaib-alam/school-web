"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

interface ImportResultAlertProps {
  result: {
    success: boolean;
    imported: number;
    errors: number;
    total: number;
  } | null;
}

export function ImportResultAlert({ result }: ImportResultAlertProps) {
  if (!result) return null;

  return (
    <div
      className={`rounded-lg p-4 flex items-start gap-3 ${result.success ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"}`}
    >
      {result.success ? (
        <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
      )}
      <div className="text-sm">
        <p className="font-medium">
          {result.success
            ? "Import completed"
            : "Import completed with issues"}
        </p>
        <p className="text-muted-foreground">
          {result.imported} of {result.total} students
          imported successfully
          {result.errors > 0 &&
            ` · ${result.errors} errors`}
        </p>
      </div>
    </div>
  );
}
