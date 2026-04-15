import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

export async function GET() {
  try {
    const { error, user: sessionUser } = await validateApiRequest();
    if (error) return error;

    const userId = sessionUser.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        tenant: { select: { id: true, name: true, slug: true } },
        customRole: { select: { id: true, name: true, color: true, permissions: true } },
        platformRole: { select: { id: true, name: true, color: true, permissions: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account deactivated' }, { status: 403 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      tenantId: user.tenant?.id || null,
      tenantSlug: user.tenant?.slug || null,
      tenantName: user.tenant?.name || null,
      phone: user.phone,
      customRole: user.customRole ? {
        id: user.customRole.id,
        name: user.customRole.name,
        color: user.customRole.color,
        permissions: JSON.parse(user.customRole.permissions || '{}'),
      } : null,
      platformRole: user.platformRole ? {
        id: user.platformRole.id,
        name: user.platformRole.name,
        color: user.platformRole.color,
        permissions: JSON.parse(user.platformRole.permissions || '{}'),
      } : null,
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
