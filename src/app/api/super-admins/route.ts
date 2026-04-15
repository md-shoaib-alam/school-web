import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

// GET /api/super-admins - List super admin users (filterable)
export async function GET(request: Request) {
  try {
    const { error, user: sessionUser } = await validateApiRequest();
    if (error) return error;
    if (sessionUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    // ... rest of GET logic ...
    const type = searchParams.get('type');
    const whereClause: Record<string, unknown> = { role: 'super_admin' };
    if (type === 'staff') {
      whereClause.platformRoleId = { not: null };
    } else if (type === 'admins') {
      whereClause.platformRoleId = null;
    }

    const admins = await db.user.findMany({
      where: whereClause,
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        isActive: true, createdAt: true, platformRoleId: true,
        platformRole: { select: { id: true, name: true, color: true, permissions: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error('Super admins GET error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function getRootAdminId(): Promise<string | null> {
  const root = await db.user.findFirst({
    where: { role: 'super_admin', platformRoleId: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  return root?.id || null;
}

export async function POST(request: Request) {
  try {
    const { error, user: sessionUser } = await validateApiRequest();
    if (error) return error;
    if (sessionUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, phone, platformRoleId } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email, and password are required' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash(password.trim(), 12),
        phone: phone?.trim() || null,
        role: 'super_admin',
        isActive: true,
        ...(platformRoleId ? { platformRoleId } : {}),
      },
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        isActive: true, createdAt: true, platformRoleId: true,
        platformRole: { select: { id: true, name: true, color: true, permissions: true } },
      },
    });

    return NextResponse.json({ success: true, admin: user });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { error, user: sessionUser } = await validateApiRequest();
    if (error) return error;
    if (sessionUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, password, isActive, platformRoleId } = body;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin not found' }, { status: 404 });
    }

    const rootId = await getRootAdminId();
    if (rootId && id === rootId && sessionUser.id !== rootId) {
      return NextResponse.json({ error: 'Only the root owner can modify themselves' }, { status: 403 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (password !== undefined && password.trim() !== '') updateData.password = await bcrypt.hash(password.trim(), 12);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (platformRoleId !== undefined) updateData.platformRoleId = platformRoleId || null;

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        isActive: true, createdAt: true, platformRoleId: true,
        platformRole: { select: { id: true, name: true, color: true, permissions: true } },
      },
    });

    return NextResponse.json({ success: true, admin: updated });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error, user: sessionUser } = await validateApiRequest();
    if (error) return error;
    if (sessionUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const rootId = await getRootAdminId();
    if (rootId && id === rootId) {
      return NextResponse.json({ error: 'Cannot delete the root platform owner' }, { status: 403 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
