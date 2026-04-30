"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AttendanceChartProps {
  data: any[];
  isPremium?: boolean;
}

export function AttendanceChart({ data, isPremium }: AttendanceChartProps) {
  return (
    <Card className="rounded-xl shadow-sm shadow-none relative overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center gap-2 text-left">
          <Calendar className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-sm font-semibold">
            Monthly Attendance (Last 6 Months)
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-left">
          Present, Absent, and Late breakdown by month
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 relative">
        <div className={`h-64 w-full ${!isPremium ? "blur-[6px] pointer-events-none select-none opacity-40" : ""}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barGap={2}
              barCategoryGap="20%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
                className="dark:stroke-gray-700"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Bar
                dataKey="present"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Present"
              />
              <Bar
                dataKey="absent"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Absent"
              />
              <Bar
                dataKey="late"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name="Late"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {!isPremium && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl border border-amber-100 dark:border-amber-900/50 shadow-xl max-w-xs animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Unlock Attendance Analytics</h4>
              <p className="text-[11px] text-muted-foreground mb-4">
                Detailed 6-month historical trends and monthly breakdowns are exclusive to Premium members.
              </p>
              <button className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-600/20 active:scale-95">
                Buy Premium
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
