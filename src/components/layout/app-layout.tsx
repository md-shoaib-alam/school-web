"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore, type UserRole } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  LogOut,
  ChevronLeft,
  Moon,
  Sun,
  ClipboardList,
  DollarSign,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";
import { hasPermission, isRootAdmin } from "@/lib/permissions";

interface NavItem {
  key: string;
  label: string;
  icon: string; // Phosphor icon classes
  badge?: string;
  permModule?: string | null;
  rootOnly?: boolean;
  subItems?: { key: string; label: string; icon?: string }[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: Record<UserRole, NavSection[]> = {
  super_admin: [
    {
      title: "ADMINISTRATION",
      items: [
        { key: "dashboard", label: "Dashboard", icon: "ph-layout" },
        {
          key: "management",
          label: "Management",
          icon: "ph-buildings",
          subItems: [
            { key: "tenants", label: "Schools / Tenants", icon: "ph-building" },
            { key: "billing", label: "Billing & Revenue", icon: "ph-receipt" },
            { key: "subscriptions", label: "User Subscriptions", icon: "ph-crown" },
          ]
        },
      ]
    },
    {
      title: "ACCESS CONTROL",
      items: [
        {
          key: "security",
          label: "Security",
          icon: "ph-shield-check",
          subItems: [
            { key: "users", label: "All Users", icon: "ph-user-gear" },
            { key: "roles", label: "Roles & Permissions", icon: "ph-shield" },
            { key: "manage-admins", label: "Manage Admins", icon: "ph-user-circle-plus" },
          ]
        },
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { key: "audit-logs", label: "Audit Logs", icon: "ph-scroll" },
        { key: "settings", label: "Platform Settings", icon: "ph-gear" },
      ]
    }
  ],
  admin: [
    {
      title: "ADMINISTRATION",
      items: [
        { key: "dashboard", label: "Dashboard", icon: "ph-layout" },
        {
          key: "people",
          label: "People",
          icon: "ph-users",
          subItems: [
            { key: "students", label: "Students", icon: "ph-graduation-cap" },
            { key: "teachers", label: "Teachers", icon: "ph-users-three" },
            { key: "parents", label: "Parents", icon: "ph-heart" },
            { key: "staff", label: "Staff / Employees", icon: "ph-user-plus" },
          ]
        },
        {
          key: "academic",
          label: "Academic",
          icon: "ph-books",
          subItems: [
            { key: "classes", label: "Classes", icon: "ph-chalkboard" },
            { key: "subjects", label: "Subjects", icon: "ph-book-open" },
            { key: "timetable", label: "Timetable", icon: "ph-clock" },
            { key: "promotions", label: "Class Promotion", icon: "ph-trend-up" },
          ]
        },
      ]
    },
    {
      title: "OPERATIONS",
      items: [
        {
          key: "ops",
          label: "School Ops",
          icon: "ph-briefcase",
          subItems: [
            { key: "attendance", label: "Attendance", icon: "ph-user-check" },
            { key: "fees", label: "Fee Management", icon: "ph-currency-circle-dollar" },
            { key: "notices", label: "Notices", icon: "ph-bell" },
            { key: "calendar", label: "Calendar", icon: "ph-calendar" },
          ]
        },
        { key: "reports", label: "Reports", icon: "ph-chart-pie" },
      ]
    },
    {
      title: "MANAGEMENT",
      items: [
        { key: "roles", label: "Roles & Permissions", icon: "ph-shield" },
        { key: "tickets", label: "Support Tickets", icon: "ph-ticket" },
        { key: "school-settings", label: "School Settings", icon: "ph-gear-six" },
      ]
    }
  ],
  teacher: [
    {
      title: "MAIN",
      items: [
        { key: "dashboard", label: "Dashboard", icon: "ph-layout" },
        {
          key: "academic",
          label: "Academic",
          icon: "ph-book",
          subItems: [
            { key: "my-classes", label: "My Classes", icon: "ph-chalkboard" },
            { key: "take-attendance", label: "Attendance", icon: "ph-user-check" },
            { key: "grade-management", label: "Grades", icon: "ph-clipboard-text" },
          ]
        },
      ]
    },
    {
      title: "RESOURCES",
      items: [
        { key: "assignments", label: "Assignments", icon: "ph-file-text" },
        { key: "timetable", label: "Timetable", icon: "ph-clock" },
        { key: "notices", label: "Notices", icon: "ph-bell" },
        { key: "tickets", label: "Support Tickets", icon: "ph-ticket" },
      ]
    }
  ],
  student: [
    {
      title: "LEARNING",
      items: [
        { key: "dashboard", label: "Dashboard", icon: "ph-layout" },
        { key: "my-classes", label: "My Classes", icon: "ph-chalkboard" },
        { key: "assignments", label: "Assignments", icon: "ph-file-text" },
        { key: "timetable", label: "Timetable", icon: "ph-clock" },
      ]
    },
    {
      title: "PERFORMANCE",
      items: [
        { key: "my-grades", label: "My Grades", icon: "ph-trend-up" },
        { key: "my-attendance", label: "Attendance", icon: "ph-user-check" },
        { key: "fees", label: "My Fees", icon: "ph-credit-card" },
        { key: "notices", label: "Notices", icon: "ph-bell" },
      ]
    }
  ],
  parent: [
    {
      title: "CHILD INFO",
      items: [
        { key: "dashboard", label: "Dashboard", icon: "ph-layout" },
        { key: "children", label: "My Children", icon: "ph-users" },
        { key: "grades", label: "Grades", icon: "ph-chart-line-up" },
        { key: "attendance", label: "Attendance", icon: "ph-user-check" },
      ]
    },
    {
      title: "ACCOUNT",
      items: [
        { key: "fees", label: "Fees", icon: "ph-credit-card" },
        { key: "notices", label: "Notices", icon: "ph-bell" },
        { key: "tickets", label: "Support Tickets", icon: "ph-ticket" },
      ]
    }
  ],
  staff: [
    {
      title: "OPERATIONS",
      items: [
        { key: "dashboard", label: "Dashboard", icon: "ph-layout" },
        {
          key: "admin-tasks",
          label: "Admin Tasks",
          icon: "ph-briefcase",
          subItems: [
            { key: "students", label: "Students", icon: "ph-graduation-cap" },
            { key: "attendance", label: "Attendance", icon: "ph-user-check" },
            { key: "fees", label: "Fees", icon: "ph-currency-circle-dollar" },
          ]
        },
      ]
    },
    {
      title: "RESOURCES",
      items: [
        { key: "notices", label: "Notices", icon: "ph-bell" },
        { key: "calendar", label: "Calendar", icon: "ph-calendar" },
        { key: "reports", label: "Reports", icon: "ph-chart-bar" },
      ]
    }
  ]
};

function NotificationBell() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="bg-gray-100 dark:bg-[#1a1c1e] hover:bg-gray-200 dark:hover:bg-[#25282c] w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border border-gray-200 dark:border-[#2d3135] relative group">
          <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#1a1c1e]" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white dark:bg-[#1a1c1e] border-gray-200 dark:border-[#2d3135] shadow-xl" align="end">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2d3135] flex items-center justify-between">
          <span className="text-gray-900 dark:text-white text-sm font-semibold">Notifications</span>
          <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW {unreadCount}</span>
        </div>
        <div className="max-h-[340px] overflow-y-auto">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 border-b border-gray-100 dark:border-[#2d3135]/50 hover:bg-gray-50 dark:hover:bg-[#25282c] cursor-pointer transition-colors" onClick={() => markRead(n.id)}>
              <div className="flex gap-3">
                <div className="mt-1 shrink-0">{n.icon}</div>
                <div>
                  <div className="text-gray-900 dark:text-gray-200 text-xs font-semibold">{n.title}</div>
                  <div className="text-gray-500 text-[11px] mt-0.5 line-clamp-2">{n.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Mid-Term Exam Schedule",
    desc: "Exams start from March 15. Check the schedule.",
    time: "2 min ago",
    read: false,
    icon: <ClipboardList className="h-4 w-4 text-blue-500" />,
  },
  {
    id: 2,
    title: "Fee Payment Reminder",
    desc: "Pending fees due by March 31.",
    time: "1 hour ago",
    read: false,
    icon: <DollarSign className="h-4 w-4 text-amber-500" />,
  },
  {
    id: 3,
    title: "Annual Day Celebration",
    desc: "Annual day on March 20. All students participate.",
    time: "3 hours ago",
    read: false,
    icon: <Calendar className="h-4 w-4 text-emerald-500" />,
  },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div 
      className="bg-gray-100 dark:bg-[#1a1c1e] hover:bg-gray-200 dark:hover:bg-[#25282c] w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border border-gray-200 dark:border-[#2d3135] group"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" 
        ? <Moon className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" /> 
        : <Sun className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
      }
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const {
    currentUser,
    currentTenantId,
    currentTenantSlug,
    logout,
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    currentTenantName,
    refreshPermissions,
  } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    refreshPermissions();
  }, []);

  if (!currentUser) return null;

  // Determine current screen from pathname
  const parts = pathname.split("/").filter(Boolean);
  let resolvedScreen = "dashboard";
  if (parts.length >= 2) {
    resolvedScreen = parts[1];
  } else if (parts.length === 1) {
    if (currentUser?.tenantId === parts[0]) {
      resolvedScreen = "dashboard";
    } else {
      resolvedScreen = parts[0];
    }
  }

  // Find parent category and label for breadcrumbs
  const sections = navSections[currentUser.role];
  let parentLabel = "";
  let activeLabel = "Dashboard";

  sections.forEach(section => {
    section.items.forEach(item => {
      if (item.key === resolvedScreen) {
        activeLabel = item.label;
        parentLabel = section.title;
      } else if (item.subItems) {
        const sub = item.subItems.find(s => s.key === resolvedScreen);
        if (sub) {
          parentLabel = item.label;
          activeLabel = sub.label;
        }
      }
    });
  });

  const navigateTo = (screen: string) => {
    setSidebarOpen(false);
    const tenantIdentifier = currentTenantSlug || currentTenantId;
    const url = !tenantIdentifier
      ? screen === "dashboard" ? "/" : `/${screen}`
      : screen === "dashboard" ? `/${tenantIdentifier}` : `/${tenantIdentifier}/${screen}`;
    router.push(url);
  };

  const firstName = currentUser.name.split(" ")[0];

  return (
    <div className="h-dvh flex overflow-hidden bg-gray-50 dark:bg-[#0d0e10] lg:p-4 gap-4 transition-colors duration-500">
      <Sidebar 
        sections={sections} 
        activeKey={resolvedScreen} 
        onNavigate={navigateTo} 
        schoolName={currentTenantName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 bg-transparent shrink-0 mb-2">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-[13px] font-medium tracking-wide">
              {parentLabel && (
                <>
                  <span className="hover:text-gray-900 dark:hover:text-gray-200 cursor-default transition-colors uppercase text-[11px] font-bold tracking-widest">{parentLabel}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                </>
              )}
              <span className="text-gray-900 dark:text-white font-bold">{activeLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">
                {currentUser.role.replace("_", " ")}
              </span>
              <span className="text-gray-900 dark:text-white text-sm font-bold opacity-90 transition-opacity">
                Hello, {firstName}.
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
              <div 
                className="bg-gray-100 dark:bg-[#1a1c1e] hover:bg-red-50 dark:hover:bg-[#25282c] w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border border-gray-200 dark:border-[#2d3135] group"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-500 dark:group-hover:text-gray-300 transition-colors" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth bg-white dark:bg-[#111214] border border-gray-200 dark:border-[#1d1f23] rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-none">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
