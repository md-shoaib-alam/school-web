"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, CalendarDays, MapPin } from "lucide-react";
import { CalendarEvent } from "./types";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "./constants";
import { formatDisplayDate, formatTimeRange } from "./utils";

interface AgendaPanelProps {
  selectedDate: string | null;
  selectedEvents: CalendarEvent[];
  availableTypes: string[];
}

export function AgendaPanel({ selectedDate, selectedEvents, availableTypes }: AgendaPanelProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <Card className="rounded-2xl border-gray-100/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 shadow-2xl shadow-gray-200/5 dark:shadow-none overflow-hidden h-fit">
        <CardHeader className="p-5 border-b border-gray-100/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-950/40">
          <CardTitle className="text-xs font-black flex items-center gap-2.5 text-gray-900 dark:text-gray-100 uppercase tracking-[0.15em]">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            Events Focus
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {!selectedDate || selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-10 text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center mb-6 transition-all hover:border-amber-500 hover:rotate-12 group">
                <CalendarDays className="h-8 w-8 text-gray-300 dark:text-gray-600 transition-colors group-hover:text-amber-500" />
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">
                {selectedDate ? "Day is Clear" : "View Schedule"}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 max-w-[200px] leading-relaxed">
                {selectedDate 
                  ? "There are no school events or deadlines scheduled for this date." 
                  : "Click on any calendar day to see specific school events and child activities."}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-5 text-left">
              <div className="px-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.25em]">
                    {formatDisplayDate(selectedDate).split(',')[0]}
                  </p>
                  <h4 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">
                    {formatDisplayDate(selectedDate).split(',').slice(1).join(',')}
                  </h4>
                </div>
                <Badge variant="secondary" className="rounded-lg font-black text-[10px] bg-amber-50 text-amber-600 border-none px-2.5 py-1">
                  {selectedEvents.length} ITEMS
                </Badge>
              </div>
              
              <ScrollArea className="max-h-[520px] pr-3 -mr-2 text-left">
                <div className="space-y-4">
                  {selectedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group relative bg-white dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-500"
                    >
                      <div
                        className="absolute left-0 top-5 bottom-5 w-1.5 rounded-r-full transition-all group-hover:scale-y-125"
                        style={{ backgroundColor: event.color || EVENT_TYPE_COLORS[event.type] }}
                      />
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-black text-gray-900 dark:text-gray-100 leading-snug group-hover:text-amber-600 transition-colors">
                            {event.title}
                          </h5>
                          <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
                            <Badge
                              className="text-[9px] font-black px-2.5 py-0.5 rounded-md border-none shadow-sm uppercase tracking-wider"
                              style={{
                                backgroundColor: `${event.color || EVENT_TYPE_COLORS[event.type] || "#6b7280"}20`,
                                color: event.color || EVENT_TYPE_COLORS[event.type] || "#6b7280",
                              }}
                            >
                              {EVENT_TYPE_LABELS[event.type] || event.type}
                            </Badge>
                            <span className="text-[10px] font-black text-gray-400 flex items-center gap-1.5 uppercase tracking-tighter">
                              <Clock className="h-3 w-3 text-amber-500" />
                              {formatTimeRange(event.date, event.endDate, event.allDay)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {event.description && (
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed font-medium">
                          {event.description}
                        </p>
                      )}

                      {event.location && (
                        <div className="mt-4 pt-3.5 border-t border-gray-50 dark:border-gray-800 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <MapPin className="h-3.5 w-3.5 text-amber-500 transition-transform group-hover:scale-125" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="rounded-2xl border-gray-100/50 dark:border-gray-800/50 bg-amber-500/5 p-5 backdrop-blur-sm border border-amber-500/10">
        <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Legend
        </h4>
        <div className="grid grid-cols-2 gap-3.5">
          {availableTypes.length > 0 ? (
            availableTypes.map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                <span className="w-2.5 h-2.5 rounded-full shadow-md border border-white dark:border-gray-900" style={{ backgroundColor: EVENT_TYPE_COLORS[t] }} />
                {EVENT_TYPE_LABELS[t]}
              </div>
            ))
          ) : (
            <p className="text-[10px] text-gray-400 italic font-bold">No active types found.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
