import { AttendanceRecord } from "@/lib/types";

export function getAttendanceStats(records: AttendanceRecord[]) {
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const percentage =
    total > 0 ? Math.round(((present + late) / total) * 100) : 0;
  return { total, present, absent, late, percentage };
}

export function getMonthlyData(records: AttendanceRecord[]) {
  const now = new Date();
  const months: {
    month: string;
    present: number;
    absent: number;
    late: number;
  }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString("en-US", { month: "short" });
    const monthRecords = records.filter((r) => {
      const rd = new Date(r.date);
      return (
        rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
      );
    });
    months.push({
      month: monthLabel,
      present: monthRecords.filter((r) => r.status === "present").length,
      absent: monthRecords.filter((r) => r.status === "absent").length,
      late: monthRecords.filter((r) => r.status === "late").length,
    });
  }
  return months;
}

export function getCalendarData(records: AttendanceRecord[], baseDate = new Date()) {
  const days: { date: number | null; day: string | null; status: string | null }[] = [];
  const statusMap = new Map<string, string>();
  records.forEach((r) => statusMap.set(r.date, r.status));

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const numDays = lastDay.getDate();
  const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ...

  // Padding for start of month (assuming Monday start for UI, but let's stick to Sunday start for standard grid)
  for (let i = 0; i < startDay; i++) {
    days.push({ date: null, day: null, status: null });
  }

  for (let i = 1; i <= numDays; i++) {
    const d = new Date(year, month, i);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayOfWeek = d.getDay();
    days.push({
      date: i,
      day: d.toLocaleString("en-US", { weekday: "narrow" }),
      status:
        dayOfWeek === 0 || dayOfWeek === 6
          ? null
          : statusMap.get(dateStr) || null,
    });
  }
  return days;
}

export function getCalendarCellColor(status: string | null) {
  if (!status)
    return "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500";
  switch (status) {
    case "present":
      return "bg-emerald-500 text-white";
    case "absent":
      return "bg-red-500 text-white";
    case "late":
      return "bg-amber-500 text-white";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500";
  }
}
