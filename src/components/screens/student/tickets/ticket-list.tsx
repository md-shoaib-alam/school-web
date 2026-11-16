import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Tag, Clock, Eye, Ticket } from "lucide-react";
import {
  TicketItem,
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  getCategoryLabel,
  formatDate,
} from "./types";

interface TicketListProps {
  tickets: TicketItem[];
  onOpenDetail: (ticketId: string) => void;
}

export function TicketList({ tickets, onOpenDetail }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardContent className="py-16 text-center">
          <Ticket className="size-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No tickets yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Submit a ticket if you need help from the school
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Card
          key={ticket.id}
          className="rounded-2xl border border-border bg-card shadow-xs hover:border-blue-500/30 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden"
          onClick={() => onOpenDetail(ticket.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {ticket.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold rounded-lg px-2 py-0.5 ${STATUS_COLORS[ticket.status] || ""}`}
                  >
                    {STATUS_LABELS[ticket.status]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold rounded-lg px-2 py-0.5 ${PRIORITY_COLORS[ticket.priority] || ""}`}
                  >
                    {PRIORITY_LABELS[ticket.priority]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium rounded-lg px-2 py-0.5 bg-muted text-muted-foreground"
                  >
                    {getCategoryLabel(ticket.category)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-3" />
                      {ticket._count.messages} message
                      {ticket._count.messages !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="size-3" />
                      {getCategoryLabel(ticket.category)}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 shrink-0 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(ticket.id);
                }}
              >
                <Eye className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
