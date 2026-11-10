"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash2, Phone, Mail, Copy, Check } from "lucide-react";
import { StaffMember } from "./types";
import { getInitials, roleBadgeStyle, avatarStyle } from "./utils";
import { useState } from "react";
import { cn } from "@/lib/utils"
import { copyToClipboard } from "@/lib/clipboard";

interface StaffCardProps {
  member: StaffMember;
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
  onView: (member: StaffMember) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function StaffCard({ member, onEdit, onDelete, onView, canEdit, canDelete }: StaffCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(member.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roleColor = member.customRole?.color || "#6366f1";

  return (
    <Card 
      className="group shadow-sm hover:shadow-md transition-all duration-300 border  bg-card overflow-hidden cursor-pointer rounded-2xl"
      onClick={() => onView(member)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar 
              className="size-12 border-2 shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0" 
              style={{ borderColor: roleColor }}
            >
              <AvatarFallback style={avatarStyle(roleColor)}>
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate leading-tight pr-1">
                {member.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-1.5 py-0 h-4 text-[9px] font-bold uppercase tracking-tight shrink-0",
                    member.isActive ? "text-emerald-600 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30" : "text-muted-foreground bg-muted "
                  )}
                >
                  {member.isActive ? "Active" : "Offline"}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-0.5 shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
            {canEdit && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="size-8 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                onClick={() => onEdit(member)}
              >
                <Pencil className="size-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="size-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => onDelete(member)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs  min-w-0">
              <Mail className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent shrink-0 rounded-md"
              onClick={(e) => { e.stopPropagation(); handleCopy(); }}
              title="Copy email"
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-xs ">
            <Phone className="size-3.5 text-muted-foreground shrink-0" />
            <span className={cn(!member.phone && "text-muted-foreground italic")}>
              {member.phone || "No contact"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {member.customRole ? (
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={roleBadgeStyle(member.customRole.color)}
              >
                {member.customRole.name}
              </Badge>
            ) : (
              <Badge variant="secondary" className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border ">
                No Role
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
