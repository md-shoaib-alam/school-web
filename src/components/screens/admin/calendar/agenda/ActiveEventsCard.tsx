"use client";

import { Button } from "@/components/ui/button";
import { X, CalendarCheck2, Clock, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarEvent, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "../types";

interface ActiveEventsCardProps {
  isViewingToday: boolean;
  selectedDate: string | null;
  onClearSelection: () => void;
  formattedDatePill: string;
  loading: boolean;
  activeEventsList: CalendarEvent[];
  onDetailClick: (ev: CalendarEvent) => void;
  getTypeBadgeStyle: (type: string, color: string) => any;
  canEdit: boolean;
  canDelete: boolean;
  openEditDialog: (ev: CalendarEvent) => void;
  openDeleteConfirm: (id: string) => void;
}

export function ActiveEventsCard({
  isViewingToday,
  selectedDate,
  onClearSelection,
  formattedDatePill,
  loading,
  activeEventsList,
  onDetailClick,
  getTypeBadgeStyle,
  canEdit,
  canDelete,
  openEditDialog,
  openDeleteConfirm,
}: ActiveEventsCardProps) {
  return (
    <div className="bg-card border border-border shadow-xs rounded-2xl p-4 sm:p-5 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            {isViewingToday ? "Today's Events" : "Selected Day"}
          </h3>
          {selectedDate && !isViewingToday && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-6 text-muted-foreground hover:text-rose-500 dark:hover:text-rose-400 ml-0.5 rounded-full cursor-pointer" 
              onClick={onClearSelection}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
        
        <div className="px-2.5 py-0.5 rounded-full bg-muted border border-border text-foreground text-xs font-semibold tracking-tight shadow-2xs shrink-0">
          {formattedDatePill}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar min-h-[120px] max-h-[260px] flex flex-col">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-xl bg-muted border border-border" />
          </div>
        ) : activeEventsList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 border border-border bg-muted/40 rounded-xl text-center">
            <CalendarCheck2 className="size-8 text-muted-foreground mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-muted-foreground">
              No events scheduled for this day
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeEventsList.map((ev) => (
              <div 
                key={ev.id} 
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
                
                <div className="flex items-start justify-between pl-3.5">
                  <div className="space-y-2 min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-foreground leading-snug tracking-tight group-hover:text-primary transition-colors duration-200 truncate pr-2">
                      {ev.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-muted-foreground">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wider border border-border/50 uppercase shadow-2xs bg-card" style={getTypeBadgeStyle(ev.type, ev.color)}>
                        {EVENT_TYPE_LABELS[ev.type] || ev.type}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground font-medium">
                        <Clock className="size-3 shrink-0 opacity-70" />
                        {ev.allDay ? "All Day" : "Scheduled"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 ml-2">
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="size-7 rounded-lg hover:bg-accent border border-transparent hover: dark:hover:border-white/[0.08]" onClick={(e) => { e.stopPropagation(); openEditDialog(ev); }}>
                        <Pencil className="size-3 text-muted-foreground hover:text-blue-600 dark:hover:text-rose-400" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="icon" className="size-7 rounded-lg hover:bg-accent border border-transparent hover: dark:hover:border-white/[0.08]" onClick={(e) => { e.stopPropagation(); openDeleteConfirm(ev.id); }}>
                        <Trash2 className="size-3 text-muted-foreground hover:text-rose-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
