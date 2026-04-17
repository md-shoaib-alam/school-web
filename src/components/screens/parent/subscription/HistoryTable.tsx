"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Receipt, CheckCircle2, XCircle } from "lucide-react";
import { SubscriptionRecord } from "./types";

interface HistoryTableProps {
  subscriptions: SubscriptionRecord[];
}

export function HistoryTable({ subscriptions }: HistoryTableProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
        <Receipt className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">No payment history</p>
        <p className="text-xs mt-1">
          Your past subscriptions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80 dark:bg-gray-800/50">
            <TableHead className="font-semibold text-gray-600 dark:text-gray-400">
              Plan
            </TableHead>
            <TableHead className="font-semibold text-gray-600 dark:text-gray-400">
              Amount
            </TableHead>
            <TableHead className="font-semibold text-gray-600 dark:text-gray-400">
              Date
            </TableHead>
            <TableHead className="font-semibold text-gray-600 dark:text-gray-400">
              Status
            </TableHead>
            <TableHead className="font-semibold text-gray-600 dark:text-gray-400">
              Transaction ID
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                {sub.planName}
                {sub.period && (
                  <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                    ({sub.period})
                  </span>
                )}
              </TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">
                {sub.amount === 0 ? (
                  <span className="text-gray-400 dark:text-gray-500">
                    Free
                  </span>
                ) : (
                  <span>₹{sub.amount.toLocaleString()}</span>
                )}
              </TableCell>
              <TableCell className="text-gray-500 dark:text-gray-400">
                {new Date(sub.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                {sub.status === "active" ? (
                  <Badge className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs shadow-none">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 text-xs shadow-none">
                    <XCircle className="h-3 w-3 mr-1" /> Cancelled
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-xs text-gray-400 dark:text-gray-500 font-mono max-w-[140px] truncate">
                {sub.transactionId || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
