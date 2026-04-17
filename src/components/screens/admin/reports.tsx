"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, GraduationCap, DollarSign, TrendingUp } from "lucide-react";

// Sub-components
import { AttendanceReport } from "./reports/AttendanceReport";
import { AcademicReport } from "./reports/AcademicReport";
import { FeeReport } from "./reports/FeeReport";

export function AdminReports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Administrative Reports
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Comprehensive analytics across all school departments
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="attendance" className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl h-auto flex-nowrap w-fit">
            <TabsTrigger
              value="attendance"
              className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger
              value="academic"
              className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Academic
            </TabsTrigger>
            <TabsTrigger
              value="fees"
              className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Finances
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="attendance" className="space-y-6 outline-none">
          <AttendanceReport />
        </TabsContent>

        <TabsContent value="academic" className="space-y-6 outline-none">
          <AcademicReport />
        </TabsContent>

        <TabsContent value="fees" className="space-y-6 outline-none">
          <FeeReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
