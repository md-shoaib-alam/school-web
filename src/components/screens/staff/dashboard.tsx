"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { hasPermission } from "@/lib/permissions";
import {
  Bell,
  Calendar,
  Clock,
  School,
  Wallet,
  UserCheck,
  GraduationCap,
  Users,
  Layers,
  Tag,
  Percent,
  Banknote,
  FileCheck,
  UserSearch,
  History,
  Bus,
  Briefcase,
  ClipboardList,
  FileText,
  Trophy,
  IdCard,
  Award,
  ArrowRight,
  Zap,
  BarChart3,
  TicketCheck,
  CalendarDays,
  BookOpen,
  Search,
} from "lucide-react";

import { actionKeywords } from "@/components/layout/dashboard-keywords";

export function StaffDashboard() {
  const { push } = useRouter();
  const { currentUser, currentTenantSlug, currentTenantId, setCurrentScreen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
    const tid = currentTenantSlug || currentTenantId || currentUser?.tenantSlug || currentUser?.tenantId;
    if (tid) {
      push(`/${tid}/${screen}`);
    } else {
      push(`/${screen}`);
    }
  };

  const allQuickActions = [
    // --- Students & Teachers ---
    {
      label: "Students",
      icon: <GraduationCap className="size-5" />,
      screen: "students",
      permModule: "students",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      label: "Teachers",
      icon: <Users className="size-5" />,
      screen: "teachers",
      permModule: "teachers",
      color: "bg-blue-500 hover:bg-blue-600",
    },

    // --- Academic Management ---
    {
      label: "Academic Years",
      icon: <CalendarDays className="size-5" />,
      screen: "academic-years",
      permModule: "settings",
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      label: "Classes",
      icon: <School className="size-5" />,
      screen: "classes",
      permModule: "classes",
      color: "bg-violet-500 hover:bg-violet-600",
    },
    {
      label: "Subjects",
      icon: <BookOpen className="size-5" />,
      screen: "subjects",
      permModule: "subjects",
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      label: "Timetable",
      icon: <Clock className="size-5" />,
      screen: "timetable",
      permModule: "timetable",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      label: "Calendar",
      icon: <Calendar className="size-5" />,
      screen: "calendar",
      permModule: "calendar",
      color: "bg-rose-500 hover:bg-rose-600",
    },

    // --- Attendance Group ---
    {
      label: "Student Attendance",
      icon: <Users className="size-5" />,
      screen: "attendance",
      permModule: "attendance",
      color: "bg-sky-500 hover:bg-sky-600",
    },
    {
      label: "Teacher Attendance",
      icon: <GraduationCap className="size-5" />,
      screen: "teacher-attendance",
      permModule: "attendance",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Staff Attendance",
      icon: <Briefcase className="size-5" />,
      screen: "staff-attendance",
      permModule: "attendance",
      color: "bg-slate-500 hover:bg-slate-600",
    },

    // --- Exam Management ---
    {
      label: "Exams",
      icon: <ClipboardList className="size-5" />,
      screen: "exams",
      permModule: "exams",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      label: "Results Entry",
      icon: <FileText className="size-5" />,
      screen: "results-entry",
      permModule: "exams",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      label: "Published Results",
      icon: <Trophy className="size-5" />,
      screen: "published-results",
      permModule: "exams",
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      label: "Admit Cards",
      icon: <IdCard className="size-5" />,
      screen: "admit-cards",
      permModule: "exams",
      color: "bg-sky-600 hover:bg-sky-700",
    },
    {
      label: "Print Marksheet",
      icon: <Award className="size-5" />,
      screen: "print-marksheet",
      permModule: "exams",
      color: "bg-violet-600 hover:bg-violet-700",
    },

    // --- Promotions Group ---
    {
      label: "Promotions",
      icon: <ArrowRight className="size-5" />,
      screen: "promotions",
      permModule: "students",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      label: "Bulk Promote",
      icon: <Zap className="size-5" />,
      screen: "bulk-promote",
      permModule: "students",
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      label: "Graduated",
      icon: <GraduationCap className="size-5" />,
      screen: "graduated",
      permModule: "students",
      color: "bg-teal-500 hover:bg-teal-600",
    },

    // --- Leave Management ---
    {
      label: "Student Leaves",
      icon: <GraduationCap className="size-5" />,
      screen: "student-leaves",
      permModule: "attendance",
      color: "bg-violet-500 hover:bg-violet-600",
    },
    {
      label: "Teacher Leaves",
      icon: <Briefcase className="size-5" />,
      screen: "teacher-leaves",
      permModule: "attendance",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Staff Leaves",
      icon: <Users className="size-5" />,
      screen: "staff-leaves",
      permModule: "attendance",
      color: "bg-slate-500 hover:bg-slate-600",
    },

    // --- Certificates ---
    {
      label: "Certificates",
      icon: <Award className="size-5" />,
      screen: "certificates",
      permModule: "students",
      color: "bg-teal-600 hover:bg-teal-700",
    },

    // --- Fees Group ---
    {
      label: "Set Fees",
      icon: <Layers className="size-5" />,
      screen: "fees",
      permModule: "fees",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      label: "Fee Categories",
      icon: <Tag className="size-5" />,
      screen: "fee-categories",
      permModule: "fees",
      color: "bg-teal-500 hover:bg-teal-600",
    },
    {
      label: "Add Concession",
      icon: <Percent className="size-5" />,
      screen: "fee-concessions",
      permModule: "fees",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      label: "Make Payment",
      icon: <Banknote className="size-5" />,
      screen: "make-payment",
      permModule: "fees",
      color: "bg-emerald-600 hover:bg-emerald-700",
      keywords: ["invoice", "bill", "pay", "fees"],
    },
    {
      label: "Check Receipt",
      icon: <FileCheck className="size-5" />,
      screen: "check-receipt",
      permModule: "fees",
      color: "bg-teal-600 hover:bg-teal-700",
      keywords: ["invoice", "receipt", "bill", "payment check"],
    },
    {
      label: "Fee Status",
      icon: <UserSearch className="size-5" />,
      screen: "fee-status",
      permModule: "fees",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      label: "Check Payments",
      icon: <History className="size-5" />,
      screen: "check-payments",
      permModule: "fees",
      color: "bg-zinc-600 hover:bg-zinc-700",
    },
    {
      label: "Transport Fee",
      icon: <Bus className="size-5" />,
      screen: "transport-fee",
      permModule: "fees",
      color: "bg-amber-600 hover:bg-amber-700",
    },

    // --- School Expenses ---
    {
      label: "School Expenses",
      icon: <Wallet className="size-5" />,
      screen: "expenses",
      permModule: null,
      color: "bg-rose-500 hover:bg-rose-600",
      keywords: ["spending", "payment", "bill", "payout", "invoice"],
    },

    // --- Notices, Support & Reports ---
    {
      label: "Notices",
      icon: <Bell className="size-5" />,
      screen: "notices",
      permModule: "notices",
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      label: "Support Tickets",
      icon: <TicketCheck className="size-5" />,
      screen: "tickets",
      permModule: null,
      color: "bg-cyan-500 hover:bg-cyan-600",
    },
    {
      label: "Reports",
      icon: <BarChart3 className="size-5" />,
      screen: "reports",
      permModule: "reports",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
  ];

  const quickActions = allQuickActions.filter((action) => {
    if (!action.permModule) return true;
    return hasPermission(currentUser, action.permModule, "view");
  });

  const filteredQuickActions = quickActions.filter((action) => {
    const query = searchQuery.toLowerCase();
    const labelMatch = action.label.toLowerCase().includes(query);
    const kws = actionKeywords[action.screen] || [];
    const keywordsMatch = kws.some((kw) => kw.toLowerCase().includes(query));
    return labelMatch || keywordsMatch;
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Quick Actions
        </h3>
        
        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-zinc-800 dark:text-zinc-200 shadow-sm transition-all"
          />
        </div>
      </div>

      {filteredQuickActions.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          No matching quick actions found.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {filteredQuickActions.map((action) => (
            <button
              key={action.screen}
              type="button"
              onClick={() => navigateTo(action.screen)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all bg-white dark:bg-zinc-950 hover:border-transparent text-center group gap-3 cursor-pointer"
            >
              <div
                className={`p-3.5 rounded-xl text-white ${action.color} transition-transform group-hover:scale-110 shadow-md`}
              >
                {action.icon}
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
