import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const view = searchParams.get('view'); // 'admin' for admin view

    if (parentId) {
      // Parent view - get subscriptions for a specific parent
      const subscriptions = await db.subscription.findMany({
        where: { parentId },
        orderBy: { createdAt: 'desc' },
      });

      // Get the parent info
      const parent = await db.parent.findUnique({
        where: { id: parentId },
        include: { user: { select: { name: true, email: true } } },
      });

      // Get active subscription
      const activeSubscription = subscriptions.find(s => s.status === 'active');

      return NextResponse.json({
        parent,
        activeSubscription: activeSubscription || null,
        subscriptions,
      });
    }

    if (view === 'admin') {
      // Admin view - get all subscriptions with parent info
      const subscriptions = await db.subscription.findMany({
        include: {
          parent: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
              students: {
                include: {
                  class: { select: { name: true, section: true, grade: true } },
                  user: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Stats
      const totalSubscriptions = subscriptions.length;
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const totalRevenue = subscriptions.reduce((sum, s) => sum + s.amount, 0);
      const planBreakdown = subscriptions.reduce((acc, s) => {
        acc[s.planName] = (acc[s.planName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return NextResponse.json({
        subscriptions,
        stats: {
          totalSubscriptions,
          activeSubscriptions,
          totalRevenue,
          planBreakdown,
        },
      });
    }

    return NextResponse.json({ error: 'Missing parentId or view parameter' }, { status: 400 });
  } catch (error) {
    console.error('Subscriptions GET error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error } = await validateApiRequest();
    if (error) return error;

    const body = await request.json();
    const { action } = body;

    if (action === 'purchase') {
      const { parentId, planId, planName, amount, period, addons } = body;

      // Get parent's tenant via user
      const parentRecord = await db.parent.findUnique({ where: { id: parentId }, include: { user: { select: { tenantId: true } } } });
      if (!parentRecord) {
        return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
      }

      // Deactivate any existing active subscription
      await db.subscription.updateMany({
        where: { parentId, status: 'active' },
        data: { status: 'cancelled' },
      });

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      if (period === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else if (period === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Generate dummy transaction ID
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const subscription = await db.subscription.create({
        data: {
          parentId,
          tenantId: parentRecord.user.tenantId!,
          planId,
          planName,
          amount,
          period: period || 'yearly',
          status: 'active',
          paymentMethod: 'card',
          transactionId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          autoRenew: true,
          addons: JSON.stringify(addons || []),
        },
      });

      return NextResponse.json({ success: true, subscription });
    }

    if (action === 'cancel') {
      const { subscriptionId } = body;
      const subscription = await db.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'cancelled', autoRenew: false },
      });
      return NextResponse.json({ success: true, subscription });
    }

    if (action === 'add-addon') {
      const { parentId, addonName, addonPrice } = body;
      // Get current active subscription
      const active = await db.subscription.findFirst({
        where: { parentId, status: 'active' },
      });

      if (!active) {
        return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
      }

      const currentAddons: string[] = JSON.parse(active.addons || '[]');
      if (!currentAddons.includes(addonName)) {
        currentAddons.push(addonName);
      }

      const updated = await db.subscription.update({
        where: { id: active.id },
        data: {
          addons: JSON.stringify(currentAddons),
          amount: active.amount + addonPrice,
        },
      });

      return NextResponse.json({ success: true, subscription: updated });
    }

    // ── Admin actions ──────────────────────────────────────────────

    if (action === 'admin-create') {
      const { parentId, planId, planName, amount, period, paymentMethod, addons } = body;

      if (!parentId || !planId || !planName || amount == null) {
        return NextResponse.json(
          { error: 'parentId, planId, planName, and amount are required' },
          { status: 400 },
        );
      }

      // Get parent's tenant via user
      const parentRecord = await db.parent.findUnique({ where: { id: parentId }, include: { user: { select: { tenantId: true } } } });
      if (!parentRecord) {
        return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
      }

      // Deactivate any existing active subscription for this parent
      await db.subscription.updateMany({
        where: { parentId, status: 'active' },
        data: { status: 'cancelled' },
      });

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      if (period === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        // yearly (default)
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Generate dummy transaction ID
      const transactionId = `TXN-ADMIN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const subscription = await db.subscription.create({
        data: {
          parentId,
          tenantId: parentRecord.user.tenantId!,
          planId,
          planName,
          amount,
          period: period || 'yearly',
          status: 'active',
          paymentMethod: paymentMethod || 'card',
          transactionId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          autoRenew: true,
          addons: JSON.stringify(addons || []),
        },
      });

      return NextResponse.json({ success: true, subscription });
    }

    if (action === 'admin-update') {
      const {
        subscriptionId,
        planName,
        amount,
        period,
        autoRenew,
        paymentMethod,
        status,
        addons,
      } = body;

      if (!subscriptionId) {
        return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
      }

      // Fetch the current subscription
      const existing = await db.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
      }

      // Build the update payload with only the fields that were provided
      const updateData: Record<string, unknown> = {};

      if (planName !== undefined) updateData.planName = planName;
      if (amount !== undefined) updateData.amount = amount;
      if (period !== undefined) updateData.period = period;
      if (autoRenew !== undefined) updateData.autoRenew = autoRenew;
      if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
      if (status !== undefined) updateData.status = status;
      if (addons !== undefined) updateData.addons = JSON.stringify(addons);

      // If planName or period changed, recalculate the end date based on start date
      const planChanged = planName !== undefined && planName !== existing.planName;
      const periodChanged = period !== undefined && period !== existing.period;

      if (planChanged || periodChanged) {
        const start = new Date(existing.startDate);
        const newEnd = new Date(start);
        const effectivePeriod = period || existing.period;

        if (effectivePeriod === 'monthly') {
          newEnd.setMonth(newEnd.getMonth() + 1);
        } else {
          newEnd.setFullYear(newEnd.getFullYear() + 1);
        }

        updateData.endDate = newEnd.toISOString().split('T')[0];
      }

      const updated = await db.subscription.update({
        where: { id: subscriptionId },
        data: updateData as any,
      });

      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === 'admin-activate') {
      const { subscriptionId, newEndDate } = body;

      if (!subscriptionId) {
        return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
      }

      // Verify the subscription exists
      const existing = await db.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
      }

      const updateData: Record<string, unknown> = {
        status: 'active',
        autoRenew: true,
      };

      if (newEndDate) {
        updateData.endDate = newEndDate;
      }

      const activated = await db.subscription.update({
        where: { id: subscriptionId },
        data: updateData as any,
      });

      return NextResponse.json({ success: true, subscription: activated });
    }

    if (action === 'admin-extend') {
      const { subscriptionId, days } = body;

      if (!subscriptionId || days == null) {
        return NextResponse.json(
          { error: 'subscriptionId and days are required' },
          { status: 400 },
        );
      }

      if (typeof days !== 'number' || days <= 0) {
        return NextResponse.json({ error: 'days must be a positive number' }, { status: 400 });
      }

      // Fetch the current subscription
      const existing = await db.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
      }

      // Calculate new end date by adding days to the current endDate
      // If no endDate exists, use today as the base
      const baseDate = existing.endDate ? new Date(existing.endDate) : new Date();
      baseDate.setDate(baseDate.getDate() + days);

      const extended = await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          endDate: baseDate.toISOString().split('T')[0],
        },
      });

      return NextResponse.json({ success: true, subscription: extended });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Subscriptions POST error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error } = await validateApiRequest();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await db.subscription.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscriptions DELETE error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
