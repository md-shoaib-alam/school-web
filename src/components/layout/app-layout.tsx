'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore, type UserRole } from '@/store/use-app-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  School, LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  DollarSign, Bell, Calendar, Clock, LogOut, ChevronLeft, Menu,
  UserCheck, FileText, BarChart3, Settings, CreditCard, TrendingUp,
  UserRound, Heart, Crown, Building2, ShieldCheck, Activity, Database,
  Globe, Receipt, UserCog, ScrollText, PieChart, Blocks,
  Sun, Moon, Check, X, UserPlus, Shield, TicketCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { hasPermission, isRootAdmin } from '@/lib/permissions';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  permModule?: string | null;
  rootOnly?: boolean;
}

const navItems: Record<UserRole, NavItem[]> = {
  super_admin: [
    { key: 'dashboard', label: 'Platform Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, permModule: null },
    { key: 'tenants', label: 'Schools / Tenants', icon: <Building2 className="h-4 w-4" />, permModule: 'tenants' },
    { key: 'billing', label: 'Billing & Revenue', icon: <Receipt className="h-4 w-4" />, permModule: 'billing' },
    { key: 'users', label: 'All Users', icon: <UserCog className="h-4 w-4" />, permModule: 'users' },
    { key: 'audit-logs', label: 'Audit Logs', icon: <ScrollText className="h-4 w-4" />, permModule: 'audit-logs' },
    { key: 'platform-analytics', label: 'Analytics', icon: <PieChart className="h-4 w-4" />, permModule: 'analytics' },
    { key: 'feature-flags', label: 'Feature Flags', icon: <Blocks className="h-4 w-4" />, permModule: 'feature-flags' },
    { key: 'roles', label: 'Roles & Permissions', icon: <Shield className="h-4 w-4" />, permModule: 'roles' },
    { key: 'staff', label: 'Staff / Employees', icon: <UserPlus className="h-4 w-4" />, permModule: 'staff', rootOnly: true },
    { key: 'manage-admins', label: 'Manage Admins', icon: <UserCog className="h-4 w-4" />, permModule: 'manage-admins', rootOnly: true },
    { key: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, permModule: 'settings' },
  ],
  admin: [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: 'students', label: 'Students', icon: <GraduationCap className="h-4 w-4" /> },
    { key: 'teachers', label: 'Teachers', icon: <Users className="h-4 w-4" /> },
    { key: 'parents', label: 'Parents', icon: <Heart className="h-4 w-4" /> },
    { key: 'classes', label: 'Classes', icon: <School className="h-4 w-4" /> },
    { key: 'subjects', label: 'Subjects', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'attendance', label: 'Attendance', icon: <UserCheck className="h-4 w-4" /> },
    { key: 'fees', label: 'Fee Management', icon: <DollarSign className="h-4 w-4" /> },
    { key: 'notices', label: 'Notices', icon: <Bell className="h-4 w-4" /> },
    { key: 'timetable', label: 'Timetable', icon: <Clock className="h-4 w-4" /> },
    { key: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    { key: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'subscriptions', label: 'Subscriptions', icon: <Crown className="h-4 w-4" /> },
    { key: 'roles', label: 'Roles & Permissions', icon: <Shield className="h-4 w-4" /> },
    { key: 'staff', label: 'Staff / Employees', icon: <UserPlus className="h-4 w-4" /> },
    { key: 'tickets', label: 'Support Tickets', icon: <TicketCheck className="h-4 w-4" /> },
    { key: 'school-settings', label: 'School Settings', icon: <Settings className="h-4 w-4" /> },
  ],
  teacher: [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: 'my-classes', label: 'My Classes', icon: <School className="h-4 w-4" /> },
    { key: 'take-attendance', label: 'Attendance', icon: <UserCheck className="h-4 w-4" /> },
    { key: 'grade-management', label: 'Grades', icon: <ClipboardList className="h-4 w-4" /> },
    { key: 'assignments', label: 'Assignments', icon: <FileText className="h-4 w-4" /> },
    { key: 'timetable', label: 'Timetable', icon: <Clock className="h-4 w-4" /> },
    { key: 'notices', label: 'Notices', icon: <Bell className="h-4 w-4" /> },
    { key: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    { key: 'tickets', label: 'Support Tickets', icon: <TicketCheck className="h-4 w-4" /> },
  ],
  student: [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: 'my-classes', label: 'My Classes', icon: <School className="h-4 w-4" /> },
    { key: 'my-grades', label: 'My Grades', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'my-attendance', label: 'Attendance', icon: <UserCheck className="h-4 w-4" /> },
    { key: 'assignments', label: 'Assignments', icon: <FileText className="h-4 w-4" /> },
    { key: 'timetable', label: 'Timetable', icon: <Clock className="h-4 w-4" /> },
    { key: 'notices', label: 'Notices', icon: <Bell className="h-4 w-4" /> },
    { key: 'fees', label: 'My Fees', icon: <CreditCard className="h-4 w-4" /> },
    { key: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    { key: 'tickets', label: 'Support Tickets', icon: <TicketCheck className="h-4 w-4" /> },
  ],
  parent: [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: 'children', label: 'My Children', icon: <Users className="h-4 w-4" /> },
    { key: 'grades', label: 'Grades', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'attendance', label: 'Attendance', icon: <UserCheck className="h-4 w-4" /> },
    { key: 'fees', label: 'Fees', icon: <CreditCard className="h-4 w-4" /> },
    { key: 'notices', label: 'Notices', icon: <Bell className="h-4 w-4" /> },
    { key: 'timetable', label: 'Timetable', icon: <Clock className="h-4 w-4" /> },
    { key: 'subscription', label: 'Subscription', icon: <Crown className="h-4 w-4" /> },
    { key: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    { key: 'tickets', label: 'Support Tickets', icon: <TicketCheck className="h-4 w-4" /> },
  ],
  staff: [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, permModule: null },
    { key: 'students', label: 'Students', icon: <GraduationCap className="h-4 w-4" />, permModule: 'students' },
    { key: 'teachers', label: 'Teachers', icon: <Users className="h-4 w-4" />, permModule: 'teachers' },
    { key: 'attendance', label: 'Attendance', icon: <UserCheck className="h-4 w-4" />, permModule: 'attendance' },
    { key: 'fees', label: 'Fee Management', icon: <DollarSign className="h-4 w-4" />, permModule: 'fees' },
    { key: 'grades', label: 'Grades', icon: <ClipboardList className="h-4 w-4" />, permModule: 'grades' },
    { key: 'notices', label: 'Notices', icon: <Bell className="h-4 w-4" />, permModule: 'notices' },
    { key: 'timetable', label: 'Timetable', icon: <Clock className="h-4 w-4" />, permModule: 'timetable' },
    { key: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" />, permModule: 'calendar' },
    { key: 'classes', label: 'Classes', icon: <School className="h-4 w-4" />, permModule: 'classes' },
    { key: 'subjects', label: 'Subjects', icon: <BookOpen className="h-4 w-4" />, permModule: 'subjects' },
    { key: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" />, permModule: 'reports' },
    { key: 'tickets', label: 'Support Tickets', icon: <TicketCheck className="h-4 w-4" /> },
  ],
};

const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-rose-500',
  admin: 'bg-emerald-500',
  teacher: 'bg-blue-500',
  student: 'bg-violet-500',
  parent: 'bg-amber-500',
  staff: 'bg-orange-500',
};

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
  staff: 'Staff',
};

