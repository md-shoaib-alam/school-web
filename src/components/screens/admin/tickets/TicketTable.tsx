"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, MessageSquare, Ticket } from "lucide-react";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  ROLE_COLORS,
} from "./constants";
import { formatDate, getCategoryLabel, getInitials } from "./helpers";
import type { TicketItem } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketTableProps {
  tickets: TicketItem[];
  loading: boolean;
  onOpenDetail: (id: string) => void;
}

export function TicketTable({ tickets, loading, onOpenDetail }: TicketTableProps) {
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No tickets found</p>
        <p className="text-sm mt-1">Create a new ticket to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-28">Priority</TableHead>
              <TableHead className="w-32">Category</TableHead>
              <TableHead className="w-44">Created By</TableHead>
              <TableHead className="w-36">Assignee</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-24 text-center">
                Messages
              </TableHead>
              <TableHead className="w-28">Created</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50"
              >
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono"
                  >
                    {ticket.id.slice(-6).toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate block max-w-[200px]">
                    {ticket.title}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium ${PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium}`}
                  >
                    {PRIORITY_LABELS[ticket.priority] ||
                      ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getCategoryLabel(ticket.category)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        {ticket.creator
                          ? getInitials(ticket.creator.name)
                          : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {ticket.creator?.name || "Unknown"}
                      </p>
                      {ticket.creator?.role && (
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 ${ROLE_COLORS[ticket.creator.role] || ""}`}
                        >
                          {ticket.creator.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {ticket.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {getInitials(ticket.assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {ticket.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium ${STATUS_COLORS[ticket.status] || ""}`}
                  >
                    {STATUS_LABELS[ticket.status] || ticket.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {ticket._count.messages}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(ticket.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    onClick={() => onOpenDetail(ticket.id)}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-4 space-y-3 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors"
            onClick={() => onOpenDetail(ticket.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {ticket.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium ${PRIORITY_COLORS[ticket.priority] || ""}`}
                  >
                    {PRIORITY_LABELS[ticket.priority]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium ${STATUS_COLORS[ticket.status] || ""}`}
                  >
                    {STATUS_LABELS[ticket.status]}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 shrink-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>{getCategoryLabel(ticket.category)}</span>
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
