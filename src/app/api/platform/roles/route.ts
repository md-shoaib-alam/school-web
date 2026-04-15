import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/platform/roles — List all platform roles
export async function GET() {
  try {
    const roles = await db.platformRole.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { users: true } } },
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error('GET /api/platform/roles error:', error);
    return NextResponse.json({ error: 'Failed to fetch platform roles' }, { status: 500 });
  }
}

// POST /api/platform/roles — Create a new platform role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, permissions } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    const existing = await db.platformRole.findFirst({
      where: { name: name.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: 'A role with this name already exists' }, { status: 409 });
    }

    const role = await db.platformRole.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#e11d48',
        permissions: JSON.stringify(permissions || {}),
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('POST /api/platform/roles error:', error);
    return NextResponse.json({ error: 'Failed to create platform role' }, { status: 500 });
  }
}

// PUT /api/platform/roles — Update an existing platform role
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, color, permissions } = body;

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const existing = await db.platformRole.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (name && name.trim() !== existing.name) {
      const duplicate = await db.platformRole.findFirst({
        where: { name: name.trim(), id: { not: id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: 'A role with this name already exists' }, { status: 409 });
      }
    }

    const role = await db.platformRole.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(color ? { color } : {}),
        ...(permissions ? { permissions: JSON.stringify(permissions) } : {}),
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('PUT /api/platform/roles error:', error);
    return NextResponse.json({ error: 'Failed to update platform role' }, { status: 500 });
  }
}

// DELETE /api/platform/roles?id=xxx — Delete a platform role
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const existing = await db.platformRole.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check for assigned users
    const userCount = await db.user.count({ where: { platformRoleId: id } });
    if (userCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete role: ${userCount} user(s) are assigned. Unassign them first.` },
        { status: 400 }
      );
    }

    // Clear any references and delete
    await db.user.updateMany({ where: { platformRoleId: id }, data: { platformRoleId: null } });
    await db.platformRole.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/platform/roles error:', error);
    return NextResponse.json({ error: 'Failed to delete platform role' }, { status: 500 });
  }
}
