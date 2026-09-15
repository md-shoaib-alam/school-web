import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Users,
  UserCog,
  Mail,
  Building2,
  Calendar,
  Eye,
  Activity,
  UserRound,
  Copy,
  Check,
} from "lucide-react";
import { PlatformUser, ROLE_CONFIG, PAGE_SIZE } from "./types";
import { useState } from "react";
import { copyToClipboard } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

interface UserTableProps {
  loading: boolean;
  users: PlatformUser[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onUserClick: (user: PlatformUser) => void;
  formatDate: (val: string) => string;
}

export function UserTable({
  loading,
  users,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onUserClick,
  formatDate,
}: UserTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, email: string, id: string) => {
    e.stopPropagation();
    copyToClipboard(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);

  if (loading) {
    return (
      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32 ml-auto" />
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b last:border-none border-border">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-6 w-24 ml-auto" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-card overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-transparent">
                <TableHead className="w-[280px] min-w-[200px] text-xs font-medium text-muted-foreground py-4 pl-6">
                  <div className="flex items-center gap-2">
                    <UserRound className="size-3.5" /> Name
                  </div>
                </TableHead>
                <TableHead className="min-w-[200px] text-xs font-medium text-muted-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5" /> Email
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px] text-xs font-medium text-muted-foreground py-4">
                  <div className="flex items-center gap-2">
                    <UserCog className="size-3.5" /> Role
                  </div>
                </TableHead>
                <TableHead className="min-w-[160px] text-xs font-medium text-muted-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-3.5" /> School
                  </div>
                </TableHead>
                <TableHead className="min-w-[100px] text-xs font-medium text-muted-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Activity className="size-3.5" /> Status
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px] hidden md:table-cell text-xs font-medium text-muted-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5" /> Joined
                  </div>
                </TableHead>
                <TableHead className="w-[60px] text-right pr-6 py-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow key="empty">
                  <TableCell colSpan={7} className="text-center py-24 text-muted-foreground">
                    <Users className="size-16 mx-auto mb-6 opacity-10" />
                    <p className="text-xl font-semibold text-foreground">No users found</p>
                    <p className="text-sm font-medium mt-1">Try adjusting your filters or search term</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const roleConf = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.student;
                  const initials = (user.name || "").split(" ").map((n) => n?.[0] || "").join("").slice(0, 2).toUpperCase();
                  return (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50 border-b last:border-none group/row"
                      onClick={() => onUserClick(user)}
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-sm ${
                            user.role === "super_admin" ? "bg-teal-500" :
                            user.role === "admin" ? "bg-emerald-500" :
                            user.role === "teacher" ? "bg-blue-500" :
                            user.role === "student" ? "bg-violet-500" :
                            user.role === "staff" ? "bg-violet-500" : "bg-amber-500"
                          }`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground font-medium md:hidden truncate">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-4 group/row">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground truncate block max-w-[200px]">{user.email}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`size-6 rounded-md shrink-0 transition-all hover:bg-muted ${copiedId === user.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                            onClick={(e) => handleCopy(e, user.email, user.id)}
                          >
                            {copiedId === user.id ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className={`gap-1.5 text-xs font-medium px-2.5 h-6 ${roleConf.bg} ${roleConf.color}`}>
                          {roleConf.icon}
                          {roleConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {user.tenant ? (
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Building2 className="size-3 text-muted-foreground" />
                            </div>
                            <span className="text-xs font-medium text-foreground truncate max-w-[140px]">{user.tenant.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground opacity-50">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <StatusBadge tone={user.isActive ? "positive" : "negative"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-4">
                        <span className="text-xs font-medium text-muted-foreground">{formatDate(user.createdAt)}</span>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUserClick(user);
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-border">
            <DataTablePagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              summary={`Showing ${startItem.toLocaleString()} to ${endItem.toLocaleString()} of ${totalCount.toLocaleString()} users`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
