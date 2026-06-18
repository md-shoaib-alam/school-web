"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Play,
  Check,
  AlertOctagon,
  Inbox
} from "lucide-react";

interface QueueStatusItem {
  name: string;
  active: number;
  waiting: number;
  delayed: number;
  failed: number;
  completed: number;
  success: boolean;
  error?: string;
}

export function QueueStatus() {
  const [queues, setQueues] = useState<QueueStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/api/super-admins/queue-status");
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error(`[QueueStatus Debug] API failed: Status=${res.status}, Body=${text}`);
        throw new Error(`Failed to fetch queue status (HTTP ${res.status}): ${text || "Unknown error"}`);
      }
      const data = await res.json();
      setQueues(data.queues || []);
    } catch (err: any) {
      console.error("Error fetching queue status:", err);
      setError(err.message || "Could not load queue status.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const totalActive = queues.reduce((acc, q) => acc + (q.active || 0), 0);
  const totalWaiting = queues.reduce((acc, q) => acc + (q.waiting || 0), 0);
  const totalFailed = queues.reduce((acc, q) => acc + (q.failed || 0), 0);
  const hasFailures = queues.some((q) => q.failed > 0);

  return (
    <div className="space-y-4">
      {/* Quick Summary Cards (Compact & Professional) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Executions</span>
              <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                {totalActive > 0 && <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />}
                {totalActive}
              </div>
            </div>
            <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30">
              <Play className="size-4 fill-current" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Jobs In Queue</span>
              <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                {totalWaiting}
              </div>
            </div>
            <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30">
              <Inbox className="size-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Queue Health</span>
              <div className="text-xs font-semibold mt-1 flex items-center gap-1.5">
                {hasFailures ? (
                  <>
                    <AlertOctagon className="size-3.5 text-amber-500 animate-bounce" />
                    <span className="text-amber-600 dark:text-amber-400">{totalFailed} Failed Jobs</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">All Operations Healthy</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => fetchStatus(true)}
              disabled={loading || refreshing}
              className="size-8 rounded-lg bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-750 text-zinc-600 dark:text-zinc-400 transition-colors disabled:opacity-50"
              title="Refresh status"
            >
              <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card (Compact & Enterprise Style) */}
      <Card className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-zinc-500" />
            <span className="font-semibold text-zinc-850 dark:text-zinc-100 text-xs">Individual Queue Metrics</span>
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-855 last:border-0">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50/10 dark:bg-red-950/5">
              <AlertCircle className="size-8 text-red-500 mx-auto mb-2" />
              <h4 className="font-semibold text-red-600 dark:text-red-400 text-xs">Synchronization Failed</h4>
              <p className="text-[11px] text-red-500/80 mt-0.5 max-w-sm mx-auto">{error}</p>
              <button
                type="button"
                onClick={() => fetchStatus()}
                className="mt-3 px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Reconnect Server
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/30 dark:bg-zinc-900/10 text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    <th className="py-2.5 px-4">Queue Pipeline</th>
                    <th className="py-2.5 px-3 text-center">Active</th>
                    <th className="py-2.5 px-3 text-center">Waiting</th>
                    <th className="py-2.5 px-3 text-center">Delayed</th>
                    <th className="py-2.5 px-3 text-center">Failed</th>
                    <th className="py-2.5 px-4 text-right">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                  {queues.map((q) => {
                    const isPipeActive = q.active > 0;
                    return (
                      <tr key={q.name} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/5 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className={`size-1.5 rounded-full ${isPipeActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                            <div>
                              <span className="font-medium text-zinc-700 dark:text-zinc-300">{q.name}</span>
                              <span className="text-[9px] text-zinc-400 block">{isPipeActive ? 'Processing' : 'Idle'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {q.active > 0 ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">
                              {q.active}
                            </span>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-650">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {q.waiting > 0 ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20">
                              {q.waiting}
                            </span>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-650">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {q.delayed > 0 ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20">
                              {q.delayed}
                            </span>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-650">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {q.failed > 0 ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-900/20">
                              {q.failed}
                            </span>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-650">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right font-medium text-zinc-500 dark:text-zinc-400">
                          {q.completed.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
