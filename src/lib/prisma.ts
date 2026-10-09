import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getDatabaseUrl(): string {
  let url = process.env.DATABASE_URL;
  if (!url) {
    url =
      'postgresql://neondb_owner:npg_A9eTUGMiDc1j@ep-misty-sea-b5gd3vbe-pooler.c-7.us-east-2.aws.neon.tech/aurum?sslmode=require';
  }
  // If connection string points to default Neon 'neondb' database, reroute to 'aurum' where the fleet tables live
  if (url.includes('/neondb')) {
    url = url.replace('/neondb', '/aurum');
  }
  return url;
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

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
