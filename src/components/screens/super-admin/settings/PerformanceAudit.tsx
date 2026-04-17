import { Activity, RefreshCw, Database, Clock, Layers, HardDrive, Cpu, Zap, Users, Server, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PerformanceData } from "./types";

interface PerformanceAuditProps {
  checking: boolean;
  onCheck: () => void;
  perfData: PerformanceData | null;
}

export function PerformanceAudit({
  checking,
  onCheck,
  perfData,
}: PerformanceAuditProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-5 w-5 text-teal-500" />
          System Performance & Resources
        </CardTitle>
        <CardDescription>
          Real-time server metrics and optimization status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onCheck}
          disabled={checking}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Running Test..." : "Run Performance Test"}
        </Button>

        {checking && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        )}

        {perfData && !checking && (
          <>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${perfData.status === "healthy" ? "bg-emerald-500" : "bg-red-500"}`} />
              <span className="text-sm font-medium text-muted-foreground">
                System Status:{" "}
                <span className={perfData.status === "healthy" ? "text-emerald-600" : "text-red-600"}>
                  {perfData.status}
                </span>
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                Last checked: {new Date(perfData.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">DB Status</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={`h-2 w-2 rounded-full ${perfData.database.status === "connected" ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span className="text-lg font-semibold">{perfData.database.status === "connected" ? "Connected" : "Disconnected"}</span>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">DB Latency</span>
                </div>
                <p className="text-lg font-semibold mt-2">{perfData.database.latency}</p>
              </div>

              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Records</span>
                </div>
                <p className="text-lg font-semibold mt-2">
                  {Object.values(perfData.database.records).reduce((a, b) => a + b, 0).toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <HardDrive className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Memory</span>
                </div>
                <p className="text-lg font-semibold mt-2">{perfData.server.memory?.heapUsed ?? "N/A"}</p>
              </div>

              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="h-4 w-4 text-teal-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Uptime</span>
                </div>
                <p className="text-lg font-semibold mt-2">{formatUptime(perfData.uptime)}</p>
              </div>

              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Queries</span>
                </div>
                <p className="text-lg font-semibold mt-2">{perfData.database.totalQueries.toLocaleString()}</p>
              </div>

              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-teal-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Latency</span>
                </div>
                <p className="text-lg font-semibold mt-2">{perfData.server.totalLatency}</p>
              </div>

              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Capacity</span>
                </div>
                <p className="text-lg font-semibold mt-2">2,000+</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  Concurrency Stack
                </h4>
                <div className="space-y-2">
                  {Object.entries(perfData.concurrency).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between gap-3">
                      <span className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="text-xs font-medium text-right max-w-[60%]">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Optimizations
                </h4>
                <div className="space-y-2">
                  {Object.entries(perfData.optimizations).map(([key, enabled]) => (
                    <div key={key} className="flex items-center gap-2">
                      {enabled ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                      )}
                      <span className="text-xs capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      {enabled && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 ml-auto">Active</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
