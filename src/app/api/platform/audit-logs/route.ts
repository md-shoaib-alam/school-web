import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRequest } from '@/lib/api-auth';

// GET /api/platform/audit-logs
export async function GET(req: NextRequest) {
  try {
    // 🔒 Security: Only super_admin can view audit logs
    const { error, user } = await validateApiRequest();
    if (error) return error;
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          tenant: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    const actionTypes = await db.auditLog.groupBy({
      by: ['action'],
      _count: { id: true },
    });

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      actionTypes: actionTypes.map(a => ({ action: a.action, count: a._count.id })),
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
