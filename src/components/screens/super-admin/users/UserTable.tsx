import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  Check,
  Power,
  Users
} from "lucide-react";
import { PlatformUser, ROLE_CONFIG } from "./types";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface UserTableProps {
  loading: boolean;
  users: PlatformUser[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  onPageChange: (page: number) => void;
  onUserClick: (user: PlatformUser) => void;
  onToggleStatus?: (userId: string, currentActive: boolean) => void;
  formatDate: (val: string) => string;
}

const AVATAR_BG_CLASSES = [
  "bg-emerald-600",
  "bg-blue-600",
  "bg-purple-600",
  "bg-amber-600",
  "bg-fuchsia-600",
  "bg-teal-600",
  "bg-sky-600",
  "bg-indigo-600",
];

export function UserTable({
  loading,
  users,
  totalCount,
  currentPage,
  totalPages,
  pageSize = 10,
  onPageSizeChange,
  onPageChange,
  onUserClick,
  onToggleStatus,
  formatDate,
}: UserTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(users.map((u) => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const isAllSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const isIndeterminate = users.some((u) => selectedIds.has(u.id)) && !isAllSelected;

  const getAvatarBg = (name: string, index: number) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i);
      hash |= 0;
    }
    return AVATAR_BG_CLASSES[Math.abs(hash) % AVATAR_BG_CLASSES.length];
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-4">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32 ml-auto" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b last:border-none border-slate-100 dark:border-zinc-800/80">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-6 w-20 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/75 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 px-4 py-3.5">
                <Checkbox
                  checked={isAllSelected || (isIndeterminate ? "indeterminate" : false)}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className="rounded-md border-slate-300 dark:border-zinc-700"
                />
              </TableHead>
              <TableHead className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Name
              </TableHead>
              <TableHead className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Email
              </TableHead>
              <TableHead className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Role
              </TableHead>
              <TableHead className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                School
              </TableHead>
              <TableHead className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Status
              </TableHead>
              <TableHead className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Joined
              </TableHead>
              <TableHead className="w-16 py-3.5 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-20 text-slate-400">
                  <Users className="size-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No users found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, idx) => {
                const roleConf = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.student;
                const initials = (user.name || "U")
                  .split(" ")
                  .map((n) => n[0] || "")
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const isSelected = selectedIds.has(user.id);
                const bgClass = getAvatarBg(user.name || "", idx);

                return (
                  <TableRow
                    key={user.id}
                    className={`border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer ${
                      isSelected ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                    }`}
                    onClick={() => onUserClick(user)}
                  >
                    {/* Checkbox */}
                    <TableCell className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleRow(user.id)}
                        aria-label={`Select ${user.name}`}
                        className="rounded-md border-slate-300 dark:border-zinc-700"
                      />
                    </TableCell>

                    {/* Name + Avatar */}
                    <TableCell className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs ${bgClass}`}
                        >
                          {initials}
                        </div>
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {user.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="px-4 py-3.5">
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
                        {user.email}
                      </span>
                    </TableCell>

                    {/* Role */}
                    <TableCell className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleConf.bg} ${roleConf.color}`}
                      >
                        {roleConf.icon}
                        {roleConf.label}
                      </span>
                    </TableCell>

                    {/* School */}
                    <TableCell className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">
                        <Building2 className="size-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[170px]">
                          {user.tenant?.name || "–"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-4 py-3.5">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                          <Clock className="size-3 text-amber-500" />
                          Inactive
                        </span>
                      )}
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="px-4 py-3.5">
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </span>
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border-slate-200 dark:border-zinc-800">
                          <DropdownMenuItem
                            onClick={() => onUserClick(user)}
                            className="text-xs font-medium gap-2 cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              copyToClipboard(user.email);
                              toast.success("Email copied to clipboard");
                            }}
                            className="text-xs font-medium gap-2 cursor-pointer"
                          >
                            <Copy className="size-3.5" />
                            Copy Email
                          </DropdownMenuItem>
                          {onToggleStatus && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onToggleStatus(user.id, user.isActive)}
                                className={`text-xs font-medium gap-2 cursor-pointer ${
                                  user.isActive ? "text-amber-600" : "text-emerald-600"
                                }`}
                              >
                                <Power className="size-3.5" />
                                {user.isActive ? "Deactivate User" : "Activate User"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer matching screenshot */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
        {/* Rows Per Page */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Rows per page</span>
          {onPageSizeChange ? (
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-16 rounded-lg border-slate-200 dark:border-zinc-800 text-xs font-semibold bg-white dark:bg-zinc-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
                <SelectItem value="10" className="text-xs">10</SelectItem>
                <SelectItem value="25" className="text-xs">25</SelectItem>
                <SelectItem value="50" className="text-xs">50</SelectItem>
                <SelectItem value="100" className="text-xs">100</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className="font-semibold text-slate-800 dark:text-slate-200">{pageSize}</span>
          )}
        </div>

        {/* Page Number Buttons */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="size-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {renderPageNumbers().map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="size-8 flex items-center justify-center text-xs text-slate-400"
                  >
                    …
                  </span>
                );
              }
              const pageNum = Number(p);
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`size-8 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="size-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
