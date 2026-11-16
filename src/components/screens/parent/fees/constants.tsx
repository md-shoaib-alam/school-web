import React from "react";
import { 
  Check, 
  Clock, 
  AlertCircle, 
  GraduationCap, 
  PenLine, 
  BookOpen, 
  Bus, 
  Globe, 
  Receipt,
  type LucideIcon 
} from "lucide-react";

export const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  paid: {
    bg: "bg-[#dcf5ea] dark:bg-emerald-950/40 text-[#0b8a5f] dark:text-emerald-400",
    text: "Paid",
    icon: <Check className="size-3.5 stroke-[2.5]" />,
  },
  pending: {
    bg: "bg-[#fdf0cf] dark:bg-amber-950/40 text-[#a16200] dark:text-amber-500",
    text: "Pending",
    icon: <Clock className="size-3.5 stroke-[2.5]" />,
  },
  overdue: {
    bg: "bg-[#fde4e6] dark:bg-red-950/40 text-[#c42f3b] dark:text-red-400",
    text: "Overdue",
    icon: <AlertCircle className="size-3.5 stroke-[2.5]" />,
  },
};

export function getFeeTypeIcon(typeStr: string): LucideIcon {
  const t = (typeStr || "").toLowerCase().trim();
  if (t.includes("tuition") || t.includes("course") || t.includes("academic")) return GraduationCap;
  if (t.includes("exam") || t.includes("test") || t.includes("assessment")) return PenLine;
  if (t.includes("library") || t.includes("book")) return BookOpen;
  if (t.includes("transport") || t.includes("bus")) return Bus;
  if (t.includes("sport") || t.includes("athletic") || t.includes("activity") || t.includes("game")) return Globe;
  return Receipt;
}
