import { CheckCircle2, Clock, XCircle, GraduationCap } from "lucide-react";
import { ClassOption } from "./types";

export const statusConfig: Record<
  string,
  { bg: string; icon: React.ReactNode; label: string }
> = {
  approved: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Approved",
  },
  pending: {
    bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    icon: <Clock className="h-3.5 w-3.5" />,
    label: "Pending",
  },
  rejected: {
    bg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: <XCircle className="h-3.5 w-3.5" />,
    label: "Rejected",
  },
  graduated: {
    bg: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800",
    icon: <GraduationCap className="h-3.5 w-3.5" />,
    label: "Graduated",
  },
};

export function getCurrentAcademicYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-based
  // Academic year runs Apr–Mar; if before Apr, use prev year
  return m >= 3 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export const getNextClass = (
  fromClassId: string,
  allClasses: ClassOption[],
): ClassOption | null => {
  const fromClass = allClasses.find((c) => c.id === fromClassId);
  if (!fromClass) return null;

  const fromGrade = parseInt(fromClass.grade) || 0;
  const nextClass = allClasses
    .filter((c) => parseInt(c.grade) === fromGrade + 1)
    .sort((a, b) => a.section.localeCompare(b.section))[0];

  return nextClass || null;
};

export const isLastClass = (
  classId: string,
  classes: ClassOption[],
): boolean => {
  const cls = classes.find((c) => c.id === classId);
  if (!cls) return false;
  const grade = parseInt(cls.grade) || 0;
  const maxGrade = Math.max(...classes.map((c) => parseInt(c.grade) || 0));
  return grade >= maxGrade;
};
