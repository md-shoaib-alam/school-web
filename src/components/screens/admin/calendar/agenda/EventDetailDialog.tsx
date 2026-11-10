"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, MapPin, Users, AlignLeft } from "lucide-react";
import { CalendarEvent, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, TARGET_ROLE_LABELS } from "../types";

interface EventDetailDialogProps {
  event: CalendarEvent | null;
  onOpenChange: (open: boolean) => void;
  getTypeBadgeStyle: (type: string, color: string) => any;
  getFormattedDatePill: (date: string) => string;
}

export function EventDetailDialog({
  event,
  onOpenChange,
  getTypeBadgeStyle,
  getFormattedDatePill,
}: EventDetailDialogProps) {
  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92%] sm:w-full max-w-[425px] sm:max-w-[450px] rounded-2xl border  bg-card shadow-2xl p-0 overflow-hidden mx-auto">
        {event && (
          <>
            <div className="h-1.5" style={{ backgroundColor: event.color || EVENT_TYPE_COLORS[event.type] || "#3b82f6" }} />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span 
                  className="px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider shadow-sm bg-card" 
                  style={getTypeBadgeStyle(event.type, event.color)}
                >
                  {EVENT_TYPE_LABELS[event.type] || event.type}
                </span>
                {event.allDay && (
                  <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider border ">
                    All Day
                  </span>
                )}
              </div>

              <DialogTitle className="text-lg font-bold text-foreground tracking-tight leading-snug">
                {event.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Event information and visual timeline details
              </DialogDescription>

              <div className="mt-5 space-y-4">
                {/* Date Segment */}
                <div className="flex items-start gap-3.5 text-sm">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100/30 dark:border-blue-900/20">
                    <Calendar className="size-4" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Schedule Date</p>
                    <p className="text-foreground font-semibold mt-0.5 text-[13px]">
                      {getFormattedDatePill(event.date)}
                      {event.endDate && event.endDate !== event.date && (
                        <span className="text-muted-foreground font-medium"> to {getFormattedDatePill(event.endDate)}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Location Segment */}
                {event.location && (
                  <div className="flex items-start gap-3.5 text-sm">
                    <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 shrink-0 border border-violet-100/30 dark:border-violet-900/20">
                      <MapPin className="size-4" />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Location</p>
                      <p className="text-foreground font-semibold mt-0.5 text-[13px]">{event.location}</p>
                    </div>
                  </div>
                )}

                {/* Visibility Target Role Segment */}
                <div className="flex items-start gap-3.5 text-sm">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-100/30 dark:border-amber-900/20">
                    <Users className="size-4" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Event Audience</p>
                    <p className="text-foreground font-semibold mt-0.5 text-[13px]">
                      {TARGET_ROLE_LABELS[event.targetRole] || event.targetRole}
                    </p>
                  </div>
                </div>

                {/* Description Segment */}
                {event.description && (
                  <div className="flex items-start gap-3.5 text-sm pt-4 border-t  mt-4">
                    <div className="p-2 rounded-xl bg-muted text-muted-foreground shrink-0 border ">
                      <AlignLeft className="size-4" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Description</p>
                      <div className="text-foreground font-medium text-[13px] leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto no-scrollbar bg-muted border  p-3 rounded-xl">
                        {event.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
