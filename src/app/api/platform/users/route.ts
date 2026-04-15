import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRequest } from '@/lib/api-auth';

// GET /api/platform/users - All users across tenants
export async function GET(req: NextRequest) {
  try {
    // 🔒 Security: Only super_admin can view all platform users
    const { error, user } = await validateApiRequest();
    if (error) return error;
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const tenantId = searchParams.get('tenantId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (role && role !== 'all') where.role = role;
    if (tenantId) where.tenantId = tenantId;
    if (search) where.name = { contains: search };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          tenant: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    const roleCounts = await db.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      roleCounts: roleCounts.map(r => ({ role: r.role, count: r._count.id })),
    });
  } catch (error) {
    console.error('Platform users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
