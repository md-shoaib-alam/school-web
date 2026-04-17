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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, Clock, AlertTriangle, Pencil, Trash2, Eye } from "lucide-react";
import type { FeeRecord } from "./types";

const statusConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
  paid: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Paid",
  },
  pending: {
    bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    icon: <Clock className="h-3.5 w-3.5" />,
    label: "Pending",
  },
  overdue: {
    bg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    label: "Overdue",
  },
};

interface FeeTableProps {
  records: FeeRecord[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (record: FeeRecord) => void;
  onDelete: (id: string) => void;
  onView: (record: FeeRecord) => void;
}

export function FeeTable({
  records,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onView,
}: FeeTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50/50 dark:bg-gray-900/20">
          <TableRow>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Student</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Fee Type</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Status</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Amount</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Due Date</TableHead>
            <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-gray-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                No fee records found.
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {record.student?.name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {record.student?.class
                        ? `${record.student.class.name}-${record.student.class.section}`
                        : "No Class"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {record.type.replace(/_/g, " ")}
                  </span>
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
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      ${record.amount.toLocaleString()}
                    </span>
                    {record.paidAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Paid: ${record.paidAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(record.dueDate).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => onView(record)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={() => onEdit(record)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Fee Record</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this fee record for{" "}
                              <strong>{record.student?.name}</strong>? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => onDelete(record.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
