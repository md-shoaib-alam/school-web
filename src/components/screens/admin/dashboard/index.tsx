"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useQuery } from "@tanstack/react-query";
import { useTenantDetail } from "@/lib/graphql/hooks/platform.hooks";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { differenceInDays } from "date-fns";
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
  Heart,
  UserPlus,
  Shield,
  Crown,
  Settings,
} from "lucide-react";

import { ComprehensiveDashboard } from "./ComprehensiveDashboard";
import { MinimalDashboard } from "./MinimalDashboard";

function getDaysRemaining(endDate?: string | null) {
  if (!endDate) return null;
  const expiry = new Date(endDate);
  const now = new Date();
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return differenceInDays(expiry, now);
}

export function AdminDashboard() {
  const { push } = useRouter();
  const [recharts, setRecharts] = useState<typeof import("recharts") | null>(null);
  const [layoutPref, setLayoutPref] = useState<string>("comprehensive");
  const [searchQuery, setSearchQuery] = useState("");

  const { 
    currentUser, 
    currentTenantId, 
    currentTenantName, 
    currentTenantSlug, 
    currentTenantLogo,
    setCurrentScreen 
  } = useAppStore();

  useEffect(() => {
    import("recharts").then(setRecharts);
    if (typeof window !== "undefined") {
      const pref = localStorage.getItem("schoolsaas_dashboard_layout_preference");
      if (pref) setLayoutPref(pref);
    }

    const handlePrefChange = (e: any) => {
      if (e.detail) setLayoutPref(e.detail);
    };

    window.addEventListener("schoolsaas_dashboard_layout_pref_changed", handlePrefChange);
    return () => {
      window.removeEventListener("schoolsaas_dashboard_layout_pref_changed", handlePrefChange);
    };
  }, []);

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
    const tid = currentTenantSlug || currentTenantId || currentUser?.tenantSlug || currentUser?.tenantId;
    if (tid) {
      push(`/${tid}/${screen}`);
    } else {
      push(`/${screen}`);
    }
  };

  const tenantId = currentTenantId || currentUser?.tenantId;

  // Optimized: Single network request for everything! (Disabled if layout preference is minimal)
  const { data: dashboardData, isPending, fetchStatus, error } = useQuery({
    queryKey: ['admin-dashboard', tenantId],
    queryFn: () => api.get('/dashboard'),
    staleTime: 60 * 1000, // Cache for 1 minute
    enabled: !!tenantId && layoutPref === "comprehensive",
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  // In React Query v5, when enabled:false, isPending=true but fetchStatus='idle'
  const isLoading = isPending && fetchStatus === 'fetching';

  useEffect(() => {
    if (error) {
      toast.error("Dashboard data failed to load", { description: (error as any).message });
    }
  }, [error]);

  // Subscription Check
  const { data: tenantDetail } = useTenantDetail(tenantId || "");
  const tenant = tenantDetail?.tenant;
  const daysRemaining = getDaysRemaining(tenant?.endDate);
  const isExpiringSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3;
  const isExpired = daysRemaining !== null && daysRemaining < 0;

  const allAdminQuickActions = [
    // --- People Management ---
    {
      label: "Students",
      icon: <GraduationCap className="size-5" />,
      screen: "students",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      label: "Teachers",
      icon: <Users className="size-5" />,
      screen: "teachers",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Parents",
      icon: <Heart className="size-5" />,
      screen: "parents",
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      label: "Staff / Employees",
      icon: <UserPlus className="size-5" />,
      screen: "staff",
      color: "bg-orange-500 hover:bg-orange-600",
    },

    // --- Academic Management ---
    {
      label: "Academic Years",
      icon: <CalendarDays className="size-5" />,
      screen: "academic-years",
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      label: "Classes",
      icon: <School className="size-5" />,
      screen: "classes",
      color: "bg-violet-500 hover:bg-violet-600",
    },
    {
      label: "Subjects",
      icon: <BookOpen className="size-5" />,
      screen: "subjects",
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      label: "Timetable",
      icon: <Clock className="size-5" />,
      screen: "timetable",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      label: "Calendar",
      icon: <Calendar className="size-5" />,
      screen: "calendar",
      color: "bg-rose-500 hover:bg-rose-600",
    },

    // --- Attendance Group ---
    {
      label: "Student Attendance",
      icon: <Users className="size-5" />,
      screen: "attendance",
      color: "bg-sky-500 hover:bg-sky-600",
    },
    {
      label: "Teacher Attendance",
      icon: <GraduationCap className="size-5" />,
      screen: "teacher-attendance",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Staff Attendance",
      icon: <Briefcase className="size-5" />,
      screen: "staff-attendance",
      color: "bg-slate-500 hover:bg-slate-600",
    },

    // --- Exam Management ---
    {
      label: "Exams",
      icon: <ClipboardList className="size-5" />,
      screen: "exams",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      label: "Results Entry",
      icon: <FileText className="size-5" />,
      screen: "results-entry",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      label: "Published Results",
      icon: <Trophy className="size-5" />,
      screen: "published-results",
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      label: "Admit Cards",
      icon: <IdCard className="size-5" />,
      screen: "admit-cards",
      color: "bg-sky-600 hover:bg-sky-700",
    },
    {
      label: "Print Marksheet",
      icon: <Award className="size-5" />,
      screen: "print-marksheet",
      color: "bg-violet-600 hover:bg-violet-700",
    },

    // --- Promotions Group ---
    {
      label: "Promotions",
      icon: <ArrowRight className="size-5" />,
      screen: "promotions",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      label: "Bulk Promote",
      icon: <Zap className="size-5" />,
      screen: "bulk-promote",
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      label: "Graduated",
      icon: <GraduationCap className="size-5" />,
      screen: "graduated",
      color: "bg-teal-500 hover:bg-teal-600",
    },

    // --- Leave Management ---
    {
      label: "Student Leaves",
      icon: <GraduationCap className="size-5" />,
      screen: "student-leaves",
      color: "bg-violet-500 hover:bg-violet-600",
    },
    {
      label: "Teacher Leaves",
      icon: <Briefcase className="size-5" />,
      screen: "teacher-leaves",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Staff Leaves",
      icon: <Users className="size-5" />,
      screen: "staff-leaves",
      color: "bg-slate-500 hover:bg-slate-600",
    },

    // --- Certificates ---
    {
      label: "Certificates",
      icon: <Award className="size-5" />,
      screen: "certificates",
      color: "bg-teal-600 hover:bg-teal-700",
    },

    // --- Fees Group ---
    {
      label: "Set Fees",
      icon: <Layers className="size-5" />,
      screen: "fees",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      label: "Fee Categories",
      icon: <Tag className="size-5" />,
      screen: "fee-categories",
      color: "bg-teal-500 hover:bg-teal-600",
    },
    {
      label: "Add Concession",
      icon: <Percent className="size-5" />,
      screen: "fee-concessions",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      label: "Make Payment",
      icon: <Banknote className="size-5" />,
      screen: "make-payment",
      color: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      label: "Check Receipt",
      icon: <FileCheck className="size-5" />,
      screen: "check-receipt",
      color: "bg-teal-600 hover:bg-teal-700",
    },
    {
      label: "Fee Status",
      icon: <UserSearch className="size-5" />,
      screen: "fee-status",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      label: "Check Payments",
      icon: <History className="size-5" />,
      screen: "check-payments",
      color: "bg-zinc-600 hover:bg-zinc-700",
    },
    {
      label: "Transport Fee",
      icon: <Bus className="size-5" />,
      screen: "transport-fee",
      color: "bg-amber-600 hover:bg-amber-700",
    },

    // --- School Expenses ---
    {
      label: "School Expenses",
      icon: <Wallet className="size-5" />,
      screen: "expenses",
      color: "bg-rose-500 hover:bg-rose-600",
    },

    // --- Notices & Support ---
    {
      label: "Notices",
      icon: <Bell className="size-5" />,
      screen: "notices",
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      label: "Support Tickets",
      icon: <TicketCheck className="size-5" />,
      screen: "tickets",
      color: "bg-cyan-500 hover:bg-cyan-600",
    },
    {
      label: "Roles & Permissions",
      icon: <Shield className="size-5" />,
      screen: "roles",
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      label: "My Subscription",
      icon: <Crown className="size-5" />,
      screen: "school-subscription",
      color: "bg-yellow-600 hover:bg-yellow-700",
    },
    {
      label: "School Settings",
      icon: <Settings className="size-5" />,
      screen: "school-settings",
      color: "bg-zinc-700 hover:bg-zinc-800",
    },
    {
      label: "Reports",
      icon: <BarChart3 className="size-5" />,
      screen: "reports",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
  ];

  const filteredQuickActions = allAdminQuickActions.filter((action) =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (layoutPref === "minimal") {
    return (
      <MinimalDashboard
        filteredQuickActions={filteredQuickActions}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        navigateTo={navigateTo}
        isExpired={isExpired}
        isExpiringSoon={isExpiringSoon}
        daysRemaining={daysRemaining}
        tenantId={tenantId || null}
        currentTenantSlug={currentTenantSlug || null}
      />
    );
  }

  return (
    <ComprehensiveDashboard
      isLoading={isLoading}
      dashboardData={dashboardData}
      recharts={recharts}
      isExpired={isExpired}
      isExpiringSoon={isExpiringSoon}
      daysRemaining={daysRemaining}
      tenantId={tenantId || null}
      currentTenantSlug={currentTenantSlug || null}
      currentTenantName={currentTenantName}
      currentTenantLogo={currentTenantLogo}
      currentUser={currentUser}
    />
  );
}
