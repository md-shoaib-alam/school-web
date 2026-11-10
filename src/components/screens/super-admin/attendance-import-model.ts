export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  classId: string;
  email?: string;
}

export interface ParsedRecord {
  id: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  rollNumber?: string;
  className?: string;
  date: string;
  status: string;
  rawStatus?: string;
  remarks?: string;
  isValid: boolean;
  errors: string[];
}

// Safely parse a date string formatted as "YYYY-MM-DD" into a local Date object.
// This prevents timezone-offset shift issues which usually occur with "new Date(dateString)".
export const parseDateString = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return undefined;
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
  return new Date(year, month - 1, day);
};

// Safely format a local Date object into a "YYYY-MM-DD" date string.
export const formatDateToString = (date?: Date): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
