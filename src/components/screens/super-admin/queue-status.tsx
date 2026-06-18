"use client";

import { QueueStatus } from "./dashboard_components/QueueStatus";
import { Cpu } from "lucide-react";

export function SuperAdminQueueStatus() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
            <Cpu className="size-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">Queue & Worker Status</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
              Admin console for monitoring processing pipelines and active background jobs
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <QueueStatus />
      </div>
    </div>
  );
}
