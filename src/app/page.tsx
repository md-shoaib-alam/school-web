'use client';

import { useEffect, useSyncExternalStore, useState } from 'react';
import { useAppStore, type UserRole } from '@/store/use-app-store';
import { LoginScreen } from '@/components/screens/login';
import { AppLayout } from '@/components/layout/app-layout';
import { isRootAdmin } from '@/lib/permissions';
import { AdminDashboard } from '@/components/screens/admin/dashboard';
import { AdminStudents } from '@/components/screens/admin/students';
import { AdminTeachers } from '@/components/screens/admin/teachers';
import { AdminParents } from '@/components/screens/admin/parents';
import { AdminClasses } from '@/components/screens/admin/classes';
import { AdminSubjects } from '@/components/screens/admin/subjects';
import { AdminAttendance } from '@/components/screens/admin/attendance';
import { AdminFees } from '@/components/screens/admin/fees';
import { AdminNotices } from '@/components/screens/admin/notices';
import { AdminTimetable } from '@/components/screens/admin/timetable';
import { AdminCalendar } from '@/components/screens/admin/calendar';
import { AdminReports } from '@/components/screens/admin/reports';
import { AdminSubscriptions } from '@/components/screens/admin/subscriptions';
import { AdminRoles } from '@/components/screens/admin/roles';
import { AdminStaff } from '@/components/screens/admin/staff';
import { AdminTickets } from '@/components/screens/admin/tickets';
import { AdminSchoolSettings } from '@/components/screens/admin/school-settings';
import { TeacherDashboard } from '@/components/screens/teacher/dashboard';
import { TeacherClasses } from '@/components/screens/teacher/my-classes';
import { TeacherAttendance } from '@/components/screens/teacher/take-attendance';
import { TeacherGrades } from '@/components/screens/teacher/grade-management';
import { TeacherAssignments } from '@/components/screens/teacher/assignments';
import { TeacherTimetable } from '@/components/screens/teacher/timetable';
import { TeacherCalendar } from '@/components/screens/teacher/calendar';
import { TeacherNotices } from '@/components/screens/teacher/notices';
import { StudentDashboard } from '@/components/screens/student/dashboard';
import { StudentClasses } from '@/components/screens/student/my-classes';
import { StudentGrades } from '@/components/screens/student/my-grades';
import { StudentAttendance } from '@/components/screens/student/my-attendance';
import { StudentAssignments } from '@/components/screens/student/assignments';
import { StudentTimetable } from '@/components/screens/student/timetable';
import { StudentCalendar } from '@/components/screens/student/calendar';
import { StudentNotices } from '@/components/screens/student/notices';
import { StudentFees } from '@/components/screens/student/fees';
import { StudentTickets } from '@/components/screens/student/tickets';
import { ParentDashboard } from '@/components/screens/parent/dashboard';
import { ParentChildren } from '@/components/screens/parent/children';
import { ParentGrades } from '@/components/screens/parent/grades';
import { ParentAttendance } from '@/components/screens/parent/attendance';
import { ParentFees } from '@/components/screens/parent/fees';
import { ParentNotices } from '@/components/screens/parent/notices';
import { ParentSubscription } from '@/components/screens/parent/subscription';
import { ParentCalendar } from '@/components/screens/parent/calendar';
import { ParentTimetable } from '@/components/screens/parent/timetable';
import { SuperAdminDashboard } from '@/components/screens/super-admin/dashboard';
import { SuperAdminTenants } from '@/components/screens/super-admin/tenants';
import { SuperAdminBilling } from '@/components/screens/super-admin/billing';
import { SuperAdminUsers } from '@/components/screens/super-admin/users';
import { SuperAdminAuditLogs } from '@/components/screens/super-admin/audit-logs';
import { SuperAdminAnalytics } from '@/components/screens/super-admin/analytics';
import { SuperAdminFeatureFlags } from '@/components/screens/super-admin/feature-flags';
import { SuperAdminSettings } from '@/components/screens/super-admin/settings';
import { SuperAdminRoles } from '@/components/screens/super-admin/roles';
import { SuperAdminManage } from '@/components/screens/super-admin/manage-admins';
import { SuperAdminStaff } from '@/components/screens/super-admin/staff';
import { StaffDashboard } from '@/components/screens/staff/dashboard';
import { NotFoundScreen } from '@/components/screens/error/not-found';
import { MaintenanceScreen } from '@/components/screens/error/maintenance';

// Prevents hydration mismatch: returns false on server, true on client
const emptySubscribe = () => () => { };
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

