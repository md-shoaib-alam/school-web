"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface FeeSummaryProps {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
}

export function FeeSummary({ total, paid, pending, overdue }: FeeSummaryProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow shadow-none">
        <CardContent className="p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Fees</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ₹{total.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-shadow shadow-none">
        <CardContent className="p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid Amount</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{paid.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow shadow-none">
        <CardContent className="p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                ₹{pending.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border-red-200 dark:border-red-800 hover:shadow-md transition-shadow shadow-none">
        <CardContent className="p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                ₹{overdue.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
