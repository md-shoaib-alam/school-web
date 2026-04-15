import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    // 🛠️ TENANT ISOLATION: Always filter by tenantId from the secure session
    const where: any = {
      user: { tenantId }
    };
    if (classId) where.classId = classId;

    const students = await db.student.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        class: { select: { name: true, section: true } },
        parent: { include: { user: { select: { name: true } } } }
      },
      orderBy: { rollNumber: 'asc' }
    });

    return NextResponse.json(students.map(s => ({
      id: s.id, userId: s.userId,
      name: s.user.name, email: s.user.email, phone: s.user.phone,
      rollNumber: s.rollNumber, className: `${s.class.name}-${s.class.section}`, classId: s.classId,
      parentId: s.parentId, parentName: s.parent?.user.name,
      gender: s.gender, dateOfBirth: s.dateOfBirth, admissionDate: s.admissionDate,
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
    const hashedPassword = await bcrypt.hash(data.password || 'changeme123', 12);
    const user = await db.user.create({
      data: { 
        email: data.email, 
        name: data.name, 
        role: 'student', 
        phone: data.phone,
        password: hashedPassword,
        tenantId: tenantId // 🔒 Securely bind to current tenant
      }
    });
    const student = await db.student.create({
      data: {
        userId: user.id, 
        rollNumber: data.rollNumber, 
        classId: data.classId,
        parentId: data.parentId, 
        gender: data.gender || 'male',
        dateOfBirth: data.dateOfBirth, 
        admissionDate: data.admissionDate || new Date().toISOString().split('T')[0]
      }
    });
    return NextResponse.json({ id: student.id, name: user.name });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const data = await request.json();
    const { id, name, email, phone, rollNumber, classId, gender, dateOfBirth } = data;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const student = await db.student.findUnique({ 
      where: { id }, 
      include: { user: true } 
    });

    if (!student || student.user.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Student not found or access denied' }, { status: 404 });
    }

    await db.user.update({
      where: { id: student.userId },
      data: { name, email, phone },
    });

    await db.student.update({
      where: { id },
      data: { rollNumber, classId, gender, dateOfBirth },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
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
    
    const student = await db.student.findUnique({ 
      where: { id }, 
      include: { user: true } 
    });

    if (student && student.user.tenantId === tenantId) {
      // 🔒 Delete student FIRST (has FK to user), then the user record
      await db.student.delete({ where: { id } });
      await db.user.delete({ where: { id: student.userId } });
    } else if (student) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
