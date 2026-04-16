"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, X, Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import { CalendarEvent, ALL_EVENT_TYPES, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "./types";
import { formatDisplayDate } from "./utils";

interface CalendarAgendaProps {
  selectedDate: string | null;
  setSelectedDate: (d: string | null) => void;
  loading: boolean;
  selectedDayEvents: CalendarEvent[];
  getTypeBadgeStyle: (type: string, color: string) => any;
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
  canEdit,
  canDelete,
  openEditDialog,
  openDeleteConfirm,
}: CalendarAgendaProps) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-3 h-full">
      <Card className="rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex-1 flex flex-col">
        <CardHeader className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              <CalendarDays className="h-3 w-3 text-emerald-600" />
              DAILY AGENDA
            </CardTitle>
            {selectedDate && (
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-slate-400 hover:text-slate-600" onClick={() => setSelectedDate(null)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
          {!selectedDate ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
              <CalendarDays className="h-10 w-10 text-slate-200 dark:text-slate-700 mb-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select a date to view agenda</p>
            </div>
          ) : loading ? (
            <div className="p-4 space-y-3 flex-1 overflow-hidden">
              {[1, 2].map((i) => <div key={i} className="h-12 w-full bg-slate-50 dark:bg-slate-800 rounded animate-pulse" />)}
            </div>
          ) : selectedDayEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 px-6 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">No events</p>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col divide-y divide-slate-50 dark:divide-slate-800">
              <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{formatDisplayDate(selectedDate).split(',')[0]}</p>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{formatDisplayDate(selectedDate).split(',').slice(1).join(',')}</h4>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {selectedDayEvents.map((ev) => (
                  <div key={ev.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] }} />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-none">{ev.title}</h5>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-current/10" style={getTypeBadgeStyle(ev.type, ev.color)}>
                            {EVENT_TYPE_LABELS[ev.type] || ev.type}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                            <Clock className="h-2.5 w-2.5" />
                            {ev.allDay ? "ALL DAY" : "SCHEDULED"}
                          </span>
                        </div>
                        {ev.location && (
                          <div className="mt-1.5 flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                            <MapPin className="h-2.5 w-2.5" />
                            {ev.location}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800" onClick={() => openEditDialog(ev)}>
                            <Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-emerald-600" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800" onClick={() => openDeleteConfirm(ev.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm mt-auto">
        <h4 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-50 dark:border-slate-800 pb-1">LEGEND</h4>
        <div className="grid grid-cols-2 gap-y-2 gap-x-2">
          {ALL_EVENT_TYPES.slice(0, 8).map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: EVENT_TYPE_COLORS[t] }} />
              <span className="uppercase tracking-tight truncate">{EVENT_TYPE_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
