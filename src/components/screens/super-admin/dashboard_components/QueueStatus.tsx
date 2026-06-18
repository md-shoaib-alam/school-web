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
  Layers,
  Clock,
  Play,
  Check,
  AlertOctagon
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
    // Auto refresh every 30 seconds
    const interval = setInterval(() => fetchStatus(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const totalActive = queues.reduce((acc, q) => acc + (q.active || 0), 0);
  const totalWaiting = queues.reduce((acc, q) => acc + (q.waiting || 0), 0);
  const hasFailures = queues.some((q) => q.failed > 0);

  return (
    <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
            <Cpu className="size-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Background Workers & Queue Health</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Monitor active jobs, pending queue counts, and processing pipelines
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchStatus(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center border border-red-100 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/10 rounded-2xl">
            <AlertCircle className="size-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => fetchStatus()}
              className="mt-3 text-xs font-semibold text-teal-600 dark:text-teal-400 underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick summary strip */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-center border-r border-slate-200 dark:border-slate-800 last:border-0">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Currently Working</span>
                <span className="text-xl font-extrabold text-teal-600 dark:text-teal-400 mt-1 block flex items-center justify-center gap-1.5">
                  {totalActive > 0 && <span className="size-2 rounded-full bg-teal-500 animate-pulse" />}
                  {totalActive} {totalActive === 1 ? 'job' : 'jobs'}
                </span>
              </div>
              <div className="text-center border-r border-slate-200 dark:border-slate-800 last:border-0">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Work Remaining</span>
                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">
                  {totalWaiting} {totalWaiting === 1 ? 'job' : 'jobs'}
                </span>
              </div>
              <div className="text-center last:border-0">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Status</span>
                <span className="text-sm font-extrabold mt-1.5 block flex items-center justify-center gap-1">
                  {hasFailures ? (
                    <>
                      <AlertOctagon className="size-4 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400">Needs Review</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4 text-teal-500" />
                      <span className="text-teal-600 dark:text-teal-400">Healthy</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Individual Queues */}
            <div className="space-y-3">
              {queues.map((q) => (
                <div 
                  key={q.name} 
                  className="p-4 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 rounded-2xl bg-white dark:bg-slate-900/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-xl flex items-center justify-center border ${
                      q.active > 0 
                        ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-100 dark:border-teal-900/30 text-teal-600' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-400'
                    }`}>
                      <Activity className={`size-4 ${q.active > 0 ? 'animate-pulse text-teal-500' : ''}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">{q.name}</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {q.active > 0 ? 'Actively processing jobs...' : 'Idle'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      q.active > 0 
                        ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <Play className="size-2.5 fill-current" />
                      <span>{q.active} Active</span>
                    </span>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      q.waiting > 0 
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 font-bold' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <Layers className="size-2.5" />
                      <span>{q.waiting} Waiting</span>
                    </span>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      q.delayed > 0 
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <Clock className="size-2.5" />
                      <span>{q.delayed} Delayed</span>
                    </span>

                    {q.failed > 0 && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                        {q.failed} Failed
                      </span>
                    )}

                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center gap-1">
                      <Check className="size-2.5" />
                      <span>{q.completed} Done</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
