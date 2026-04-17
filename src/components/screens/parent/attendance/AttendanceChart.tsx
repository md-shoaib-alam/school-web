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
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <Card className="rounded-xl shadow-sm shadow-none">
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
      <CardContent className="p-4">
        <div className="h-64 w-full">
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
      </CardContent>
    </Card>
  );
}
