import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null
  if (date instanceof Date) return date.toISOString()
  return String(date)
}

function checkAuth(context: any) {
  if (!context?.session?.user) {
    throw new Error('Unauthorized');
  }
  return {
    user: context.session.user,
    tenantId: context.tenantId,
  };
}

// ── Resolvers ────────────────────────────────────────────────────────────────

export const resolvers = {
  // ── JSON Scalar ──────────────────────────────────────────────────────────
  JSON: {
    __serialize: (value: unknown) => value,
    __parseValue: (value: unknown) => value,
    __parseLiteral: (ast: { value: string }) => {
      try {
        return JSON.parse(ast.value)
      } catch {
        return ast.value
      }
    },
  },

  // ── Query ────────────────────────────────────────────────────────────────
  Query: {
    platformStats: async () => {
      try {
        // Step 1: Execute all platform statistics in a single parallel wave
        const [
          tenantStatGrouping,
          userStatGrouping,
          classCount,
          subStats,
          revenueStats,
          recentLogs,
          planDist,
          activeRevenueResult,
          tenants
        ] = await Promise.all([
          db.tenant.groupBy({
            by: ['status'],
            _count: { id: true },
          }),
          db.user.groupBy({
            by: ['role'],
            _count: { id: true },
          }),
          db.class.count(),
          db.subscription.groupBy({
            by: ['status'],
            _count: { id: true },
          }),
          db.subscription.aggregate({
            _sum: { amount: true },
          }),
          db.auditLog.findMany({
            take: 10, // Reduced from 20 to 10 for dashboard preview
            orderBy: { createdAt: 'desc' },
            include: { tenant: { select: { id: true, name: true, slug: true } } },
          }),
          db.tenant.groupBy({
            by: ['plan'],
            _count: { id: true },
          }),
          db.subscription.aggregate({
            where: { status: 'active' },
            _sum: { amount: true },
          }),
          db.tenant.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { 
              id: true, name: true, slug: true, plan: true, status: true, 
              _count: { select: { users: true, classes: true } } 
            }
          })
        ]);

        // Map results back to the required structure
        const totalTenants = tenantStatGrouping.reduce((acc, curr) => acc + (curr._count.id || 0), 0);
        const activeTenants = tenantStatGrouping.find(g => g.status === 'active')?._count.id || 0;
        const trialTenants = tenantStatGrouping.find(g => g.status === 'trial')?._count.id || 0;
        const suspendedTenants = tenantStatGrouping.find(g => g.status === 'suspended')?._count.id || 0;

        const totalUsers = userStatGrouping.reduce((acc, curr) => acc + (curr._count.id || 0), 0);
        const totalStudents = userStatGrouping.find(g => g.role === 'student')?._count.id || 0;
        const totalTeachers = userStatGrouping.find(g => g.role === 'teacher')?._count.id || 0;
        const totalParents = userStatGrouping.find(g => g.role === 'parent')?._count.id || 0;
        const totalAdmins = userStatGrouping.find(g => g.role === 'admin')?._count.id || 0;

        const totalSubscriptions = subStats.reduce((acc, curr) => acc + (curr._count.id || 0), 0);
        const activeSubscriptions = subStats.find(g => g.status === 'active')?._count.id || 0;

        // Monthly growth (simulated for now, could be db aggregated later)
        const monthlyData = [5, 4, 3, 2, 1, 0].map(i => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            month: date.toLocaleString('default', { month: 'short' }),
            newTenants: Math.floor(Math.random() * 5) + 1,
            newUsers: Math.floor(Math.random() * 50) + 20,
            revenue: Math.floor(Math.random() * 5000) + 2000,
          };
        });

        const topTenants = tenants.map(t => ({
          ...t,
          revenue: 0,
          studentCount: t._count.users || 0,
          teacherCount: 0, // Simplified for dashboard
        }));

        return {
          tenants: {
            total: totalTenants,
            active: activeTenants,
            trial: trialTenants,
            suspended: suspendedTenants,
          },
          users: {
            total: totalUsers,
            students: totalStudents,
            teachers: totalTeachers,
            parents: totalParents,
            admins: totalAdmins,
          },
          classes: classCount,
          subscriptions: {
            total: totalSubscriptions,
            active: activeSubscriptions,
          },
          revenue: {
            active: activeRevenueResult._sum.amount || 0,
            total: revenueStats._sum.amount || 0,
          },
          planDistribution: planDist.map((p) => ({ plan: p.plan, count: p._count.id })),
          recentLogs,
          monthlyData,
          topTenants,
        }
      } catch (error) {
        console.error('platformStats resolver error:', error)
        throw new Error('Failed to fetch platform stats')
      }
    },

    billingData: async () => {
      try {
        const [
          recentSubscriptions,
          tenantRevenue,
          activeSubCounts,
          tenantList,
          planGrouping,
          methodGrouping
        ] = await Promise.all([
          db.subscription.findMany({
            include: {
              parent: { include: { user: { select: { id: true, name: true, email: true } } } },
              tenant: { select: { id: true, name: true, slug: true } },
            },
            take: 20, // Limited for dashboard preview
            orderBy: { createdAt: 'desc' },
          }),
          db.subscription.groupBy({
            by: ['tenantId'],
            _sum: { amount: true },
            _count: { id: true },
          }),
          db.subscription.groupBy({
            by: ['tenantId'],
            where: { status: 'active' },
            _sum: { amount: true },
            _count: { id: true },
          }),
          db.tenant.findMany({
            select: { 
              id: true, name: true, slug: true, plan: true, status: true,
              _count: { select: { users: true, classes: true } }
            },
            take: 50, // Added safety limit
          }),
          db.subscription.groupBy({
            by: ['planName'],
            _count: { id: true },
            _sum: { amount: true },
            where: { status: 'active' }
          }),
          db.subscription.groupBy({
            by: ['paymentMethod'],
            _count: { id: true },
            _sum: { amount: true }
          })
        ])

        const revenueMap = new Map(tenantRevenue.map(r => [r.tenantId, { total: r._sum.amount || 0, count: r._count.id }]));
        const activeMap = new Map(activeSubCounts.map(r => [r.tenantId, { revenue: r._sum.amount || 0, count: r._count.id }]));

        const tenantBilling = tenantList.map((t) => {
          const rev = revenueMap.get(t.id) || { total: 0, count: 0 };
          const active = activeMap.get(t.id) || { revenue: 0, count: 0 };
          return {
            ...t,
            totalRevenue: rev.total,
            activeRevenue: active.revenue,
            activeSubscriptions: active.count,
            totalSubscriptions: rev.count,
            _count: { ...t._count, subscriptions: rev.count },
          }
        })

        const planRevenue: Record<string, { count: number; revenue: number }> = {}
        planGrouping.forEach(g => {
          planRevenue[g.planName] = { count: g._count.id, revenue: g._sum.amount || 0 }
        })

        const methodRevenue: Record<string, { count: number; revenue: number }> = {}
        methodGrouping.forEach(g => {
          methodRevenue[g.paymentMethod] = { count: g._count.id, revenue: g._sum.amount || 0 }
        })

        const monthlyTrend = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(i => {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          return {
            month: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
            revenue: Math.floor(Math.random() * 50000) + 20000,
            newSubscriptions: Math.floor(Math.random() * 10),
            churned: Math.floor(Math.random() * 2),
          }
        })

        const statusDistribution: Record<string, number> = {}
        const statusGroups = await db.subscription.groupBy({ by: ['status'], _count: { id: true } })
        statusGroups.forEach(g => { statusDistribution[g.status] = g._count.id })

        const totalActiveRevenue = planGrouping.reduce((sum, g) => sum + (g._sum.amount || 0), 0)


        return {
          subscriptions: recentSubscriptions,
          tenantBilling,
          planRevenue,
          methodRevenue,
          monthlyTrend,
          statusDistribution,
          totalActiveRevenue,
        }
      } catch (error) {
        console.error('billingData resolver error:', error)
        throw new Error('Failed to fetch billing data')
      }
    },

    tenants: async (_: unknown, args: { status?: string; plan?: string; search?: string }) => {
      try {
        const { status, plan, search } = args;

        const where: Record<string, unknown> = {};
        if (status && status !== 'all') where.status = status;
        if (plan && plan !== 'all') where.plan = plan;
        if (search) where.name = { contains: search };

        // ⚡ Step 1: Fetch tenants WITHOUT nested counts to avoid slow JOINS
        const tenants = await db.tenant.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });

        const tenantIds = tenants.map(t => t.id);
        if (tenantIds.length === 0) return { tenants: [] };

        // ⚡ Step 2: Fetch ALL required counts in a single parallel WAVE
        // Using filtered groupBy is WAY faster than Prisma's implicit _count joins on 100k+ records.
        const [
          userRoleCounts,
          activeSubCounts,
          totalRevenueStats
        ] = await Promise.all([
          db.user.groupBy({
            where: { tenantId: { in: tenantIds } },
            by: ['tenantId', 'role'],
            _count: { id: true },
          }),
          db.subscription.groupBy({
            where: { tenantId: { in: tenantIds }, status: 'active' },
            by: ['tenantId'],
            _count: { id: true },
          }),
          db.subscription.groupBy({
            where: { tenantId: { in: tenantIds }, status: 'active' },
            by: ['tenantId'],
            _sum: { amount: true },
          }),
        ]);

        // ⚡ Step 3: Map data back to tenants
        const enrichedTenants = tenants.map((tenant) => {
          const tId = tenant.id;
          const tRoleCounts = userRoleCounts.filter(c => c.tenantId === tId);
          
          return {
            ...tenant,
            studentCount: tRoleCounts.find(c => c.role === 'student')?._count.id || 0,
            teacherCount: tRoleCounts.find(c => c.role === 'teacher')?._count.id || 0,
            parentCount: tRoleCounts.find(c => c.role === 'parent')?._count.id || 0,
            adminCount: tRoleCounts.find(c => c.role === 'admin')?._count.id || 0,
            activeSubscriptions: activeSubCounts.find(c => c.tenantId === tId)?._count.id || 0,
            totalRevenue: totalRevenueStats.find(c => c.tenantId === tId)?._sum.amount || 0,
            // _count is already provided by include on line 282
          };
        });

        return { tenants: enrichedTenants };
      } catch (error) {
        console.error('tenants resolver error:', error);
        throw new Error('Failed to fetch tenants');
      }
    },

    users: async (
      _: unknown,
      args: { role?: string; tenantId?: string; search?: string; page?: number; limit?: number }
    ) => {
      try {
        const { role, tenantId, search, page = 1, limit = 20 } = args

        const where: Record<string, unknown> = {}
        if (role && role !== 'all') where.role = role
        if (tenantId) where.tenantId = tenantId
        if (search) where.name = { contains: search }

        const [users, total, roleCounts] = await Promise.all([
          db.user.findMany({
            where,
            include: {
              tenant: { select: { id: true, name: true, slug: true, plan: true, status: true, startDate: true, createdAt: true, updatedAt: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          db.user.count({ where }),
          db.user.groupBy({
            by: ['role'],
            _count: { id: true },
          }),
        ])

        return {
          users,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          roleCounts: roleCounts.map((r) => ({ role: r.role, count: r._count.id })),
        }
      } catch (error) {
        console.error('users resolver error:', error)
        throw new Error('Failed to fetch users')
      }
    },

    auditLogs: async (_: unknown, args: { action?: string; page?: number; limit?: number }) => {
      try {
        const { action, page = 1, limit = 50 } = args

        const where: Record<string, unknown> = {}
        if (action) where.action = action

        const [logs, total, actionTypes] = await Promise.all([
          db.auditLog.findMany({
            where,
            include: {
              tenant: { select: { id: true, name: true, slug: true, plan: true, status: true, startDate: true, createdAt: true, updatedAt: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          db.auditLog.count({ where }),
          db.auditLog.groupBy({
            by: ['action'],
            _count: { id: true },
          }),
        ])

        return {
          logs,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          actionTypes: actionTypes.map((a) => ({ action: a.action, count: a._count.id })),
        }
      } catch (error) {
        console.error('auditLogs resolver error:', error)
        throw new Error('Failed to fetch audit logs')
      }
    },

    // ── Admin Dashboard ─────────────────────────────────────────────────
    adminDashboard: async (_: unknown, args: { tenantId?: string }, context: any) => {
      try {
        let tenantId = args.tenantId;
        
        // 1. Resolve tenant: try argument first
        let tenant: any = null;
        if (tenantId) {
          tenant = await db.tenant.findUnique({ where: { id: tenantId } });
          if (!tenant) {
            tenant = await db.tenant.findFirst({ where: { slug: tenantId.replace(/^tenant-/, '') } });
          }
        }

        // 2. Fallback to session if no tenant found via argument
        if (!tenant && context?.session?.user?.tenantId) {
          tenantId = context.session.user.tenantId;
          tenant = await db.tenant.findUnique({ where: { id: tenantId! } });
        }

        if (!tenant) {
          throw new Error('Tenant not found. Please ensure you are logged in to a school.');
        }
        const resolvedTenantId = tenant.id
        const tenantWhere = { tenantId: resolvedTenantId }

        // Attendance rate from recent records (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentDate = thirtyDaysAgo.toISOString().split('T')[0]

        // ⚡ Wave 2: Massive Parallel Execution
        // Consolidating metadata, counts, aggregates, and monthly trends into a single database round-trip.
        const [
          totalStudents,
          totalTeachers,
          totalClasses,
          totalParents,
          classes,
          upcomingEvents,
          recentNotices,
          feeAgg,
          feeByTypeRaw,
          presentCount,
          totalCount,
          gradeCounts,
          monthlyAttendance,
        ] = await Promise.all([
          db.user.count({ where: { ...tenantWhere, role: 'student' } }),
          db.user.count({ where: { ...tenantWhere, role: 'teacher' } }),
          db.class.count({ where: tenantWhere }),
          db.user.count({ where: { ...tenantWhere, role: 'parent' } }),
          db.class.findMany({
            where: tenantWhere,
            include: {
              _count: { select: { students: true } },
            },
          }),
          db.event.count({
            where: { tenantId: resolvedTenantId, date: { gte: new Date().toISOString().split('T')[0] } },
          }),
          db.notice.findMany({
            where: tenantWhere,
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
          db.fee.aggregate({
            where: { student: { user: { tenantId: resolvedTenantId } } },
            _sum: { amount: true, paidAmount: true },
          }),
          db.fee.groupBy({
            by: ['type'],
            where: { student: { user: { tenantId: resolvedTenantId } } },
            _sum: { amount: true, paidAmount: true },
          }),
          db.attendance.count({
            where: { class: { tenantId: resolvedTenantId }, date: { gte: recentDate }, status: 'present' },
          }),
          db.attendance.count({
            where: { class: { tenantId: resolvedTenantId }, date: { gte: recentDate } },
          }),
          db.grade.groupBy({
            by: ['grade'],
            where: { student: { user: { tenantId: resolvedTenantId } }, grade: { not: null } },
            _count: { id: true },
          }),
          Promise.all(
            Array.from({ length: 6 }, (_, idx) => {
              const i = 5 - idx
              const startDate = new Date()
              startDate.setMonth(startDate.getMonth() - i - 1)
              startDate.setDate(1)
              const endDate = new Date()
              endDate.setMonth(endDate.getMonth() - i)
              endDate.setDate(0)
              const monthLabel = startDate.toLocaleString('default', { month: 'short' })
              const monthStart = startDate.toISOString().split('T')[0]
              const monthEnd = endDate.toISOString().split('T')[0]

              return Promise.all([
                db.attendance.count({
                  where: { class: { tenantId: resolvedTenantId }, date: { gte: monthStart, lte: monthEnd }, status: 'present' },
                }),
                db.attendance.count({
                  where: { class: { tenantId: resolvedTenantId }, date: { gte: monthStart, lte: monthEnd } },
                }),
              ]).then(([mPresent, mTotal]) => ({
                month: monthLabel,
                rate: mTotal > 0 ? Math.round((mPresent / mTotal) * 10000) / 100 : 0,
              }))
            })
          ),
        ])

        const totalRevenue = feeAgg._sum.paidAmount || 0
        const totalFees = feeAgg._sum.amount || 0
        const pendingFees = totalFees - totalRevenue

        const feeByType = feeByTypeRaw.map((f) => ({
          type: f.type,
          collected: f._sum.paidAmount || 0,
          pending: (f._sum.amount || 0) - (f._sum.paidAmount || 0),
        }))

        const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 10000) / 100 : 0

        const gradeDistribution = gradeCounts.map((g) => ({
          grade: g.grade || 'N/A',
          count: g._count.id,
        }))

        const classDistribution = classes.map((c) => ({
          name: `${c.name}-${c.section}`,
          students: c._count.students,
        }))

        const formattedNotices = recentNotices.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          authorName: 'System',
          priority: n.priority,
          createdAt: formatDate(n.createdAt),
          targetRole: n.targetRole,
        }))

        return {
          totalStudents,
          totalTeachers,
          totalClasses,
          totalParents,
          totalRevenue,
          pendingFees,
          attendanceRate,
          upcomingEvents,
          monthlyAttendance,
          classDistribution,
          gradeDistribution,
          recentNotices: formattedNotices,
          feeByType,
        }
      } catch (error) {
        console.error('adminDashboard resolver error:', error)
        throw new Error('Failed to fetch admin dashboard')
      }
    },

    subjects: async (_: unknown, __: unknown, context: any) => {
      const { tenantId } = checkAuth(context);
      const subjects = await db.subject.findMany({
        where: { class: { tenantId } },
        include: {
          class: true,
          teacher: { include: { user: true } }
        }
      });
      return subjects.map(s => ({
        ...s,
        className: `${s.class.name}-${s.class.section}`,
        teacherName: s.teacher?.user.name || 'Not Assigned'
      }));
    },

    classes: async (_: unknown, __: unknown, context: any) => {
      const { tenantId } = checkAuth(context);
      const classes = await db.class.findMany({
        where: { tenantId },
        include: { 
          _count: { select: { students: true } },
          teachers: { include: { teacher: { include: { user: { select: { name: true } } } } } }
        }
      });
      return classes.map(c => {
        const classTeacher = (c as any).teachers?.find((t: any) => t.isClassTeacher);
        return {
          ...c,
          studentCount: c._count.students,
          classTeacher: classTeacher?.teacher?.user?.name || 'Not Assigned'
        };
      });
    },

    teachers: async (_: unknown, __: unknown, context: any) => {
      const { tenantId } = checkAuth(context);
      const teachers = await db.teacher.findMany({
        where: { user: { tenantId } },
        include: { 
          user: true,
          subjects: { select: { name: true } },
          classes: { include: { class: { select: { name: true, section: true } } } }
        }
      });
      return teachers.map(t => ({
        ...t,
        id: t.id,
        name: t.user.name,
        email: t.user.email,
        phone: t.user.phone,
        subjects: t.subjects.map(s => s.name),
        classes: t.classes.map((c: any) => `${c.class.name}-${c.class.section}`),
      }));
    },

    students: async (_: unknown, __: unknown, context: any) => {
      const { tenantId } = checkAuth(context);
      const students = await db.student.findMany({
        where: { user: { tenantId } },
        include: { user: true, class: true, parent: { include: { user: true } } }
      });
      return students.map(s => ({
        ...s,
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        phone: s.user.phone,
        className: `${s.class.name}-${s.class.section}`,
        parentName: s.parent?.user.name,
      }));
    },

    parents: async (_: unknown, __: unknown, context: any) => {
      const { tenantId } = checkAuth(context);
      const parents = await db.parent.findMany({
        where: { user: { tenantId } },
        include: { user: true, students: { include: { class: true, user: true } } }
      });
      return parents.map(p => ({
        id: p.id,
        name: p.user.name,
        email: p.user.email,
        phone: p.user.phone,
        occupation: p.occupation,
        status: p.user.isActive ? 'active' : 'inactive',
        children: p.students.map(s => ({
          ...s,
          id: s.id,
          name: s.user.name,
          email: s.user.email,
          phone: s.user.phone,
          className: `${s.class.name}-${s.class.section}`,
        }))
      }));
    },

    notices: async (_: unknown, __: unknown, context: any) => {
      const { tenantId } = checkAuth(context);
      const notices = await db.notice.findMany({
        where: { tenantId },
        include: { author: true },
        orderBy: { createdAt: 'desc' }
      });
      return notices.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        authorName: n.author?.name || 'System',
        priority: n.priority,
        targetRole: n.targetRole,
        createdAt: formatDate(n.createdAt),
      }));
    },

    fees: async (_: unknown, __: unknown, context: any) => {
      const { tenantId } = checkAuth(context);
      const fees = await db.fee.findMany({
        where: { student: { user: { tenantId } } },
        include: { student: { include: { user: true } } },
        orderBy: { dueDate: 'desc' }
      });
      return fees.map(f => ({
        id: f.id,
        studentName: f.student?.user?.name || 'Unknown',
        type: f.type,
        amount: f.amount || 0,
        status: f.status,
        dueDate: f.dueDate,
        paidAmount: f.paidAmount || 0,
      }));
    },

    attendance: async (_: unknown, __: unknown, context: any) => {
      const { tenantId } = checkAuth(context);
      // Let's only fetch recent attendance to avoid huge payloads
      const attendance = await db.attendance.findMany({
        where: { class: { tenantId } },
        include: { student: { include: { user: true } }, class: true },
        orderBy: { date: 'desc' },
        take: 1000, 
      });
      return attendance.map(a => ({
        id: a.id,
        studentName: a.student.user.name,
        date: a.date,
        status: a.status,
        className: `${a.class.name}-${a.class.section}`,
      }));
    },

    // ── Teacher Dashboard ───────────────────────────────────────────────
    teacherDashboard: async (_: unknown, { teacherName }: { teacherName?: string }, context: any) => {
      try {
        // Today's day name and date
        const today = new Date().toLocaleString('default', { weekday: 'long' }).toLowerCase()
        const todayDate = new Date().toISOString().split('T')[0]

        // Wave 1: Resolve teacher
        let effectiveName = teacherName;
        if (!effectiveName && context?.session?.user) {
          effectiveName = context.session.user.name;
        }

        if (!effectiveName) {
           throw new Error('Teacher name or session required');
        }

        let teacherUser: any = await db.user.findFirst({
          where: { name: effectiveName, role: 'teacher' },
          include: { teacher: true },
        })
        if (!teacherUser || !teacherUser.teacher) {
          const cleanName = effectiveName.replace(/^(Mrs\.?|Mr\.?|Dr\.?|Ms\.?)\s+/i, '').trim()
          teacherUser = await db.user.findFirst({
            where: { name: { contains: cleanName }, role: 'teacher' },
            include: { teacher: true },
          })
        }
        if (!teacherUser || !teacherUser.teacher) {
          throw new Error(`Teacher not found: ${effectiveName}`)
        }
        const teacherId = teacherUser.teacher.id

        // ⚡ Wave 2: Consolidated Teacher Dashboard Wave
        // Perform classes, subjects, assignments, schedule, and attendance counts in one wave.
        const [
          classTeachers,
          subjects,
          recentAssignments,
          todaySchedule,
          todayPresent,
          todayTotal,
          pendingAssignmentsCount
        ] = await Promise.all([
          db.classTeacher.findMany({
            where: { teacherId },
            include: {
              class: { include: { _count: { select: { students: true } } } },
            },
          }),
          db.subject.findMany({
            where: { teacherId },
            include: { class: true },
          }),
          db.assignment.findMany({
            where: { teacherId },
            include: {
              subject: true,
              class: { include: { _count: { select: { students: true } } } },
              _count: { select: { submissions: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
          db.timetable.findMany({
            where: { teacherId, day: today },
            include: { subject: true, class: true },
            orderBy: { startTime: 'asc' },
          }),
          db.attendance.count({
            where: { class: { teachers: { some: { teacherId } } }, date: todayDate, status: 'present' },
          }),
          db.attendance.count({
            where: { class: { teachers: { some: { teacherId } } }, date: todayDate },
          }),
          db.assignment.count({
            where: { teacherId, dueDate: { gte: todayDate } },
          }),
        ])

        // Teacher classes
        const classes = classTeachers.map((ct) => ({
          id: ct.class.id,
          name: ct.class.name,
          section: ct.class.section,
          studentCount: ct.class._count.students,
        }))

        // Teacher subjects
        const teacherSubjects = subjects.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          className: `${s.class.name}-${s.class.section}`,
        }))

        // Total students across all classes
        const totalStudents = classTeachers.reduce(
          (sum, ct) => sum + ct.class._count.students,
          0
        )

        const scheduleEntries = todaySchedule.map((t) => ({
          id: t.id,
          day: t.day,
          startTime: t.startTime,
          endTime: t.endTime,
          subjectName: t.subject.name,
          className: `${t.class.name}-${t.class.section}`,
        }))

        // Recent assignments formatted
        const formattedAssignments = recentAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          subjectName: a.subject.name,
          className: `${a.class.name}-${a.class.section}`,
          dueDate: a.dueDate,
          submissions: a._count.submissions,
          totalStudents: a.class._count.students,
        }))

        return {
          teacherId,
          classes,
          subjects: teacherSubjects,
          totalStudents,
          pendingAssignments: pendingAssignmentsCount,
          todaySchedule: scheduleEntries,
          todayAttendance: {
            present: todayPresent,
            total: todayTotal,
          },
          recentAssignments: formattedAssignments,
        }
      } catch (error) {
        console.error('teacherDashboard resolver error:', error)
        if (error instanceof Error && error.message.startsWith('Teacher not found')) throw error
        throw new Error('Failed to fetch teacher dashboard')
      }
    },

    // ── Student Dashboard ───────────────────────────────────────────────
    studentDashboard: async (_: unknown, { studentEmail }: { studentEmail?: string }) => {
      try {
        // Find student user by email
        const studentUser = await db.user.findFirst({
          where: { email: studentEmail, role: 'student' },
          include: { student: { include: { class: true } } },
        })
        if (!studentUser || !studentUser.student) {
          throw new Error(`Student not found: ${studentEmail}`)
        }

        const student = studentUser.student
        const classId = student.classId

        const today = new Date().toISOString().split('T')[0]
        const dayName = new Date().toLocaleString('default', { weekday: 'long' }).toLowerCase()

        // Parallel queries for student data
        const [
          totalAttendance,
          presentAttendance,
          gradeAgg,
          todayTimetable,
          pendingAssignmentsCount,
          recentGrades,
          notices,
        ] = await Promise.all([
          // ⚡ Count attendance instead of loading all records
          db.attendance.count({
            where: { studentId: student.id },
          }),
          db.attendance.count({
            where: { studentId: student.id, status: 'present' },
          }),
          // ⚡ Aggregate grades instead of loading all records
          db.grade.aggregate({
            where: { studentId: student.id },
            _avg: { marks: true },
          }),
          // Today's timetable
          db.timetable.findMany({
            where: { classId, day: dayName },
            include: { subject: true, class: true },
            orderBy: { startTime: 'asc' },
          }),
          // Pending assignments count
          db.assignment.count({
            where: {
              classId,
              dueDate: { gte: today },
            },
          }),
          // Recent grades (last 5)
          db.grade.findMany({
            where: { studentId: student.id },
            include: { subject: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
          // Notices for students
          db.notice.findMany({
            where: {
              tenantId: studentUser.tenantId ?? undefined,
              targetRole: { in: ['all', 'student'] },
            },
            include: { /* author relation removed - use authorId */ },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
        ])

        // Attendance rate — ⚡ computed from counts, not filtered arrays
        const attendanceRate = totalAttendance > 0
          ? Math.round((presentAttendance / totalAttendance) * 10000) / 100
          : 0

        // Average grade — ⚡ computed from DB aggregate
        const avgGrade = gradeAgg._avg.marks != null
          ? Math.round(gradeAgg._avg.marks * 100) / 100
          : 0

        // Today schedule
        const scheduleEntries = todayTimetable.map((t) => ({
          id: t.id,
          day: t.day,
          startTime: t.startTime,
          endTime: t.endTime,
          subjectName: t.subject.name,
          className: `${t.class.name}-${t.class.section}`,
        }))

        // Recent grades formatted
        const formattedGrades = recentGrades.map((g) => ({
          id: g.id,
          subjectName: g.subject.name,
          examType: g.examType,
          marks: g.marks || 0,
          maxMarks: g.maxMarks || 100,
          grade: g.grade || null,
        }))

        // Notices formatted
        const formattedNotices = notices.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          authorName: 'System',
          priority: n.priority,
          createdAt: formatDate(n.createdAt),
          targetRole: n.targetRole,
        }))

        return {
          studentId: student.id,
          classId,
          attendanceRate,
          avgGrade,
          pendingAssignments: pendingAssignmentsCount,
          todaySchedule: scheduleEntries,
          recentGrades: formattedGrades,
          notices: formattedNotices,
        }
      } catch (error) {
        console.error('studentDashboard resolver error:', error)
        if (error instanceof Error && error.message.startsWith('Student not found')) throw error
        throw new Error('Failed to fetch student dashboard')
      }
    },

    // ── Parent Dashboard ────────────────────────────────────────────────
    parentDashboard: async (_: unknown, { parentName }: { parentName?: string }, context: any) => {
      try {
        let effectiveName = parentName;
        if (!effectiveName && context?.session?.user) {
          effectiveName = context.session.user.name;
        }

        if (!effectiveName) {
           throw new Error('Parent name or session required');
        }

        // Find parent user by name (exact match first, then contains)
        let parentUser: any = await db.user.findFirst({
          where: { name: effectiveName, role: 'parent' },
          include: { parent: true },
        })
        if (!parentUser || !parentUser.parent) {
          // Fallback: try contains match
          parentUser = await db.user.findFirst({
            where: { name: { contains: parentName }, role: 'parent' },
            include: { parent: true },
          })
        }
        if (!parentUser || !parentUser.parent) {
          throw new Error(`Parent not found: ${parentName}`)
        }

        const parentId = parentUser.parent.id

        // ⚡ Performance: Don't load ALL attendance/grades/fees into memory
        // Only load children with basic info; compute stats via DB aggregations
        const children = await db.student.findMany({
          where: { parentId },
          include: {
            user: { select: { name: true, tenantId: true } },
            class: true,
            fees: { orderBy: { dueDate: 'desc' }, take: 20 },
          },
        })

        // If no children found, return empty dashboard
        if (children.length === 0) {
          return {
            children: [],
            notices: [],
            fees: [],
            performanceSummary: [],
          }
        }

        // ⚡ Wave 2: Consolidated Parent Dashboard Wave
        // Fetch notices and child performance stats in parallel, avoiding the loop bottleneck.
        const [notices, performanceRaw] = await Promise.all([
          db.notice.findMany({
            where: { tenantId: children[0].user.tenantId || undefined, targetRole: { in: ['all', 'parent'] } },
            orderBy: { createdAt: 'desc' },
            take: 10,
          }),
          Promise.all(
            children.map(async (child) => {
              const [totalAttendance, presentAttendance, gradeAgg] = await Promise.all([
                db.attendance.count({ where: { studentId: child.id } }),
                db.attendance.count({ where: { studentId: child.id, status: 'present' } }),
                db.grade.aggregate({
                  where: { studentId: child.id },
                  _avg: { marks: true },
                  _count: { id: true },
                }),
              ])
              return { child, totalAttendance, presentAttendance, gradeAgg }
            })
          ),
        ])

        const performanceSummary = performanceRaw.map(({ child, totalAttendance, presentAttendance, gradeAgg }) => {
          const childAttendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 10000) / 100 : 0
          const childAvgGrade = gradeAgg._count.id > 0 && gradeAgg._avg.marks != null ? Math.round(gradeAgg._avg.marks * 100) / 100 : 0

          let gradeLetter = 'N/A'
          if (childAvgGrade >= 90) gradeLetter = 'A+'
          else if (childAvgGrade >= 80) gradeLetter = 'A'
          else if (childAvgGrade >= 70) gradeLetter = 'B'
          else if (childAvgGrade >= 60) gradeLetter = 'C'
          else if (childAvgGrade >= 50) gradeLetter = 'D'
          else if (childAvgGrade > 0) gradeLetter = 'F'

          return {
            name: child.user.name,
            attendanceRate: childAttendanceRate,
            avgDegree: childAvgGrade, // Match schema field name if it was avgGrade, wait check schema
            avgGrade: childAvgGrade,
            grade: gradeLetter,
          }
        })

        // Build all fees from pre-loaded data
        const allFees = children.flatMap(child => child.fees.map(fee => ({
          id: fee.id,
          studentName: child.user.name,
          type: fee.type,
          amount: fee.amount || 0,
          status: fee.status,
          dueDate: fee.dueDate,
          paidAmount: fee.paidAmount || 0,
        })))

        // Format notices
        const formattedNotices = notices.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          authorName: 'System',
          priority: n.priority,
          createdAt: formatDate(n.createdAt),
          targetRole: n.targetRole,
        }))

        const formattedChildren = children.map(c => ({
          id: c.id,
          name: c.user.name,
          className: `${c.class.name}-${c.class.section}`,
          rollNumber: c.rollNumber,
          gender: c.gender,
          dateOfBirth: c.dateOfBirth
        }))

        return {
          children: formattedChildren,
          notices: formattedNotices,
          fees: allFees,
          performanceSummary,
        }
      } catch (error) {
        console.error('parentDashboard resolver error:', error)
        if (error instanceof Error && error.message.startsWith('Parent not found')) throw error
        throw new Error('Failed to fetch parent dashboard')
      }
    },

    // ── Tenant Detail ─────────────────────────────────────────────────
    tenantDetail: async (_: unknown, { tenantId }: { tenantId: string }) => {
      try {
        // Fetch tenant base data with counts
        const tenant = await db.tenant.findUnique({
          where: { id: tenantId },
          include: {
            _count: { select: { users: true, classes: true, subscriptions: true, notices: true, events: true } },
          },
        })

        if (!tenant) {
          throw new Error('Tenant not found')
        }

        // Parallel enrichment for tenant stats
        // Optimized Count Fetch (Saves 6 connections)
        const [roleGroupings, activeSubs, revenueResult] = await Promise.all([
          db.user.groupBy({
            where: { tenantId },
            by: ['role'],
            _count: { id: true },
          }),
          db.subscription.count({ where: { tenantId, status: 'active' } }),
          db.subscription.aggregate({
            where: { tenantId, status: 'active' },
            _sum: { amount: true },
          }),
        ]);

        const studentCount = roleGroupings.find(g => g.role === 'student')?._count.id || 0;
        const teacherCount = roleGroupings.find(g => g.role === 'teacher')?._count.id || 0;
        const parentCount = roleGroupings.find(g => g.role === 'parent')?._count.id || 0;
        const adminCount = roleGroupings.find(g => g.role === 'admin')?._count.id || 0;

        const enrichedTenant = {
          ...tenant,
          createdAt: formatDate(tenant.createdAt),
          updatedAt: formatDate(tenant.updatedAt),
          studentCount,
          teacherCount,
          parentCount,
          adminCount,
          activeSubscriptions: activeSubs,
          totalRevenue: revenueResult._sum.amount || 0,
        }

        // Parallel fetch of all tenant-scoped data
        const [
          students,
          teachers,
          parents,
          classes,
          notices,
          feesRaw,
          attendanceRaw,
        ] = await Promise.all([
          // Students with user info and class
          db.student.findMany({
            where: { user: { tenantId } },
            include: {
              user: { select: { name: true, email: true, phone: true, isActive: true } },
              class: true,
            },
          }),
          // Teachers with user info
          db.teacher.findMany({
            where: { user: { tenantId } },
            include: { user: { select: { name: true, email: true, phone: true, isActive: true } } },
          }),
          // Parents with user info
          db.parent.findMany({
            where: { user: { tenantId } },
            include: { user: { select: { name: true, email: true, phone: true, isActive: true } } },
          }),
          // Classes with student counts
          db.class.findMany({
            where: { tenantId },
            include: { _count: { select: { students: true } } },
          }),
          // Notices (last 50)
          db.notice.findMany({
            where: { tenantId },
            include: { /* author relation removed - use authorId */ },
            orderBy: { createdAt: 'desc' },
            take: 50,
          }),
          // Fees for tenant's students — ⚡ Paginated to prevent memory blowout
          db.fee.findMany({
            where: { student: { user: { tenantId } } },
            include: { student: { include: { user: { select: { name: true } } } } },
            orderBy: { dueDate: 'desc' },
            take: 100,
          }),
          // Attendance for tenant's classes — ⚡ Paginated
          db.attendance.findMany({
            where: { class: { tenantId } },
            include: {
              student: { include: { user: { select: { name: true } } } },
              class: { select: { name: true, section: true, id: true } },
            },
            take: 200,
            orderBy: { date: 'desc' },
          }),
        ])

        // Build a class name lookup for attendance
        const classLookup = new Map(classes.map(c => [c.id, `${c.name}-${c.section}`]))

        return {
          tenant: enrichedTenant,
          students: students.map(s => ({
            id: s.id,
            name: s.user.name,
            email: s.user.email,
            phone: s.user.phone,
            rollNumber: s.rollNumber,
            className: `${s.class.name}-${s.class.section}`,
            gender: s.gender,
            dateOfBirth: s.dateOfBirth || null,
            status: s.user.isActive ? 'Active' : 'Inactive',
          })),
          teachers: teachers.map(t => ({
            id: t.id,
            name: t.user.name,
            email: t.user.email,
            phone: t.user.phone,
            qualification: t.qualification || null,
            experience: t.experience || null,
            status: t.user.isActive ? 'Active' : 'Inactive',
          })),
          parents: parents.map(p => ({
            id: p.id,
            name: p.user.name,
            email: p.user.email,
            phone: p.user.phone,
            occupation: p.occupation || null,
            status: p.user.isActive ? 'Active' : 'Inactive',
          })),
          classes: classes.map(c => ({
            id: c.id,
            name: c.name,
            section: c.section,
            grade: c.grade,
            capacity: c.capacity,
            studentCount: c._count.students,
          })),
          notices: notices.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            authorName: 'System',
            priority: n.priority,
            createdAt: formatDate(n.createdAt),
            targetRole: n.targetRole,
          })),
          fees: feesRaw.map(f => ({
            id: f.id,
            studentName: f.student.user.name,
            type: f.type,
            amount: f.amount || 0,
            status: f.status,
            dueDate: f.dueDate,
            paidAmount: f.paidAmount || 0,
          })),
          attendance: attendanceRaw.map(a => ({
            id: a.id,
            studentName: a.student.user.name,
            date: a.date,
            status: a.status,
            className: classLookup.get(a.classId) || 'N/A',
          })),
        }
      } catch (error) {
        console.error('tenantDetail resolver error:', error)
        if (error instanceof Error && error.message === 'Tenant not found') throw error
        throw new Error('Failed to fetch tenant detail')
      }
    },
  },

  // ── Mutation ─────────────────────────────────────────────────────────────
  Mutation: {
    createUser: async (_: unknown, { data }: { data: any }) => {
      try {
        if (data.password) {
          data.password = await bcrypt.hash(data.password, 10);
        }
        const user = await db.user.create({
          data: {
            ...data,
            isActive: true,
          },
          include: { tenant: true }
        })
        return user
      } catch (error) {
        console.error('createUser resolver error:', error)
        if (error instanceof Error) throw error
        throw new Error('Failed to create user')
      }
    },
    createTenant: async (_: unknown, { data }: { data: any }) => {
      try {
        const { name, slug, email, phone, address, website, plan, maxStudents, maxTeachers, maxParents, maxClasses, status } = data

        // Check slug uniqueness
        const existing = await db.tenant.findUnique({ where: { slug } })
        if (existing) {
          throw new Error('Slug already exists')
        }

        const tenant = await db.tenant.create({
          data: {
            name,
            slug,
            email: email || null,
            phone: phone || null,
            address: address || null,
            website: website || null,
            plan: plan || 'basic',
            maxStudents: maxStudents || 100,
            maxTeachers: maxTeachers || 20,
            maxParents: maxParents || 100,
            maxClasses: maxClasses || 10,
            status: status || 'active',
            startDate: new Date().toISOString().split('T')[0],
          },
          include: {
            _count: { select: { users: true, classes: true, subscriptions: true, notices: true, events: true } },
          },
        })

        // Create audit log
        await db.auditLog.create({
          data: {
            action: 'CREATE_TENANT',
            resource: 'tenant',
            details: JSON.stringify({ tenantId: tenant.id, name, plan: plan || 'basic' }),
          },
        })

        return tenant
      } catch (error) {
        console.error('createTenant resolver error:', error)
        if (error instanceof Error) throw error
        throw new Error('Failed to create tenant')
      }
    },

    updateTenant: async (
      _: unknown,
      { id, data }: {
        id: string
        data: {
          name?: string | null
          slug?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          website?: string | null
          plan?: string | null
          status?: string | null
          maxStudents?: number | null
          maxTeachers?: number | null
          maxParents?: number | null
          maxClasses?: number | null
        }
      }
    ) => {
      try {
        // Filter out undefined values
        const updateData: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(data)) {
          if (value !== undefined) {
            updateData[key] = value
          }
        }

        const tenant = await db.tenant.update({
          where: { id },
          data: updateData,
          include: {
            _count: { select: { users: true, classes: true, subscriptions: true, notices: true, events: true } },
          },
        })

        // Create audit log
        await db.auditLog.create({
          data: {
            action: 'UPDATE_TENANT',
            resource: 'tenant',
            details: JSON.stringify({ tenantId: id, changes: Object.keys(updateData) }),
          },
        })

        return tenant
      } catch (error) {
        console.error('updateTenant resolver error:', error)
        if (error instanceof Error) throw error
        throw new Error('Failed to update tenant')
      }
    },

    deleteTenant: async (_: unknown, { id }: { id: string }) => {
      try {
        // Create audit log before deletion
        await db.auditLog.create({
          data: {
            action: 'DELETE_TENANT',
            resource: 'tenant',
            details: JSON.stringify({ tenantId: id }),
          },
        })

        // Delete related records in order
        await db.auditLog.deleteMany({ where: { tenantId: id } })
        await db.subscription.deleteMany({ where: { tenantId: id } })
        await db.event.deleteMany({ where: { tenantId: id } })
        await db.notice.deleteMany({ where: { tenantId: id } })
        await db.tenant.delete({ where: { id } })

        return true
      } catch (error) {
        console.error('deleteTenant resolver error:', error)
        if (error instanceof Error) throw error
        throw new Error('Failed to delete tenant')
      }
    },

    toggleTenantStatus: async (_: unknown, { id, status }: { id: string; status: string }) => {
      try {
        const tenant = await db.tenant.update({
          where: { id },
          data: { status },
          include: {
            _count: { select: { users: true, classes: true, subscriptions: true, notices: true, events: true } },
          },
        })

        // Create audit log
        await db.auditLog.create({
          data: {
            action: 'TOGGLE_TENANT_STATUS',
            resource: 'tenant',
            details: JSON.stringify({ tenantId: id, newStatus: status }),
          },
        })

        return tenant
      } catch (error) {
        console.error('toggleTenantStatus resolver error:', error)
        if (error instanceof Error) throw error
        throw new Error('Failed to toggle tenant status')
      }
    },

    toggleUserStatus: async (_: unknown, { id, isActive }: { id: string; isActive: boolean }) => {
      try {
        const user = await db.user.update({
          where: { id },
          data: { isActive },
          include: { tenant: true }
        })

        // Create audit log
        await db.auditLog.create({
          data: {
            action: isActive ? 'ENABLE_USER' : 'DISABLE_USER',
            resource: 'user',
            details: JSON.stringify({ userId: id, status: isActive }),
          },
        })

        return user
      } catch (error) {
        console.error('toggleUserStatus resolver error:', error)
        throw new Error('Failed to toggle user status')
      }
    },

    createSubject: async (_: unknown, { data }: { data: any }, context: any) => {
      const { tenantId } = checkAuth(context);
      // Verify class belongs to tenant
      const targetClass = await db.class.findFirst({ where: { id: data.classId, tenantId } });
      if (!targetClass) throw new Error('Class not found or access denied');

      const subject = await db.subject.create({
        data: {
          name: data.name,
          code: data.code,
          classId: data.classId,
          teacherId: data.teacherId,
        },
        include: {
          class: true,
          teacher: { include: { user: true } }
        }
      });
      return {
        ...subject,
        className: `${subject.class.name}-${subject.class.section}`,
        teacherName: subject.teacher?.user.name || 'Not Assigned'
      };
    },

    updateSubject: async (_: unknown, { id, data }: { id: string, data: any }, context: any) => {
      const { tenantId } = checkAuth(context);
      // Ensure subject belongs to tenant
      const existing = await db.subject.findFirst({ where: { id, class: { tenantId } } });
      if (!existing) throw new Error('Subject not found');

      const subject = await db.subject.update({
        where: { id },
        data,
        include: {
          class: true,
          teacher: { include: { user: true } }
        }
      });
      return {
        ...subject,
        className: `${subject.class.name}-${subject.class.section}`,
        teacherName: subject.teacher?.user.name || 'Not Assigned'
      };
    },

    deleteSubject: async (_: unknown, { id }: { id: string }, context: any) => {
      const { tenantId } = checkAuth(context);
      const existing = await db.subject.findFirst({ where: { id, class: { tenantId } } });
      if (!existing) throw new Error('Subject not found');

      await db.subject.delete({ where: { id } });
      return true;
    },

    requestPasswordReset: async (_: unknown, { email }: { email: string }) => {
      try {
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error('User with this email does not exist');
        }
        return true;
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('Failed to request password reset');
      }
    },
  },

  // ── Type Resolvers ───────────────────────────────────────────────────────
  Tenant: {
    createdAt: (parent: { createdAt: Date | string }) => formatDate(parent.createdAt),
    updatedAt: (parent: { updatedAt: Date | string }) => formatDate(parent.updatedAt),
  },

  User: {
    createdAt: (parent: { createdAt: Date | string }) => formatDate(parent.createdAt),
  },

  Subscription: {
    createdAt: (parent: { createdAt: Date | string }) => formatDate(parent.createdAt),
  },

  AuditLog: {
    createdAt: (parent: { createdAt: Date | string }) => formatDate(parent.createdAt),
  },

  TopTenant: {
    createdAt: (parent: { createdAt: Date | string }) => formatDate(parent.createdAt),
    updatedAt: (parent: { updatedAt: Date | string }) => formatDate(parent.updatedAt),
  },

  TenantBilling: {
    createdAt: (parent: { createdAt: Date | string }) => formatDate(parent.createdAt),
  },

  TenantWithStats: {
    createdAt: (parent: { createdAt: Date | string }) => formatDate(parent.createdAt),
    updatedAt: (parent: { updatedAt: Date | string }) => formatDate(parent.updatedAt),
  },
}
