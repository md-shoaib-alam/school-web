"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, FileText, X, Sparkles } from "lucide-react";

interface PublishedExam {
  id: string;
  name: string;
  examType: string;
  className: string;
  classSection: string;
  academicYear: string;
}

interface ResultPublishedBannerProps {
  /** studentId — only required when viewing a specific student's results (parent portal) */
  studentId?: string;
  /** Optional className override */
  className?: string;
}

const DISMISSED_KEY = "dismissed_result_banners";

function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function addDismissed(id: string) {
  const current = getDismissed();
  if (!current.includes(id)) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, id]));
  }
}

export function ResultPublishedBanner({ studentId, className: classNameProp }: ResultPublishedBannerProps) {
  const { push } = useRouter();
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [publishedExams, setPublishedExams] = useState<PublishedExam[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDismissed(getDismissed());
  }, []);

  useEffect(() => {
    async function fetchPublishedExams() {
      try {
        setLoading(true);
        const res = await apiFetch("/api/exams?status=completed&limit=10");
        if (!res.ok) return;
        const json = await res.json();
        const data: any[] = Array.isArray(json) ? json : (json.data || []);
        setPublishedExams(
          data.map((e: any) => ({
            id: e.id,
            name: e.name,
            examType: e.examType,
            className: e.className,
            classSection: e.classSection,
            academicYear: e.academicYear,
          }))
        );
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchPublishedExams();
  }, [studentId]);

  const visibleExams = publishedExams.filter((e) => !dismissed.includes(e.id));

  if (loading || visibleExams.length === 0) return null;

  const handleDismiss = (id: string) => {
    addDismissed(id);
    setDismissed((prev) => [...prev, id]);
  };

  const handleViewMarksheet = () => {
    if (slug) {
      const path = studentId
        ? `/${slug}/view-marksheet?studentId=${studentId}`
        : `/${slug}/view-marksheet`;
      push(path);
    }
  };

  // Deduplicate by examType cycle name (e.g. "Mid Term 2024-2025")
  const uniqueCycles = Array.from(
    new Map(visibleExams.map((e) => [`${e.examType}::${e.academicYear}`, e])).values()
  );

  return (
    <div className={`space-y-3 ${classNameProp ?? ""}`}>
      {uniqueCycles.map((exam) => (
        <div
          key={exam.id}
          className="relative overflow-hidden rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-cyan-50/40 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/10 shadow-sm"
        >
          {/* Animated shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_3s_ease-in-out_infinite]" />

          <div className="relative flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              {/* Icon */}
              <div className="shrink-0 size-9 rounded-xl bg-emerald-500 dark:bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                <Trophy className="size-4.5" />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 leading-tight">
                    Results Published!
                  </p>
                  <Badge className="text-[9px] font-bold tracking-wide px-1.5 py-0 border-none bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-none uppercase">
                    <Sparkles className="size-2.5 mr-0.5" />
                    New
                  </Badge>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium line-clamp-1">
                  {exam.name
                    ? exam.name.replace(/ - .+$/, "")
                    : `${exam.examType} · ${exam.academicYear}`}{" "}
                  results are now available. Click to view your marksheet.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleViewMarksheet}
                className="h-8 gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 border-none rounded-xl px-3 transition-all"
              >
                <FileText className="size-3.5" />
                View Marksheet
              </Button>
              <button
                onClick={() => handleDismiss(exam.id)}
                className="size-6 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
