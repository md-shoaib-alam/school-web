import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const parents = await db.parent.findMany({
      where: { user: { tenantId } },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        students: {
          include: {
            user: { select: { name: true, email: true } },
            class: { select: { name: true, section: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(parents.map(p => ({
      id: p.id,
      userId: p.userId,
      name: p.user?.name || 'Unknown',
      email: p.user?.email || '',
      phone: p.user?.phone || '',
      occupation: p.occupation,
      children: (p.students || []).map(s => ({
        id: s.id,
        name: s.user?.name || 'Unknown',
        email: s.user?.email || '',
        rollNumber: s.rollNumber,
        className: `${s.class.name}-${s.class.section}`,
        classId: s.classId,
        gender: s.gender,
        dateOfBirth: s.dateOfBirth,
      })),
    })));
  } catch (error) {
    console.error('[PARENTS_GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const body = await request.json();

    if (body.action === 'create') {
      const hashedPassword = await bcrypt.hash(body.password || 'changeme123', 12);
      const user = await db.user.create({
        data: {
          email: body.email,
          name: body.name,
          role: 'parent',
          phone: body.phone,
          password: hashedPassword,
          tenantId
        }
      });
      const parent = await db.parent.create({
        data: {
          userId: user.id,
          occupation: body.occupation,
        }
      });
      return NextResponse.json({ success: true, id: parent.id, name: user.name });
    }

    if (body.action === 'link-child') {
      const { parentId, studentId, unlink } = body;
      
      // Verify student belongs to this tenant
      const student = await db.student.findUnique({
        where: { id: studentId },
        include: { user: true }
      });
      if (!student || student.user.tenantId !== tenantId) {
        return NextResponse.json({ error: 'Student not found or access denied' }, { status: 404 });
      }

      if (unlink) {
        await db.student.update({
          where: { id: studentId },
          data: { parentId: null }
        });
      } else {
        await db.student.update({
          where: { id: studentId },
          data: { parentId }
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[PARENTS_POST]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const data = await request.json();
    const { id, name, email, phone, occupation } = data;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const parent = await db.parent.findUnique({ where: { id }, include: { user: true } });
    if (!parent || parent.user.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Parent not found or access denied' }, { status: 404 });
    }

    await db.user.update({
      where: { id: parent.userId },
      data: { name, email, phone },
    });
    await db.parent.update({
      where: { id },
      data: { occupation },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PARENTS_PUT]', error);
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

    const parent = await db.parent.findUnique({
      where: { id },
      include: { user: true }
    });

    if (parent && parent.user.tenantId === tenantId) {
      // 🔒 Delete in correct FK dependency order
      // Unlink all children first
      await db.student.updateMany({
        where: { parentId: id },
        data: { parentId: null }
      });
      await db.subscription.deleteMany({ where: { parentId: id } });
      await db.parent.delete({ where: { id } });
      await db.user.delete({ where: { id: parent.userId } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PARENTS_DELETE]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
