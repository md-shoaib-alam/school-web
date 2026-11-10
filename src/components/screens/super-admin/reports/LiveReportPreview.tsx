"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ColumnDefinition } from "./types";

interface LiveReportPreviewProps {
  columns: ColumnDefinition[];
  selectedColumns: string[];
  data: any[];
  isLoading: boolean;
}

export function LiveReportPreview({
  columns,
  selectedColumns,
  data,
  isLoading
}: LiveReportPreviewProps) {
  return (
    <div className="space-y-3 pt-2 text-left">
      <div className="flex justify-between items-center border-t  pt-4">
        <label className="text-xs font-medium text-muted-foreground">Live Report Preview (Top 5 Matches)</label>
        <Badge className="bg-muted border  text-foreground font-semibold px-2 py-0.5 rounded-full uppercase">
          {data.length} records matched
        </Badge>
      </div>

      <div className="overflow-x-auto border  rounded-xl max-h-72">
        <table className="min-w-full divide-y divide-border text-xs">
          <thead className="bg-muted sticky top-0">
            <tr>
              {columns
                .filter(col => selectedColumns.includes(col.id))
                .map(col => (
                  <th key={col.id} className="px-4 py-3 text-left font-semibold text-muted-foreground tracking-wider">
                    {col.label}
                  </th>
                ))}
              {selectedColumns.length === 0 && (
                <th className="px-4 py-3 text-center text-muted-foreground">No columns selected</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {isLoading ? (
              <tr>
                <td colSpan={selectedColumns.length || 1} className="px-4 py-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin text-teal-600" />
                    <span>Loading live system records...</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.slice(0, 5).map((row: any, rIdx) => (
                <tr key={rIdx} className="hover:bg-accent/30 transition-colors">
                  {columns
                    .filter(col => selectedColumns.includes(col.id))
                    .map(col => {
                      const val = row[col.id];
                      return (
                        <td key={col.id} className="px-4 py-3 whitespace-nowrap text-foreground font-medium">
                          {col.id === "status" ? (
                            <Badge className={`text-xs h-5 font-medium px-2 ${
                              val === "Active" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" :
                              val === "Inactive" ? "bg-muted text-foreground border " :
                              val === "Trial" ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30" :
                              "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30"
                            }`}>
                              {val}
                            </Badge>
                          ) : String(val ?? "N/A")}
                        </td>
                      );
                    })}
                </tr>
              ))
            )}
            {!isLoading && data.length === 0 && (
              <tr>
                <td 
                  colSpan={selectedColumns.length || 1} 
                  className="px-4 py-6 text-center text-muted-foreground font-medium bg-muted"
                >
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
