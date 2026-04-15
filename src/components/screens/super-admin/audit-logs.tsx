"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  FileText,
  Activity,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useAuditLogs } from "@/lib/graphql/hooks";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  details: string;
  createdAt: string;
  tenant: {
    name: string;
  } | null;
}

interface ActionTypeCount {
  action: string;
  count: number;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
  actionTypes: ActionTypeCount[];
}

function getActionCategory(action: string): string {
  if (action.startsWith("CREATE")) return "CREATE";
  if (action.startsWith("UPDATE")) return "UPDATE";
  if (action.startsWith("DELETE")) return "DELETE";
  if (action.includes("LOGIN") || action.includes("LOGOUT")) return "LOGIN";
  if (
    action.includes("VIEW") ||
    action.includes("LIST") ||
    action.includes("GET")
  )
    return "VIEW";
  if (action.includes("EXPORT")) return "EXPORT";
  if (action.includes("SUSPEND") || action.includes("DISABLE"))
    return "SUSPEND";
  return "VIEW";
}

const categoryColors: Record<string, string> = {
  CREATE:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700",
  UPDATE:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700",
  DELETE:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700",
  LOGIN:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700",
  VIEW: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  EXPORT:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700",
  SUSPEND:
    "bg-orange-100 dark:bg-orange-900/30 text-orange-700 border-orange-200",
};

const categoryIcons: Record<string, string> = {
  CREATE: "🟢",
  UPDATE: "🔵",
  DELETE: "🔴",
  LOGIN: "🟣",
  VIEW: "⚪",
  EXPORT: "🟡",
  SUSPEND: "🟠",
};

function truncateJson(jsonStr: string, maxLen: number = 60): string {
  try {
    const parsed = JSON.parse(jsonStr);
    const formatted = JSON.stringify(parsed);
    if (formatted.length <= maxLen) return formatted;
    return formatted.slice(0, maxLen) + "...";
  } catch {
    if (jsonStr.length <= maxLen) return jsonStr;
    return jsonStr.slice(0, maxLen) + "...";
  }
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function SuperAdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch via GraphQL
  const {
    data,
    isLoading: loading,
    error: fetchError,
  } = useAuditLogs({
    action: actionFilter !== "all" ? actionFilter : undefined,
    page,
    limit,
  });

  const filteredLogs =
    data?.logs.filter((log) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.resource.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.tenant?.name?.toLowerCase().includes(q)
      );
    }) ?? [];

  const totalLogs = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-7 w-10" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-rose-500" />
                  <p className="text-xs text-muted-foreground font-medium">
                    Total Logs
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {totalLogs}
                </p>
              </CardContent>
            </Card>
            {data?.actionTypes.slice(0, 4).map((at) => {
              const category = getActionCategory(at.action);
              return (
                <Card
                  key={at.action}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {at.action.replace(/_/g, " ")}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {at.count}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>

      {/* All Action Types Mini Cards */}
      {!loading && data && data.actionTypes.length > 4 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-rose-500" />
              Action Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.actionTypes.map((at) => {
                const category = getActionCategory(at.action);
                return (
                  <Badge
                    key={at.action}
                    variant="outline"
                    className={`${categoryColors[category] || categoryColors.VIEW} px-3 py-1 text-xs`}
                  >
                    <span className="mr-1">
                      {categoryIcons[category] || "⚪"}
                    </span>
                    {at.action.replace(/_/g, " ")}
                    <span className="ml-1.5 font-bold">({at.count})</span>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-rose-500" />
            Audit Log Entries
          </CardTitle>
          <CardDescription>
            Review all platform actions and system events across tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by action, resource, details, or tenant..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select
                value={actionFilter}
                onValueChange={(val) => {
                  setActionFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {data?.actionTypes.map((at) => (
                    <SelectItem key={at.action} value={at.action}>
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
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : fetchError ? (
            <div className="text-center py-10">
              <p className="text-red-500 font-medium">
                Error loading audit logs
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {fetchError.message}
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-10">
              <ScrollText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                No audit logs found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {search || actionFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No logs have been recorded yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <div className="max-h-[520px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-900/80">
                        <TableHead className="w-[180px]">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Timestamp
                          </div>
                        </TableHead>
                        <TableHead className="w-[160px]">Action</TableHead>
                        <TableHead className="w-[120px]">Resource</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="w-[140px]">Tenant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => {
                        const category = getActionCategory(log.action);
                        return (
                          <TableRow
                            key={log.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900/50 transition-colors"
                          >
                            <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                              {formatTimestamp(log.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`${categoryColors[category] || categoryColors.VIEW} text-[11px] font-medium`}
                              >
                                {log.action.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {log.resource}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[250px]">
                              <span className="text-xs font-mono text-muted-foreground bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded inline-block truncate max-w-full">
                                {log.details ? truncateJson(log.details) : "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {log.tenant?.name || (
                                  <span className="text-muted-foreground italic">
                                    System
                                  </span>
                                )}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {(page - 1) * limit + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {Math.min(page * limit, totalLogs)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {totalLogs}
                  </span>{" "}
                  entries
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(1)}
                    disabled={page <= 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="icon"
                          className={`h-8 w-8 ${page === pageNum ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    },
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(totalPages)}
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
    </div>
  );
}
