import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Cache on globalThis in ALL environments to prevent connection pool exhaustion
// in serverless environments (Vercel, AWS Lambda, etc.)
globalForPrisma.prisma = prisma;

export default prisma;
