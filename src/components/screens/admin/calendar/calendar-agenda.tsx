"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, CalendarCheck2, Clock, MapPin, Pencil, Trash2, X, RotateCw } from "lucide-react";
import { CalendarEvent, ALL_EVENT_TYPES, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "./types";
import { isToday, formatDateISO } from "./utils";

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
  allEvents = [],
  canEdit,
  canDelete,
  openEditDialog,
  openDeleteConfirm,
}: CalendarAgendaProps) {
  
  const todayStr = useMemo(() => formatDateISO(new Date()), []);

  // Determine date string for top view
  const displayDate = selectedDate || todayStr;
  const isViewingToday = displayDate === todayStr;

  // Compute the top events (fallback to today if nothing selected)
  const activeEventsList = useMemo(() => {
    if (selectedDate) return selectedDayEvents;
    return allEvents.filter(ev => ev.date === todayStr || (ev.endDate && ev.endDate >= todayStr && ev.date <= todayStr));
  }, [selectedDate, selectedDayEvents, allEvents, todayStr]);

  // Compute Upcoming Events (strictly starting tomorrow, or after displayDate)
  const upcomingEventsList = useMemo(() => {
    return allEvents
      .filter(ev => ev.date > todayStr)
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
      <div className="bg-white dark:bg-neutral-900/40 border border-slate-200/60 dark:border-white/[0.06] shadow-sm rounded-2xl p-5 sm:p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {isViewingToday ? "Today's Events" : "Selected Day"}
            </h3>
            {selectedDate && !isViewingToday && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 ml-0.5 rounded-full" 
                onClick={() => setSelectedDate(null)}
              >
                <X className="h-3.5 w-3.5" />
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
              <div className="h-14 w-full bg-slate-50/60 dark:bg-white/[0.02] rounded-xl animate-pulse border border-slate-100/50 dark:border-white/[0.03]" />
            </div>
          ) : activeEventsList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 border border-slate-100 dark:border-white/[0.04] bg-slate-50/30 dark:bg-white/[0.01] rounded-xl text-center">
              <CalendarCheck2 className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                No events scheduled for this day
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeEventsList.map((ev) => (
                <div 
                  key={ev.id} 
                  className="group relative p-3.5 bg-slate-50/30 dark:bg-white/[0.01] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04] rounded-xl transition-all duration-200"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl shrink-0" style={{ backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] || "#3b82f6" }} />
                  
                  <div className="flex items-start justify-between pl-1">
                    <div className="space-y-1.5 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                        {ev.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border" style={getTypeBadgeStyle(ev.type, ev.color)}>
                          {(EVENT_TYPE_LABELS[ev.type] || ev.type).toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {ev.allDay ? "All Day" : "Scheduled"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 ml-2">
                      {canEdit && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-slate-200/60 dark:hover:border-white/[0.08]" onClick={() => openEditDialog(ev)}>
                          <Pencil className="h-3 w-3 text-slate-500 hover:text-blue-600 dark:hover:text-rose-400" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-slate-200/60 dark:hover:border-white/[0.08]" onClick={() => openDeleteConfirm(ev.id)}>
                          <Trash2 className="h-3 w-3 text-slate-500 hover:text-rose-600" />
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
      <div className="bg-white dark:bg-neutral-900/40 border border-slate-200/60 dark:border-white/[0.06] shadow-sm rounded-2xl p-5 sm:p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Upcoming Events
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-blue-500 hover:text-blue-600 dark:text-blue-400 rounded-full transition-transform duration-500 active:rotate-180"
            onClick={() => window.location.reload()}
          >
            <RotateCw className="h-3.5 w-3.5 stroke-[2]" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar min-h-[160px] flex flex-col">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 w-full bg-slate-50/60 dark:bg-white/[0.02] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : upcomingEventsList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 border border-slate-100 dark:border-white/[0.04] bg-slate-50/30 dark:bg-white/[0.01] rounded-xl text-center">
              <CalendarDays className="h-7 w-7 text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                No upcoming events schedule
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingEventsList.map((ev) => (
                <div 
                  key={ev.id} 
                  className="group relative p-3 bg-slate-50/20 dark:bg-white/[0.01] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] border border-slate-100/70 dark:border-white/[0.03] rounded-xl transition-all duration-150"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl shrink-0" style={{ backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] || "#3b82f6" }} />
                  
                  <div className="flex justify-between items-center pl-1.5">
                    <div className="space-y-1 min-w-0 flex-1 pr-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug truncate">
                        {ev.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                        <span className="font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.03] px-1 rounded shrink-0">
                          {getFormattedDatePill(ev.date).split(" ").slice(0,2).join(" ")}
                        </span>
                        {ev.location && (
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            {ev.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide border uppercase shadow-sm shrink-0" style={getTypeBadgeStyle(ev.type, ev.color)}>
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
      <div className="bg-white dark:bg-neutral-900/40 border border-slate-200/60 dark:border-white/[0.06] shadow-sm rounded-2xl p-4 sm:p-5 shrink-0 mt-auto">
        <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-white/[0.04] pb-1.5">
          Event Categories
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
          {ALL_EVENT_TYPES.slice(0, 8).map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: EVENT_TYPE_COLORS[t] }} />
              <span className="truncate tracking-tight text-[11px]">{EVENT_TYPE_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


