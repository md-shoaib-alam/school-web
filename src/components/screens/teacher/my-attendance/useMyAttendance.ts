import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAppStore } from '@/store/use-app-store';
import { AttendanceRecordItem } from './types';
import { formatLocalDate, calculateAttendanceMetrics } from './utils';

export function useMyAttendance() {
  const { currentUser } = useAppStore();

  // Anchored strictly to real current month
  const now = useMemo(() => new Date(), []);
  const currentRealYear = now.getFullYear();
  const currentRealMonth = now.getMonth(); // 0-indexed
  const currentMonthStr = useMemo(() => {
    return `${currentRealYear}-${String(currentRealMonth + 1).padStart(2, '0')}`;
  }, [currentRealYear, currentRealMonth]);
  const daysInCurrentMonth = useMemo(() => {
    return new Date(currentRealYear, currentRealMonth + 1, 0).getDate();
  }, [currentRealYear, currentRealMonth]);

  // Real local today string: YYYY-MM-DD
  const todayStr = useMemo(() => formatLocalDate(now), [now]);

  // Calendar navigation state (defaults to current month)
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => formatLocalDate(new Date()));

  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const calMonthStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;

  // Current month's real records (for the 5 summary stat cards)
  const [currentMonthRecords, setCurrentMonthRecords] = useState<AttendanceRecordItem[]>([]);
  // Calendar's records (matches currentMonthRecords when viewing current month)
  const [calendarRecords, setCalendarRecords] = useState<AttendanceRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);

  // Fetch Current Month Attendance strictly for the summary cards
  const fetchCurrentMonthAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const userId = currentUser?.id;
      const res = await apiFetch(
        `/api/staff-attendance?month=${currentMonthStr}${userId ? `&userId=${userId}` : ''}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCurrentMonthRecords(data);
          return;
        }
      }
      setCurrentMonthRecords([]);
    } catch {
      setCurrentMonthRecords([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentMonthStr]);

  // Initial load & whenever currentUser or currentMonth changes
  useEffect(() => {
    fetchCurrentMonthAttendance();
  }, [fetchCurrentMonthAttendance]);

  // Auto-refresh when tab/window regains focus or periodically (real-time sync)
  useEffect(() => {
    const handleFocus = () => {
      fetchCurrentMonthAttendance();
    };
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(fetchCurrentMonthAttendance, 10000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchCurrentMonthAttendance]);

  // Active calendar records (always immediately reflects currentMonthRecords when viewing current month)
  const activeCalendarRecords = useMemo(() => {
    return calMonthStr === currentMonthStr ? currentMonthRecords : calendarRecords;
  }, [calMonthStr, currentMonthStr, currentMonthRecords, calendarRecords]);

  // Fetch Calendar Month Attendance only when browsing different calendar months
  useEffect(() => {
    if (calMonthStr === currentMonthStr) {
      setLoading(false);
      return;
    }
    let isCancelled = false;
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const userId = currentUser?.id;
        const res = await apiFetch(
          `/api/staff-attendance?month=${calMonthStr}${userId ? `&userId=${userId}` : ''}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && !isCancelled) {
            setCalendarRecords(data);
            return;
          }
        }
        if (!isCancelled) setCalendarRecords([]);
      } catch {
        if (!isCancelled) setCalendarRecords([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchCalendar();
    return () => {
      isCancelled = true;
    };
  }, [currentUser?.id, calMonthStr, currentMonthStr]);

  // Month navigation for interactive calendar
  const handlePrevMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCalendarDate(today);
    setSelectedDate(formatLocalDate(today));
  };

  // Self check-in / check-out action passing local date
  const handleCheckInToggle = async () => {
    setIsCheckingIn(true);
    try {
      const res = await apiFetch('/api/staff-attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: todayStr }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.action === 'check_in') {
          toast.success('Checked in successfully!');
        } else if (data.action === 'check_out') {
          toast.success('Checked out successfully!');
        }
        await fetchCurrentMonthAttendance();
      } else {
        toast.error(data.message || data.error || 'Failed to record attendance');
      }
    } catch {
      toast.error('Failed to record attendance');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Metrics strictly for Current Month (the 5 cards)
  const currentMonthMetrics = useMemo(() => {
    return calculateAttendanceMetrics(currentMonthRecords, daysInCurrentMonth);
  }, [currentMonthRecords, daysInCurrentMonth]);

  // Today's record (matched by local date!)
  const todayRecord = useMemo(() => {
    return currentMonthRecords.find((r) => r.date === todayStr) || null;
  }, [currentMonthRecords, todayStr]);

  // Recent attendance list (only real records for current month, sorted desc)
  const recentRecords = useMemo(() => {
    return [...currentMonthRecords]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }, [currentMonthRecords]);

  return {
    currentUser,
    todayStr,
    currentRealYear,
    currentRealMonth,
    calendarDate,
    calYear,
    calMonth,
    selectedDate,
    setSelectedDate,
    currentMonthRecords,
    calendarRecords: activeCalendarRecords,
    currentMonthMetrics,
    todayRecord,
    recentRecords,
    loading,
    isCheckingIn,
    viewAllModalOpen,
    setViewAllModalOpen,
    handlePrevMonth,
    handleNextMonth,
    handleGoToday,
    handleCheckInToggle,
  };
}
