"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { IndianRupee } from "lucide-react";
import { STATUS_CONFIG, TYPE_ICONS } from "./constants";
import type { FeeRecord } from "@/lib/types";

interface FeeTableProps {
  studentName: string;
  fees: FeeRecord[];
  onPay: (feeId: string) => void;
}

export function FeeTable({ studentName, fees, onPay }: FeeTableProps) {
  return (
    <Card className="rounded-xl shadow-sm shadow-none">
      <CardHeader className="text-left">
        <CardTitle className="text-base">Fee Details — {studentName}</CardTitle>
        <CardDescription>{fees.length} fee records</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Fee Type</TableHead>
                <TableHead className="hidden sm:table-cell text-left">Amount</TableHead>
                <TableHead className="hidden md:table-cell text-left">Due Date</TableHead>
                <TableHead className="hidden md:table-cell text-left">Paid Amount</TableHead>
                <TableHead className="w-28 text-center">Status</TableHead>
                <TableHead className="w-24 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <IndianRupee className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>No fee records found</p>
                  </TableCell>
                </TableRow>
              ) : (
                fees.map((fee) => {
                  const config = STATUS_CONFIG[fee.status] || STATUS_CONFIG.pending;
                  return (
                    <TableRow key={fee.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{TYPE_ICONS[fee.type] || "💰"}</span>
                          <span className="font-medium text-sm capitalize">{fee.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm font-medium text-left">
                        ₹{fee.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground text-left">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-left">
                        <span className={fee.paidAmount > 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}>
                          ₹{fee.paidAmount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`${config.bg} font-medium capitalize shadow-none`}>
                          {config.icon}
                          <span className="ml-1">{fee.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {fee.status !== "paid" ? (
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3 shadow-none"
                            onClick={() => onPay(fee.id)}
                          >
                            Pay Now
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Done</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
