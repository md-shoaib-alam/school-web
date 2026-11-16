"use client";

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
import { 
  IndianRupee, 
  ArrowDownToLine, 
  Lock, 
  School 
} from "lucide-react";
import { STATUS_CONFIG, getFeeTypeIcon } from "./constants";
import type { FeeRecord } from "@/types";
import { ReceiptTemplate } from "./ReceiptTemplate";
import { cn } from "@/lib/utils";

interface FeeTableProps {
  studentName: string;
  fees: FeeRecord[];
  onPay: (feeId: string) => void;
  isPremium?: boolean;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

export function FeeTable({ studentName, fees, onPay, isPremium }: FeeTableProps) {
  const { push } = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("all");
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Fee_Receipt_${studentName}`,
  });

  const onPrintClick = (fee: FeeRecord) => {
    if (!isPremium) {
      push(`/${slug}/subscription`);
      return;
    }
    setSelectedFee(fee);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const totalCount = fees.length;
  const paidCount = fees.filter((f) => f.status === "paid").length;
  const unpaidCount = fees.filter((f) => f.status !== "paid").length;

  const filteredFees = fees.filter((fee) => {
    if (filter === "paid") return fee.status === "paid";
    if (filter === "unpaid") return fee.status !== "paid";
    return true;
  });

  return (
    <div className="rounded-[18px] border border-border bg-card shadow-xs overflow-hidden font-manrope">
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

      {/* Tabs Row (Matching Fee Details HTML / Reference UI) */}
      <div className="flex items-center gap-1.5 p-3 border-b border-border overflow-x-auto bg-card">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "px-3.5 py-1.5 rounded-full font-bold text-sm transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap",
            filter === "all"
              ? "bg-[#ebeafd] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400"
              : "text-[#6a6f83] dark:text-muted-foreground hover:bg-muted/50"
          )}
        >
          All
          <span className="text-xs font-semibold opacity-75">{totalCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("unpaid")}
          className={cn(
            "px-3.5 py-1.5 rounded-full font-bold text-sm transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap",
            filter === "unpaid"
              ? "bg-[#ebeafd] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400"
              : "text-[#6a6f83] dark:text-muted-foreground hover:bg-muted/50"
          )}
        >
          Unpaid
          <span className="text-xs font-semibold opacity-75">{unpaidCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("paid")}
          className={cn(
            "px-3.5 py-1.5 rounded-full font-bold text-sm transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap",
            filter === "paid"
              ? "bg-[#ebeafd] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400"
              : "text-[#6a6f83] dark:text-muted-foreground hover:bg-muted/50"
          )}
        >
          Paid
          <span className="text-xs font-semibold opacity-75">{paidCount}</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-left py-3 px-4 text-[13px] font-semibold text-[#6a6f83] dark:text-muted-foreground">
                Fee type
              </TableHead>
              <TableHead className="text-left py-3 px-4 text-[13px] font-semibold text-[#6a6f83] dark:text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="text-left py-3 px-4 text-[13px] font-semibold text-[#6a6f83] dark:text-muted-foreground">
                Due date
              </TableHead>
              <TableHead className="text-left py-3 px-4 text-[13px] font-semibold text-[#6a6f83] dark:text-muted-foreground">
                Paid
              </TableHead>
              <TableHead className="text-left py-3 px-4 text-[13px] font-semibold text-[#6a6f83] dark:text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-right py-3 px-4 text-[13px] font-semibold text-[#6a6f83] dark:text-muted-foreground">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <IndianRupee className="size-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">
                    {filter === "unpaid"
                      ? "No unpaid fee records found"
                      : filter === "paid"
                      ? "No paid fee records found"
                      : "No fee records found"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredFees.map((fee) => {
                const config = STATUS_CONFIG[fee.status] || STATUS_CONFIG.pending;
                const FeeIcon = getFeeTypeIcon(fee.type);
                const isPaid = fee.status === "paid";
                const isOverdue = fee.status === "overdue";
                const isPending = fee.status === "pending";

                return (
                  <TableRow key={fee.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                    {/* Fee type with 36x36 icon */}
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-[#ebeafd] dark:bg-indigo-950/50 text-[#4f46e5] dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <FeeIcon className="size-4.5" />
                        </div>
                        <span className="font-bold text-[15px] text-foreground capitalize">
                          {fee.type}
                        </span>
                      </div>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="py-3.5 px-4 font-extrabold text-[15px] text-foreground tabular-nums text-left">
                      ₹{fee.amount.toLocaleString("en-IN")}
                    </TableCell>

                    {/* Due date with optional Overdue / Due soon badge */}
                    <TableCell className="py-3.5 px-4 text-left">
                      <span className="text-[14px] text-muted-foreground block">
                        {formatDate(fee.dueDate)}
                      </span>
                      {isOverdue && (
                        <span className="block text-[12px] font-bold text-[#c42f3b] dark:text-red-400 mt-0.5">
                          Overdue
                        </span>
                      )}
                      {isPending && (
                        <span className="block text-[12px] font-bold text-[#a16200] dark:text-amber-500 mt-0.5">
                          Due soon
                        </span>
                      )}
                    </TableCell>

                    {/* Paid Amount */}
                    <TableCell className="py-3.5 px-4 text-left tabular-nums text-[15px]">
                      {fee.paidAmount > 0 ? (
                        <span className="font-extrabold text-[#0b8a5f] dark:text-emerald-400">
                          ₹{fee.paidAmount.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="font-semibold text-muted-foreground">
                          ₹0
                        </span>
                      )}
                    </TableCell>

                    {/* Status Pill Chip */}
                    <TableCell className="py-3.5 px-4 text-left">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-bold",
                        config.bg
                      )}>
                        {config.icon}
                        <span>{config.text}</span>
                      </span>
                    </TableCell>

                    {/* Action Button: Only Receipt (with Lock if no sub) or Pay at School (NO success text) */}
                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="flex justify-end">
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (isPremium) onPrintClick(fee);
                            }}
                            disabled={!isPremium}
                            title={isPremium ? "Download receipt" : "Subscription required to download receipt"}
                            className={cn(
                              "inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3.5 rounded-[10px] font-bold text-[13px] transition-colors border",
                              isPremium
                                ? "border-[#0b8a5f] text-[#0b8a5f] dark:text-emerald-400 hover:bg-[#dcf5ea]/40 dark:hover:bg-emerald-950/30 cursor-pointer"
                                : "opacity-40 cursor-not-allowed border-border text-muted-foreground bg-muted"
                            )}
                          >
                            {isPremium ? (
                              <ArrowDownToLine className="size-3.5 stroke-[2.2]" />
                            ) : (
                              <Lock className="size-3.5 stroke-[2.2]" />
                            )}
                            Receipt
                          </button>
                        ) : (
                          <div
                            className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3.5 rounded-[10px] border border-border text-foreground font-bold text-[13px] bg-transparent select-none cursor-default"
                          >
                            <School className="size-3.5 text-muted-foreground stroke-[2]" />
                            Pay at school
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
