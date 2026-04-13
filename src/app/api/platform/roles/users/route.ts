import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/platform/roles/users?roleId=xxx — Get users assigned to a platform role
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json({ error: 'roleId is required' }, { status: 400 });
    }

    const users = await db.user.findMany({
      where: { role: 'super_admin', platformRoleId: roleId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/platform/roles/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PATCH /api/platform/roles/users — Assign or unassign a platform role to/from a user
// Body: { userId, roleId, action: 'assign' | 'unassign' }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, roleId, action } = body;

    if (!userId || !roleId || !action) {
      return NextResponse.json({ error: 'userId, roleId, and action are required' }, { status: 400 });
    }

    if (action !== 'assign' && action !== 'unassign') {
      return NextResponse.json({ error: 'action must be "assign" or "unassign"' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin user not found' }, { status: 404 });
    }

    if (action === 'assign') {
      // Verify the platform role exists
      const role = await db.platformRole.findUnique({ where: { id: roleId } });
      if (!role) {
        return NextResponse.json({ error: 'Platform role not found' }, { status: 404 });
      }

      await db.user.update({
        where: { id: userId },
        data: { platformRoleId: roleId },
      });

      return NextResponse.json({ success: true, message: `Role "${role.name}" assigned to ${user.name}` });
    } else {
      await db.user.update({
        where: { id: userId },
        data: { platformRoleId: null },
      });

      return NextResponse.json({ success: true, message: `Role unassigned from ${user.name}` });
    }
  } catch (error) {
    console.error('PATCH /api/platform/roles/users error:', error);
    return NextResponse.json({ error: 'Failed to update role assignment' }, { status: 500 });
  }
}

// POST /api/platform/roles/users — Get available super admins not assigned to a given role
// Body: { excludeRoleId }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { excludeRoleId } = body;

    const users = await db.user.findMany({
      where: {
        role: 'super_admin',
        ...(excludeRoleId ? { platformRoleId: { not: excludeRoleId } } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        platformRoleId: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('POST /api/platform/roles/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch available users' }, { status: 500 });
  }
}
