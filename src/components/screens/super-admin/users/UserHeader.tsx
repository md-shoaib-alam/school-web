import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { STAT_CARDS } from "./types";

interface UserHeaderProps {
  totalCount: number;
  roleCountsMap: Record<string, number>;
}

export function UserHeader({ totalCount, roleCountsMap }: UserHeaderProps) {
  const getCount = (key: string) => {
    if (key === "total") return totalCount;
    if (key === "admin") {
      return (roleCountsMap["admin"] ?? 0) + (roleCountsMap["super_admin"] ?? 0);
    }
    return roleCountsMap[key] ?? 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            User Management
          </h2>
          <p className="text-sm font-bold text-muted-foreground">
            Manage and monitor all users across all tenant schools
          </p>
        </div>
        <Badge
          variant="outline"
          className="w-fit gap-1.5 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm"
        >
          <Shield className="h-3.5 w-3.5" />
          Cross-Tenant View
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map((stat) => {
          const count = getCount(stat.key);
          const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : "0.0";
          const Icon = stat.icon;
          return (
            <Card
              key={stat.key}
              className={`border-none shadow-sm ${stat.bg} overflow-hidden group hover:scale-[1.02] transition-transform`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${stat.iconBg} shadow-inner`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color} opacity-80`}>
                    {percentage}%
                  </span>
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
                  {count.toLocaleString()}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
