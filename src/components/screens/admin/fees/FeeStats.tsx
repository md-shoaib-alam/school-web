"use client";

import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, TrendingUp, AlertTriangle } from "lucide-react";

interface FeeStatsProps {
  totalRevenue: number;
  pendingAmount: number;
  collectionRate: number;
}

export function FeeStats({
  totalRevenue,
  pendingAmount,
  collectionRate,
}: FeeStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-none shadow-sm bg-emerald-50 dark:bg-emerald-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Total Revenue
              </p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                ₹{totalRevenue.toLocaleString()}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-none">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Outstanding
              </p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                ₹{pendingAmount.toLocaleString()}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Collection Rate
              </p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                {collectionRate}%
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
