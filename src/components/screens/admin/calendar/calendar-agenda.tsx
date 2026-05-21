"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, CalendarCheck2, Clock, MapPin, Pencil, Trash2, X, RotateCw, Calendar, Users, AlignLeft } from "lucide-react";
import { CalendarEvent, ALL_EVENT_TYPES, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, TARGET_ROLE_LABELS } from "./types";
import { isToday, formatDateISO } from "./utils";

const EMPTY_EVENTS: CalendarEvent[] = [];

interface CalendarAgendaProps {
  selectedDate: string | null;
  setSelectedDate: (d: string | null) => void;
  loading: boolean;
  selectedDayEvents: CalendarEvent[];
  getTypeBadgeStyle: (type: string, color: string) => any;
  allEvents: CalendarEvent[];
  canEdit: boolean;
  canDelete: boolean;
  openEditDialog: (ev: CalendarEvent) => void;
  openDeleteConfirm: (id: string) => void;
}

export function CalendarAgenda({
  selectedDate,
  setSelectedDate,
  loading,
  selectedDayEvents,
  getTypeBadgeStyle,
  allEvents = EMPTY_EVENTS,
  canEdit,
  canDelete,
  openEditDialog,
  openDeleteConfirm,
}: CalendarAgendaProps) {
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  
  const todayStr = useMemo(() => formatDateISO(new Date()), []);

  // Determine date string for top view
  const displayDate = selectedDate || todayStr;
  const isViewingToday = displayDate === todayStr;

  // Compute the top events (fallback to today if nothing selected)
  const activeEventsList = useMemo(() => {
    if (selectedDate) return selectedDayEvents;
    return allEvents.filter(ev => ev.date === todayStr || (ev.endDate && ev.endDate >= todayStr && ev.date <= todayStr));
  }, [selectedDate, selectedDayEvents, allEvents, todayStr]);

  // Compute Upcoming Events (strictly tomorrow up to 30 days in the future)
  const upcomingEventsList = useMemo(() => {
    const futureLimit = new Date();
    futureLimit.setDate(futureLimit.getDate() + 30);
    const maxDateStr = formatDateISO(futureLimit);

    return allEvents
      .filter(ev => ev.date > todayStr && ev.date <= maxDateStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4); // Limit to 4 upcoming items for compact display
  }, [allEvents, todayStr]);

  // Formats date to "13 May 2026"
  const getFormattedDatePill = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="lg:col-span-4 flex flex-col gap-5 h-full">
      {/* 1. Top Card: Today's / Selected Events */}
      <div className="bg-white dark:bg-neutral-900/40 border border-zinc-200/60 dark:border-white/[0.06] shadow-sm rounded-2xl p-5 sm:p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">
              {isViewingToday ? "Today's Events" : "Selected Day"}
            </h3>
            {selectedDate && !isViewingToday && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-6 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 ml-0.5 rounded-full" 
                onClick={() => setSelectedDate(null)}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
          
          <div className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold tracking-tight border border-blue-100/50 dark:border-blue-900/20 shadow-sm shadow-blue-500/5 shrink-0">
            {getFormattedDatePill(displayDate)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar min-h-[120px] max-h-[260px] flex flex-col">
          {loading ? (
            <div className="space-y-3">
              <div className="h-14 w-full bg-zinc-50/60 dark:bg-white/[0.02] rounded-xl animate-pulse border border-zinc-100/50 dark:border-white/[0.03]" />
            </div>
          ) : activeEventsList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 border border-zinc-100 dark:border-white/[0.04] bg-zinc-50/30 dark:bg-white/[0.01] rounded-xl text-center">
              <CalendarCheck2 className="size-8 text-zinc-300 dark:text-zinc-600 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                No events scheduled for this day
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeEventsList.map((ev) => (
                <div 
                  key={ev.id} 
                  onClick={() => setDetailEvent(ev)}
                  className="group relative p-3.5 bg-zinc-50/30 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] border border-zinc-100 dark:border-white/[0.05] hover:border-zinc-200/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] rounded-2xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-transform duration-300 group-hover:scale-y-125" style={{ backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] || "#3b82f6" }} />
                  
                  <div className="flex items-start justify-between pl-3.5">
                    <div className="space-y-2 min-w-0 flex-1">
                      <h4 className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 leading-snug tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate pr-2">
                        {ev.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black tracking-wider border uppercase shadow-sm bg-white/80 dark:bg-neutral-900/50" style={getTypeBadgeStyle(ev.type, ev.color)}>
                          {EVENT_TYPE_LABELS[ev.type] || ev.type}
                        </span>
                        <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 font-semibold">
                          <Clock className="size-3 shrink-0 opacity-70" />
                          {ev.allDay ? "All Day" : "Scheduled"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 ml-2">
                      {canEdit && (
                        <Button variant="ghost" size="icon" className="size-7 rounded-lg hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-zinc-200/60 dark:hover:border-white/[0.08]" onClick={(e) => { e.stopPropagation(); openEditDialog(ev); }}>
                          <Pencil className="size-3 text-zinc-500 hover:text-blue-600 dark:hover:text-rose-400" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" className="size-7 rounded-lg hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-zinc-200/60 dark:hover:border-white/[0.08]" onClick={(e) => { e.stopPropagation(); openDeleteConfirm(ev.id); }}>
                          <Trash2 className="size-3 text-zinc-500 hover:text-rose-600" />
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

      {/* 2. Bottom Card: Upcoming Events */}
      <div className="bg-white dark:bg-neutral-900/40 border border-zinc-200/60 dark:border-white/[0.06] shadow-sm rounded-2xl p-5 sm:p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">
            Upcoming Events
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-7 text-blue-500 hover:text-blue-600 dark:text-blue-400 rounded-full transition-transform duration-500 active:rotate-180"
            onClick={() => window.location.reload()}
          >
            <RotateCw className="size-3.5 stroke-[2]" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar min-h-[160px] flex flex-col">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 w-full bg-zinc-50/60 dark:bg-white/[0.02] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : upcomingEventsList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 border border-zinc-100 dark:border-white/[0.04] bg-zinc-50/30 dark:bg-white/[0.01] rounded-xl text-center">
              <CalendarDays className="size-7 text-zinc-300 dark:text-zinc-600 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                No upcoming events schedule
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingEventsList.map((ev) => (
                <div 
                  key={ev.id} 
                  onClick={() => setDetailEvent(ev)}
                  className="group relative p-3.5 bg-zinc-50/30 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] border border-zinc-100 dark:border-white/[0.05] hover:border-zinc-200/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] rounded-2xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-transform duration-300 group-hover:scale-y-125" style={{ backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] || "#3b82f6" }} />
                  
                  <div className="flex justify-between items-center pl-3.5">
                    <div className="space-y-1.5 min-w-0 flex-1 pr-3">
                      <h4 className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                        {ev.title}
                      </h4>
                      <div className="flex items-center gap-2.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                        <span className="font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200/50 dark:border-white/[0.02] px-1.5 py-0.5 rounded shrink-0 text-[9px]">
                          {getFormattedDatePill(ev.date).split(" ").slice(0,2).join(" ")}
                        </span>
                        {ev.location && (
                          <span className="flex items-center gap-1 truncate font-semibold">
                            <MapPin className="size-2.5 shrink-0 opacity-70" />
                            {ev.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black tracking-wider border uppercase shadow-sm bg-white/80 dark:bg-neutral-900/50 shrink-0" style={getTypeBadgeStyle(ev.type, ev.color)}>
                      {EVENT_TYPE_LABELS[ev.type] || ev.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Categories Legend */}
      <div className="bg-white dark:bg-neutral-900/40 border border-zinc-200/60 dark:border-white/[0.06] shadow-sm rounded-2xl p-4 sm:p-5 shrink-0 mt-auto">
        <h4 className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 border-b border-zinc-100 dark:border-white/[0.04] pb-1.5">
          Event Categories
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
          {ALL_EVENT_TYPES.slice(0, 8).map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <span className="size-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: EVENT_TYPE_COLORS[t] }} />
              <span className="truncate tracking-tight text-[11px]">{EVENT_TYPE_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Event Detail Dialog */}
      <Dialog open={!!detailEvent} onOpenChange={(open) => !open && setDetailEvent(null)}>
        <DialogContent className="max-w-[425px] sm:max-w-[450px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl p-0 overflow-hidden">
          {detailEvent && (
            <>
              <div className="h-1.5" style={{ backgroundColor: detailEvent.color || EVENT_TYPE_COLORS[detailEvent.type] || "#3b82f6" }} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span 
                    className="px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider shadow-sm bg-white dark:bg-zinc-900" 
                    style={getTypeBadgeStyle(detailEvent.type, detailEvent.color)}
                  >
                    {EVENT_TYPE_LABELS[detailEvent.type] || detailEvent.type}
                  </span>
                  {detailEvent.allDay && (
                    <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 dark:bg-white/[0.05] px-2 py-0.5 rounded uppercase tracking-wider border border-zinc-200/40 dark:border-white/[0.05]">
                      All Day
                    </span>
                  )}
                </div>

                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-snug">
                  {detailEvent.title}
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
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Schedule Date</p>
                      <p className="text-zinc-700 dark:text-zinc-300 font-semibold mt-0.5 text-[13px]">
                        {getFormattedDatePill(detailEvent.date)}
                        {detailEvent.endDate && detailEvent.endDate !== detailEvent.date && (
                          <span className="text-zinc-400 font-medium"> to {getFormattedDatePill(detailEvent.endDate)}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Location Segment */}
                  {detailEvent.location && (
                    <div className="flex items-start gap-3.5 text-sm">
                      <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 shrink-0 border border-violet-100/30 dark:border-violet-900/20">
                        <MapPin className="size-4" />
                      </div>
                      <div className="pt-0.5">
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Location</p>
                        <p className="text-zinc-700 dark:text-zinc-300 font-semibold mt-0.5 text-[13px]">{detailEvent.location}</p>
                      </div>
                    </div>
                  )}

                  {/* Visibility Target Role Segment */}
                  <div className="flex items-start gap-3.5 text-sm">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-100/30 dark:border-amber-900/20">
                      <Users className="size-4" />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Event Audience</p>
                      <p className="text-zinc-700 dark:text-zinc-300 font-semibold mt-0.5 text-[13px]">
                        {TARGET_ROLE_LABELS[detailEvent.targetRole] || detailEvent.targetRole}
                      </p>
                    </div>
                  </div>

                  {/* Description Segment */}
                  {detailEvent.description && (
                    <div className="flex items-start gap-3.5 text-sm pt-4 border-t border-zinc-100 dark:border-white/[0.04] mt-4">
                      <div className="p-2 rounded-xl bg-zinc-50 dark:bg-white/[0.02] text-zinc-500 shrink-0 border border-zinc-100/50 dark:border-white/[0.02]">
                        <AlignLeft className="size-4" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Description</p>
                        <div className="text-zinc-600 dark:text-zinc-400 font-medium text-[13px] leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto no-scrollbar bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/[0.02] p-3 rounded-xl">
                          {detailEvent.description}
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
    </div>
  );
}


