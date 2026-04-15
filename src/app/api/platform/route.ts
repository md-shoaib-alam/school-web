import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRequest } from '@/lib/api-auth';

// GET /api/platform/stats - Platform-wide statistics
export async function GET() {
  try {
    // 🔒 Security: Only super_admin can access platform stats
    const { error, user } = await validateApiRequest();
    if (error) return error;
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const totalTenants = await db.tenant.count();
    const activeTenants = await db.tenant.count({ where: { status: 'active' } });
    const trialTenants = await db.tenant.count({ where: { status: 'trial' } });
    const suspendedTenants = await db.tenant.count({ where: { status: 'suspended' } });

    const totalUsers = await db.user.count();
    const totalStudents = await db.user.count({ where: { role: 'student' } });
    const totalTeachers = await db.user.count({ where: { role: 'teacher' } });
    const totalParents = await db.user.count({ where: { role: 'parent' } });
    const totalAdmins = await db.user.count({ where: { role: 'admin' } });

    const totalClasses = await db.class.count();
    const totalSubscriptions = await db.subscription.count();
    const activeSubscriptions = await db.subscription.count({ where: { status: 'active' } });

    // Revenue
    const activeRevenue = await db.subscription.aggregate({
      where: { status: 'active' },
      _sum: { amount: true }
    });
    const totalRevenue = await db.subscription.aggregate({
      _sum: { amount: true }
    });

    // Plan distribution
    const planDist = await db.tenant.groupBy({
      by: ['plan'],
      _count: { id: true }
    });

    // Recent audit logs
    const recentLogs = await db.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    // Monthly growth (simulated)
    const monthlyData: Array<{ month: string; newTenants: number; newUsers: number; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      monthlyData.push({
        month,
        newTenants: Math.floor(Math.random() * 5) + 1,
        newUsers: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 50000) + 20000,
      });
    }

    // Top tenants by revenue
    const tenants = await db.tenant.findMany({
      include: {
        _count: { select: { users: true, classes: true } }
      },
      orderBy: { createdAt: 'desc' },
    });

    const tenantRevenues = await Promise.all(tenants.map(async (t) => {
      const rev = await db.subscription.aggregate({
        where: { tenantId: t.id, status: 'active' },
        _sum: { amount: true }
      });
      return { ...t, revenue: rev._sum.amount || 0 };
    }));

    const topTenants = tenantRevenues
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      tenants: { total: totalTenants, active: activeTenants, trial: trialTenants, suspended: suspendedTenants },
      users: { total: totalUsers, students: totalStudents, teachers: totalTeachers, parents: totalParents, admins: totalAdmins },
      classes: totalClasses,
      subscriptions: { total: totalSubscriptions, active: activeSubscriptions },
      revenue: {
        active: activeRevenue._sum.amount || 0,
        total: totalRevenue._sum.amount || 0,
      },
      planDistribution: planDist.map(p => ({ plan: p.plan, count: p._count.id })),
      recentLogs,
      monthlyData,
      topTenants,
    });
  } catch (error) {
    console.error('Platform stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch platform stats' }, { status: 500 });
  }
}
