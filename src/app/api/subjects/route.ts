import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

export async function GET() {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const subjects = await db.subject.findMany({
      where: { class: { tenantId } },
      include: {
        class: { select: { name: true, section: true } },
        teacher: { include: { user: { select: { name: true } } } }
      }
    });
    return NextResponse.json(subjects.map(s => ({
      id: s.id, name: s.name, code: s.code,
      className: `${(s as any).class.name}-${(s as any).class.section}`,
      classId: s.classId,
      teacherName: (s as any).teacher?.user?.name || 'Not Assigned',
      teacherId: s.teacherId || '',
    })));
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const data = await request.json();
    
    // Ensure the class belongs to this tenant
    const targetClass = await db.class.findUnique({ where: { id: data.classId } });
    if (!targetClass || targetClass.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    const subject = await db.subject.create({
      data: {
        name: data.name, code: data.code, classId: data.classId,
        teacherId: data.teacherId || null,
      }
    });
    return NextResponse.json({ id: subject.id });
  } catch (err) {
    console.error('[SUBJECTS_POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const data = await request.json();
    const { id, name, code, classId, teacherId } = data;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const existing = await db.subject.findUnique({ 
      where: { id },
      include: { class: true }
    });

    if (!existing || existing.class.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Subject not found or access denied' }, { status: 404 });
    }

    await db.subject.update({
      where: { id },
      data: { name, code, classId, teacherId: teacherId || null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[SUBJECTS_PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const existing = await db.subject.findUnique({ 
      where: { id },
      include: { class: true }
    });

    if (!existing || existing.class.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Subject not found or access denied' }, { status: 404 });
    }

    await db.subject.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[SUBJECTS_DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
