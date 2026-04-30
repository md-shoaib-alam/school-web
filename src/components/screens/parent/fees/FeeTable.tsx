"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianRupee, Printer, Lock } from "lucide-react";
import { STATUS_CONFIG, TYPE_ICONS } from "./constants";
import type { FeeRecord } from "@/lib/types";
import { ReceiptTemplate } from "./ReceiptTemplate";

interface FeeTableProps {
  studentName: string;
  fees: FeeRecord[];
  onPay: (feeId: string) => void;
  isPremium?: boolean;
}

export function FeeTable({ studentName, fees, onPay, isPremium }: FeeTableProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Fee_Receipt_${studentName}`,
  });

  const onPrintClick = (fee: FeeRecord) => {
    if (!isPremium) {
      router.push(`/${slug}/subscription`);
      return;
    }
    setSelectedFee(fee);
    // Give state a moment to update before printing
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  return (
    <Card className="rounded-xl shadow-sm shadow-none">
      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        {selectedFee && (
          <ReceiptTemplate 
            ref={contentRef}
            studentName={studentName}
            fee={selectedFee}
          />
        )}
      </div>

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
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">
                              ✓ Success
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-7 px-2 text-[10px] gap-1 font-bold transition-all ${
                                isPremium 
                                  ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800/50 dark:text-emerald-400 dark:hover:bg-emerald-900/20" 
                                  : "border-gray-200 text-gray-400 opacity-60 cursor-not-allowed grayscale"
                              }`}
                              onClick={() => onPrintClick(fee)}
                            >
                              {isPremium ? (
                                <Printer className="h-3 w-3" />
                              ) : (
                                <Lock className="h-2.5 w-2.5" />
                              )}
                              {isPremium ? "Receipt" : "Upgrade"}
                            </Button>
                          </div>
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
