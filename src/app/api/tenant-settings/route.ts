import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

const DEFAULT_SETTINGS = {
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
};

// GET /api/tenant-settings
export async function GET() {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    let settings: Record<string, unknown> = DEFAULT_SETTINGS;

    if (tenant.settings && tenant.settings.trim() !== '' && tenant.settings !== '{}') {
      try {
        settings = { ...DEFAULT_SETTINGS, ...JSON.parse(tenant.settings) };
      } catch {
        settings = DEFAULT_SETTINGS;
      }
    }

    return NextResponse.json(settings); // Frontend expectation
  } catch (error) {
    console.error('[TENANT_SETTINGS_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/tenant-settings
export async function PUT(request: Request) {
  try {
    const { error, tenantId: rawTenantId } = await validateApiRequest();
    if (error) return error;
    const tenantId = rawTenantId!;

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'settings object is required' }, { status: 400 });
    }

    await db.tenant.update({
      where: { id: tenantId },
      data: { settings: JSON.stringify(settings) },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[TENANT_SETTINGS_PUT]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
