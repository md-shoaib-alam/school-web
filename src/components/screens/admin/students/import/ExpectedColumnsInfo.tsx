"use client";

import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface ExpectedColumnsInfoProps {
  onDownloadSample: (e: React.MouseEvent) => void;
}

const EXPECTED_COLUMNS = [
  "name",
  "email",
  "phone",
  "class (e.g. 10-A)",
  "roll_number",
  "gender",
  "date_of_birth",
  "blood_group",
  "admission_date",
  "transport_route",
  "pickup_point",
];

export function ExpectedColumnsInfo({ onDownloadSample }: ExpectedColumnsInfoProps) {
  return (
    <div className="rounded-lg bg-muted/50 p-4 space-y-2">
      <p className="text-sm font-medium">Expected spreadsheet columns:</p>
      <div className="flex flex-wrap gap-1.5">
        {EXPECTED_COLUMNS.map((col) => (
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
        onClick={onDownloadSample}
      >
        <Download className="size-3.5" />
        Download Sample Template
      </button>
    </div>
  );
}
