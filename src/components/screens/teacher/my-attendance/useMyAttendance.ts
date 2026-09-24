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
  const fetchCurrentMonthAttendance = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const userId = currentUser?.id;
      const res = await apiFetch(
        `/api/staff-attendance?month=${currentMonthStr}${userId ? `&userId=${encodeURIComponent(userId)}` : ''}&_t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const userRecords = userId ? data.filter((r: any) => r.userId === userId) : data;
          setCurrentMonthRecords(userRecords);
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
      fetchCurrentMonthAttendance(true);
    };
    const handleUpdate = () => {
      fetchCurrentMonthAttendance(true);
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('schoolsaas_attendance_updated', handleUpdate);
    // Real-time silent sync every 5 seconds
    const interval = setInterval(() => {
      fetchCurrentMonthAttendance(true);
    }, 5000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('schoolsaas_attendance_updated', handleUpdate);
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
          `/api/staff-attendance?month=${calMonthStr}${userId ? `&userId=${encodeURIComponent(userId)}` : ''}&_t=${Date.now()}`,
          { cache: 'no-store' }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && !isCancelled) {
            const userRecords = userId ? data.filter((r: any) => r.userId === userId) : data;
            setCalendarRecords(userRecords);
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

  // Today's record (matched by local date and currentUser id)
  const todayRecord = useMemo(() => {
    const userId = currentUser?.id;
    return (
      currentMonthRecords.find(
        (r) => r.date === todayStr && (!userId || r.userId === userId)
      ) || null
    );
  }, [currentMonthRecords, todayStr, currentUser?.id]);

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
    refetch: fetchCurrentMonthAttendance,
  };
}
