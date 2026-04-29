"use client";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  LayoutGrid,
  List,
  School,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────

interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  className: string; // e.g. "Grade 5-A"
  classId: string;
  teacherName: string;
  teacherId: string;
}

// ─── Cookie helpers ───────────────────────────────────────────

const VIEW_COOKIE = "teacher_subjects_view";

function getViewCookie(): "grid" | "table" {
  if (typeof document === "undefined") return "grid";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${VIEW_COOKIE}=`));
  const val = match?.split("=")[1];
  return val === "table" ? "table" : "grid";
}

function setViewCookie(view: "grid" | "table") {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${VIEW_COOKIE}=${view}; expires=${expires.toUTCString()}; path=/`;
}

// ─── Colour palette per subject (deterministic by name) ──────

const PALETTES = [
  { bg: "bg-blue-50 dark:bg-blue-900/20", icon: "bg-blue-500/10 text-blue-500", badge: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { bg: "bg-violet-50 dark:bg-violet-900/20", icon: "bg-violet-500/10 text-violet-500", badge: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "bg-emerald-500/10 text-emerald-500", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { bg: "bg-amber-50 dark:bg-amber-900/20", icon: "bg-amber-500/10 text-amber-500", badge: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { bg: "bg-rose-50 dark:bg-rose-900/20", icon: "bg-rose-500/10 text-rose-500", badge: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  { bg: "bg-cyan-50 dark:bg-cyan-900/20", icon: "bg-cyan-500/10 text-cyan-500", badge: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
];

function palette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

// ─── Component ────────────────────────────────────────────────

export function TeacherSubjects() {
  const [view, setView] = useState<"grid" | "table">("grid");

  // Hydrate from cookie after mount
  useEffect(() => {
    setView(getViewCookie());
  }, []);

  const switchView = (v: "grid" | "table") => {
    setView(v);
    setViewCookie(v);
  };

  const { data: subjects = [], isLoading } = useQuery<SubjectInfo[]>({
    queryKey: ["teacher-subjects-mine-v2"],
    queryFn: () => api.get<SubjectInfo[]>("/subjects?mine=true"),
    staleTime: 10 * 60 * 1000, // 10 min — serve from cache, no refetch on every nav
    gcTime: 30 * 60 * 1000,    // keep in memory for 30 min
  });

  // ── Loading ──────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────

  if (subjects.length === 0) {
    return (
      <div className="space-y-6">
        <Header subjects={subjects} view={view} switchView={switchView} />
        <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
          <BookOpen className="h-16 w-16 text-gray-700 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-gray-300">No Subjects Assigned</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">
            You don't have any subjects assigned yet. Contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header subjects={subjects} view={view} switchView={switchView} />

      {view === "grid" ? (
        <GridView subjects={subjects} />
      ) : (
        <TableView subjects={subjects} />
      )}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────

function Header({
  subjects,
  view,
  switchView,
}: {
  subjects: SubjectInfo[];
  view: "grid" | "table";
  switchView: (v: "grid" | "table") => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          My Subjects
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {subjects.length} subject{subjects.length !== 1 ? "s" : ""} assigned
          to you across{" "}
          {new Set(subjects.map((s) => s.classId)).size} class
          {new Set(subjects.map((s) => s.classId)).size !== 1 ? "es" : ""}.
        </p>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/50 flex-shrink-0">
        <button
          onClick={() => switchView("grid")}
          className={`p-1.5 rounded-lg transition-all ${
            view === "grid"
              ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
          title="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => switchView("table")}
          className={`p-1.5 rounded-lg transition-all ${
            view === "table"
              ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
          title="Table view"
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Grid View ────────────────────────────────────────────────

function GridView({ subjects }: { subjects: SubjectInfo[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => {
        const p = palette(subject.name);
        return (
          <Card
            key={subject.id}
            className="rounded-xl shadow-sm border-0 hover:shadow-md transition-all group overflow-hidden"
          >
            <CardContent className="p-5">
              {/* Icon + name */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${p.icon}`}
                >
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                    {subject.code}
                  </p>
                </div>
              </div>

              {/* Class — prominent */}
              <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${p.bg} border border-current/10`}>
                <School className={`h-4 w-4 flex-shrink-0 ${p.icon.split(" ")[1]} dark:text-white/80`} />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/50 leading-none mb-0.5">
                    Class
                  </p>
                  <p className={`text-sm font-bold truncate ${p.icon.split(" ")[1]} dark:text-white`}>
                    {subject.className}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────

function TableView({ subjects }: { subjects: SubjectInfo[] }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-12" />
          <col className="w-[34%]" />
          <col className="w-[28%]" />
          <col className="w-[38%]" />
        </colgroup>
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
            <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-left py-3 pl-4 pr-2">
              #
            </th>
            <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-left py-3 px-3">
              Subject
            </th>
            <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-left py-3 px-3">
              Code
            </th>
            <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-left py-3 px-3">
              Class
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {subjects.map((subject, index) => {
            const p = palette(subject.name);
            return (
              <tr
                key={subject.id}
                className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
              >
                <td className="py-3 pl-4 pr-2 text-xs text-gray-400 font-mono">
                  {index + 1}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${p.icon}`}>
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {subject.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md inline-block">
                    {subject.code}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${p.bg} max-w-full`}>
                    <School className={`h-3.5 w-3.5 flex-shrink-0 ${p.icon.split(" ")[1]} dark:text-white/80`} />
                    <span className={`text-xs font-bold truncate ${p.icon.split(" ")[1]} dark:text-white`}>
                      {subject.className}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
