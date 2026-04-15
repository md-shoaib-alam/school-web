import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    const where: any = {
      student: { user: { tenantId } }
    };
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    // ⚡ Paginated to prevent unbounded response growth
    const fees = await db.fee.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true } } } }
      },
      orderBy: { dueDate: 'asc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return NextResponse.json(fees.map(f => ({
      id: f.id, studentId: f.studentId, studentName: f.student.user.name,
      amount: f.amount, type: f.type, status: f.status,
      dueDate: f.dueDate, paidAmount: f.paidAmount,
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
    
    // Verify student belongs to tenant
    const student = await db.student.findUnique({
      where: { id: data.studentId },
      include: { user: true }
    });
    if (!student || student.user.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Student not found or access denied' }, { status: 404 });
    }

    const fee = await db.fee.create({
      data: {
        studentId: data.studentId,
        amount: data.amount,
        type: data.type,
        status: data.status || 'pending',
        dueDate: data.dueDate,
        paidAmount: data.paidAmount || 0,
      }
    });
    return NextResponse.json({ id: fee.id });
  } catch (error) {
    console.error('[FEES_POST]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const data = await request.json();
    const { id, status, paidAmount, paidDate } = data;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const fee = await db.fee.findUnique({
      where: { id },
      include: { student: { include: { user: true } } }
    });
    if (!fee || fee.student.user.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Fee record not found or access denied' }, { status: 404 });
    }

    await db.fee.update({
      where: { id },
      data: { status, paidAmount, paidDate },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FEES_PUT]', error);
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

    const fee = await db.fee.findUnique({
      where: { id },
      include: { student: { include: { user: true } } }
    });
    if (!fee || fee.student.user.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Fee record not found or access denied' }, { status: 404 });
    }

    await db.fee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FEES_DELETE]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
