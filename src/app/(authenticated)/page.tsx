'use client';

import { useAppStore } from '@/store/use-app-store';
import { AdminDashboard } from '@/components/screens/admin/dashboard';
import { SuperAdminDashboard } from '@/components/screens/super-admin/dashboard';
import { TeacherDashboard } from '@/components/screens/teacher/dashboard';
import { StudentDashboard } from '@/components/screens/student/dashboard';
import { ParentDashboard } from '@/components/screens/parent/dashboard';
import { StaffDashboard } from '@/components/screens/staff/dashboard';
import { NotFoundScreen } from '@/components/screens/error/not-found';

export default function DashboardPage() {
  const { currentUser } = useAppStore();

  if (!currentUser) return null;

  switch (currentUser.role) {
    case 'super_admin': return <SuperAdminDashboard />;
    case 'admin': return <AdminDashboard />;
    case 'teacher': return <TeacherDashboard />;
    case 'student': return <StudentDashboard />;
    case 'parent': return <ParentDashboard />;
    case 'staff': return <StaffDashboard />;
    default: return <NotFoundScreen />;
  }
}
