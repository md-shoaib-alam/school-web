"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

interface TicketStatsProps {
  stats: {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
}

export function TicketStats({ stats }: TicketStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Open
              </p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">
                {stats.open}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <AlertCircle className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                In Progress
              </p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">
                {stats.in_progress}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Resolved
              </p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">
                {stats.resolved}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Closed
              </p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">
                {stats.closed}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-muted border border-border flex items-center justify-center">
              <XCircle className="size-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
