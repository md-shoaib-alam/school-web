import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

const VALID_STATUSES = ['open', 'in_progress', 'on_hold', 'resolved', 'closed'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, role: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, role: true, avatar: true },
        },
        messages: {
          include: {
            author: {
              select: { id: true, name: true, role: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, priority, assignedTo } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    // Validate ticket exists
    const existingTicket = await db.ticket.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Build update data with only provided fields
    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return NextResponse.json(
          { error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.priority = priority;
    }

    if (assignedTo !== undefined) {
      if (assignedTo !== null && typeof assignedTo === 'string') {
        // Validate the assignee user exists
        const assignee = await db.user.findUnique({
          where: { id: assignedTo },
          select: { id: true },
        });
        if (!assignee) {
          return NextResponse.json({ error: 'Assignee user not found' }, { status: 404 });
        }
        updateData.assignedTo = assignedTo;
      } else if (assignedTo === null) {
        // Allow unassigning by setting to null
        updateData.assignedTo = null;
      } else {
        return NextResponse.json(
          { error: 'assignedTo must be a valid user ID or null' },
          { status: 400 }
        );
      }
    }

    // Check that at least one field was provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update. Provide status, priority, or assignedTo.' },
        { status: 400 }
      );
    }

    const updatedTicket = await db.ticket.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, role: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, role: true, avatar: true },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    // Validate ticket exists
    const existingTicket = await db.ticket.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Delete ticket (messages are cascade deleted via schema)
    await db.ticket.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}
