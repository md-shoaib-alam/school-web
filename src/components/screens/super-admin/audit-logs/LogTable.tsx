import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ScrollText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Building2,
} from "lucide-react";
import { 
  AuditLog, 
  ActionTypeCount, 
  getActionCategory, 
  categoryColors, 
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
  actionTypes,
}: LogTableProps) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
            <ScrollText className="h-5 w-5 text-teal-600" />
          </div>
          Audit Log Intelligence
        </CardTitle>
        <CardDescription className="font-medium text-sm">
          Review granular platform actions and security events across all tenant schools
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50 group-focus-within:opacity-100 transition-opacity" />
            <Input
              placeholder="Search actions, resources, or tenants..."
              className="pl-11 h-11 rounded-xl border-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 font-bold"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select
              value={actionFilter}
              onValueChange={onActionFilterChange}
            >
              <SelectTrigger className="w-full sm:w-[220px] h-11 rounded-xl border-2 font-bold">
                <SelectValue placeholder="Action category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2">
                <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest py-3">All Events</SelectItem>
                {actionTypes.map((at) => (
                  <SelectItem key={at.action} value={at.action} className="text-[10px] font-black uppercase tracking-widest py-3">
                    {at.action.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-24 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed">
            <div className="h-16 w-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <ScrollText className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">No matching logs</p>
            <p className="text-xs font-bold text-muted-foreground mt-1">Adjust your parameters or try a broader search.</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border-2 border-gray-100 dark:border-gray-900 overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-900/80 hover:bg-transparent">
                      <TableHead className="w-[200px] uppercase tracking-widest text-[10px] font-black py-4 pl-6">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" /> Timestamp
                        </div>
                      </TableHead>
                      <TableHead className="w-[180px] uppercase tracking-widest text-[10px] font-black py-4">Action</TableHead>
                      <TableHead className="w-[140px] uppercase tracking-widest text-[10px] font-black py-4">Context</TableHead>
                      <TableHead className="uppercase tracking-widest text-[10px] font-black py-4">Trace Details</TableHead>
                      <TableHead className="w-[160px] uppercase tracking-widest text-[10px] font-black py-4 pr-6">Affiliation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const category = getActionCategory(log.action);
                      return (
                        <TableRow
                          key={log.id}
                          className="hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-colors border-b last:border-none"
                        >
                          <TableCell className="pl-6 py-4">
                            <span className="text-[10px] font-black text-muted-foreground font-mono">
                              {formatTimestamp(log.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant="outline"
                              className={`${categoryColors[category] || ""} text-[9px] font-black uppercase tracking-widest px-2.5 h-6 border-transparent shadow-sm`}
                            >
                              {log.action.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                              {log.resource}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[300px] py-4">
                            <div className="group relative">
                              <span className="text-[10px] font-bold font-mono text-muted-foreground bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg inline-block truncate max-w-full border border-gray-100 dark:border-gray-800">
                                {log.details ? truncateJson(log.details, 80) : "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 pr-6">
                            <div className="flex items-center gap-2">
                              {log.tenant ? (
                                <>
                                  <div className="h-6 w-6 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
                                    <Building2 className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate max-w-[140px]">
                                    {log.tenant.name}
                                  </span>
                                </>
                              ) : (
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest h-6 bg-blue-50 text-blue-700 border-transparent">Platform Root</Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Displaying <span className="text-teal-600">{(page - 1) * limit + 1}</span> to <span className="text-teal-600">{Math.min(page * limit, totalLogs)}</span> of {totalLogs.toLocaleString()} events
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => onPageChange(1)}
                  disabled={page <= 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl mr-2"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 w-8 rounded-xl font-black text-xs ${page === pageNum ? "bg-teal-600 text-white shadow-lg shadow-teal-200 dark:shadow-none" : ""}`}
                        onClick={() => onPageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl ml-2"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => onPageChange(totalPages)}
                  disabled={page >= totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
