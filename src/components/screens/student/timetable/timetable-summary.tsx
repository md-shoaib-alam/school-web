import { Card, CardContent } from "@/components/ui/card";
import { Calendar, BookOpen, Clock } from "lucide-react";
import type { TimetableSlot } from "@/types";
import { DAY_FULL_LABELS, formatTime } from "./types";

interface TimetableSummaryProps {
  todayKey: string;
  todayDateString: string;
  todaySlots: TimetableSlot[];
  nextPeriod: TimetableSlot | null;
}

export function TimetableSummary({
  todayKey,
  todayDateString,
  todaySlots,
  nextPeriod,
}: TimetableSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Calendar className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {todayKey ? DAY_FULL_LABELS[todayKey] : "Weekend"}
            </p>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
              {todayDateString}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {todaySlots.length} Classes
            </p>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {nextPeriod
                ? `Next: ${nextPeriod.subjectName}`
                : todaySlots.length > 0
                  ? "No more classes"
                  : "No classes today"}
            </p>
            <p className="text-xs text-muted-foreground">
              {nextPeriod
                ? `At ${formatTime(nextPeriod.startTime)}`
                : todaySlots.length > 0
                  ? "All done for today"
                  : "Enjoy your day off"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
