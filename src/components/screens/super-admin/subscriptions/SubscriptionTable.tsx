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
  MoreVertical,
  Pencil,
  Trash2,
  CalendarClock,
  Plus,
  Building2,
  Crown,
  Star,
  CalendarDays,
  IndianRupee,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { StatusBadge } from "@/components/ui/status-badge";

interface SubscriptionTableProps {
  unifiedData: any[];
  loading: boolean;
  selectedTenant: string;
  page: number;
  limit: number;
  totalPages: number;
  totalEntries: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
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
  onLimitChange,
  onEdit,
  onExtend,
  onDelete,
  onAssign,
}: SubscriptionTableProps) {
  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalEntries);

  return (
    <Card className="overflow-hidden border rounded-xl bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-medium text-muted-foreground">Parent & Students</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Plan Details</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Period</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Total Amount</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-right">Actions</TableHead>
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
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Building2 className="size-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {!selectedTenant ? "Select a School" : "No Results Found"}
                      </p>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        {!selectedTenant
                          ? "Please select a school from the dropdown to view parent subscriptions."
                          : "We couldn't find any subscriptions matching your filters."}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              unifiedData.map((item) => {
                const sub = item.subscription;
                const parent = item.parent;

                const statusTone = !sub
                  ? "neutral" as const
                  : sub.status === "active"
                    ? "positive" as const
                    : sub.status === "cancelled" || sub.status === "expired"
                      ? "negative" as const
                      : "warning" as const;

                const statusLabel = !sub
                  ? "No Active Plan"
                  : sub.status === "active"
                    ? "Active"
                    : sub.status === "cancelled"
                      ? "Cancelled"
                      : sub.status === "expired"
                        ? "Expired"
                        : sub.status;

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "size-10 rounded-full flex items-center justify-center font-semibold uppercase text-xs",
                            sub
                              ? "bg-muted text-foreground"
                              : "bg-muted text-muted-foreground",
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
                                  className="text-xs py-0 h-5"
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
                                ? "bg-muted text-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {sub.planName === "Premium" ? (
                              <Crown className="size-4" />
                            ) : (
                              <Star className="size-4" />
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
                      <StatusBadge tone={statusTone}>
                        {statusLabel}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      {sub ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium capitalize">
                            {sub.period}
                          </span>
                          <span suppressHydrationWarning className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            {new Date(sub.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        "\u2013"
                      )}
                    </TableCell>
                    <TableCell>
                      {sub ? (
                        <div className="flex items-center gap-1 font-semibold text-sm">
                          <IndianRupee className="size-3.5" />
                          {sub.amount.toLocaleString()}
                        </div>
                      ) : (
                        "\u2013"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {sub ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                              Subscription Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(sub)}>
                              <Pencil className="size-4 mr-2" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExtend(sub)}>
                              <CalendarClock className="size-4 mr-2" /> Extend
                              Validity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => onDelete(sub)}
                            >
                              <Trash2 className="size-4 mr-2" /> Delete Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAssign(item)}
                        >
                          <Plus className="size-3.5 mr-1.5" />
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
        <div className="px-6 py-4 border-t">
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            summary={`Showing ${startEntry}\u2013${endEntry} of ${totalEntries} entries`}
          />
        </div>
      )}
    </Card>
  );
}
