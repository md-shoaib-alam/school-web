import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRequest } from '@/lib/api-auth';

// GET /api/tenants - List all tenants with stats
export async function GET(req: NextRequest) {
  try {
    // 🔒 Security: Only super_admin can list tenants
    const { error, user } = await validateApiRequest();
    if (error) return error;
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;
    if (plan && plan !== 'all') where.plan = plan;
    if (search) where.name = { contains: search };

    const tenants = await db.tenant.findMany({
      where,
      include: {
        _count: {
          select: { users: true, classes: true, notices: true, events: true, subscriptions: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get detailed stats per tenant
    const enrichedTenants = await Promise.all(tenants.map(async (tenant) => {
      const studentCount = await db.user.count({ where: { tenantId: tenant.id, role: 'student' } });
      const teacherCount = await db.user.count({ where: { tenantId: tenant.id, role: 'teacher' } });
      const parentCount = await db.user.count({ where: { tenantId: tenant.id, role: 'parent' } });
      const adminCount = await db.user.count({ where: { tenantId: tenant.id, role: 'admin' } });
      const activeSubs = await db.subscription.count({ where: { tenantId: tenant.id, status: 'active' } });
      const totalRevenue = await db.subscription.aggregate({
        where: { tenantId: tenant.id, status: 'active' },
        _sum: { amount: true }
      });

      return {
        ...tenant,
        studentCount,
        teacherCount,
        parentCount,
        adminCount,
        activeSubscriptions: activeSubs,
        totalRevenue: totalRevenue._sum.amount || 0,
      };
    }));

    return NextResponse.json({ tenants: enrichedTenants });
  } catch (error) {
    console.error('Tenants GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// POST /api/tenants - Create a new tenant
export async function POST(req: NextRequest) {
  try {
    // 🔒 Security: Only super_admin can create tenants
    const { error, user } = await validateApiRequest();
    if (error) return error;
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, email, phone, address, website, plan, maxStudents, maxTeachers, maxParents, maxClasses } = body;

    // Check slug uniqueness
    const existing = await db.tenant.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    const tenant = await db.tenant.create({
      data: {
        name,
        slug,
        email: email || null,
        phone: phone || null,
        address: address || null,
        website: website || null,
        plan: plan || 'basic',
        maxStudents: maxStudents || 100,
        maxTeachers: maxTeachers || 20,
        maxParents: maxParents || 100,
        maxClasses: maxClasses || 10,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
      }
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'CREATE_TENANT',
        resource: 'tenant',
        details: JSON.stringify({ tenantId: tenant.id, name, plan }),
      }
    });

    return NextResponse.json({ tenant }, { status: 201 });
  } catch (error) {
    console.error('Tenants POST error:', error);
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}

// PUT /api/tenants - Update tenant
export async function PUT(req: NextRequest) {
  try {
    // 🔒 Security: Only super_admin can update tenants
    const { error, user } = await validateApiRequest();
    if (error) return error;
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...rawData } = body;

    // 🔒 Security: Whitelist allowed update fields to prevent mass assignment
    const allowedFields = ['name', 'email', 'phone', 'address', 'website', 'plan', 'status', 'maxStudents', 'maxTeachers', 'maxParents', 'maxClasses'];
    const data: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (rawData[key] !== undefined) data[key] = rawData[key];
    }

    const tenant = await db.tenant.update({
      where: { id },
      data,
    });

    await db.auditLog.create({
      data: {
        action: 'UPDATE_TENANT',
        resource: 'tenant',
        details: JSON.stringify({ tenantId: id, changes: Object.keys(data) }),
      }
    });

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Tenants PUT error:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}

// DELETE /api/tenants - Delete tenant
export async function DELETE(req: NextRequest) {
  try {
    // 🔒 Security: Only super_admin can delete tenants
    const { error, user } = await validateApiRequest();
    if (error) return error;
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    // Create audit log before deletion (with no tenantId so it survives)
    await db.auditLog.create({
      data: {
        action: 'DELETE_TENANT',
        resource: 'tenant',
        details: JSON.stringify({ tenantId: id }),
      }
    });

    // 🔒 Delete ALL related data in correct dependency order to avoid orphaned records
    // 1. Deep nested records first
    const tenantStudents = await db.student.findMany({ where: { user: { tenantId: id } }, select: { id: true } });
    const studentIds = tenantStudents.map(s => s.id);
    const tenantClasses = await db.class.findMany({ where: { tenantId: id }, select: { id: true } });
    const classIds = tenantClasses.map(c => c.id);
    const tenantTeachers = await db.teacher.findMany({ where: { user: { tenantId: id } }, select: { id: true } });
    const teacherIds = tenantTeachers.map(t => t.id);
    const tenantParents = await db.parent.findMany({ where: { user: { tenantId: id } }, select: { id: true } });
    const parentIds = tenantParents.map(p => p.id);

    // 2. Delete leaf records
    if (studentIds.length > 0) {
      await db.submission.deleteMany({ where: { studentId: { in: studentIds } } });
      await db.grade.deleteMany({ where: { studentId: { in: studentIds } } });
      await db.attendance.deleteMany({ where: { studentId: { in: studentIds } } });
      await db.fee.deleteMany({ where: { studentId: { in: studentIds } } });
    }
    if (classIds.length > 0) {
      await db.assignment.deleteMany({ where: { classId: { in: classIds } } });
      await db.timetable.deleteMany({ where: { classId: { in: classIds } } });
    }
    if (teacherIds.length > 0) {
      await db.classTeacher.deleteMany({ where: { teacherId: { in: teacherIds } } });
      await db.subject.deleteMany({ where: { teacherId: { in: teacherIds } } });
    }

    // 3. Delete profile records
    if (studentIds.length > 0) await db.student.deleteMany({ where: { id: { in: studentIds } } });
    if (teacherIds.length > 0) await db.teacher.deleteMany({ where: { id: { in: teacherIds } } });
    if (parentIds.length > 0) {
      await db.subscription.deleteMany({ where: { parentId: { in: parentIds } } });
      await db.parent.deleteMany({ where: { id: { in: parentIds } } });
    }

    // 4. Delete tenant-level records
    await db.ticketMessage.deleteMany({ where: { ticket: { tenantId: id } } });
    await db.ticket.deleteMany({ where: { tenantId: id } });
    await db.event.deleteMany({ where: { tenantId: id } });
    await db.notice.deleteMany({ where: { tenantId: id } });
    await db.customRole.deleteMany({ where: { tenantId: id } });
    await db.auditLog.deleteMany({ where: { tenantId: id } });
    await db.class.deleteMany({ where: { tenantId: id } });
    await db.user.deleteMany({ where: { tenantId: id } });

    // 5. Finally delete tenant
    await db.tenant.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tenants DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}
