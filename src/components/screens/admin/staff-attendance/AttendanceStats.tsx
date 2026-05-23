"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";

interface AttendanceStatsProps {
  total: number;
  present: number;
  absent: number;
}

export function AttendanceStats({
  total,
  present,
  absent,
}: AttendanceStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mt-6">
      <Card className="rounded-xl shadow-sm border-0">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Users className="size-5 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Total
            </p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {total}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm border-0">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <UserCheck className="size-5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Present
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {present}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm border-0">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <UserX className="size-5 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Absent
            </p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {absent}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
