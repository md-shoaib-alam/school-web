import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

// GET /api/submissions?assignmentId=xxx&studentId=xxx
export async function GET(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');

    const where: Record<string, string> = {};
    if (assignmentId) where.assignmentId = assignmentId;
    if (studentId) where.studentId = studentId;

    const submissions = await db.submission.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            class: { select: { name: true, section: true } },
          },
        },
        assignment: {
          include: {
            subject: { select: { name: true } },
            teacher: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: submissions.map((s) => ({
        id: s.id,
        assignmentId: s.assignmentId,
        studentId: s.studentId,
        content: s.content,
        status: s.status,
        submittedAt: s.submittedAt.toISOString(),
        grade: s.grade,
        feedback: s.feedback,
        studentName: s.student.user.name,
        studentEmail: s.student.user.email,
        studentClass: `${s.student.class.name}-${s.student.class.section}`,
        assignmentTitle: s.assignment.title,
        assignmentDescription: s.assignment.description,
        assignmentDueDate: s.assignment.dueDate,
        subjectName: s.assignment.subject.name,
        teacherName: s.assignment.teacher.user.name,
      })),
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST /api/submissions
export async function POST(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error } = await validateApiRequest();
    if (error) return error;

    const data = await request.json();
    const { assignmentId, studentId, content, status } = data;

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, message: 'assignmentId is required' },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'studentId is required' },
        { status: 400 }
      );
    }

    const submission = await db.submission.create({
      data: {
        assignmentId,
        studentId,
        content: content || null,
        status: status || 'submitted',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: submission.id,
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        content: submission.content,
        status: submission.status,
        submittedAt: submission.submittedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

// PUT /api/submissions
export async function PUT(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error } = await validateApiRequest();
    if (error) return error;

    const data = await request.json();
    const { id, content, grade, status, feedback } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'id is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (content !== undefined) updateData.content = content;
    if (grade !== undefined) updateData.grade = grade;
    if (status !== undefined) updateData.status = status;
    if (feedback !== undefined) updateData.feedback = feedback;

    const submission = await db.submission.update({
      where: { id },
      data: updateData as any,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: submission.id,
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        content: submission.content,
        status: submission.status,
        submittedAt: submission.submittedAt.toISOString(),
        grade: submission.grade,
        feedback: submission.feedback,
      },
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

// DELETE /api/submissions?id=xxx
export async function DELETE(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'id is required' },
        { status: 400 }
      );
    }

    await db.submission.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
