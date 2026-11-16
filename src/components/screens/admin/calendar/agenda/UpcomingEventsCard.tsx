"use client";

import { Button } from "@/components/ui/button";
import { RotateCw, CalendarDays, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarEvent, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "../types";

interface UpcomingEventsCardProps {
  loading: boolean;
  upcomingEventsList: CalendarEvent[];
  onDetailClick: (ev: CalendarEvent) => void;
  getFormattedDatePill: (date: string) => string;
  getTypeBadgeStyle: (type: string, color: string) => any;
}

export function UpcomingEventsCard({
  loading,
  upcomingEventsList,
  onDetailClick,
  getFormattedDatePill,
  getTypeBadgeStyle,
}: UpcomingEventsCardProps) {
  const queryClient = useQueryClient();
  return (
    <div className="bg-card border border-border shadow-xs rounded-2xl p-4 sm:p-5 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          Upcoming Events
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-7 text-muted-foreground hover:text-foreground rounded-full transition-transform duration-500 active:rotate-180 cursor-pointer"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["calendar-events"] })}
        >
          <RotateCw className="size-3.5 stroke-[2]" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar min-h-[160px] flex flex-col">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={`upcoming-skel-${i}`} className="h-14 w-full rounded-xl bg-muted border border-border" />
            ))}
          </div>
        ) : upcomingEventsList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 border border-border bg-muted/40 rounded-xl text-center">
            <CalendarDays className="size-7 text-muted-foreground mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-muted-foreground">
              No upcoming events scheduled
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingEventsList.map((ev) => (
              <button 
                key={ev.id} 
                type="button"
                onClick={() => onDetailClick(ev)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onDetailClick(ev);
                  }
                }}
                className="w-full text-left group relative p-3.5 bg-muted/40 hover:bg-muted border border-border/60 hover:border-border rounded-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-transform duration-300 group-hover:scale-y-125" style={{ backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] || "#3b82f6" }} />
                
                <div className="flex justify-between items-center pl-3.5">
                  <div className="space-y-1.5 min-w-0 flex-1 pr-3">
                    <h4 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 truncate">
                      {ev.title}
                    </h4>
                    <div className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                      <span className="font-medium text-foreground bg-muted border border-border px-2 py-0.5 rounded shrink-0 text-xs">
                        {getFormattedDatePill(ev.date).split(" ").slice(0,2).join(" ")}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1 truncate font-medium">
                          <MapPin className="size-3 shrink-0 opacity-70" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wider border border-border/50 uppercase shadow-2xs bg-card shrink-0" style={getTypeBadgeStyle(ev.type, ev.color)}>
                    {EVENT_TYPE_LABELS[ev.type] || ev.type}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
