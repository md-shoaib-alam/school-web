"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Percent, CheckCircle2 } from "lucide-react";
import type { StudentOption, FeeItem, FeeConcession } from "../types";

interface PendingFeesChecklistProps {
  selectedStudent: StudentOption;
  onChangeStudent: () => void;
  concessions: FeeConcession[];
  pendingFees: FeeItem[];
  loadingFees: boolean;
  selectedFeeIds: Set<string>;
  onToggleFee: (id: string) => void;
  onToggleAll: () => void;
}

export function PendingFeesChecklist({
  selectedStudent,
  onChangeStudent,
  concessions,
  pendingFees,
  loadingFees,
  selectedFeeIds,
  onToggleFee,
  onToggleAll,
}: PendingFeesChecklistProps) {
  return (
    <div className="space-y-4">
      {/* Student Header */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-lg font-bold shrink-0">
            {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{selectedStudent.name}</p>
            <p className="text-sm text-muted-foreground">{selectedStudent.className} • Roll: {selectedStudent.rollNumber}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onChangeStudent}>
            Change
          </Button>
        </CardContent>
      </Card>

      {/* Concessions Info */}
      {concessions.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Percent className="size-4" />Active Concessions
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-1">
              {concessions.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">{c.concessionType.replace('_', ' ')}</Badge>
                  <span>{c.concessionType === 'percentage' ? `${c.amount}%` : `₹${c.amount}`}</span>
                  {c.reason && <span className="text-muted-foreground">({c.reason})</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Fees */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Pending Fees</CardTitle>
              <CardDescription>{pendingFees.length} pending fee(s)</CardDescription>
            </div>
            {pendingFees.length > 0 && (
              <Button variant="outline" size="sm" onClick={onToggleAll}>
                {selectedFeeIds.size === pendingFees.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingFees ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : pendingFees.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CheckCircle2 className="size-10 mx-auto mb-2 text-emerald-500 opacity-50" />
              <p>All fees paid! No pending fees.</p>
            </div>
          ) : (
            <div className="divide-y">
              {pendingFees.map(fee => (
                <button 
                  key={fee.id} 
                  type="button"
                  className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer text-left bg-transparent border-none" 
                  onClick={() => onToggleFee(fee.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onToggleFee(fee.id);
                    }
                  }}
                >
                  <Checkbox checked={selectedFeeIds.has(fee.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{fee.feeCategoryName || fee.type}</p>
                    <p className="text-xs text-muted-foreground">Due: {fee.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{fee.amount.toLocaleString()}</p>
                    {fee.concession > 0 && <p className="text-xs text-amber-600">-₹{fee.concession.toLocaleString()} concession</p>}
                    {fee.paidAmount > 0 && <p className="text-xs text-blue-600">-₹{fee.paidAmount.toLocaleString()} previously paid</p>}
                    {(fee.paidAmount > 0 || fee.concession > 0) && (
                      <p className="text-xs font-bold text-emerald-600 border-t mt-1 pt-1">Bal: ₹{(fee.amount - fee.concession - fee.paidAmount).toLocaleString()}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
