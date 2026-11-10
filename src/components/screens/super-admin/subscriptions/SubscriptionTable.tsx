import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Pencil,
  Trash2,
  CalendarClock,
  Plus,
  Crown,
  Star,
  IndianRupee,
  UserCircle,
} from "lucide-react";
import { format } from "date-fns";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

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

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
];

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "verified" || s === "enabled") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
        <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
        Active
      </span>
    );
  }
  if (s === "cancelled" || s === "expired" || s === "inactive") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50">
        <span className="size-1.5 rounded-full bg-rose-500 shrink-0" />
        {s === "cancelled" ? "Cancelled" : s === "expired" ? "Expired" : "Inactive"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border  dark:bg-slate-800">
      <span className="size-1.5 rounded-full bg-slate-400 shrink-0" />
      No Plan
    </span>
  );
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
  const commonClasses = "text-xs font-semibold text-muted-foreground py-3.5";
  const cellClasses = "py-3 text-xs font-medium text-foreground";

  return (
    <div className="rounded-2xl border  overflow-hidden shadow-2xs bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-transparent border-b ">
              <TableHead className="w-10 py-3.5 pl-4">
                <input type="checkbox" className="rounded  text-blue-600 focus:ring-blue-500 size-3.5" />
              </TableHead>
              <TableHead className="w-12 text-xs font-semibold text-muted-foreground py-3.5">#</TableHead>
              <TableHead className={commonClasses}>Parent Name</TableHead>
              <TableHead className={commonClasses}>Student</TableHead>
              <TableHead className={commonClasses}>Plan</TableHead>
              <TableHead className={commonClasses}>Status</TableHead>
              <TableHead className={commonClasses}>Period</TableHead>
              <TableHead className={commonClasses}>Start Date</TableHead>
              <TableHead className={commonClasses}>Total Amount</TableHead>
              <TableHead className={`${commonClasses} text-right pr-4`}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-b ">
                  <TableCell colSpan={10} className="py-3">
                    <Skeleton className="h-8 w-full rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : unifiedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="size-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <svg className="size-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-base text-foreground">
                        {!selectedTenant ? "Select a School" : "No Results Found"}
                      </p>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                        {!selectedTenant
                          ? "Please select a school from the dropdown to view parent subscriptions."
                          : "We couldn't find any subscriptions matching your filters."}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              unifiedData.map((item, idx) => {
                const sub = item.subscription;
                const parent = item.parent;
                const rowNum = (page - 1) * limit + idx + 1;
                const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const parentName = parent?.user?.name || parent?.name || "Parent";
                const initials = parentName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "PR";

                // Student name on one line
                const studentName =
                  (parent?.students && parent.students[0]?.name) ||
                  (parent?.students && parent.students[0]?.user?.name) ||
                  (parent?.children && parent.children[0]?.name) ||
                  "Student " + rowNum;

                const formattedDate = sub?.startDate
                  ? format(new Date(sub.startDate), "MMM dd, yyyy")
                  : "–";

                return (
                  <TableRow
                    key={item.id || idx}
                    className="hover:bg-muted dark:hover:bg-slate-800/40 transition-colors border-b  last:border-none"
                  >
                    {/* Checkbox */}
                    <TableCell className="w-10 py-3 pl-4">
                      <input type="checkbox" className="rounded  text-blue-600 focus:ring-blue-500 size-3.5" />
                    </TableCell>

                    {/* Row # */}
                    <TableCell className="w-12 py-3 text-xs font-semibold text-muted-foreground">
                      {rowNum}
                    </TableCell>

                    {/* Parent Name (Avatar + Name in one line) */}
                    <TableCell className={cellClasses}>
                      <div className="flex items-center gap-2.5">
                        <div className={`size-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${avatarBg}`}>
                          {initials}
                        </div>
                        <span className="font-semibold text-xs text-foreground truncate max-w-[160px]">
                          {parentName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Student (Icon + Name in one line) */}
                    <TableCell className={cellClasses}>
                      <div className="flex items-center gap-1.5 text-foreground">
                        <UserCircle className="size-3.5 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[140px]">{studentName}</span>
                      </div>
                    </TableCell>

                    {/* Plan (Icon + Name in one line) */}
                    <TableCell className={cellClasses}>
                      {sub ? (
                        <div className="flex items-center gap-1.5">
                          {sub.planName === "Premium" ? (
                            <Crown className="size-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <Star className="size-3.5 text-blue-500 shrink-0" />
                          )}
                          <span className="font-medium text-foreground">
                            {sub.planName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">No Plan</span>
                      )}
                    </TableCell>

                    {/* Status (StatusBadge in one line) */}
                    <TableCell className={cellClasses}>
                      <StatusBadge status={sub?.status || "none"} />
                    </TableCell>

                    {/* Period in one line */}
                    <TableCell className={cellClasses}>
                      {sub ? (
                        <span className="capitalize">{sub.period}</span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </TableCell>

                    {/* Start Date in one line */}
                    <TableCell className={`${cellClasses} text-muted-foreground`}>
                      {formattedDate}
                    </TableCell>

                    {/* Total Amount in one line */}
                    <TableCell className={cellClasses}>
                      {sub ? (
                        <span className="font-semibold text-foreground flex items-center gap-0.5">
                          <IndianRupee className="size-3" />
                          {sub.amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-4 py-3">
                      {sub ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                            >
                              •••
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(sub)} className="text-xs gap-2">
                              <Pencil className="size-3.5" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExtend(sub)} className="text-xs gap-2">
                              <CalendarClock className="size-3.5" /> Extend Validity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 text-xs gap-2"
                              onClick={() => onDelete(sub)}
                            >
                              <Trash2 className="size-3.5" /> Delete Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-[11px] rounded-lg gap-1"
                          onClick={() => onAssign(item)}
                        >
                          <Plus className="size-3" />
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
        <div className="px-5 py-3 border-t ">
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            summary={`Showing ${startEntry}–${endEntry} of ${totalEntries} entries`}
          />
        </div>
      )}
    </div>
  );
}
