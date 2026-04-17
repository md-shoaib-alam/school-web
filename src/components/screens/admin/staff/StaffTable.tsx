"use client";

import { Badge } from "@/components/ui/badge";
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
import { Pencil, Trash2, Shield, Phone, Mail } from "lucide-react";
import { StaffMember } from "./types";
import { getInitials, roleBadgeStyle, avatarStyle } from "./utils";

interface StaffTableProps {
  staff: StaffMember[];
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function StaffTable({
  staff,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: StaffTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50/50 dark:bg-gray-900/20">
          <TableRow>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Member</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Contact</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Role</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Status</TableHead>
            {(canEdit || canDelete) && <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-gray-500">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center text-gray-500">
                No staff members found.
              </TableCell>
            </TableRow>
          ) : (
            staff.map((member) => (
              <TableRow key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback style={avatarStyle(member.customRole?.color || "#6366f1")}>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{member.name}</span>
                      <span className="text-[10px] text-gray-500">{member.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <Phone className="h-3 w-3" />
                      {member.phone || "No phone"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {member.customRole ? (
                    <Badge
                      variant="outline"
                      className="gap-1.5 shadow-none font-bold text-[10px]"
                      style={roleBadgeStyle(member.customRole.color)}
                    >
                      <Shield className="h-3 w-3" />
                      {member.customRole.name}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] font-bold">Standard</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold shadow-none ${
                      member.isActive 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" 
                        : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-800"
                    }`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                {(canEdit || canDelete) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          onClick={() => onEdit(member)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => onDelete(member)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
