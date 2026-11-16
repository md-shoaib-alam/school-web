import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock } from "lucide-react";

interface TicketHeaderProps {
  totalCount: number;
  openCount: number;
  onNewClick: () => void;
}

export function TicketHeader({ totalCount, openCount, onNewClick }: TicketHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            My Tickets
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCount} ticket{totalCount !== 1 ? "s" : ""}
            {openCount > 0 ? ` - ${openCount} active` : ""}
          </p>
        </div>
        {openCount > 0 && (
          <Badge className="bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25 rounded-lg gap-1.5 font-semibold text-xs">
            <Clock className="size-3" />
            {openCount} Active
          </Badge>
        )}
      </div>
      <Button
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl shadow-xs shadow-blue-500/20 hover:shadow-sm transition-all duration-200 cursor-pointer shrink-0 font-medium px-4 h-9.5"
        onClick={onNewClick}
      >
        <Plus className="size-4 mr-2" />
        New Ticket
      </Button>
    </div>
  );
}
