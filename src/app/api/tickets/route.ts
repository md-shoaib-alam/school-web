import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';
import { resolveTenantId } from '@/lib/resolve-tenant';

const VALID_STATUSES = ['open', 'in_progress', 'on_hold', 'resolved', 'closed'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const VALID_CATEGORIES = [
  'general',
  'billing',
  'technical',
  'academics',
  'feature_request',
  'complaint',
  'other',
];

export async function GET(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error: authError } = await validateApiRequest();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);

    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const createdBy = searchParams.get('createdBy');
    const assignedTo = searchParams.get('assignedTo');

    const where: Record<string, unknown> = {};

    // Filter by tenantId if provided
    if (tenantId) {
      const resolvedId = await resolveTenantId(tenantId);
      if (!resolvedId) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
      where.tenantId = resolvedId;
    }

    // Handle "my_open" status filter
    if (status === 'my_open') {
      if (!createdBy) {
        return NextResponse.json(
          { error: 'createdBy is required when filtering by my_open status' },
          { status: 400 }
        );
      }
      where.createdBy = createdBy;
      where.status = { in: ['open', 'in_progress'] };
    } else if (status && VALID_STATUSES.includes(status)) {
      where.status = status;
    } else if (status && status !== 'my_open') {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Filter by createdBy (only if not already set by my_open)
    if (createdBy && status !== 'my_open') {
      where.createdBy = createdBy;
    }

    // Filter by assignedTo
    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    // Filter by priority
    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return NextResponse.json(
          { error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` },
          { status: 400 }
        );
      }
      where.priority = priority;
    }

    // Filter by category
    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
          { status: 400 }
        );
      }
      where.category = category;
    }

    const tickets = await db.ticket.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error: authError } = await validateApiRequest();
    if (authError) return authError;

    const body = await request.json();
    const { tenantId, title, description, priority, category, createdBy } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!createdBy || typeof createdBy !== 'string') {
      return NextResponse.json(
        { error: 'createdBy (user ID) is required' },
        { status: 400 }
      );
    }

    // Validate user exists
    const user = await db.user.findUnique({
      where: { id: createdBy },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate tenant if provided
    let resolvedTenantId: string | null = null;
    if (tenantId) {
      resolvedTenantId = await resolveTenantId(tenantId);
      if (!resolvedTenantId) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
    }

    // Validate priority if provided
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    const ticket = await db.ticket.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        priority: priority || 'medium',
        category: category || 'general',
        status: 'open',
        createdBy,
        tenantId: resolvedTenantId || null,
      },
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

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
