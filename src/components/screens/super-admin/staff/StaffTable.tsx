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
import { StatusBadge } from "@/components/ui/status-badge";

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
      <Card className="border-none shadow-sm bg-card">
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
      <div className="py-24 text-center bg-card rounded-3xl border-2 border-dashed border-border">
        <div className="size-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
          <Users className="size-10" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">No staff members found</h3>
        <p className="text-sm font-medium text-muted-foreground mt-2 max-w-[280px] mx-auto leading-relaxed">
          {staffList.length === 0
            ? 'Start building your platform team by clicking "Add Staff" above.'
            : "No staff members match your search criteria. Try a different term."}
        </p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-card overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-transparent">
                <TableHead className="min-w-[220px] text-xs font-medium text-muted-foreground py-4 pl-6">Member</TableHead>
                <TableHead className="hidden sm:table-cell text-xs font-medium text-muted-foreground py-4">Contact Info</TableHead>
                <TableHead className="hidden lg:table-cell text-xs font-medium text-muted-foreground py-4">Platform Role</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground py-4">Status</TableHead>
                {(canEdit || canDelete) && (
                  <TableHead className="w-[100px] text-right py-4 pr-6">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((member) => {
                const initials = getInitials(member.name);
                const roleColor = member.platformRole?.color;
                const hasApiColor = !!roleColor;

                return (
                  <TableRow
                    key={member.id}
                    className="hover:bg-muted/50 transition-colors border-b last:border-none"
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 shrink-0 shadow-sm rounded-xl">
                          <AvatarFallback
                            className={`text-xs font-bold rounded-xl ${!hasApiColor ? "bg-muted text-muted-foreground" : ""}`}
                            style={hasApiColor ? avatarStyle(roleColor) : undefined}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {member.name}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium truncate sm:hidden">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Mail className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium text-foreground truncate">
                            {member.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0 opacity-60">
                          <Phone className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium truncate">
                            {member.phone || "\u2013"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell py-4">
                      {member.platformRole ? (
                        <Badge
                          variant="outline"
                          className="font-medium text-xs gap-1.5 h-6 px-2.5 shadow-sm"
                          style={roleBadgeStyle(member.platformRole.color)}
                        >
                          <Shield className="size-2.5" />
                          {member.platformRole.name}
                        </Badge>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 opacity-50">
                          <UserCircle className="size-3.5" />
                          No Role Assigned
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      <StatusBadge tone={member.isActive ? "positive" : "negative"}>
                        {member.isActive ? "Active" : "Inactive"}
                      </StatusBadge>
                    </TableCell>

                    {(canEdit || canDelete) && (
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
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
                                  className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => setDeletingId(member.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl border-2">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-semibold text-xl">
                                    Delete Staff Member
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="font-medium text-sm">
                                    Are you sure you want to permanently delete{" "}
                                    <span className="font-semibold text-foreground">{member.name}</span>?
                                    This action cannot be undone and will revoke all access immediately.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2">
                                  <AlertDialogCancel className="rounded-xl font-medium border-2">
                                    Keep Member
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-medium"
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
          <div className="px-6 py-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground">
              Directly managing <span className="text-foreground">{filtered.length}</span> platform personnel records
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
