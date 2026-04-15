import { PrismaClient } from '@prisma/client';

// Simple metrics tracking
const metrics = {
  totalQueries: 0,
  lastQueryTime: 0,
  warm: false
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaBase = globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

export const rawDb = prismaBase;

// Create an extended client to track stats
export const db = prismaBase.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = performance.now();
      try {
        metrics.totalQueries++;
        metrics.warm = true;
        return await query(args);
      } finally {
        metrics.lastQueryTime = performance.now() - start;
      }
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaBase;

/**
 * Returns connection pool and query health metrics
 */
export function getPoolStats() {
  return { ...metrics };
}

/**
 * Returns server memory usage in MB
 */
export function getMemoryStats() {
  const mem = process.memoryUsage();
  return {
    rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
  };
}