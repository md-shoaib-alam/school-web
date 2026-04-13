'use client';

import { useParams } from 'next/navigation';
import { useAppStore } from '@/store/use-app-store';
import { AdminDashboard } from '@/components/screens/admin/dashboard';
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
import { TeacherDashboard } from '@/components/screens/teacher/dashboard';
import { StudentDashboard } from '@/components/screens/student/dashboard';
import { ParentDashboard } from '@/components/screens/parent/dashboard';
import { StaffDashboard } from '@/components/screens/staff/dashboard';
import { NotFoundScreen } from '@/components/screens/error/not-found';

export default function GenericSlugDispatcher() {
  const { slug } = useParams();
  const { currentUser } = useAppStore();

  if (!currentUser) return null;

  // 1. Check if it's a Platform Screen (Super Admin only)
  if (currentUser.role === 'super_admin') {
    switch (slug) {
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
    }
  }

  // 2. Check if it's a Tenant Dashboard (matches slug or tenantId, or user is super_admin)
  const isTenantMatch = currentUser.tenantId === slug || currentUser.tenantSlug === slug;
  if (isTenantMatch || currentUser.role === 'super_admin') {
    switch (currentUser.role) {
      case 'super_admin':
      case 'admin': return <AdminDashboard />;
      case 'teacher': return <TeacherDashboard />;
      case 'student': return <StudentDashboard />;
      case 'parent': return <ParentDashboard />;
      case 'staff': return <StaffDashboard />;
    }
  }

  return <NotFoundScreen />;
}
