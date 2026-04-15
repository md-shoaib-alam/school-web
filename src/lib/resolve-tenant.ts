import { db } from '@/lib/db';

/**
 * Resolve a raw tenant identifier to a real database tenant ID.
 *
 * Accepts:
 *   1. A real cuid (e.g. "clx1abc2...") → returned as-is if found
 *   2. A slug with "tenant-" prefix (e.g. "tenant-sigel") → strips prefix, looks up by slug
 *   3. A plain slug (e.g. "sigel") → looks up by slug
 *
 * Returns the actual tenant ID (cuid) or null if not found.
 */
export async function resolveTenantId(rawId: string): Promise<string | null> {
  if (!rawId || typeof rawId !== 'string' || rawId.trim().length === 0) {
    return null;
  }

  const trimmed = rawId.trim();
  const slug = trimmed.replace(/^tenant-/, '');

  // 🔒 Performance: Single query with OR instead of two sequential queries
  const tenant = await db.tenant.findFirst({
    where: {
      OR: [
        { id: trimmed },
        { slug },
      ],
    },
    select: { id: true },
  });

  return tenant?.id || null;
}
