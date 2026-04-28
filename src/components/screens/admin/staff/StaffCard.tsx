"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash2, Shield, Phone, Mail, Copy, Check, MoreHorizontal } from "lucide-react";
import { StaffMember } from "./types";
import { getInitials, roleBadgeStyle, avatarStyle } from "./utils";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StaffCardProps {
  member: StaffMember;
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function StaffCard({ member, onEdit, onDelete, canEdit, canDelete }: StaffCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(member.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-gray-100 dark:border-gray-800 overflow-hidden">
      <CardContent className="p-0">
        <div className="h-1.5 w-full" style={{ backgroundColor: member.customRole?.color || "#6366f1" }} />
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-900 shadow-sm">
                <AvatarFallback style={avatarStyle(member.customRole?.color || "#6366f1")}>
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate leading-tight pr-1">
                  {member.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                   {member.customRole ? (
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 h-4.5 text-[9px] font-bold uppercase tracking-tight shrink-0"
                      style={roleBadgeStyle(member.customRole.color)}
                    >
                      {member.customRole.name}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="px-1.5 py-0 h-4.5 text-[9px] font-bold uppercase tracking-tight shrink-0">
                      Standard
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-1.5 py-0 h-4.5 text-[9px] font-bold uppercase tracking-tight shrink-0",
                      member.isActive ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-gray-400 bg-gray-50 border-gray-100"
                    )}
                  >
                    {member.isActive ? "Active" : "Offline"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-0.5 shrink-0 ml-1">
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
                  className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => onDelete(member)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 min-w-0">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
                onClick={handleCopy}
                title="Copy email"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-gray-400" />}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Phone className="h-3 w-3" />
              <span>{member.phone || "No contact"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
