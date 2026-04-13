import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');

    const where: any = {
      class: { tenantId }
    };
    if (classId) where.classId = classId;
    if (date) where.date = date;

    const attendance = await db.attendance.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true } } } }
      },
      orderBy: [{ date: 'desc' }, { studentId: 'asc' }],
      take: 500
    });

    return NextResponse.json(attendance.map(a => ({
      id: a.id, studentId: a.studentId, studentName: a.student.user.name,
      classId: a.classId, date: a.date, status: a.status,
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
    // data: { classId, date, records: [{ studentId, status }] }
    
    // Verify class belongs to tenant
    const cls = await db.class.findUnique({ where: { id: data.classId } });
    if (!cls || cls.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 });
    }

    // 🔒 Performance: Batch all upserts in a single transaction instead of N+1 sequential queries
    await db.$transaction(
      data.records.map((record: { studentId: string; status: string }) =>
        db.attendance.upsert({
          where: { studentId_classId_date: { studentId: record.studentId, classId: data.classId, date: data.date } },
          create: { studentId: record.studentId, classId: data.classId, date: data.date, status: record.status },
          update: { status: record.status }
        })
      )
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ATTENDANCE_POST]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
