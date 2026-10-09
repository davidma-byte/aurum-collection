import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Ensure DATABASE_URL is available even if not yet configured in deployment environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://neondb_owner:npg_A9eTUGMiDc1j@ep-misty-sea-b5gd3vbe-pooler.c-7.us-east-2.aws.neon.tech/aurum?sslmode=require';
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
