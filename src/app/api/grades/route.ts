import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    const where: any = {
      student: { user: { tenantId } }
    };
    if (studentId) where.studentId = studentId;
    if (classId) {
      where.subject = { classId };
    }

    // ⚡ Paginated for scalability
    const grades = await db.grade.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return NextResponse.json(grades.map(g => ({
      id: g.id, studentId: g.studentId, studentName: g.student.user.name,
      subjectName: g.subject.name, examType: g.examType,
      marks: g.marks, maxMarks: g.maxMarks, grade: g.grade, remarks: g.remarks,
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
    const calcGrade = (marks: number, max: number) => {
      const pct = (marks / max) * 100;
      if (pct >= 90) return 'A+'; if (pct >= 80) return 'A'; if (pct >= 70) return 'B+';
      if (pct >= 60) return 'B'; if (pct >= 50) return 'C'; return 'D';
    };
    const grade = await db.grade.create({
      data: {
        studentId: data.studentId, subjectId: data.subjectId, teacherId: data.teacherId,
        examType: data.examType, marks: data.marks, maxMarks: data.maxMarks,
        grade: calcGrade(data.marks, data.maxMarks), remarks: data.remarks,
      }
    });
    return NextResponse.json({ id: grade.id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
