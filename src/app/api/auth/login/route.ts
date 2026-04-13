import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJWT } from '@/lib/jwt';

// Simple in-memory rate limiter for brute-force protection
const rateLimitMap = new Map<string, { count: number, lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const BAN_DURATION = 15 * 60 * 1000; // 15 minutes

// POST - Authenticate user with email + password
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  
  // Check rate limit
  const limit = rateLimitMap.get(ip);
  if (limit && limit.count >= MAX_ATTEMPTS && Date.now() - limit.lastAttempt < BAN_DURATION) {
    const remainingTime = Math.ceil((BAN_DURATION - (Date.now() - limit.lastAttempt)) / 60000);
    return NextResponse.json({ 
      error: `Too many failed attempts. Please try again in ${remainingTime} minutes.` 
    }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const identifier = email.trim();

    // Find user by email or phone
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { phone: identifier },
        ],
      },
      include: {
        tenant: { select: { id: true, name: true, slug: true } },
        customRole: { select: { id: true, name: true, color: true, permissions: true } },
      },
    });

    if (!user) {
      // Increment failure count
      const current = rateLimitMap.get(ip) || { count: 0, lastAttempt: Date.now() };
      rateLimitMap.set(ip, { count: current.count + 1, lastAttempt: Date.now() });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: 'Your account has been deactivated. Please contact the administrator.' }, { status: 403 });
    }

    // Compare password using bcrypt (supports hashed passwords)
    // Also supports legacy plaintext for migration period
    const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    const isValid = isHashed
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!isValid) {
      // Increment failure count
      const current = rateLimitMap.get(ip) || { count: 0, lastAttempt: Date.now() };
      rateLimitMap.set(ip, { count: current.count + 1, lastAttempt: Date.now() });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Success - Reset rate limit for this IP
    rateLimitMap.delete(ip);

    // Generate JWT for React Native / mobile integration
    const token = await signJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant?.id || null,
    });

    // Return user data + token
    return NextResponse.json({
      success: true,
      token,
      user: {
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
      },
    });
  } catch (error) {
    console.error('Auth login error:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