// Valid screen paths per role
const roleScreens: Record<UserRole, Set<string>> = {
  super_admin: new Set([
    'dashboard', 'tenants', 'billing', 'users', 'audit-logs',
    'platform-analytics', 'feature-flags', 'roles', 'staff', 'settings', 'manage-admins',
  ]),
  admin: new Set([
    'dashboard', 'students', 'teachers', 'parents', 'classes', 'subjects',
    'attendance', 'fees', 'notices', 'timetable', 'calendar', 'reports',
    'subscriptions', 'roles', 'staff', 'tickets', 'school-settings',
  ]),
  teacher: new Set([
    'dashboard', 'my-classes', 'take-attendance', 'grade-management',
    'assignments', 'timetable', 'notices', 'calendar', 'tickets',
  ]),
  student: new Set([
    'dashboard', 'my-classes', 'my-grades', 'my-attendance',
    'assignments', 'timetable', 'notices', 'fees', 'calendar', 'tickets',
  ]),
  parent: new Set([
    'dashboard', 'children', 'grades', 'attendance', 'fees',
    'notices', 'timetable', 'subscription', 'calendar', 'tickets',
  ]),
  staff: new Set([
    'dashboard', 'students', 'teachers', 'attendance', 'fees', 'grades',
    'notices', 'timetable', 'calendar', 'classes', 'subjects', 'reports', 'tickets',
  ]),
};

function ScreenRouter({ screen }: { screen: string }) {
  const { currentUser } = useAppStore();
  if (!currentUser) return null;
  const role = currentUser.role;

  if (role === 'super_admin') {
    switch (screen) {
      case 'dashboard': return <SuperAdminDashboard />;
      case 'tenants': return <SuperAdminTenants />;
      case 'billing': return <SuperAdminBilling />;
      case 'users': return <SuperAdminUsers />;
      case 'audit-logs': return <SuperAdminAuditLogs />;
      case 'platform-analytics': return <SuperAdminAnalytics />;
      case 'feature-flags': return <SuperAdminFeatureFlags />;
      case 'roles': return <SuperAdminRoles />;
      case 'staff': return <SuperAdminStaff />;
      case 'settings': return <SuperAdminSettings />;
      case 'manage-admins': return <SuperAdminManage />;
      default: return <NotFoundScreen />;
    }
  }

  if (role === 'admin') {
    switch (screen) {
      case 'dashboard': return <AdminDashboard />;
      case 'students': return <AdminStudents />;
      case 'teachers': return <AdminTeachers />;
      case 'parents': return <AdminParents />;
      case 'classes': return <AdminClasses />;
      case 'subjects': return <AdminSubjects />;
      case 'attendance': return <AdminAttendance />;
      case 'fees': return <AdminFees />;
      case 'notices': return <AdminNotices />;
      case 'timetable': return <AdminTimetable />;
      case 'calendar': return <AdminCalendar />;
      case 'reports': return <AdminReports />;
      case 'subscriptions': return <AdminSubscriptions />;
      case 'roles': return <AdminRoles />;
      case 'staff': return <AdminStaff />;
      case 'school-settings': return <AdminSchoolSettings />;
      case 'tickets': return <AdminTickets />;
      default: return <NotFoundScreen />;
    }
  }

  if (role === 'teacher') {
    switch (screen) {
      case 'dashboard': return <TeacherDashboard />;
      case 'my-classes': return <TeacherClasses />;
      case 'take-attendance': return <TeacherAttendance />;
      case 'grade-management': return <TeacherGrades />;
      case 'assignments': return <TeacherAssignments />;
      case 'timetable': return <TeacherTimetable />;
      case 'notices': return <TeacherNotices />;
      case 'calendar': return <TeacherCalendar />;
      case 'tickets': return <AdminTickets />;
      default: return <NotFoundScreen />;
    }
  }

  if (role === 'student') {
    switch (screen) {
      case 'dashboard': return <StudentDashboard />;
      case 'my-classes': return <StudentClasses />;
      case 'my-grades': return <StudentGrades />;
      case 'my-attendance': return <StudentAttendance />;
      case 'assignments': return <StudentAssignments />;
      case 'timetable': return <StudentTimetable />;
      case 'notices': return <StudentNotices />;
      case 'fees': return <StudentFees />;
      case 'tickets': return <StudentTickets />;
      case 'calendar': return <StudentCalendar />;
      default: return <NotFoundScreen />;
    }
  }

  if (role === 'parent') {
    switch (screen) {
      case 'dashboard': return <ParentDashboard />;
      case 'children': return <ParentChildren />;
      case 'grades': return <ParentGrades />;
      case 'attendance': return <ParentAttendance />;
      case 'fees': return <ParentFees />;
      case 'notices': return <ParentNotices />;
      case 'timetable': return <ParentTimetable />;
      case 'subscription': return <ParentSubscription />;
      case 'calendar': return <ParentCalendar />;
      case 'tickets': return <StudentTickets />;
      default: return <NotFoundScreen />;
    }
  }

  // Staff role — uses admin screens based on custom role permissions
  if (role === 'staff') {
    switch (screen) {
      case 'dashboard': return <StaffDashboard />;
      case 'students': return <AdminStudents />;
      case 'teachers': return <AdminTeachers />;
      case 'attendance': return <AdminAttendance />;
      case 'fees': return <AdminFees />;
      case 'grades': return <TeacherGrades />;
      case 'notices': return <AdminNotices />;
      case 'timetable': return <AdminTimetable />;
      case 'calendar': return <AdminCalendar />;
      case 'classes': return <AdminClasses />;
      case 'subjects': return <AdminSubjects />;
      case 'reports': return <AdminReports />;
      case 'tickets': return <AdminTickets />;
      default: return <NotFoundScreen />;
    }
  }

  return <NotFoundScreen />;
}