// Mock notification data
const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Mid-Term Exam Schedule', desc: 'Exams start from March 15. Check the schedule.', time: '2 min ago', read: false, icon: <ClipboardList className="h-4 w-4 text-blue-500" /> },
  { id: 2, title: 'Fee Payment Reminder', desc: 'Pending fees due by March 31.', time: '1 hour ago', read: false, icon: <DollarSign className="h-4 w-4 text-amber-500" /> },
  { id: 3, title: 'Annual Day Celebration', desc: 'Annual day on March 20. All students participate.', time: '3 hours ago', read: false, icon: <Calendar className="h-4 w-4 text-emerald-500" /> },
  { id: 4, title: 'New Notice Posted', desc: 'PTM scheduled for next Saturday.', time: 'Yesterday', read: true, icon: <Bell className="h-4 w-4 text-violet-500" /> },
  { id: 5, title: 'Attendance Report', desc: 'Weekly attendance report is now available.', time: '2 days ago', read: true, icon: <UserCheck className="h-4 w-4 text-rose-500" /> },
];

function NotificationBell() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="h-[18px] w-[18px] text-gray-500 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 h-7 px-2"
            onClick={markAllRead}
          >
            Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-[340px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Bell className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                    !notification.read && 'bg-blue-50/50 dark:bg-blue-900/10'
                  )}
                  onClick={() => markRead(notification.id)}
                >
                  <div className="mt-0.5 shrink-0">{notification.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm truncate',
                        !notification.read
                          ? 'font-semibold text-gray-900 dark:text-gray-100'
                          : 'font-medium text-gray-700 dark:text-gray-300'
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notification.desc}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-[18px] w-[18px]" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800">
          {theme === 'dark' ? (
            <Moon className="h-[18px] w-[18px] text-blue-400" />
          ) : (
            <Sun className="h-[18px] w-[18px] text-amber-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          className={cn('gap-2 cursor-pointer', theme === 'light' && 'bg-accent')}
          onClick={() => setTheme('light')}
        >
          <Sun className="h-4 w-4" />
          Light
          {theme === 'light' && <Check className="h-3.5 w-3.5 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn('gap-2 cursor-pointer', theme === 'dark' && 'bg-accent')}
          onClick={() => setTheme('dark')}
        >
          <Moon className="h-4 w-4" />
          Dark
          {theme === 'dark' && <Check className="h-3.5 w-3.5 ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, currentTenantId, currentTenantSlug, logout, sidebarOpen, toggleSidebar, setSidebarOpen, currentTenantName, refreshPermissions } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  // Determine current screen from pathname
  const parts = pathname.split('/').filter(Boolean);
  let resolvedScreen = 'dashboard';
  if (parts.length >= 2) {
    resolvedScreen = parts[1];
  } else if (parts.length === 1) {
    // If it's a tenant ID, screen is dashboard. If it's a root path, it depends.
    if (currentUser?.tenantId === parts[0]) {
      resolvedScreen = 'dashboard';
    } else {
      resolvedScreen = parts[0];
    }
  }

  // Refresh permissions from DB on mount (ensures role/permission changes are picked up)
  useEffect(() => {
    refreshPermissions();
  }, []);

  if (!currentUser) return null;

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isRoot = isRootAdmin(currentUser);
  // Any user with a custom role that has permissions defined should be filtered
  const hasCustomPermissions = !!currentUser.customRole?.permissions && Object.keys(currentUser.customRole.permissions).length > 0;
  // Super admin with a platform role has restricted permissions
  const hasPlatformPermissions = isSuperAdmin && !!currentUser.platformRole;

  // Filter nav items based on permissions
  const allItems = navItems[currentUser.role];
  const items = allItems.filter((item) => {
    // Dashboard always shows
    if (item.key === 'dashboard') return true;

    // Root-only items (Staff Management, Manage Admins) only visible to root admin
    if (item.rootOnly && !isRoot) return false;

    // For super admin with platform role: check permission-based visibility
    if (hasPlatformPermissions && item.permModule) {
      return hasPermission(currentUser, item.permModule, 'view');
    }

    // For tenant staff with custom role: check permission-based visibility
    if (hasCustomPermissions && item.permModule) {
      return hasPermission(currentUser, item.permModule, 'view');
    }

    return true;
  });
  const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const navigateTo = (screen: string) => {
    setSidebarOpen(false);
    const tenantIdentifier = currentTenantSlug || currentTenantId;
    const url = !tenantIdentifier
      ? screen === 'dashboard' ? '/' : `/${screen}`
      : screen === 'dashboard' ? `/${tenantIdentifier}` : `/${tenantIdentifier}/${screen}`;
    router.push(url);
  };

  return (
    <div className="h-dvh flex overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:h-dvh border-r overflow-hidden',
          isSuperAdmin
            ? 'bg-gradient-to-b from-rose-950 to-rose-900 border-rose-800/50'
            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          'p-4 flex items-center justify-between border-b',
          isSuperAdmin ? 'border-rose-800/50' : 'border-gray-100 dark:border-gray-800'
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md',
              isSuperAdmin ? 'bg-rose-600' : 'bg-emerald-600'
            )}>
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className={cn('font-bold text-sm', isSuperAdmin ? 'text-white' : 'text-gray-900 dark:text-gray-100')}>
                {isSuperAdmin ? 'SchoolSaaS' : (currentTenantName || 'Sigel School')}
              </h2>
              <p className={cn('text-xs', isSuperAdmin ? 'text-rose-300' : 'text-gray-400')}>
                {isSuperAdmin ? 'Platform Console' : 'Management System'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn('lg:hidden', isSuperAdmin ? 'text-rose-300 hover:text-white hover:bg-rose-800' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200')}
            onClick={toggleSidebar}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 sidebar-scrollbar overscroll-contain">
          <div className="space-y-1">
            {items.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-10 px-3 font-normal',
                  resolvedScreen === item.key
                    ? isSuperAdmin
                      ? 'bg-rose-800/60 text-white font-medium'
                      : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-medium'
                    : isSuperAdmin
                      ? 'text-rose-200 hover:text-white hover:bg-rose-800/40'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                onClick={() => navigateTo(item.key)}
              >
                {item.icon}
                {item.label}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className={cn(
          'p-4 border-t',
          isSuperAdmin ? 'border-rose-800/50' : 'border-gray-100 dark:border-gray-800'
        )}>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className={cn('text-white text-xs font-semibold', roleColors[currentUser.role])}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium truncate', isSuperAdmin ? 'text-white' : 'text-gray-900 dark:text-gray-100')}>
                {currentUser.name}
              </p>
              <Badge variant="secondary" className={cn(
                'text-[10px] px-1.5 py-0',
                isSuperAdmin ? 'bg-rose-800/60 text-rose-200 hover:bg-rose-800/60' : ''
              )}>
                {currentUser.customRole?.name || roleLabels[currentUser.role]}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 hover:text-red-500',
                isSuperAdmin ? 'text-rose-300 hover:bg-rose-800/60' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              onClick={() => { logout(); router.push('/'); }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="shrink-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {items.find(i => i.key === resolvedScreen)?.label || 'Dashboard'}
            </h1>
            {/* Breadcrumb showing current path with tenant context */}
            {resolvedScreen !== 'dashboard' && (
              <span className="hidden sm:inline text-sm text-gray-400 dark:text-gray-500 font-normal">
                /{resolvedScreen.replace(/-/g, ' ')}
              </span>
            )}
            {isSuperAdmin && (
              <Badge className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 text-[10px]">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Platform Level
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isSuperAdmin && currentTenantName && (
              <Badge variant="outline" className="hidden sm:flex gap-1 text-xs">
                <School className="h-3 w-3" />
                {currentTenantName}
              </Badge>
            )}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mr-2">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            {/* Notification Bell */}
            <NotificationBell />
            {/* Dark Mode Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
