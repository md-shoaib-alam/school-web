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
  ChevronLeft,
  ChevronRight,
  UserCog,
  Mail,
  Building2,
  Calendar,
  Eye,
  Activity,
  UserRound,
} from "lucide-react";
import { PlatformUser, ROLE_CONFIG, PAGE_SIZE } from "./types";

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
  
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32 ml-auto" />
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b last:border-none border-gray-100 dark:border-gray-800">
              <Skeleton className="h-8 w-8 rounded-full" />
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
    <Card className="border-none shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 hover:bg-transparent">
                <TableHead className="w-[280px] min-w-[200px] uppercase tracking-widest text-[10px] font-black text-muted-foreground py-4 pl-6">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-3.5 w-3.5" /> Name
                  </div>
                </TableHead>
                <TableHead className="min-w-[200px] uppercase tracking-widest text-[10px] font-black text-muted-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px] uppercase tracking-widest text-[10px] font-black text-muted-foreground py-4">
                  <div className="flex items-center gap-2">
                    <UserCog className="h-3.5 w-3.5" /> Role
                  </div>
                </TableHead>
                <TableHead className="min-w-[160px] uppercase tracking-widest text-[10px] font-black text-muted-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" /> School
                  </div>
                </TableHead>
                <TableHead className="min-w-[100px] uppercase tracking-widest text-[10px] font-black text-muted-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5" /> Status
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px] hidden md:table-cell uppercase tracking-widest text-[10px] font-black text-muted-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> Joined
                  </div>
                </TableHead>
                <TableHead className="w-[60px] text-right pr-6 py-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-24 text-muted-foreground">
                    <Users className="h-16 w-16 mx-auto mb-6 opacity-10" />
                    <p className="text-xl font-black text-gray-900 dark:text-gray-100">No users found</p>
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
                      className="cursor-pointer transition-colors hover:bg-teal-50/30 dark:hover:bg-teal-900/10 border-b last:border-none"
                      onClick={() => onUserClick(user)}
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 text-white shadow-sm ${
                            user.role === "super_admin" ? "bg-teal-500" : 
                            user.role === "admin" ? "bg-emerald-500" : 
                            user.role === "teacher" ? "bg-blue-500" : 
                            user.role === "student" ? "bg-violet-500" : 
                            user.role === "staff" ? "bg-indigo-500" : "bg-amber-500"
                          }`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium md:hidden truncate">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-4">
                        <span className="text-xs font-bold text-muted-foreground truncate block max-w-[220px]">{user.email}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className={`gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 h-6 border-transparent ${roleConf.bg} ${roleConf.color}`}>
                          {roleConf.icon}
                          {roleConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {user.tenant ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[140px]">{user.tenant.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground opacity-50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2.5 h-6 border-transparent ${
                          user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}>
                          <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-4">
                        <span className="text-xs font-bold text-muted-foreground">{formatDate(user.createdAt)}</span>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUserClick(user);
                          }}
                        >
                          <Eye className="h-4 w-4" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-50 dark:border-gray-900 bg-gray-50/30 dark:bg-gray-900/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Showing <span className="text-teal-600">{startItem.toLocaleString()}</span> to <span className="text-teal-600">{endItem.toLocaleString()}</span> of {totalCount.toLocaleString()} users
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 px-1">
                {getPageNumbers().map((page, idx) =>
                  page === "ellipsis" ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground font-black">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 w-8 rounded-xl font-black text-xs ${currentPage === page ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 dark:shadow-none' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
