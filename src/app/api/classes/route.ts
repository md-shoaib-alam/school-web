import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

export async function GET() {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const classes = await db.class.findMany({
      where: { tenantId },
      include: {
        _count: { select: { students: true } },
        teachers: { include: { teacher: { include: { user: { select: { name: true } } } } } }
      }
    });

    return NextResponse.json(classes.map(c => {
      const classTeacher = (c as any).teachers?.find((t: any) => t.isClassTeacher);
      return {
        id: c.id, name: c.name, section: c.section, grade: c.grade, capacity: c.capacity,
        studentCount: c._count.students,
        classTeacher: classTeacher?.teacher?.user?.name || 'Not Assigned',
      };
    }));
  } catch (error) {
    console.error('[CLASSES_GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const data = await request.json();
    const cls = await db.class.create({
      data: {
        name: data.name,
        section: data.section || 'A',
        grade: data.grade,
        capacity: data.capacity || 40,
        tenantId: tenantId, // 🔒 Bound to secure session tenant
      }
    });
    return NextResponse.json({ id: cls.id, name: cls.name });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const data = await request.json();
    const { id, name, section, grade, capacity } = data;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const cls = await db.class.findUnique({ where: { id } });
    if (!cls || cls.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 });
    }

    await db.class.update({
      where: { id },
      data: { name, section, grade, capacity },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CLASSES_PUT]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const cls = await db.class.findUnique({ where: { id } });
    if (!cls || cls.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 });
    }

    await db.class.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CLASSES_DELETE]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
