'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Users, Search, Filter, ChevronLeft, ChevronRight, UserCog, Shield,
  GraduationCap, BookOpen, Heart, Crown, Phone, Mail, Calendar,
  Building2, Eye, Activity, UserRound, Menu,
} from 'lucide-react';
import { useUsers, useToggleUserStatus } from '@/lib/graphql/hooks';

// ── Types ───────────────────────────────────────────────────────────────────

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  status?: string;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  tenant: TenantInfo | null;
}

interface RoleCount {
  role: string;
  count: number;
}

interface UsersResponse {
  users: PlatformUser[];
  total: number;
  page: number;
  totalPages: number;
  roleCounts: RoleCount[];
  tenants: TenantInfo[];
}

// ── Constants ───────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'all', label: 'All Roles' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
] as const;

const ROLE_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  super_admin: {
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700',
    icon: <Shield className="h-3.5 w-3.5" />,
    label: 'Super Admin',
  },
  admin: {
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700',
    icon: <Crown className="h-3.5 w-3.5" />,
    label: 'Admin',
  },
  teacher: {
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
    icon: <BookOpen className="h-3.5 w-3.5" />,
    label: 'Teacher',
  },
  student: {
    color: 'text-violet-700 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700',
    icon: <GraduationCap className="h-3.5 w-3.5" />,
    label: 'Student',
  },
  parent: {
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700',
    icon: <Heart className="h-3.5 w-3.5" />,
    label: 'Parent',
  },
};

