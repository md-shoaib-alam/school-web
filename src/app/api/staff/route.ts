import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

// GET - List all staff (users with role='staff') for a tenant
export async function GET() {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    if (!rawTenantId) {
      return NextResponse.json({ error: 'Tenant context required' }, { status: 403 });
    }
    const tenantId = rawTenantId;

    const staff = await db.user.findMany({
      where: { tenantId, role: 'staff' },
      include: { customRole: { select: { id: true, name: true, color: true, permissions: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(staff.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      address: s.address,
      isActive: s.isActive,
      customRole: s.customRole ? { ...s.customRole, permissions: JSON.parse(s.customRole.permissions || '{}') } : null,
      createdAt: s.createdAt,
    })));
  } catch (error) {
    console.error('[STAFF_GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST - Create a staff member
export async function POST(request: Request) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    if (!rawTenantId) {
      return NextResponse.json({ error: 'Tenant context required' }, { status: 403 });
    }
    const tenantId = rawTenantId;

    const body = await request.json();
    const { name, email, password, phone, address, customRoleId, isActive } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }

    // Check email uniqueness
    const existingUser = await db.user.findUnique({ where: { email: email.trim() } });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    // Validate customRoleId
    if (customRoleId) {
      const role = await db.customRole.findFirst({ where: { id: customRoleId, tenantId } });
      if (!role) {
        return NextResponse.json({ error: 'Selected role not found' }, { status: 404 });
      }
    }

    const user = await db.user.create({
      data: {
        tenantId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash(password?.trim() || 'changeme123', 12),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        role: 'staff',
        customRoleId: customRoleId || null,
        isActive: isActive !== false,
      },
      include: { customRole: true },
    });

    return NextResponse.json({
      success: true,
      staff: {
        ...user,
        customRole: user.customRole ? { ...user.customRole, permissions: JSON.parse(user.customRole.permissions || '{}') } : null,
      },
    });
  } catch (error) {
    console.error('[STAFF_POST]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PUT - Update staff member
export async function PUT(request: Request) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    if (!rawTenantId) {
      return NextResponse.json({ error: 'Tenant context required' }, { status: 403 });
    }
    const tenantId = rawTenantId;

    const body = await request.json();
    const { id, name, password, phone, address, customRoleId, isActive } = body;

    if (!id) return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });

    const existing = await db.user.findFirst({ 
      where: { id, tenantId, role: 'staff' } 
    });

    if (!existing) {
      return NextResponse.json({ error: 'Staff member not found or access denied' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (password !== undefined && password.trim() !== '') updateData.password = await bcrypt.hash(password.trim(), 12);
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (customRoleId !== undefined) updateData.customRoleId = customRoleId || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      include: { customRole: true },
    });

    return NextResponse.json({ success: true, staff: updated });
  } catch (error) {
    console.error('[STAFF_PUT]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE - Delete staff member
export async function DELETE(request: Request) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    if (!rawTenantId) {
      return NextResponse.json({ error: 'Tenant context required' }, { status: 403 });
    }
    const tenantId = rawTenantId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });

    const existing = await db.user.findFirst({ 
      where: { id, tenantId, role: 'staff' } 
    });

    if (!existing) {
      return NextResponse.json({ error: 'Staff member not found or access denied' }, { status: 404 });
    }

    // Delete notices authored by this user
    await db.notice.deleteMany({ where: { authorId: id } });
    // Delete the user
    await db.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[STAFF_DELETE]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
