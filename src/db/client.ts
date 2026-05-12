import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Prisma client singleton. Reuses the same instance in development
 * to avoid exhausting database connections during hot reload.
 */
export const prisma: PrismaClient =
  globalThis.__prisma ?? new PrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalThis.__prisma = prisma;
}
