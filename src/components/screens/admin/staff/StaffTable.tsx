"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, Shield, Phone, Eye, MoreVertical } from "lucide-react";
import { StaffMember } from "./types";
import { getInitials, roleBadgeStyle } from "./utils";
import { LazyMotion, domMax, m } from "framer-motion";

const premiumLayoutTransition = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.7
} as const;

interface StaffTableProps {
  staff: StaffMember[];
  /** First paint only: items arrive with a staggered fade instead of the view-switch travel. */
  enter?: boolean;
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
  onView: (member: StaffMember) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function StaffTable({
  staff,
  enter,
  onEdit,
  onDelete,
  onView,
  canEdit,
  canDelete,
}: StaffTableProps) {
  return (
    <Card className="shadow-sm border-0 overflow-hidden mb-4">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
      <Table className="text-left">
        <TableHeader className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
          <TableRow>
            <TableHead className="px-6 py-4">Member</TableHead>
            <TableHead className="px-6 py-4 hidden sm:table-cell">Contact</TableHead>
            <TableHead className="px-6 py-4 hidden md:table-cell">Role</TableHead>
            <TableHead className="px-6 py-4 hidden sm:table-cell">Status</TableHead>
            <TableHead className="px-6 py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                No staff members found.
              </TableCell>
            </TableRow>
          ) : (
            <LazyMotion features={domMax}>
              {staff.map((member, index) => (
              <m.tr
                key={member.id}
                id={`staff-item-${member.id}`}
                layoutId={`staff-${member.id}`}
                initial={enter ? { y: 6 } : undefined}
                animate={{ y: 0 }}
                transition={enter ? { ...premiumLayoutTransition, delay: Math.min(index, 10) * 0.03 } : premiumLayoutTransition}
                data-slot="table-row"
                className="hover:bg-muted border-b transition-colors cursor-pointer"
                onClick={() => onView(member)}
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 group">
                      <span className="font-bold text-sm text-foreground truncate">{member.name}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{member.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 hidden sm:table-cell">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <Phone className="size-3" />
                      {member.phone || "No phone"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 hidden md:table-cell">
                  {member.customRole ? (
                    <Badge
                      variant="outline"
                      className="gap-1.5 shadow-none font-bold text-[10px]"
                      style={roleBadgeStyle(member.customRole.color)}
                    >
                      <Shield className="size-3" />
                      {member.customRole.name}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] font-bold">Standard</Badge>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4 hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold shadow-none ${
                      member.isActive 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" 
                        : "bg-muted text-foreground "
                    }`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Desktop Actions (xl and up) */}
                    <div className="hidden xl:flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-emerald-600"
                        onClick={() => onView(member)}
                        title="View Details"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      {canEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-emerald-600"
                          onClick={() => onEdit(member)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-red-600"
                          onClick={() => onDelete(member)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Mobile/Tablet Actions (below xl) */}
                    <div className="xl:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => onView(member)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          {canEdit && (
                            <DropdownMenuItem onClick={() => onEdit(member)} className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit Staff</span>
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem 
                              onClick={() => onDelete(member)} 
                              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Record</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </TableCell>
              </m.tr>
              ))}
            </LazyMotion>
          )}
        </TableBody>
      </Table>
        </div>
      </CardContent>
    </Card>
  );
}
