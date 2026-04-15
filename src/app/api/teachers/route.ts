import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const teachers = await db.teacher.findMany({
      where: { user: { tenantId } },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        subjects: { select: { name: true } },
        classes: { include: { class: { select: { name: true, section: true } } } }
      }
    });

    return NextResponse.json(teachers.map(t => ({
      id: t.id, userId: t.userId,
      name: t.user?.name || 'Unknown', 
      email: t.user?.email || '', 
      phone: t.user?.phone || '',
      qualification: t.qualification, experience: t.experience, joiningDate: t.joiningDate,
      subjects: t.subjects.map(s => s.name),
      classes: t.classes.map(c => `${c.class.name}-${c.class.section}`),
    })));
  } catch (error) {
    console.error('[TEACHERS_GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const data = await request.json();
    const hashedPassword = await bcrypt.hash(data.password || 'changeme123', 12);
    const user = await db.user.create({
      data: { 
        email: data.email, 
        name: data.name, 
        role: 'teacher', 
        phone: data.phone,
        password: hashedPassword,
        tenantId // 🔒 Securely bind to company
      }
    });
    const teacher = await db.teacher.create({
      data: {
        userId: user.id,
        qualification: data.qualification || null,
        experience: data.experience || null,
      }
    });
    return NextResponse.json({ id: teacher.id, name: user.name });
  } catch (error) {
    console.error('[TEACHERS_POST]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const data = await request.json();
    const { id, name, email, phone, qualification, experience } = data;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const teacher = await db.teacher.findUnique({ 
      where: { id }, 
      include: { user: true } 
    });
    
    if (!teacher || teacher.user.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Teacher not found or access denied' }, { status: 404 });
    }

    await db.user.update({
      where: { id: teacher.userId },
      data: { name, email, phone },
    });

    await db.teacher.update({
      where: { id },
      data: { qualification, experience },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TEACHERS_PUT]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const teacher = await db.teacher.findUnique({ 
      where: { id }, 
      include: { user: true } 
    });
    
    if (teacher && teacher.user.tenantId === tenantId) {
      // 🔒 Delete in correct FK dependency order
      await db.classTeacher.deleteMany({ where: { teacherId: id } });
      await db.subject.updateMany({ where: { teacherId: id }, data: { teacherId: null } });
      await db.teacher.delete({ where: { id } });
      await db.user.delete({ where: { id: teacher.userId } });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TEACHERS_DELETE]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
