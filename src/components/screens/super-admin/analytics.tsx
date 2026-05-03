"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Activity, 
  Database, 
  Clock, 
  Layers, 
  HardDrive, 
  Zap, 
  RefreshCw,
  ShieldCheck,
  Box,
  Server,
  Cpu,
  Wifi,
  Cloud,
  Code,
  Shield,
  Users,
  Building2,
  CreditCard,
  Workflow
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function SuperAdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [lastChecked, setLastChecked] = useState("");
  const isFetchingRef = useRef(false);

  const fetchHealth = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    setLoading(true);
    try {
      const res = await apiFetch("/api/health");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastChecked(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Failed to fetch health data:", error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const formatUptime = (seconds: number) => {
    if (!seconds) return "0m";
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m`;
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const services = data?.services || {};
  const memory = data?.memory || {};
  const pool = data?.pool || {};
  const server = data?.server || {};
  const records = services?.database?.records || {};

  const coreMetrics = [
    { label: "System Uptime", value: formatUptime(data?.uptime), icon: <Clock className="h-4 w-4" />, color: "text-emerald-600" },
    { label: "Server Latency", value: server?.totalLatency || "0ms", icon: <Activity className="h-4 w-4" />, color: "text-blue-600" },
    { label: "Memory (RSS)", value: memory?.rss || "0 MB", icon: <Cpu className="h-4 w-4" />, color: "text-purple-600" },
    { label: "Node Version", value: server?.nodeVersion || "N/A", icon: <Code className="h-4 w-4" />, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Performance & Health</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive real-time infrastructure and service monitoring</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchHealth} disabled={loading}>
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Sync Health Data
        </Button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${data?.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Platform Status: <span className={data?.status === "healthy" ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>{data?.status?.toUpperCase() || "UNKNOWN"}</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
           <span className="hidden sm:inline">Environment: <span className="font-bold uppercase text-gray-600 dark:text-gray-300">{server?.environment || "N/A"}</span></span>
           <span className="hidden sm:inline h-4 w-px bg-gray-200 dark:bg-gray-700" />
           <span>Checked: {lastChecked}</span>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {coreMetrics.map((metric, i) => (
          <Card key={i} className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`${metric.color}`}>
                  {metric.icon}
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{metric.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Connectivity */}
        <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Wifi className="h-4 w-4 text-emerald-600" />
              Service Connectivity
            </CardTitle>
            <CardDescription className="text-xs">Connection status and latency for core platform services</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Database", status: services?.database?.status, latency: services?.database?.latency, icon: <Database className="h-4 w-4" /> },
              { label: "Redis Cache", status: services?.redis?.status, latency: services?.redis?.latency, icon: <Zap className="h-4 w-4" /> },
              { label: "Razorpay", status: services?.razorpay?.status, icon: <CreditCard className="h-4 w-4" /> },
              { label: "BullMQ (Queues)", status: services?.bullmq?.status, icon: <Workflow className="h-4 w-4" /> },
              { label: "Firebase (FCM)", status: services?.firebase?.status, sub: services?.firebase?.serviceAccountName, icon: <Cloud className="h-4 w-4" /> },
              { label: "Object Storage (R2)", status: services?.storage?.status, icon: <Box className="h-4 w-4" /> },
            ].map((svc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                <div className="flex items-center gap-3">
                  <div className={svc.status === "connected" ? "text-emerald-500" : "text-gray-400"}>
                    {svc.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{svc.label}</span>
                    {svc.sub && <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{svc.sub}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant="outline" className={`text-[9px] ${svc.status === "connected" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {svc.status?.toUpperCase() || "OFFLINE"}
                  </Badge>
                  {svc.latency && <span className="text-[10px] text-gray-400 mt-1">{svc.latency}</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Platform Statistics */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal-600" />
              Platform Records
            </CardTitle>
            <CardDescription className="text-xs">Aggregate counts across all tenants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {[
              { label: "Total Schools", value: records?.schools, icon: <Building2 className="h-3.5 w-3.5" /> },
              { label: "Total Users", value: records?.users, icon: <Users className="h-3.5 w-3.5" /> },
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {stat.icon}
                  {stat.label}
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{(stat.value || 0).toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-2">
               <p className="text-[10px] text-gray-400 italic font-medium leading-relaxed">
                 Real-time synchronization with primary database. Counts reflect all registered entities across the SaaS network.
               </p>
            </div>
          </CardContent>
        </Card>

        {/* Memory Allocation */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-purple-600" />
              Memory Allocation
            </CardTitle>
            <CardDescription className="text-xs">Node.js process memory distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {[
              { label: "Heap Used", value: memory?.heapUsed, color: "bg-purple-500" },
              { label: "Heap Total", value: memory?.heapTotal, color: "bg-blue-500" },
              { label: "External", value: memory?.external, color: "bg-amber-500" },
            ].map((mem, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-500">{mem.label}</span>
                  <span className="text-gray-900 dark:text-gray-100">{mem.value}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${mem.color}`} style={{ width: '45%' }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Connection Pool */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-600" />
              Connection Pool
            </CardTitle>
            <CardDescription className="text-xs">Database pooling and saturation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500">Active / Max</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{pool?.active} / {pool?.max}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500">Idle / Waiting</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{pool?.idle} / {pool?.waiting}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Total Count</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{pool?.totalCount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Runtime Environment */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Server className="h-4 w-4 text-gray-600" />
              Runtime Details
            </CardTitle>
            <CardDescription className="text-xs">System environment and node version</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500">OS Platform</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">{server?.platform || "Unknown"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500">Node Engine</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{server?.nodeVersion || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Environment</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">{server?.environment || "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
