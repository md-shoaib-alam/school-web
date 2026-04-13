import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const body = await request.json();
    const { userId, message } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Validate ticket exists
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true },
    });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Validate user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the message and update ticket's updatedAt in a transaction
    const [ticketMessage] = await db.$transaction([
      db.ticketMessage.create({
        data: {
          ticketId,
          userId,
          message: message.trim(),
        },
        include: {
          author: {
            select: { id: true, name: true, role: true, avatar: true },
          },
        },
      }),
      db.ticket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json(ticketMessage, { status: 201 });
  } catch (error) {
    console.error('Error adding message to ticket:', error);
    return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
  }
}
