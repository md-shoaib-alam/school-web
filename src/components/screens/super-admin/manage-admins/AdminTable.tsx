import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ShieldCheck,
  Mail,
  Clock,
  Pencil,
  Trash2,
  LockKeyhole,
} from "lucide-react";
import { AdminRecord, getInitials, formatDate } from "./types";

// Simple tooltip wrapper (from original file)
function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {text}
      </div>
    </div>
  );
}

interface AdminTableProps {
  admins: AdminRecord[];
  filteredAdmins: AdminRecord[];
  loading: boolean;
  rootAdminId: string | null;
  onEdit: (admin: AdminRecord) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
}

export function AdminTable({
  admins,
  filteredAdmins,
  loading,
  rootAdminId,
  onEdit,
  onDelete,
  deletingId,
  setDeletingId,
}: AdminTableProps) {
  return (
    <Card className="overflow-hidden border-teal-100/50 dark:border-teal-900/20">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground border-dashed border-2 m-4 rounded-xl">
            <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-lg text-foreground">No super admin accounts</p>
            <p className="text-sm mt-1 max-w-xs mx-auto">
              {admins.length === 0
                ? "Create your first super admin account to get started."
                : "No admins match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="min-w-[250px] font-bold">Name</TableHead>
                  <TableHead className="hidden sm:table-cell font-bold">Email</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="hidden md:table-cell font-bold">Created</TableHead>
                  <TableHead className="w-[100px] text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => {
                  const isRoot = admin.id === rootAdminId;
                  return (
                    <TableRow
                      key={admin.id}
                      className="hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-sm">
                            <AvatarFallback className="bg-teal-500 text-white text-xs font-bold">
                              {getInitials(admin.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-sm truncate">
                                {admin.name}
                              </p>
                              {isRoot && (
                                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-[10px] gap-1 px-1.5 py-0 shadow-none font-semibold">
                                  <LockKeyhole className="h-3 w-3" />
                                  Root Owner
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate sm:hidden font-medium">
                              {admin.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate font-medium text-muted-foreground">
                            {admin.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            admin.isActive
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-none shadow-none text-[10px] py-0.5"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-none shadow-none text-[10px] py-0.5"
                          }
                        >
                          {admin.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-tight">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(admin.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {isRoot ? (
                          <Tooltip text="Root owner cannot be modified">
                            <div className="flex items-center justify-end gap-1 opacity-30 cursor-not-allowed">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </Tooltip>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                              onClick={() => onEdit(admin)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog
                              open={deletingId === admin.id}
                              onOpenChange={(open) => {
                                if (!open) setDeletingId(null);
                              }}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() => setDeletingId(admin.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Super Admin
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete{" "}
                                    <strong className="text-foreground">{admin.name}</strong>? This action
                                    cannot be undone and they will lose all platform access.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    className="rounded-xl"
                                    onClick={() => setDeletingId(null)}
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl border-none"
                                    onClick={() => onDelete(admin.id)}
                                  >
                                    Delete Account
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && filteredAdmins.length > 0 && (
          <div className="px-6 py-4 border-t bg-muted/20">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Showing{" "}
              <span className="text-foreground">
                {filteredAdmins.length}
              </span>{" "}
              of{" "}
              <span className="text-foreground">
                {admins.length}
              </span>{" "}
              super admin{admins.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
