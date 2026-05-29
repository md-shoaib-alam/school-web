import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Shield,
  UserCircle,
} from "lucide-react";
import { StaffRecord, getInitials, avatarStyle, roleBadgeStyle } from "./types";

interface StaffTableProps {
  loading: boolean;
  staffList: StaffRecord[];
  filtered: StaffRecord[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (member: StaffRecord) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
}

export function StaffTable({
  loading,
  staffList,
  filtered,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  deletingId,
  setDeletingId,
}: StaffTableProps) {
  if (loading) {
    return (
      <Card className="border-none shadow-sm bg-white dark:bg-zinc-800">
        <CardContent className="p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="py-24 text-center bg-white dark:bg-zinc-800 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-900">
        <div className="size-20 mx-auto mb-6 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-muted-foreground/30">
          <Users className="size-10" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">No staff members found</h3>
        <p className="text-sm font-medium text-muted-foreground mt-2 max-w-[280px] mx-auto leading-relaxed">
          {staffList.length === 0
            ? 'Start building your platform team by clicking "Add Staff" above.'
            : "No staff members match your search criteria. Try a different term."}
        </p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-zinc-800 overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-transparent">
                <TableHead className="min-w-[220px] uppercase tracking-widest text-[10px] font-black text-muted-foreground py-4 pl-6">Member</TableHead>
                <TableHead className="hidden sm:table-cell uppercase tracking-widest text-[10px] font-black text-muted-foreground py-4">Contact Info</TableHead>
                <TableHead className="hidden lg:table-cell uppercase tracking-widest text-[10px] font-black text-muted-foreground py-4">Platform Role</TableHead>
                <TableHead className="uppercase tracking-widest text-[10px] font-black text-muted-foreground py-4">Status</TableHead>
                {(canEdit || canDelete) && (
                  <TableHead className="w-[100px] text-right py-4 pr-6">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((member) => {
                const initials = getInitials(member.name);
                const roleColor = member.platformRole?.color || "#6b7280";

                return (
                  <TableRow
                    key={member.id}
                    className="hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-colors border-b last:border-none"
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 shrink-0 shadow-sm rounded-xl">
                          <AvatarFallback
                            className="text-xs font-black rounded-xl"
                            style={avatarStyle(roleColor)}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                              {member.name}
                            </p>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium truncate sm:hidden">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Mail className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate">
                            {member.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0 opacity-60">
                          <Phone className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-[10px] font-bold truncate">
                            {member.phone || "–"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell py-4">
                      {member.platformRole ? (
                        <Badge
                          variant="outline"
                          className="font-black text-[9px] uppercase tracking-widest gap-1.5 h-6 border-transparent px-2.5 shadow-sm"
                          style={roleBadgeStyle(member.platformRole.color)}
                        >
                          <Shield className="size-2.5" />
                          {member.platformRole.name}
                        </Badge>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 opacity-50">
                          <UserCircle className="size-3.5" />
                          No Role Assigned
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-black uppercase tracking-widest px-2.5 h-6 border-transparent ${
                          member.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <div className={`size-1.5 rounded-full mr-1.5 ${member.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    {(canEdit || canDelete) && (
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                              onClick={() => onEdit(member)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <AlertDialog
                              open={deletingId === member.id}
                              onOpenChange={(open) => {
                                if (!open) setDeletingId(null);
                              }}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  onClick={() => setDeletingId(member.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl border-2">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-black text-xl">
                                    Delete Staff Member
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="font-medium text-sm">
                                    Are you sure you want to permanently delete{" "}
                                    <span className="font-black text-zinc-900 dark:text-zinc-100">{member.name}</span>? 
                                    This action cannot be undone and will revoke all access immediately.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2">
                                  <AlertDialogCancel className="rounded-xl font-bold border-2">
                                    Keep Member
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black"
                                    onClick={() => onDelete(member.id)}
                                  >
                                    Confirm Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Directly managing <span className="text-teal-600">{filtered.length}</span> platform personnel records
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
