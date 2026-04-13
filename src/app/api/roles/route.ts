import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';
import { resolveTenantId } from '@/lib/resolve-tenant';

export async function GET(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error, user, tenantId: sessionTenantId } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const rawTenantId = searchParams.get('tenantId');

    // Derive tenantId from session; super_admin can optionally specify
    let resolvedId = sessionTenantId;
    if (user?.role === 'super_admin' && rawTenantId) {
      resolvedId = await resolveTenantId(rawTenantId);
    } else if (rawTenantId && rawTenantId === sessionTenantId) {
      resolvedId = sessionTenantId;
    }

    if (!resolvedId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const roles = await db.customRole.findMany({
      where: { tenantId: resolvedId },
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Roles GET error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error, user, tenantId: sessionTenantId } = await validateApiRequest();
    if (error) return error;

    const body = await request.json();
    const { tenantId: rawTenantId, name, description, color, permissions } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // Derive tenantId from session; super_admin can optionally specify
    let tenantId = sessionTenantId;
    if (user?.role === 'super_admin' && rawTenantId) {
      tenantId = await resolveTenantId(rawTenantId);
    }
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check if role name already exists in this tenant
    const existing = await db.customRole.findFirst({
      where: { tenantId, name },
    });
    if (existing) {
      return NextResponse.json({ error: 'A role with this name already exists' }, { status: 409 });
    }

    const role = await db.customRole.create({
      data: {
        tenantId,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#6366f1',
        permissions: JSON.stringify(permissions || {}),
      },
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Roles POST error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error } = await validateApiRequest();
    if (error) return error;

    const body = await request.json();
    const { id, name, description, color, permissions } = body;

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const existing = await db.customRole.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (color !== undefined) updateData.color = color;
    if (permissions !== undefined) updateData.permissions = JSON.stringify(permissions);

    const updated = await db.customRole.update({
      where: { id },
      data: updateData as any,
    });

    return NextResponse.json({ success: true, role: updated });
  } catch (error) {
    console.error('Roles PUT error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const existing = await db.customRole.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (existing._count.users > 0) {
      return NextResponse.json({
        error: `Cannot delete "${existing.name}" — ${existing._count.users} staff member(s) are assigned to this role. Reassign them first.`,
      }, { status: 400 });
    }

    await db.customRole.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Roles DELETE error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
