import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

export async function GET() {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    // 🔒 Security: Ensure tenant isolation
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 403 });
    }

    // ⚡ Paginated for scalability
    const notices = await db.notice.findMany({
      where: { tenantId },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(notices.map(n => ({
      id: n.id, title: n.title, content: n.content,
      authorName: n.author?.name || 'System', targetRole: n.targetRole,
      priority: n.priority, createdAt: n.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error('[NOTICES_GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error, tenantId, user } = await validateApiRequest();
    if (error) return error;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 403 });
    }

    const data = await request.json();
    const notice = await db.notice.create({
      data: {
        title: data.title,
        content: data.content,
        tenantId,
        authorId: user!.id,
        targetRole: data.targetRole || 'all',
        priority: data.priority || 'normal',
      }
    });
    return NextResponse.json({ id: notice.id, title: notice.title });
  } catch (error) {
    console.error('[NOTICES_POST]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 403 });
    }

    const data = await request.json();
    const { id, title, content, priority, targetRole } = data;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const existing = await db.notice.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Notice not found or access denied' }, { status: 404 });
    }

    await db.notice.update({
      where: { id },
      data: { title, content, priority, targetRole },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[NOTICES_PUT]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error, tenantId } = await validateApiRequest();
    if (error) return error;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const existing = await db.notice.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Notice not found or access denied' }, { status: 404 });
    }

    await db.notice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[NOTICES_DELETE]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
