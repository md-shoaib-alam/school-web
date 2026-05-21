import { 
  useState 
} from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  CalendarDays,
  MoreHorizontal,
  Clock,
  Database,
  Activity
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  AuditLog, 
  ActionTypeCount, 
  truncateJson, 
  formatTimestamp 
} from "./types";

interface LogTableProps {
  loading: boolean;
  logs: AuditLog[];
  totalLogs: number;
  page: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (val: string) => void;
  actionFilter: string;
  onActionFilterChange: (val: string) => void;
  roleFilter: string;
  onRoleFilterChange: (val: string) => void;
  tenantFilter: string;
  onTenantFilterChange: (val: string) => void;
  tenants: any[];
  actionTypes: ActionTypeCount[];
}

export function LogTable({
  loading,
  logs,
  totalLogs,
  page,
  totalPages,
  limit,
  onPageChange,
  search,
  onSearchChange,
  actionFilter,
  onActionFilterChange,
  roleFilter,
  onRoleFilterChange,
  tenantFilter,
  onTenantFilterChange,
  tenants,
  actionTypes,
}: LogTableProps) {
  const [showFilters, setShowFilters] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const getActionColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("DELETE") || act.includes("REMOVE") || act.includes("DISABLE")) {
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    }
    if (act.includes("CREATE") || act.includes("ADD") || act.includes("ENABLE") || act.includes("INVITE")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
    }
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("PATCH") || act.includes("CHANGE")) {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
    }
    if (act.includes("LOGIN") || act.includes("AUTH") || act.includes("VERIFY")) {
      return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800";
    }
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="px-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Audit Logs</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor any changes made to your project, schema and content with audit logs.
        </p>
      </div>

      {/* Filters Area */}
      {showFilters && (
        <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row items-end gap-4">
          <div className="w-full space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">By Role</Label>
            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
              <SelectTrigger className="w-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-10">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">By Tenant</Label>
            <Select value={tenantFilter} onValueChange={onTenantFilterChange}>
              <SelectTrigger className="w-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-10">
                <SelectValue placeholder="Select Tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenants</SelectItem>
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Action</Label>
            <Select value={actionFilter} onValueChange={onActionFilterChange}>
              <SelectTrigger className="w-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-10">
                <SelectValue placeholder="Select Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map((at) => (
                  <SelectItem key={at.action} value={at.action} className="capitalize">
                    {at.action.replace(/_/g, " ").toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 h-10 md:pt-1.5">
            <Button className="bg-[#0056b3] hover:bg-[#004494] text-white px-6 h-10 rounded-md shadow-sm">
              Apply
            </Button>
            <Button 
              variant="outline" 
              className="bg-white dark:bg-transparent h-10 text-zinc-600"
              onClick={() => setShowFilters(false)}
            >
              Hide
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            No audit events found matching current filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full text-left">
                <TableHeader>
                  <TableRow className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                    <TableHead className="font-semibold text-zinc-800 dark:text-zinc-200 py-3 px-4 h-auto">Operator</TableHead>
                    <TableHead className="font-semibold text-zinc-800 dark:text-zinc-200 py-3 px-4 h-auto">Email Address</TableHead>
                    <TableHead className="font-semibold text-zinc-800 dark:text-zinc-200 py-3 px-4 h-auto">Action</TableHead>
                    <TableHead className="font-semibold text-zinc-800 dark:text-zinc-200 py-3 px-4 h-auto">Timestamp</TableHead>
                    <TableHead className="font-semibold text-zinc-800 dark:text-zinc-200 py-3 px-4 h-auto text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      {/* Column 1: User Name with Avatar */}
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${log.user?.name || log.tenant?.name || 'Sys'}`} />
                            <AvatarFallback className="text-[10px] bg-zinc-100 text-zinc-500"><User className="size-3.5" /></AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {log.user?.name || (log.tenant ? `${log.tenant.name} (System)` : "Platform Admin")}
                            </span>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                              @{log.tenant?.slug || "sysroot"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        <span className="text-sm text-[#0056b3] dark:text-blue-400 hover:underline cursor-pointer">
                          {log.user?.email || log.tenant?.email || "system@platform.dev"}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-sm capitalize">
                        <Badge 
                          variant="outline" 
                          className={`font-medium px-2 py-0.5 rounded-md border ${getActionColor(log.action)}`}
                        >
                          {log.action.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {formatTimestamp(log.createdAt)}
                      </TableCell>

                      <TableCell className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                          onClick={() => setSelectedLog(log)}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Control Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-medium text-zinc-500">
              <div>
                Displaying {(page - 1) * limit + 1} to {Math.min(page * limit, totalLogs)} of {totalLogs.toLocaleString()} records
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="size-7 p-0 bg-white dark:bg-transparent" onClick={() => onPageChange(1)} disabled={page <= 1}>
                  <ChevronsLeft className="size-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="size-7 p-0 bg-white dark:bg-transparent" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
                  <ChevronLeft className="size-3.5" />
                </Button>
                
                <div className="flex gap-1 mx-1">
                  {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                    const p = page <= 2 ? i + 1 : (page >= totalPages - 1 ? totalPages - 2 + i : page - 1 + i);
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <Button 
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="sm" 
                        className={`size-7 text-xs p-0 ${page === p ? 'bg-[#0056b3] text-white' : 'bg-white dark:bg-transparent'}`}
                        onClick={() => onPageChange(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>

                <Button variant="outline" size="icon" className="size-7 p-0 bg-white dark:bg-transparent" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
                  <ChevronRight className="size-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="size-7 p-0 bg-white dark:bg-transparent" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}>
                  <ChevronsRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-lg border-zinc-200 dark:border-zinc-800 sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Activity className="size-5 text-blue-600" />
              Audit Event Details
            </DialogTitle>
            <DialogDescription>
              Complete trace history and context dump for this transaction.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-5 pt-2">
              {/* Essential Context Bar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1">
                    <Clock className="size-3" /> Executed At
                  </span>
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {formatTimestamp(selectedLog.createdAt)}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1">
                    <Database className="size-3" /> Target Module
                  </span>
                  <Badge variant="secondary" className="uppercase text-[9px] h-5 tracking-wide font-bold">
                    {selectedLog.resource}
                  </Badge>
                </div>
              </div>

              {/* Actor Meta Grid */}
              <div className="p-3 rounded-lg border border-blue-50 dark:border-zinc-800 bg-blue-50/20 dark:bg-zinc-900/50 space-y-3">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-blue-600/80 dark:text-blue-400/80 border-b border-blue-100 dark:border-zinc-800 pb-1.5 mb-2">
                  Operator & Network Context
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-medium text-zinc-500">Operator Name</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {selectedLog.user?.name || (selectedLog.tenant ? `${selectedLog.tenant.name}` : "Platform Engine")}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-medium text-zinc-500">Network IP</p>
                    <p className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {selectedLog.ipAddress || "Internal"}
                    </p>
                  </div>
                  <div className="col-span-2 space-y-0.5">
                    <p className="text-[10px] font-medium text-zinc-500">Registered Email</p>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
                      {selectedLog.user?.email || selectedLog.tenant?.email || "sysadmin@platform.dev"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Payload Context */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Action Event Payload</span>
                   <Badge variant="outline" className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-950">
                      {selectedLog.action}
                   </Badge>
                </div>
                <div className="relative bg-zinc-950 dark:bg-zinc-950 border border-zinc-800 rounded-md p-3 overflow-hidden">
                  <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto custom-scrollbar leading-relaxed">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.details), null, 2);
                      } catch {
                        return selectedLog.details;
                      }
                    })()}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
