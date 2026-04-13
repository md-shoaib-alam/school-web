import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateApiRequest } from '@/lib/api-auth';

// GET /api/platform-settings?key=maintenance_mode
export async function GET(request: NextRequest) {
  try {
    // 🔒 Security: Only super_admin can read platform settings
    const { error, user } = await validateApiRequest();
    if (error) return error;
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // Fetch a specific setting
      const setting = await db.platformSetting.findUnique({
        where: { key },
      });
      return NextResponse.json({
        key,
        value: setting?.value ?? null,
      });
    }

    // Fetch all settings
    const settings = await db.platformSetting.findMany();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/platform-settings
export async function PUT(request: NextRequest) {
  try {
    // 🔒 Security: Only super_admin can update platform settings
    const { error, user } = await validateApiRequest();
    if (error) return error;
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const setting = await db.platformSetting.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });

    return NextResponse.json({
      key: setting.key,
      value: setting.value,
      updatedAt: setting.updatedAt,
    });
  } catch (error) {
    console.error('Error updating platform setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}
