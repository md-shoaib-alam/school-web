import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

export async function GET() {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!; // Guaranteed non-null after auth check for tenant users

    // 🔒 Performance: Use count/aggregate instead of loading all records into memory
    const [totalStudents, totalTeachers, totalClasses, totalParents] = await Promise.all([
      db.student.count({ where: { user: { tenantId } } }),
      db.teacher.count({ where: { user: { tenantId } } }),
      db.class.count({ where: { tenantId } }),
      db.parent.count({ where: { user: { tenantId } } }),
    ]);

    // 🔒 Performance: Aggregate fees server-side instead of loading all fee records
    const [paidFees, allFees] = await Promise.all([
      db.fee.aggregate({
        where: { student: { user: { tenantId } }, status: 'paid' },
        _sum: { paidAmount: true },
      }),
      db.fee.aggregate({
        where: { student: { user: { tenantId } }, status: { not: 'paid' } },
        _sum: { amount: true, paidAmount: true },
      }),
    ]);
    const totalRevenue = paidFees._sum.paidAmount || 0;
    const pendingFees = (allFees._sum.amount || 0) - (allFees._sum.paidAmount || 0);

    // 🔒 Performance: Count attendance status server-side instead of loading all records
    const [totalAttendance, presentAttendance] = await Promise.all([
      db.attendance.count({ where: { class: { tenantId } } }),
      db.attendance.count({ where: { class: { tenantId }, status: { in: ['present', 'late'] } } }),
    ]);
    const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;

    const upcomingEvents = await db.event.count({
      where: { tenantId, date: { gte: new Date().toISOString().split('T')[0] } }
    });

    // Monthly attendance — compute via DB counts per month
    const monthlyData: { month: string; rate: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      const [monthTotal, monthPresent] = await Promise.all([
        db.attendance.count({ where: { class: { tenantId }, date: { gte: monthStart, lte: monthEnd } } }),
        db.attendance.count({ where: { class: { tenantId }, date: { gte: monthStart, lte: monthEnd }, status: { in: ['present', 'late'] } } }),
      ]);
      const monthRate = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0;
      monthlyData.push({ month: date.toLocaleString('default', { month: 'short' }), rate: monthRate });
    }

    const classDistribution = await db.class.findMany({
      where: { tenantId },
      include: { _count: { select: { students: true } } }
    });
    const classData = classDistribution.map(c => ({ name: `${c.name}-${c.section}`, students: (c as any)._count.students }));

    // Grade distribution via groupBy
    const gradeGroups = await db.grade.groupBy({
      by: ['grade'],
      where: { student: { user: { tenantId } } },
      _count: { id: true },
    });
    const gradeMap = Object.fromEntries(gradeGroups.map(g => [g.grade, g._count.id]));
    const gradeDistribution = ['A+', 'A', 'B+', 'B', 'C', 'D'].map(g => ({
      grade: g, count: gradeMap[g] || 0
    }));

    const recentNotices = await db.notice.findMany({
      where: { tenantId },
      take: 5, orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } }
    });

    // Fee breakdown by type — use aggregate per type
    const feeTypes = ['tuition', 'exam', 'library', 'transport'];
    const feeByType = await Promise.all(feeTypes.map(async (type) => {
      const [collected, pending] = await Promise.all([
        db.fee.aggregate({
          where: { student: { user: { tenantId } }, type, status: 'paid' },
          _sum: { paidAmount: true },
        }),
        db.fee.aggregate({
          where: { student: { user: { tenantId } }, type, status: { not: 'paid' } },
          _sum: { amount: true, paidAmount: true },
        }),
      ]);
      return {
        type,
        collected: collected._sum.paidAmount || 0,
        pending: (pending._sum.amount || 0) - (pending._sum.paidAmount || 0),
      };
    }));

    return NextResponse.json({
      totalStudents, totalTeachers, totalClasses, totalParents,
      totalRevenue, pendingFees, attendanceRate,
      upcomingEvents,
      monthlyAttendance: monthlyData,
      classDistribution: classData,
      gradeDistribution: gradeDistribution,
      recentNotices: recentNotices.map(n => ({
        id: n.id, title: n.title, content: n.content,
        authorName: n.author.name, priority: n.priority,
        createdAt: n.createdAt.toISOString(), targetRole: n.targetRole
      })),
      feeByType,
    });
  } catch (error) {
    console.error('[DASHBOARD_GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

