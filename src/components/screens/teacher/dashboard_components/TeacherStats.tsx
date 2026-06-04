"use client";

import { Card, CardContent } from "@/components/ui/card";
import { School, Users, FileText, UserCheck } from "lucide-react";

interface TeacherStatsProps {
  totalClasses: number;
  totalStudents: number;
  pendingAssignments: number;
  attendanceRate: string;
}

export function TeacherStats({
  totalClasses,
  totalStudents,
  pendingAssignments,
  attendanceRate,
}: TeacherStatsProps) {
  const stats = [
    {
      title: "My Classes",
      value: totalClasses,
      icon: <School className="size-5" />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: <Users className="size-5" />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
    },
    {
      title: "Pending Homework",
      value: pendingAssignments,
      icon: <FileText className="size-5" />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30",
    },
    {
      title: "Today's Attendance",
      value: attendanceRate,
      icon: <UserCheck className="size-5" />,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
