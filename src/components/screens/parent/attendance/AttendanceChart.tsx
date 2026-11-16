"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AttendanceChartProps {
  data: any[];
  isPremium?: boolean;
  className?: string;
}

export function AttendanceChart({ data, isPremium, className }: AttendanceChartProps) {
  const { push } = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [recharts, setRecharts] = useState<typeof import("recharts") | null>(null);

  useEffect(() => {
    import("recharts").then(setRecharts);
  }, []);

  return (
    <Card className={cn("rounded-2xl shadow-xs relative overflow-hidden border border-border bg-card flex flex-col", className)}>
      <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border shrink-0">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
              <Calendar className="size-4.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Monthly Attendance
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Last 6 months breakdown
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] sm:text-xs font-medium">Present</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-500" />
              <span className="text-[11px] sm:text-xs font-medium">Absent</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 pt-3 relative flex-1 min-h-0 flex flex-col">
        <div className={`relative flex-1 min-h-[170px] w-full transition-all duration-300 ${!isPremium ? "blur-[6px] pointer-events-none select-none opacity-40 scale-95" : ""}`}>
          {!recharts ? (
            <div className="size-full flex items-center justify-center">
              <div className="size-full animate-pulse bg-muted rounded-lg" />
            </div>
          ) : (
            (() => {
              const {
                Bar,
                BarChart,
                XAxis,
                YAxis,
                Tooltip,
                ResponsiveContainer,
                CartesianGrid,
              } = recharts;

              const maxVal = Math.max(
                28,
                ...(data || []).map(
                  (d) => (Number(d.present) || 0) + (Number(d.absent) || 0)
                )
              );
              const maxDomain = maxVal <= 28 ? 28 : Math.ceil(maxVal / 7) * 7;
              const yDomain: [number, number] = [0, maxDomain];
              const yTicks = [0, 7, 14, 21, 28];
              if (maxDomain > 28) {
                yTicks.push(maxDomain);
              }

              return (
                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart
                      data={data}
                      maxBarSize={24}
                      margin={{ top: 10, right: 10, left: 0, bottom: 4 }}
                    >
                      <defs>
                        <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="currentColor"
                        className="text-zinc-200 dark:text-zinc-800"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "currentColor" }}
                        className="text-muted-foreground"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={yDomain}
                        ticks={yTicks}
                        tick={{ fontSize: 11, fill: "currentColor" }}
                        className="text-muted-foreground"
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={30}
                      />
                      <Tooltip
                        cursor={{ fill: "currentColor", className: "text-muted/20" }}
                        content={({ active, payload, label }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-xl border border-border bg-card/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl select-none text-xs">
                                <p className="font-bold text-foreground mb-1.5">{label}</p>
                                <div className="space-y-1">
                                  {payload.map((entry: any, index: number) => {
                                    const isPresent =
                                      entry.dataKey === "present" ||
                                      entry.name?.toLowerCase() === "present";
                                    const dotColor = isPresent ? "bg-emerald-500" : "bg-red-500";
                                    return (
                                      <div
                                        key={`item-${index}`}
                                        className="flex items-center gap-2 font-medium"
                                      >
                                        <span
                                          className={cn("size-2 rounded-full shrink-0", dotColor)}
                                        />
                                        <span className="text-muted-foreground">{entry.name} :</span>
                                        <span className="font-semibold text-foreground tabular-nums">
                                          {entry.value}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="present"
                        stackId="attendance"
                        fill="url(#presentGradient)"
                        radius={[4, 4, 0, 0]}
                        name="Present"
                      />
                      <Bar
                        dataKey="absent"
                        stackId="attendance"
                        fill="url(#absentGradient)"
                        radius={[4, 4, 0, 0]}
                        name="Absent"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()
          )}
        </div>

        {!isPremium && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
            <div className="bg-card/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xl w-full max-w-[240px] sm:max-w-xs animate-in zoom-in-95 duration-300">
              <div className="size-10 sm:size-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Calendar className="size-5 sm:size-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-1">Unlock Analytics</h4>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-3 sm:mb-4 px-2">
                6-month history and monthly trends are for Premium members.
              </p>
              <button 
                type="button"
                onClick={() => push(`/${slug}/subscription`)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-600/20 active:scale-95 uppercase tracking-wider"
              >
                Buy Premium
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