const STAT_CARDS = [
  { key: 'total', label: 'Total Users', icon: Users, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-50 dark:bg-gray-900', iconBg: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
  { key: 'student', label: 'Students', icon: GraduationCap, color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30', iconBg: 'bg-violet-200 text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-700' },
  { key: 'teacher', label: 'Teachers', icon: BookOpen, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', iconBg: 'bg-blue-200 text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-700' },
  { key: 'parent', label: 'Parents', icon: Heart, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', iconBg: 'bg-amber-200 text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700' },
  { key: 'admin', label: 'Admins', icon: Shield, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', iconBg: 'bg-emerald-200 text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-700' },
] as const;

const PAGE_SIZE = 20;

// ── Component ───────────────────────────────────────────────────────────────

export function SuperAdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Detail sheet
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Status toggle mutation
  const toggleStatus = useToggleUserStatus();

  // Fetch users via GraphQL
  const { data, isLoading: loading } = useUsers({
    role: roleFilter !== 'all' ? roleFilter : undefined,
    tenantId: tenantFilter !== 'all' ? tenantFilter : undefined,
    search: search.trim() || undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  // Role counts map
  const roleCountsMap: Record<string, number> = {};
  if (data?.roleCounts) {
    data.roleCounts.forEach((rc) => {
      roleCountsMap[rc.role] = rc.count;
    });
  }
  const totalCount = data?.total ?? 0;

  // Get count for a stat card
  const getCount = (key: string) => {
    if (key === 'total') return totalCount;
    if (key === 'admin') {
      return (roleCountsMap['admin'] ?? 0) + (roleCountsMap['super_admin'] ?? 0);
    }
    return roleCountsMap[key] ?? 0;
  };

  // Reset page when filters change (handled in handlers below)

  // Derive unique tenants from user data for the filter dropdown
  const tenants = useMemo(() => {
    if (!data?.users) return [];
    const map = new Map<string, TenantInfo>();
    data.users.forEach((u) => {
      if (u.tenant?.id && u.tenant?.name && !map.has(u.tenant.id)) {
        map.set(u.tenant.id, { id: u.tenant.id, name: u.tenant.name, slug: u.tenant.slug || '' });
      }
    });
    return Array.from(map.values());
  }, [data]);

  // Helper: change filter and reset page
  const setRoleFilterAndReset = (v: string) => { setRoleFilter(v); setCurrentPage(1); };
  const setTenantFilterAndReset = (v: string) => { setTenantFilter(v); setCurrentPage(1); };
  const setSearchAndReset = (v: string) => { setSearch(v); setCurrentPage(1); };

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Pagination helpers
  const totalPages = data?.totalPages ?? 1;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);

  // Page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const openUserDetail = (user: PlatformUser | Record<string, unknown>) => {
    setSelectedUser(user as PlatformUser);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all users across all tenant schools
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 text-xs px-3 py-1">
          <Shield className="h-3.5 w-3.5" />
          Cross-Tenant View
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        {STAT_CARDS.map((stat) => {
          const count = getCount(stat.key);
          const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0';
          const Icon = stat.icon;
          return (
            <Card
              key={stat.key}
              className={`border ${stat.border} ${stat.bg} overflow-hidden`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs font-medium ${stat.color} opacity-80`}>
                    {percentage}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearchAndReset(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={roleFilter} onValueChange={setRoleFilterAndReset}>
                <SelectTrigger className="w-full lg:w-44">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tenant Filter */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={tenantFilter} onValueChange={setTenantFilterAndReset}>
                <SelectTrigger className="w-full lg:w-52">
                  <SelectValue placeholder="Filter by school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48 ml-auto" />
              </div>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-6 w-20 ml-auto" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900/80 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900/80">
                      <TableHead className="w-[280px] min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                          Name
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          Email
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                          Role
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          Tenant / School
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          Status
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[120px] hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Created
                        </div>
                      </TableHead>
                      <TableHead className="w-[60px] text-right">
                        <span className="sr-only">View</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!data || data.users.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm font-medium">No users found</p>
                          <p className="text-xs mt-1">
                            Try adjusting your search or filters
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.users.map((user) => {
                        const roleConf = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.student;
                        const initials = (user.name || '').split(' ').map((n) => n?.[0] || '').join('').slice(0, 2).toUpperCase();
                        return (
                          <TableRow
                            key={user.id}
                            className="cursor-pointer transition-colors hover:bg-rose-50 dark:bg-rose-900/30/40"
                            onClick={() => openUserDetail(user)}
                          >
                            {/* Name */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 text-white ${user.role === 'super_admin' ? 'bg-rose-500' : user.role === 'admin' ? 'bg-emerald-500' : user.role === 'teacher' ? 'bg-blue-500' : user.role === 'student' ? 'bg-violet-500' : 'bg-amber-500'}`}
                                >
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground md:hidden truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Email */}
                            <TableCell className="hidden sm:table-cell">
                              <span className="text-sm text-muted-foreground truncate block max-w-[220px]">
                                {user.email}
                              </span>
                            </TableCell>

                            {/* Role */}
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`gap-1 text-[11px] font-medium px-2 py-0.5 border ${roleConf.bg} ${roleConf.color}`}
                              >
                                {roleConf.icon}
                                {roleConf.label}
                              </Badge>
                            </TableCell>

                            {/* Tenant */}
                            <TableCell>
                              {user.tenant ? (
                                <div className="flex items-center gap-1.5">
                                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[140px]">
                                    {user.tenant.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[11px] font-medium px-2 py-0.5 border ${
                                  user.isActive
                                    ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                    : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400'
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>

                            {/* Created */}
                            <TableCell className="hidden md:table-cell">
                              <span className="text-sm text-muted-foreground">
                                {formatDate(user.createdAt)}
                              </span>
                            </TableCell>

                            {/* View */}
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:bg-rose-900/30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openUserDetail(user);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data && data.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-muted-foreground">
                    Showing{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">{startItem.toLocaleString()}</span>
                    {' '}to{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">{endItem.toLocaleString()}</span>
                    {' '}of{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">{totalCount.toLocaleString()}</span>
                    {' '}users
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {getPageNumbers().map((page, idx) =>
                      page === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-sm">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="icon"
                          className={`h-8 w-8 text-xs ${
                            currentPage === page
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : ''
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto">
          {selectedUser && (
            <>
              {/* Sheet Header Banner */}
              <div
                className={`p-6 pb-4 ${
                  selectedUser.role === 'super_admin'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-500'
                    : selectedUser.role === 'admin'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                    : selectedUser.role === 'teacher'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500'
                    : selectedUser.role === 'student'
                    ? 'bg-gradient-to-r from-violet-600 to-violet-500'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500'
                }`}
              >
                <SheetHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-white dark:bg-gray-900/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold">
                      {(selectedUser.name || '').split(' ').map((n) => n?.[0] || '').join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <SheetTitle className="text-white text-lg font-bold">
                        {selectedUser.name}
                      </SheetTitle>
                      <SheetDescription className="text-white/80 text-sm mt-0.5">
                        {ROLE_CONFIG[selectedUser.role]?.label ?? 'User'}
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium px-2.5 py-1 border ${
                      selectedUser.isActive
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${selectedUser.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    {selectedUser.isActive ? 'Active Account' : 'Inactive Account'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`gap-1 text-xs font-medium px-2.5 py-1 border ${ROLE_CONFIG[selectedUser.role]?.bg ?? ''} ${ROLE_CONFIG[selectedUser.role]?.color ?? ''}`}
                  >
                    {ROLE_CONFIG[selectedUser.role]?.icon}
                    {ROLE_CONFIG[selectedUser.role]?.label}
                  </Badge>
                </div>

                {/* User Information */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    User Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <UserRound className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Full Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedUser.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Email Address</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Phone Number</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedUser.phone || <span className="text-muted-foreground">Not provided</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Account Created</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Account Actions */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Administrative Actions
                  </h3>
                  <div className="p-4 rounded-lg border border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-950/20">
                    <p className="text-sm font-medium mb-1">Account Status Control</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {selectedUser.isActive 
                        ? 'Deactivating this account will prevent the user from logging in until re-enabled.'
                        : 'Activating this account will restore login permissions for the user.'}
                    </p>
                    <Button 
                      variant={selectedUser.isActive ? "destructive" : "default"}
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => {
                        toggleStatus.mutate(
                          { id: selectedUser.id, isActive: !selectedUser.isActive },
                          {
                            onSuccess: (updated) => {
                              setSelectedUser({ ...selectedUser, isActive: updated.isActive });
                            }
                          }
                        );
                      }}
                      disabled={toggleStatus.isPending || selectedUser.role === 'super_admin'}
                    >
                      <Activity className="h-4 w-4" />
                      {toggleStatus.isPending ? 'Updating...' : selectedUser.isActive ? 'Deactivate Account' : 'Activate Account'}
                    </Button>
                    {selectedUser.role === 'super_admin' && (
                      <p className="text-[10px] text-rose-500 mt-2 text-center">Super Admin accounts cannot be disabled here.</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Tenant / School Information */}
                {selectedUser.tenant ? (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Tenant / School Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">School Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedUser.tenant.name || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <Crown className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Subscription Plan</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedUser.tenant.plan
                            ? selectedUser.tenant.plan.charAt(0).toUpperCase() + selectedUser.tenant.plan.slice(1)
                            : <span className="text-muted-foreground">N/A</span>
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <Activity className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Tenant Status</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedUser.tenant.status
                            ? selectedUser.tenant.status.charAt(0).toUpperCase() + selectedUser.tenant.status.slice(1)
                            : <span className="text-muted-foreground">N/A</span>
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <Menu className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Tenant Slug</p>
                        <p className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{selectedUser.tenant.slug || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                    <p className="text-sm">This user has no tenant association (Platform-level account)</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
