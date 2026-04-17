'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/store/use-app-store';
import { useTenantResolution } from '@/lib/graphql/hooks/platform.hooks';
import dynamic from 'next/dynamic';

const LoadingScreen = () => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="animate-spin h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full" />
  </div>
);

const AdminDashboard = dynamic(() => import('@/components/screens/admin/dashboard').then(m => m.AdminDashboard), { loading: LoadingScreen });
const SuperAdminDashboard = dynamic(() => import('@/components/screens/super-admin/dashboard').then(m => m.SuperAdminDashboard), { loading: LoadingScreen });
const SuperAdminTenants = dynamic(() => import('@/components/screens/super-admin/tenants').then(m => m.SuperAdminTenants), { loading: LoadingScreen });
const SuperAdminBilling = dynamic(() => import('@/components/screens/super-admin/billing').then(m => m.SuperAdminBilling), { loading: LoadingScreen });
const SuperAdminUsers = dynamic(() => import('@/components/screens/super-admin/users').then(m => m.SuperAdminUsers), { loading: LoadingScreen });
const SuperAdminAuditLogs = dynamic(() => import('@/components/screens/super-admin/audit-logs').then(m => m.SuperAdminAuditLogs), { loading: LoadingScreen });
const SuperAdminAnalytics = dynamic(() => import('@/components/screens/super-admin/analytics').then(m => m.SuperAdminAnalytics), { loading: LoadingScreen });
const SuperAdminFeatureFlags = dynamic(() => import('@/components/screens/super-admin/feature-flags').then(m => m.SuperAdminFeatureFlags), { loading: LoadingScreen });
const SuperAdminSettings = dynamic(() => import('@/components/screens/super-admin/settings').then(m => m.SuperAdminSettings), { loading: LoadingScreen });
const SuperAdminRoles = dynamic(() => import('@/components/screens/super-admin/roles').then(m => m.SuperAdminRoles), { loading: LoadingScreen });
const SuperAdminManage = dynamic(() => import('@/components/screens/super-admin/manage-admins').then(m => m.SuperAdminManage), { loading: LoadingScreen });
const SuperAdminStaff = dynamic(() => import('@/components/screens/super-admin/staff').then(m => m.SuperAdminStaff), { loading: LoadingScreen });
const SuperAdminSubscriptions = dynamic(() => import('@/components/screens/super-admin/subscriptions').then(m => m.SuperAdminSubscriptions), { loading: LoadingScreen });

const TeacherDashboard = dynamic(() => import('@/components/screens/teacher/dashboard').then(m => m.TeacherDashboard), { loading: LoadingScreen });
const StudentDashboard = dynamic(() => import('@/components/screens/student/dashboard').then(m => m.StudentDashboard), { loading: LoadingScreen });
const ParentDashboard = dynamic(() => import('@/components/screens/parent/dashboard').then(m => m.ParentDashboard), { loading: LoadingScreen });
const StaffDashboard = dynamic(() => import('@/components/screens/staff/dashboard').then(m => m.StaffDashboard), { loading: LoadingScreen });
const NotFoundScreen = dynamic(() => import('@/components/screens/error/not-found').then(m => m.NotFoundScreen));

export default function GenericSlugDispatcher() {
  const { slug } = useParams();
  const { currentUser, currentTenantSlug, setCurrentTenant } = useAppStore();

  const { data: resolvedTenant } = useTenantResolution(slug as string);

  useEffect(() => {
    if (resolvedTenant && resolvedTenant.slug !== currentTenantSlug) {
      setCurrentTenant(resolvedTenant.id, resolvedTenant.name, resolvedTenant.slug);
    }
  }, [resolvedTenant, currentTenantSlug, setCurrentTenant]);

  if (!currentUser) return null;

  // 1. Check if it's a Platform Screen (Super Admin only)
  if (currentUser.role === 'super_admin') {
    switch (slug) {
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
      case 'subscriptions': return <SuperAdminSubscriptions />;
    }
  }

  // 2. Check if it's a Tenant Dashboard (matches slug or tenantId, or user is super_admin)
  const isTenantMatch = currentUser.tenantId === slug || currentUser.tenantSlug === slug;
  if (isTenantMatch || currentUser.role === 'super_admin') {
    // For Super Admin visiting a tenant slug, wait for resolution to avoid fetching with wrong context
    if (currentUser.role === 'super_admin' && !isTenantMatch && !resolvedTenant) {
      return <LoadingScreen />;
    }

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
