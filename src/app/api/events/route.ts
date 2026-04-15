import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRequest } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const { searchParams } = request.nextUrl;
    const month = searchParams.get("month"); // "YYYY-MM"
    const type = searchParams.get("type");
    const targetRole = searchParams.get("targetRole");

    const conditions: Record<string, unknown>[] = [{ tenantId }];

    if (month) {
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      const monthStart = `${month}-01`;
      const monthEnd = `${month}-${String(daysInMonth).padStart(2, '0')}`;

      // Match events that overlap with this month:
      // 1. Events starting in this month
      // 2. Events ending in this month
      // 3. Multi-day events that span across this month entirely
      conditions.push({
        OR: [
          { date: { gte: monthStart, lte: monthEnd } },
          { endDate: { gte: monthStart, lte: monthEnd } },
          { AND: [
            { date: { lt: monthStart } },
            { endDate: { gt: monthEnd } },
          ]},
        ],
      });
    }

    if (type) {
      conditions.push({ type });
    }

    if (targetRole) {
      conditions.push({ targetRole });
    }

    const events = await db.event.findMany({
      where: { AND: conditions },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("[GET /api/events] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/events — create a new event
//   - tenantId is REQUIRED in body — event belongs to that specific school
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const body = await request.json();
    const { title, date } = body;

    if (!title || !date) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const event = await db.event.create({
      data: {
        tenantId,
        title: title.trim(),
        description: body.description?.trim() || null,
        date: date.trim(),
        endDate: body.endDate?.trim() || null,
        type: body.type || "general",
        targetRole: body.targetRole || "all",
        color: body.color || "#10b981",
        allDay: Boolean(body.allDay),
        location: body.location?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/events]", error);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const body = await request.json();
    const { id } = body;

    const existing = await db.event.findFirst({
      where: { id: id.trim(), tenantId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    const data: Record<string, any> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.date !== undefined) data.date = body.date;
    if (body.endDate !== undefined) data.endDate = body.endDate;
    if (body.type !== undefined) data.type = body.type;
    if (body.targetRole !== undefined) data.targetRole = body.targetRole;
    if (body.color !== undefined) data.color = body.color;
    if (body.allDay !== undefined) data.allDay = body.allDay;
    if (body.location !== undefined) data.location = body.location;

    const event = await db.event.update({
      where: { id: id.trim() },
      data,
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("[PUT /api/events]", error);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    const existing = await db.event.findFirst({
      where: { id, tenantId },
    });

    if (!existing) return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });

    await db.event.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("[DELETE /api/events]", error);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
