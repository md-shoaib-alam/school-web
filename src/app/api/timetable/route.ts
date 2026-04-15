import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    const where: any = {
      class: { tenantId }
    };
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;

    const timetable = await db.timetable.findMany({
      where,
      include: {
        subject: { select: { name: true } },
        teacher: { include: { user: { select: { name: true } } } },
        class: { select: { name: true, section: true } }
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }]
    });

    return NextResponse.json(timetable.map(t => ({
      id: t.id, day: t.day, startTime: t.startTime, endTime: t.endTime,
      subjectId: t.subjectId, teacherId: t.teacherId,
      subjectName: t.subject.name, teacherName: t.teacher.user.name,
      className: `${t.class.name}-${t.class.section}`,
    })));
  } catch (error) {
    console.error('[TIMETABLE_GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const data = await request.json();
    const { slots } = data;
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: 'slots array is required' }, { status: 400 });
    }

    const created: Array<Record<string, unknown>> = [];
    const errors: Array<{ slot: Record<string, unknown>; reason: string }> = [];

    // ⚡ Validate all slots first
    const validSlots: typeof slots = [];
    for (const slot of slots) {
      if (!slot.classId || !slot.subjectId || !slot.teacherId || !slot.day || !slot.startTime || !slot.endTime) {
        errors.push({ slot, reason: 'Missing required fields' });
      } else {
        validSlots.push(slot);
      }
    }

    // ⚡ Batch verify all class IDs in a SINGLE query instead of N queries
    const uniqueClassIds = [...new Set(validSlots.map(s => s.classId))];
    const verifiedClasses = await db.class.findMany({
      where: { id: { in: uniqueClassIds }, tenantId },
      select: { id: true },
    });
    const validClassIds = new Set(verifiedClasses.map((c: { id: string }) => c.id));

    // Separate valid vs unauthorized slots
    const authorizedSlots = validSlots.filter(s => {
      if (!validClassIds.has(s.classId)) {
        errors.push({ slot: s, reason: 'Class not found or access denied' });
        return false;
      }
      return true;
    });

    // ⚡ Create all valid entries in a single transaction
    if (authorizedSlots.length > 0) {
      const entries = await db.$transaction(
        authorizedSlots.map(slot =>
          db.timetable.create({
            data: {
              classId: slot.classId,
              subjectId: slot.subjectId,
              teacherId: slot.teacherId,
              day: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
            },
            include: {
              subject: { select: { name: true } },
              teacher: { include: { user: { select: { name: true } } } },
              class: { select: { name: true, section: true } },
            },
          })
        )
      );

      for (const entry of entries) {
        created.push({
          id: entry.id,
          day: entry.day,
          startTime: entry.startTime,
          endTime: entry.endTime,
          subjectId: entry.subjectId,
          teacherId: entry.teacherId,
          subjectName: entry.subject.name,
          teacherName: entry.teacher.user.name,
          className: `${entry.class.name}-${entry.class.section}`,
        });
      }
    }

    return NextResponse.json({ success: true, created: created.length, errors: errors.length, data: created });
  } catch (error) {
    console.error('[TIMETABLE_POST]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    const data = await request.json();
    const { id, subjectId, teacherId, day, startTime, endTime } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const existing = await db.timetable.findUnique({
      where: { id },
      include: { class: true }
    });
    if (!existing || existing.class.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Entry not found or access denied' }, { status: 404 });
    }

    const updateData: any = {};
    if (subjectId !== undefined) updateData.subjectId = subjectId;
    if (teacherId !== undefined) updateData.teacherId = teacherId;
    if (day !== undefined) updateData.day = day;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;

    const updated = await db.timetable.update({
      where: { id },
      data: updateData,
      include: {
        subject: { select: { name: true } },
        teacher: { include: { user: { select: { name: true } } } },
        class: { select: { name: true, section: true } },
      },
    });

    return NextResponse.json({
      id: updated.id,
      day: updated.day,
      startTime: updated.startTime,
      endTime: updated.endTime,
      subjectId: updated.subjectId,
      teacherId: updated.teacherId,
      subjectName: updated.subject.name,
      teacherName: updated.teacher.user.name,
      className: `${updated.class.name}-${updated.class.section}`,
    });
  } catch (error) {
    console.error('[TIMETABLE_PUT]', error);
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

    const existing = await db.timetable.findUnique({
      where: { id },
      include: { class: true }
    });
    if (!existing || existing.class.tenantId !== tenantId) {
       return NextResponse.json({ error: 'Entry not found or access denied' }, { status: 404 });
    }

    await db.timetable.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TIMETABLE_DELETE]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
