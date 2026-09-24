'use client';

import React from 'react';
import {
  useMyAttendance,
  AttendanceHeroBanner,
  MonthlyMetricCards,
  AttendanceCalendar,
  TodayAttendanceCard,
  AttendanceBreakdownCard,
  RecentAttendanceList,
  AttendanceHistoryDialog,
  TeacherQRScanModal,
} from './my-attendance/index';

export function TeacherMyAttendance() {
  const {
    currentUser,
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

  return (
    <div className="space-y-5">
      {/* ── 1. Hero Profile Banner (Real User Data Only) ── */}
      <AttendanceHeroBanner
        currentUser={currentUser}
        todayRecord={todayRecord}
      />

      {/* ── 2. Five Current Month Summary Metric Cards (Current Month Real Data Only) ── */}
      <MonthlyMetricCards
        metrics={currentMonthMetrics}
        currentRealMonth={currentRealMonth}
        currentRealYear={currentRealYear}
      />

      {/* ── 3. Three-Column Main Dashboard Layout ── */}
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
        />

        {/* ── Middle Column: Today's Attendance & Breakdown (4 cols) ── */}
        <div className="lg:col-span-4 space-y-4">
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
export const MyAttendanceScreen = TeacherMyAttendance;
