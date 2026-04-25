import React from "react";
import { 
  Shield, 
  Crown, 
  BookOpen, 
  GraduationCap, 
  Heart, 
  UserCog, 
  Users 
} from "lucide-react";

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  status?: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string; // "super_admin" | "admin" | "teacher" | "student" | "parent" | "staff"
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  tenant: TenantInfo | null;
}

export interface RoleCount {
  role: string;
  count: number;
}

export interface UsersResponse {
  users: PlatformUser[];
  total: number;
  page: number;
  totalPages: number;
  roleCounts: RoleCount[];
  tenants: TenantInfo[];
}

export const ROLES = [
  { value: "all", label: "All Roles" },
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "staff", label: "Staff" },
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
] as const;

export const ROLE_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  super_admin: {
    color: "text-teal-700 dark:text-teal-400",
    bg: "bg-teal-100 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700",
    icon: React.createElement(Shield, { className: "h-3.5 w-3.5" }),
    label: "Super Admin",
  },
  admin: {
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700",
    icon: React.createElement(Crown, { className: "h-3.5 w-3.5" }),
    label: "Admin",
  },
  teacher: {
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700",
    icon: React.createElement(BookOpen, { className: "h-3.5 w-3.5" }),
    label: "Teacher",
  },
  student: {
    color: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700",
    icon: React.createElement(GraduationCap, { className: "h-3.5 w-3.5" }),
    label: "Student",
  },
  parent: {
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700",
    icon: React.createElement(Heart, { className: "h-3.5 w-3.5" }),
    label: "Parent",
  },
  staff: {
    color: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700",
    icon: React.createElement(UserCog, { className: "h-3.5 w-3.5" }),
    label: "Staff",
  },
};

export const STAT_CARDS = [
  { key: "total", label: "Total Users", icon: Users, color: "text-gray-700 dark:text-gray-300", bg: "bg-gray-50 dark:bg-gray-900", iconBg: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700" },
  { key: "student", label: "Students", icon: GraduationCap, color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/30", iconBg: "bg-violet-200 text-violet-700 dark:text-violet-400", border: "border-violet-200 dark:border-violet-700" },
  { key: "teacher", label: "Teachers", icon: BookOpen, color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30", iconBg: "bg-blue-200 text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-700" },
  { key: "parent", label: "Parents", icon: Heart, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30", iconBg: "bg-amber-200 text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-700" },
  { key: "staff", label: "Staff", icon: UserCog, color: "text-indigo-700 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/30", iconBg: "bg-indigo-200 text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-700" },
  { key: "admin", label: "Admins", icon: Shield, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30", iconBg: "bg-emerald-200 text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-700" },
] as const;

export const PAGE_SIZE = 50;
