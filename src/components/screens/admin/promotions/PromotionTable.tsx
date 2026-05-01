"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { PromotionRecord } from "./types";
import { statusConfig } from "./utils";

interface PromotionTableProps {
  records: PromotionRecord[];
  onApprove?: (id: string) => void;
  onReject?: (record: PromotionRecord) => void;
  approvingId?: string | null;
  type: 'promotion' | 'graduation';
}

export function PromotionTable({
  records,
  onApprove,
  onReject,
  approvingId,
  type,
}: PromotionTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50/50 dark:bg-gray-900/20">
          <TableRow>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Student</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">
              {type === 'promotion' ? 'Transition' : 'Graduated From'}
            </TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Year</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Status</TableHead>
            {type === 'promotion' && <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-gray-500">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={type === 'promotion' ? 5 : 4} className="h-32 text-center text-gray-500">
                No records found.
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{record.studentName}</span>
                    <span className="text-[10px] text-gray-500">{record.studentEmail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{record.fromClassName}</span>
                    {type === 'promotion' && (
                      <>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {record.toClassName}
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-bold bg-gray-50 dark:bg-gray-800">
                    {record.academicYear}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`gap-1 shadow-none font-medium text-[10px] ${
                      statusConfig[record.status]?.bg || ""
                    }`}
                  >
                    {statusConfig[record.status]?.icon}
                    {statusConfig[record.status]?.label || record.status}
                  </Badge>
                </TableCell>
                {type === 'promotion' && (
                  <TableCell className="text-right">
                    {record.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          onClick={() => onApprove?.(record.id)}
                          disabled={!!approvingId}
                        >
                          {approvingId === record.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => onReject?.(record)}
                          disabled={!!approvingId}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
