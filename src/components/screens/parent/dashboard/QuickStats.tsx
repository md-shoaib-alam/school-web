"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Bell, DollarSign } from "lucide-react";

interface QuickStatsProps {
  childrenCount: number;
  noticeCount: number;
  pendingFees: number;
}

export function QuickStats({ childrenCount, noticeCount, pendingFees }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="rounded-xl shadow-sm shadow-none">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30">
            <Users className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">Total Children</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{childrenCount}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm shadow-none">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">Active Notices</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{noticeCount}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm shadow-none">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30">
            <DollarSign className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">Pending Fees</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ₹{pendingFees.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
