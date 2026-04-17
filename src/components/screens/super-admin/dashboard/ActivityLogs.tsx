import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  Building2, 
  UserCog, 
  Plus, 
  AlertTriangle, 
  ShieldCheck, 
  CreditCard,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { DashboardData, formatAction } from "./types";

interface ActivityLogsProps {
  loading: boolean;
  data: DashboardData | undefined;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE_TENANT: <Plus className="h-3.5 w-3.5" />,
  UPDATE_TENANT: <Building2 className="h-3.5 w-3.5" />,
  DELETE_TENANT: <AlertTriangle className="h-3.5 w-3.5" />,
  CREATE_USER: <UserCog className="h-3.5 w-3.5" />,
  LOGIN: <ShieldCheck className="h-3.5 w-3.5" />,
  UPDATE_SUBSCRIPTION: <CreditCard className="h-3.5 w-3.5" />,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE_TENANT: "bg-emerald-50 text-emerald-700 border-emerald-100",
  UPDATE_TENANT: "bg-blue-50 text-blue-700 border-blue-100",
  DELETE_TENANT: "bg-red-50 text-red-700 border-red-100",
  CREATE_USER: "bg-violet-50 text-violet-700 border-violet-100",
  LOGIN: "bg-gray-50 text-gray-700 border-gray-200",
  UPDATE_SUBSCRIPTION: "bg-amber-50 text-amber-700 border-amber-100",
};

export function ActivityLogs({ loading, data }: ActivityLogsProps) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-emerald-600" /> Recent Platform Activity
        </CardTitle>
        <CardDescription className="text-xs">System-wide audit logs and operations</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t border-gray-50 dark:border-gray-900">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/30 dark:bg-gray-900/30 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Action</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Admin / School</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Details</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4} className="p-4">
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                (data?.activityLogs || []).map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors border-b last:border-none">
                    <TableCell className="pl-6 py-4">
                      <Badge variant="outline" className={`gap-1.5 font-black text-[9px] h-6 uppercase tracking-widest px-2 border-none ${ACTION_COLORS[log.action] || 'bg-gray-100'}`}>
                        {ACTION_ICONS[log.action]}
                        {formatAction(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{log.user.name}</span>
                        {log.tenant && (
                          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-2.5 w-2.5" />
                            {log.tenant.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-xs text-muted-foreground font-medium max-w-[300px] truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : "System operation"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                          {format(new Date(log.createdAt), "dd MMM, yyyy")}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {format(new Date(log.createdAt), "HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
