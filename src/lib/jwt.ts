import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret_should_be_32_chars_long'
);

/**
 * Standard JWT Implementation
 * Designed for both Web and React Native app integration.
 */

export async function signJWT(payload: any) {
  // We use a long expiration for demo/dev, usually 1h-24h in production
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') 
    .sign(JWT_SECRET);
  return token;
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as any;
  } catch (error) {
    return null;
  }
}
