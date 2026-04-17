import type { ClassInfo, TimetableSlot as BaseTimetableSlot } from "@/lib/types";

export type ViewMode = "grid" | "list" | "day";

export interface FormSlot {
  id: string;
  day: string;
  subjectId: string;
  teacherId: string;
  startTime: string;
  endTime: string;
}

export interface TimetableSlot extends BaseTimetableSlot {
  // Add any extra fields if needed
}

export interface AvailableSubject {
  id: string;
  name: string;
  code: string;
  className: string;
  teacherName?: string;
}

export interface AvailableTeacher {
  id: string;
  name: string;
  email: string;
}
