import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    const where: any = {};
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;

    const assignments = await db.assignment.findMany({
      where,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true, section: true, students: true } },
        teacher: { include: { user: { select: { name: true } } } },
        submissions: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(assignments.map(a => ({
      id: a.id, title: a.title, description: a.description,
      subjectName: a.subject.name, className: `${a.class.name}-${a.class.section}`,
      teacherName: a.teacher.user.name, dueDate: a.dueDate,
      submissions: a.submissions.length, totalStudents: a.class.students.length,
    })));
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error } = await validateApiRequest();
    if (error) return error;

    const data = await request.json();
    const assignment = await db.assignment.create({
      data: {
        subjectId: data.subjectId, classId: data.classId, teacherId: data.teacherId,
        title: data.title, description: data.description, dueDate: data.dueDate,
      }
    });
    return NextResponse.json({ id: assignment.id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
