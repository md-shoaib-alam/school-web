import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Activity, 
  ShieldCheck 
} from "lucide-react";
import { 
  ActionTypeCount, 
  getActionCategory, 
  categoryColors, 
  categoryIcons 
} from "./types";

interface LogStatsProps {
  loading: boolean;
  totalLogs: number;
  actionTypes: ActionTypeCount[];
}

export function LogStats({ loading, totalLogs, actionTypes }: LogStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-none shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-7 w-10" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-gray-800 hover:scale-[1.02] transition-transform">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                <FileText className="h-4 w-4 text-teal-600" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Events</p>
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{totalLogs.toLocaleString()}</p>
          </CardContent>
        </Card>

        {actionTypes.slice(0, 4).map((at) => (
          <Card key={at.action} className="border-none shadow-sm bg-white dark:bg-gray-800 hover:scale-[1.02] transition-transform">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">
                  {at.action.replace(/_/g, " ")}
                </p>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{at.count.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {actionTypes.length > 4 && (
        <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              Categorical Trace Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {actionTypes.map((at) => {
                const category = getActionCategory(at.action);
                return (
                  <Badge
                    key={at.action}
                    variant="outline"
                    className={`${categoryColors[category] || ""} px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 border-transparent rounded-xl shadow-sm`}
                  >
                    <span className="mr-2 text-xs">{categoryIcons[category] || "⚪"}</span>
                    {at.action.replace(/_/g, " ")}
                    <span className="ml-2 opacity-60">[{at.count}]</span>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
