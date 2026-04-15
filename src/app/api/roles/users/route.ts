import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/resolve-tenant';

// GET /api/roles/users?roleId=xxx
// Returns staff assigned to a specific custom role
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json({ error: 'roleId is required' }, { status: 400 });
    }

    // No need to resolve tenant — roleId is already scoped to a tenant
    const users = await db.user.findMany({
      where: {
        customRoleId: roleId,
        role: 'staff',
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
// Body: { userId: string, roleId: string | null }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, roleId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Single query — Prisma will throw if userId doesn't exist (P2025)
    // or if roleId references a non-existent customRole (foreign key constraint)
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
  } catch (error: any) {
    console.error('PATCH /api/roles/users error:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (error?.code === 'P2003') {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

// POST /api/roles/users — Returns available staff (teachers + staff) with NO custom role assigned
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId: rawTenantId } = body;

    if (!rawTenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const resolvedId = await resolveTenantId(rawTenantId);
    if (!resolvedId) {
      console.error('POST /api/roles/users: Could not resolve tenantId:', rawTenantId);
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Return only staff/teachers with NO custom role assigned (customRoleId is null)
    const users = await db.user.findMany({
      where: {
        tenantId: resolvedId,
        role: 'staff',
        customRoleId: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        customRoleId: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('POST /api/roles/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch available users' }, { status: 500 });
  }
}

