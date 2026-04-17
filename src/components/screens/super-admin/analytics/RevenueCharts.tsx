import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DollarSign, Globe } from "lucide-react";
import { revenueConfig, PIE_COLORS, geographicData } from "./utils";

interface RevenueChartsProps {
  loading: boolean;
  revenueBreakdown: any[];
}

function ChartSkeleton() {
  return <Skeleton className="h-[300px] w-full rounded-xl" />;
}

export function RevenueCharts({ loading, revenueBreakdown }: RevenueChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Breakdown by Tenant */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-teal-500" />
            Revenue by Tenant (Top 10)
          </CardTitle>
          <CardDescription>
            Monthly recurring revenue distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ChartContainer
              config={revenueConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={revenueBreakdown} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={120}
                  tickFormatter={(v: string) =>
                    v.length > 18 ? v.slice(0, 18) + "..." : v
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {revenueBreakdown.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>Tenant distribution by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5 pt-2">
            {geographicData.map((geo) => (
              <div key={geo.country} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${geo.color}`} />
                    <span className="text-sm font-bold">{geo.country}</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{geo.percentage}%</span>
                </div>
                <div className="relative">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${geo.color}`}
                      style={{ width: `${geo.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-4 border-t flex items-center justify-center">
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={geographicData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="percentage"
                      nameKey="country"
                      stroke="none"
                    >
                      {geographicData.map((_, index) => (
                        <Cell
                          key={`geo-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value}%`,
                        name,
                      ]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