export default function Home() {
  const { isLoggedIn, currentUser, currentScreen, currentTenantId, setCurrentScreen } = useAppStore();
  const mounted = useHydrated();
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // Check maintenance mode for non-super_admin users
  useEffect(() => {
    if (!isLoggedIn || !currentUser || currentUser.role === 'super_admin') return;
    let cancelled = false;
    fetch('/api/platform-settings?key=maintenance_mode')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setMaintenanceActive(data.value === 'true');
        }
      })
      .catch(() => { })
      .finally(() => {
        if (!cancelled) setMaintenanceLoading(false);
      });
    return () => { cancelled = true; };
  }, [isLoggedIn, currentUser]);

  // Poll every 30 seconds when maintenance is active
  useEffect(() => {
    if (!maintenanceActive) return;
    let cancelled = false;
    const interval = setInterval(() => {
      fetch('/api/platform-settings?key=maintenance_mode')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data) {
            setMaintenanceActive(data.value === 'true');
          }
        })
        .catch(() => { });
    }, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [maintenanceActive]);

  // Sync URL to state on mount and when URL changes
  useEffect(() => {
    const syncUrl = () => {
      const pathname = window.location.pathname;
      const parts = pathname.split('/').filter(Boolean);
      const detectedTenantId = parts[0];

      let screen = 'dashboard';
      if (parts.length >= 2) {
        screen = parts[1] || 'dashboard';
      } else if (parts.length === 1) {
        screen = parts[0];
      }

      // Only update if different to avoid loops
      if (screen !== useAppStore.getState().currentScreen) {
        useAppStore.setState({ currentScreen: screen });
      }

      // Sync tenant ID if it changed and we have a new one (primarily for multi-tenant staff)
      if (detectedTenantId && detectedTenantId !== currentTenantId) {
        // Note: For regular users, tenantId is usually fixed, but some staff can switch.
        // We only update if it's a valid change.
        // useAppStore.setState({ currentTenantId: detectedTenantId });
      }
    };

    if (mounted && isLoggedIn) {
      syncUrl();
    }
  }, [mounted, isLoggedIn, currentTenantId, currentScreen]);

  // Ensure URL matches current state after login
  useEffect(() => {
    if (isLoggedIn && currentUser && currentTenantId) {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const expectedPrefix = currentTenantId;

      // If URL doesn't start with tenant ID, redirect to correct URL
      if (parts.length > 0 && parts[0] !== expectedPrefix) {
        const url = currentScreen === 'dashboard'
          ? `/${expectedPrefix}`
          : `/${expectedPrefix}/${currentScreen}`;
        window.history.replaceState({}, '', url);
      }
    }
  }, [isLoggedIn, currentUser, currentTenantId, currentScreen]);

  // Not mounted yet → render nothing (avoids hydration mismatch with localStorage state)
  if (!mounted) {
    return null;
  }

  // Not logged in → show login
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  // Maintenance mode check (runs after login check, before any other guard)
  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Show loading while checking maintenance status for non-super_admin
  if (isLoggedIn && !isSuperAdmin && maintenanceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Maintenance mode active → block non-super_admin users
  if (isLoggedIn && !isSuperAdmin && maintenanceActive) {
    return <MaintenanceScreen />;
  }

  // Logged in but screen not valid for this role → show 404
  if (currentUser && (!currentUser.role || !roleScreens[currentUser.role] || !roleScreens[currentUser.role].has(currentScreen))) {
    return (
      <AppLayout>
        <NotFoundScreen />
      </AppLayout>
    );
  }

  // Non-root super admin staff cannot access staff management or manage admins
  if (
    currentUser?.role === 'super_admin' &&
    !isRootAdmin(currentUser) &&
    (currentScreen === 'staff' || currentScreen === 'manage-admins')
  ) {
    return (
      <AppLayout>
        <NotFoundScreen />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScreenRouter screen={currentScreen} />
    </AppLayout>
  );
}
