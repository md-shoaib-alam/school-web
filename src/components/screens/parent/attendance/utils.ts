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

export function getCalendarData(records: AttendanceRecord[]) {
  const today = new Date();
  const days: { date: number; day: string; status: string | null }[] = [];
  const statusMap = new Map<string, string>();
  records.forEach((r) => statusMap.set(r.date, r.status));

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    days.push({
      date: d.getDate(),
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
