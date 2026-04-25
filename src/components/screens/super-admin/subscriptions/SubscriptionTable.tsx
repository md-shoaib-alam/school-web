import { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreVertical,
  Pencil,
  Trash2,
  CalendarClock,
  Plus,
  Building2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Star,
  CalendarDays,
  IndianRupee,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { statusConfig } from "./types";

interface SubscriptionTableProps {
  unifiedData: any[];
  loading: boolean;
  selectedTenant: string;
  page: number;
  limit: number;
  totalPages: number;
  totalEntries: number;
  onPageChange: (page: number) => void;
  onEdit: (sub: any) => void;
  onExtend: (sub: any) => void;
  onDelete: (sub: any) => void;
  onAssign: (item: any) => void;
}

export function SubscriptionTable({
  unifiedData,
  loading,
  selectedTenant,
  page,
  limit,
  totalPages,
  totalEntries,
  onPageChange,
  onEdit,
  onExtend,
  onDelete,
  onAssign,
}: SubscriptionTableProps) {
  return (
    <Card className="overflow-hidden border-teal-100 dark:border-teal-900/20">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-teal-50/50 dark:bg-teal-900/10">
            <TableRow>
              <TableHead>Parent & Students</TableHead>
              <TableHead>Plan Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-12 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : unifiedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">No Results Found</p>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        We couldn't find any subscriptions matching your
                        filters.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              unifiedData.map((item) => {
                const sub = item.subscription;
                const parent = item.parent;

                return (
                  <TableRow
                    key={item.id}
                    className="group hover:bg-teal-50/30 dark:hover:bg-teal-900/5 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center font-bold uppercase",
                            sub
                              ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500",
                          )}
                        >
                          {parent?.user?.name?.[0] || parent?.name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {parent?.user?.name || parent?.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {parent?.user?.email || parent?.email}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(parent?.students || parent?.children || []).map(
                              (s: any) => (
                                <Badge
                                  key={s.id}
                                  variant="outline"
                                  className="text-[10px] py-0 h-4 bg-white dark:bg-gray-950"
                                >
                                  {s.name || s.user?.name}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sub ? (
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "p-1.5 rounded-lg",
                              sub.planName === "Premium"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-blue-100 text-blue-600",
                            )}
                          >
                            {sub.planName === "Premium" ? (
                              <Crown className="h-4 w-4" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {sub.planName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                              ID: {sub.planId}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No Plan Assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "gap-1 py-1 px-2 text-[11px] font-medium border shadow-none",
                          sub
                            ? statusConfig[sub.status]?.bg
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 border-gray-200 dark:border-gray-700",
                        )}
                      >
                        {sub ? (
                          statusConfig[sub.status]?.icon
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {sub
                          ? statusConfig[sub.status]?.label
                          : "No Active Plan"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium capitalize">
                            {sub.period}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(sub.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {sub ? (
                        <div className="flex items-center gap-1 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {sub.amount.toLocaleString()}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {sub ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                              Subscription Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(sub)}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExtend(sub)}>
                              <CalendarClock className="h-4 w-4 mr-2" /> Extend
                              Validity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700 focus:bg-red-50"
                              onClick={() => onDelete(sub)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          onClick={() => onAssign(item)}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Assign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-900/20 border-t gap-4">
          <div className="flex items-center gap-4 order-2 sm:order-1">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                {(page - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                {Math.min(page * limit, totalEntries)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {totalEntries}
              </span>{" "}
              entries
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Rows per page: 25
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  // Show first, last, and a window around current page
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 text-xs",
                          page === pageNum
                            ? "bg-teal-600 hover:bg-teal-700 shadow-sm"
                            : "hover:bg-teal-50",
                        )}
                        onClick={() => onPageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }

                  // Show ellipsis
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <span
                        key={pageNum}
                        className="px-1 text-muted-foreground text-xs"
                      >
                        ...
                      </span>
                    );
                  }

                  return null;
                },
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
