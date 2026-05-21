"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, UserCheck, ClipboardList, FileText, CalendarDays, ArrowRight } from "lucide-react";

interface QuickActionsProps {
  onNavigate: (screen: string) => void;
}

const actions = [
  {
    label: "Take Attendance",
    icon: <UserCheck className="size-4" />,
    screen: "take-attendance",
  },
  {
    label: "Assessments",
    icon: <ClipboardList className="size-4" />,
    screen: "assessments",
  },
  {
    label: "Create Homework",
    icon: <FileText className="size-4" />,
    screen: "homework",
  },
  {
    label: "View Timetable",
    icon: <CalendarDays className="size-4" />,
    screen: "timetable",
  },
];

export function QuickActions({ onNavigate }: QuickActionsProps) {
  return (
    <Card className="rounded-xl shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="size-4 text-blue-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          {actions.map((action) => (
            <Button
              key={action.screen}
              variant="ghost"
              className="w-full justify-start gap-3 h-11 px-3 text-blue-900/90 dark:text-blue-100/90 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              onClick={() => onNavigate(action.screen)}
            >
              <span className="text-blue-500">{action.icon}</span>
              {action.label}
              <ArrowRight className="size-3.5 ml-auto text-zinc-300 dark:text-zinc-600" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
