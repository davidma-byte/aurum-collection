import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  let clean = url;
  if (clean.includes('/neondb')) {
    clean = clean.replace('/neondb', '/aurum');
  }
  if (!clean.includes('sslmode=')) {
    clean += (clean.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  if (!clean.includes('connect_timeout=')) {
    clean += (clean.includes('?') ? '&' : '?') + 'connect_timeout=30';
  }
  if (clean.includes('-pooler') && !clean.includes('pgbouncer=')) {
    clean += (clean.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
  return clean;
}

const fallbackUrl =
  'postgresql://neondb_owner:npg_A9eTUGMiDc1j@ep-misty-sea-b5gd3vbe-pooler.c-7.us-east-2.aws.neon.tech/aurum?sslmode=require&pgbouncer=true&connect_timeout=30';

const dbUrl = sanitizeUrl(process.env.DATABASE_URL) || fallbackUrl;
process.env.DATABASE_URL = dbUrl;

if (process.env.PRISMA_DATABASE_URL) {
  process.env.PRISMA_DATABASE_URL = sanitizeUrl(process.env.PRISMA_DATABASE_URL) || dbUrl;
}
if (process.env.POSTGRES_URL) {
  process.env.POSTGRES_URL = sanitizeUrl(process.env.POSTGRES_URL) || dbUrl;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
