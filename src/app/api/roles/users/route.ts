import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/resolve-tenant';

// GET /api/roles/users?roleId=xxx&tenantId=xxx
// Returns users (teachers + staff) assigned to a specific custom role
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');
    const tenantId = searchParams.get('tenantId');

    if (!roleId || !tenantId) {
      return NextResponse.json({ error: 'roleId and tenantId are required' }, { status: 400 });
    }

    const resolvedId = await resolveTenantId(tenantId);
    if (!resolvedId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const users = await db.user.findMany({
      where: {
        tenantId: resolvedId,
        customRoleId: roleId,
        role: { in: ['teacher', 'staff'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/roles/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch role users' }, { status: 500 });
  }
}

// PATCH /api/roles/users — Assign or unassign a role from a user
// Body: { userId: string, roleId: string | null, tenantId: string }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, roleId, tenantId: rawTenantId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If assigning a role, validate it exists
    if (roleId) {
      const resolvedId = rawTenantId ? await resolveTenantId(rawTenantId) : user.tenantId;
      if (resolvedId) {
        const role = await db.customRole.findFirst({
          where: { id: roleId, tenantId: resolvedId },
        });
        if (!role) {
          return NextResponse.json({ error: 'Role not found in this school' }, { status: 404 });
        }
      }
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { customRoleId: roleId || null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('PATCH /api/roles/users error:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

// GET /api/roles/users?tenantId=xxx&available=true
// Returns users (teachers + staff) NOT assigned to any custom role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId: rawTenantId, excludeRoleId } = body;

    if (!rawTenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const resolvedId = await resolveTenantId(rawTenantId);
    if (!resolvedId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get all users (teachers + staff) who don't have THIS role assigned
    const users = await db.user.findMany({
      where: {
        tenantId: resolvedId,
        role: { in: ['teacher', 'staff'] },
        ...(excludeRoleId ? { customRoleId: { not: excludeRoleId } } : { customRoleId: null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        customRoleId: true,
        customRole: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('POST /api/roles/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch available users' }, { status: 500 });
  }
}
