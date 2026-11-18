'use client';

import React from 'react';
import { Calendar as CalendarIcon, CalendarCheck, History as HistoryIcon } from 'lucide-react';
import { usePillSlider } from '@/lib/pill-slider';
import { cn } from '@/lib/utils';
import {
  useMyAttendance,
  MonthlyMetricCards,
  AttendanceCalendar,
  TodayAttendanceCard,
  AttendanceBreakdownCard,
  RecentAttendanceList,
  AttendanceHistoryDialog,
  TeacherQRScanModal,
} from './my-attendance/index';

type MobileView = 'today' | 'calendar' | 'history';

const MOBILE_TABS = [
  { id: 'today' as const, label: 'Today', icon: CalendarCheck },
  { id: 'calendar' as const, label: 'Calendar', icon: CalendarIcon },
  { id: 'history' as const, label: 'History', icon: HistoryIcon },
];

export function TeacherMyAttendance() {
  const {
    todayStr,
    currentRealYear,
    currentRealMonth,
    calYear,
    calMonth,
    selectedDate,
    setSelectedDate,
    currentMonthRecords,
    calendarRecords,
    currentMonthMetrics,
    todayRecord,
    recentRecords,
    isCheckingIn,
    viewAllModalOpen,
    setViewAllModalOpen,
    handlePrevMonth,
    handleNextMonth,
    handleGoToday,
    handleCheckInToggle,
    refetch,
  } = useMyAttendance();

  const [qrScanModalOpen, setQrScanModalOpen] = React.useState(false);
  const [mobileView, setMobileView] = React.useState<MobileView>('today');

  const tabContainerRef = React.useRef<HTMLDivElement>(null);
  const activePill = React.useRef<HTMLDivElement>(null);
  const hoverPill = React.useRef<HTMLDivElement>(null);
  const hovered = React.useRef<HTMLElement | null>(null);
  const place = usePillSlider(tabContainerRef);

  React.useLayoutEffect(() => {
    const box = tabContainerRef.current;
    if (!box || (box.offsetWidth === 0 && box.offsetHeight === 0)) return;
    const activeEl = box.querySelector<HTMLElement>("[data-tab][data-active='true']");
    place(activePill.current, activeEl);
    place(hoverPill.current, hovered.current && !hovered.current.dataset.active ? hovered.current : null);
  }, [mobileView, place]);

  React.useLayoutEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const box = tabContainerRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() => {
      if (box.offsetWidth === 0 && box.offsetHeight === 0) return;
      place(activePill.current, box.querySelector<HTMLElement>("[data-tab][data-active='true']"), true);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [place]);

  const showOnly = (...views: MobileView[]) =>
    views.includes(mobileView) ? '' : 'max-lg:hidden';

  return (
    <div className="space-y-5">
      {/* ── 1. Page Title & 2. Mobile Tabs Switcher (Sticky on Mobile) ── */}
      <div className="sticky -top-4 z-20 -mx-4 px-4 pt-2.5 pb-2.5 bg-background border-b border-border/40 space-y-2 lg:static lg:top-auto lg:z-auto lg:mx-0 lg:px-0 lg:pt-0 lg:pb-0 lg:bg-transparent lg:border-b-0 lg:space-y-0">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground text-center sm:text-left sm:text-2xl">
            My Attendance
          </h2>
          <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
            Track your daily attendance, check-in records, and monthly overview.
          </p>
        </div>

        {/* ── 2. Mobile Only: Today / Calendar / History Switcher ── */}
        <div
          ref={tabContainerRef}
          className="relative flex items-center p-1 rounded-lg border bg-muted/60 dark:bg-card shadow-xs select-none lg:hidden"
          onPointerOver={(event) => {
            const target = (event.target as HTMLElement).closest<HTMLElement>("[data-tab]");
            hovered.current = target ?? null;
            place(hoverPill.current, target && !target.dataset.active ? target : null);
          }}
          onPointerLeave={() => {
            hovered.current = null;
            place(hoverPill.current, null);
          }}
        >
          {/* Sliding Hover Pill */}
          <div
            ref={hoverPill}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-0 rounded-md bg-accent opacity-0 will-change-transform"
          />

          {/* Sliding Active Pill (Sidebar brand styling & spring animation) */}
          <div
            ref={activePill}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-0 rounded-md bg-brand opacity-0 shadow-xs will-change-transform"
          />

          {MOBILE_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = mobileView === id;
            return (
              <button
                key={id}
                type="button"
                data-tab
                data-active={isActive ? "true" : undefined}
                onClick={() => setMobileView(id)}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold whitespace-nowrap transition-colors duration-200 outline-none select-none",
                  isActive
                    ? "text-brand-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4 shrink-0 transition-transform", isActive ? "stroke-[2.2]" : "stroke-[1.8]")} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Five Current Month Summary Metric Cards ── */}
      <MonthlyMetricCards
        metrics={currentMonthMetrics}
        currentRealMonth={currentRealMonth}
        currentRealYear={currentRealYear}
        className={showOnly('calendar')}
      />

      {/* ── 4. Three-Column Main Dashboard Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Left Column: Interactive Month Calendar (5 cols) ── */}
        <AttendanceCalendar
          calYear={calYear}
          calMonth={calMonth}
          todayStr={todayStr}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onGoToday={handleGoToday}
          calendarRecords={calendarRecords}
          className={showOnly('calendar')}
        />

        {/* ── Middle Column: Today's Attendance & Breakdown (4 cols) ── */}
        <div className={cn('grid gap-3 lg:col-span-4 lg:block lg:space-y-4', showOnly('today'))}>
          <TodayAttendanceCard
            todayRecord={todayRecord}
            isCheckingIn={isCheckingIn}
            onCheckInToggle={handleCheckInToggle}
            onOpenQRScan={() => setQrScanModalOpen(true)}
            metrics={currentMonthMetrics}
          />

          <AttendanceBreakdownCard metrics={currentMonthMetrics} />
        </div>

        {/* ── Right Column: Recent Attendance Log (3 cols) ── */}
        <RecentAttendanceList
          recentRecords={recentRecords}
          currentRealMonth={currentRealMonth}
          currentRealYear={currentRealYear}
          onSelectDate={setSelectedDate}
          onOpenViewAll={() => setViewAllModalOpen(true)}
          className={showOnly('history')}
        />
      </div>

      {/* ── View All Attendance Modal ── */}
      <AttendanceHistoryDialog
        open={viewAllModalOpen}
        onOpenChange={setViewAllModalOpen}
        currentRealMonth={currentRealMonth}
        currentRealYear={currentRealYear}
        currentMonthRecords={currentMonthRecords}
      />

      {/* ── Camera & Code QR Scanner Modal ── */}
      <TeacherQRScanModal
        open={qrScanModalOpen}
        onOpenChange={setQrScanModalOpen}
        onScanSuccess={refetch}
        todayStr={todayStr}
      />
    </div>
  );
}
