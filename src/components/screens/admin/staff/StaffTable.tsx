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
import { Pencil, Trash2, Shield, Phone, Mail, Copy, Check } from "lucide-react";
import { useState } from "react";
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/20">
          <TableRow>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-zinc-500">Member</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-zinc-500">Contact</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-zinc-500">Role</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest text-zinc-500">Status</TableHead>
            {(canEdit || canDelete) && <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-zinc-500">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center text-zinc-500">
                No staff members found.
              </TableCell>
            </TableRow>
          ) : (
            staff.map((member) => (
              <TableRow key={member.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback style={avatarStyle(member.customRole?.color || "#6366f1")}>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col group">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{member.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500">{member.email}</span>
                        <button 
                          onClick={() => handleCopy(member.email, member.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                          title="Copy email"
                        >
                          {copiedId === member.id ? (
                            <Check className="size-2.5 text-emerald-500" />
                          ) : (
                            <Copy className="size-2.5 text-zinc-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <Phone className="size-3" />
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
                      <Shield className="size-3" />
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
                        : "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-400 dark:border-zinc-800"
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
                          className="size-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          onClick={() => onEdit(member)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => onDelete(member)}
                        >
                          <Trash2 className="size-3.5" />
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
