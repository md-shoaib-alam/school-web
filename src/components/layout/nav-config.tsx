import {
  School,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  IndianRupee,
  Bell,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  Trophy,
  BarChart3,
  Settings,
  CreditCard,
  TrendingUp,
  Building2,
  Receipt,
  UserCog,
  ScrollText,
  PieChart,
  Blocks,
  Shield,
  UserPlus,
  Crown,
  Award,
  CalendarDays,
  TicketCheck,
  Heart,
  Layers,
  Tag,
  Percent,
  Banknote,
  FileCheck,
  UserSearch,
  History,
  Bus,
  IdCard,
  Briefcase,
  ArrowRight,
  Zap,
} from "lucide-react";
import { type UserRole } from "@/store/use-app-store";

export interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  permModule?: string | null;
  rootOnly?: boolean;
  children?: {
    key: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

export const navItems: Record<UserRole, NavItem[]> = {
  super_admin: [
    {
      key: "dashboard",
      label: "Platform Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      permModule: null,
    },
    {
      key: "tenants",
      label: "Schools / Tenants",
      icon: <Building2 className="h-4 w-4" />,
      permModule: "tenants",
    },
    {
      key: "billing",
      label: "Billing & Revenue",
      icon: <Receipt className="h-4 w-4" />,
      permModule: "billing",
    },
    {
      key: "users",
      label: "All Users",
      icon: <UserCog className="h-4 w-4" />,
      permModule: "users",
    },
    {
      key: "audit-logs",
      label: "Audit Logs",
      icon: <ScrollText className="h-4 w-4" />,
      permModule: "audit-logs",
    },
    {
      key: "platform-analytics",
      label: "Analytics",
      icon: <PieChart className="h-4 w-4" />,
      permModule: "analytics",
    },
    {
      key: "feature-flags",
      label: "Feature Flags",
      icon: <Blocks className="h-4 w-4" />,
      permModule: "feature-flags",
    },
    {
      key: "roles",
      label: "Roles & Permissions",
      icon: <Shield className="h-4 w-4" />,
      permModule: "roles",
    },
    {
      key: "staff",
      label: "Staff / Employees",
      icon: <UserPlus className="h-4 w-4" />,
      permModule: "staff",
      rootOnly: true,
    },
    {
      key: "manage-admins",
      label: "Manage Admins",
      icon: <UserCog className="h-4 w-4" />,
      permModule: "manage-admins",
      rootOnly: true,
    },
    {
      key: "subscriptions",
      label: "User Subscriptions",
      icon: <Crown className="h-4 w-4" />,
      permModule: "billing",
    },
    {
      key: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      permModule: "settings",
    },
  ],
  admin: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      key: "students",
      label: "Students",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    { key: "teachers", label: "Teachers", icon: <Users className="h-4 w-4" /> },
    { key: "parents", label: "Parents", icon: <Heart className="h-4 w-4" /> },
    { key: "staff", label: "Staff / Employees", icon: <UserPlus className="h-4 w-4" /> },
    { key: "classes", label: "Classes", icon: <School className="h-4 w-4" /> },
    {
      key: "leave-management",
      label: "Leave Management",
      icon: <CalendarDays className="h-4 w-4" />,
      children: [
        { key: "student-leaves", label: "Student Leaves", icon: <GraduationCap className="h-4 w-4" /> },
        { key: "teacher-leaves", label: "Teacher Leaves", icon: <Briefcase className="h-4 w-4" /> },
        { key: "staff-leaves", label: "Staff Leaves", icon: <Users className="h-4 w-4" /> },
      ]
    },
    {
      key: "promotions-group",
      label: "Class Promotion",
      icon: <GraduationCap className="h-4 w-4" />,
      children: [
        { key: "promotions", label: "Promotions", icon: <ArrowRight className="h-4 w-4" /> },
        { key: "bulk-promote", label: "Bulk Promote", icon: <Zap className="h-4 w-4" /> },
        { key: "graduated", label: "Graduated", icon: <GraduationCap className="h-4 w-4" /> },
      ]
    },
    {
      key: "exam-management",
      label: "Exam Management",
      icon: <ClipboardList className="h-4 w-4" />,
      children: [
        { key: "exams", label: "Exams", icon: <ClipboardList className="h-4 w-4" /> },
        { key: "results-entry", label: "Results Entry", icon: <FileText className="h-4 w-4" /> },
        { key: "published-results", label: "Published Results", icon: <Trophy className="h-4 w-4" /> },
        { key: "admit-cards", label: "Admit Cards", icon: <IdCard className="h-4 w-4" /> },
      ]
    },
    {
      key: "subjects",
      label: "Subjects",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      key: "attendance-group",
      label: "Attendance",
      icon: <UserCheck className="h-4 w-4" />,
      children: [
        { key: "attendance", label: "Student Attendance", icon: <Users className="h-4 w-4" /> },
        { key: "teacher-attendance", label: "Teacher Attendance", icon: <GraduationCap className="h-4 w-4" /> },
        { key: "staff-attendance", label: "Admin Staff Attendance", icon: <Briefcase className="h-4 w-4" /> },
      ]
    },
    {
      key: "fees",
      label: "Fee Management",
      icon: <IndianRupee className="h-4 w-4" />,
      children: [
        { key: "fees", label: "Set Fees", icon: <Layers className="h-4 w-4" /> },
        { key: "fee-categories", label: "Fee Categories", icon: <Tag className="h-4 w-4" /> },
        { key: "fee-concessions", label: "Add Concession", icon: <Percent className="h-4 w-4" /> },
        { key: "make-payment", label: "Make Payment", icon: <Banknote className="h-4 w-4" /> },
        { key: "check-receipt", label: "Check Receipt", icon: <FileCheck className="h-4 w-4" /> },
        { key: "fee-status", label: "Fee Status", icon: <UserSearch className="h-4 w-4" /> },
        { key: "check-payments", label: "Check Payments", icon: <History className="h-4 w-4" /> },
        { key: "transport-fee", label: "Transport Fee", icon: <Bus className="h-4 w-4" /> },
      ]
    },
    { key: "notices", label: "Notices", icon: <Bell className="h-4 w-4" /> },
    {
      key: "timetable",
      label: "Timetable",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      key: "calendar",
      label: "Calendar",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      key: "reports",
      label: "Reports",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      key: "certificates",
      label: "Certificates",
      icon: <Award className="h-4 w-4" />,
      permModule: "students",
    },
    {
      key: "roles",
      label: "Roles & Permissions",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      key: "tickets",
      label: "Support Tickets",
      icon: <TicketCheck className="h-4 w-4" />,
    },
    {
      key: "school-settings",
      label: "School Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  teacher: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      key: "my-classes",
      label: "My Classes",
      icon: <School className="h-4 w-4" />,
    },
    {
      key: "take-attendance",
      label: "Attendance",
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      key: "grade-management",
      label: "Grades",
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      key: "assignments",
      label: "Assignments",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      key: "leaves",
      label: "My Leaves",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      key: "timetable",
      label: "Timetable",
      icon: <Clock className="h-4 w-4" />,
    },
    { key: "notices", label: "Notices", icon: <Bell className="h-4 w-4" /> },
    {
      key: "calendar",
      label: "Calendar",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      key: "tickets",
      label: "Support Tickets",
      icon: <TicketCheck className="h-4 w-4" />,
    },
  ],
  student: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      key: "my-classes",
      label: "My Classes",
      icon: <School className="h-4 w-4" />,
    },
    {
      key: "my-grades",
      label: "My Grades",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      key: "my-attendance",
      label: "Attendance",
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      key: "assignments",
      label: "Assignments",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      key: "leaves",
      label: "My Leaves",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      key: "timetable",
      label: "Timetable",
      icon: <Clock className="h-4 w-4" />,
    },
    { key: "notices", label: "Notices", icon: <Bell className="h-4 w-4" /> },
    { key: "fees", label: "My Fees", icon: <CreditCard className="h-4 w-4" /> },
    {
      key: "calendar",
      label: "Calendar",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      key: "tickets",
      label: "Support Tickets",
      icon: <TicketCheck className="h-4 w-4" />,
    },
  ],
  parent: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      key: "children",
      label: "My Children",
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: "grades",
      label: "Grades",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      key: "attendance",
      label: "Attendance",
      icon: <UserCheck className="h-4 w-4" />,
    },
    { key: "fees", label: "Fees", icon: <CreditCard className="h-4 w-4" /> },
    { key: "notices", label: "Notices", icon: <Bell className="h-4 w-4" /> },
    {
      key: "timetable",
      label: "Timetable",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      key: "subscription",
      label: "Subscription",
      icon: <Crown className="h-4 w-4" />,
    },
    {
      key: "calendar",
      label: "Calendar",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      key: "tickets",
      label: "Support Tickets",
      icon: <TicketCheck className="h-4 w-4" />,
    },
  ],
  staff: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      permModule: null,
    },
    {
      key: "students",
      label: "Students",
      icon: <GraduationCap className="h-4 w-4" />,
      permModule: "students",
    },
    {
      key: "teachers",
      label: "Teachers",
      icon: <Users className="h-4 w-4" />,
      permModule: "teachers",
    },
    {
      key: "attendance",
      label: "Attendance",
      icon: <UserCheck className="h-4 w-4" />,
      permModule: "attendance",
    },
    {
      key: "staff-attendance",
      label: "Staff Attendance",
      icon: <ClipboardList className="h-4 w-4" />,
      permModule: "attendance",
    },
    {
      key: "fees",
      label: "Fee Management",
      icon: <IndianRupee className="h-4 w-4" />,
      permModule: "fees",
    },
    {
      key: "grades",
      label: "Grades",
      icon: <ClipboardList className="h-4 w-4" />,
      permModule: "grades",
    },
    {
      key: "admit-cards",
      label: "Admit Cards",
      icon: <IdCard className="h-4 w-4" />,
      permModule: "exams",
    },
    {
      key: "notices",
      label: "Notices",
      icon: <Bell className="h-4 w-4" />,
      permModule: "notices",
    },
    {
      key: "timetable",
      label: "Timetable",
      icon: <Clock className="h-4 w-4" />,
      permModule: "timetable",
    },
    {
      key: "calendar",
      label: "Calendar",
      icon: <Calendar className="h-4 w-4" />,
      permModule: "calendar",
    },
    {
      key: "classes",
      label: "Classes",
      icon: <School className="h-4 w-4" />,
      permModule: "classes",
    },
    {
      key: "subjects",
      label: "Subjects",
      icon: <BookOpen className="h-4 w-4" />,
      permModule: "subjects",
    },
    {
      key: "reports",
      label: "Reports",
      icon: <BarChart3 className="h-4 w-4" />,
      permModule: "reports",
    },
    {
      key: "certificates",
      label: "Certificates",
      icon: <Award className="h-4 w-4" />,
      permModule: "students",
    },
    {
      key: "tickets",
      label: "Support Tickets",
      icon: <TicketCheck className="h-4 w-4" />,
    },
  ],
};

export const roleColors: Record<UserRole, string> = {
  super_admin: "bg-teal-500",
  admin: "bg-emerald-500",
  teacher: "bg-blue-500",
  student: "bg-violet-500",
  parent: "bg-amber-500",
  staff: "bg-orange-500",
};

export const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  staff: "Staff",
};
