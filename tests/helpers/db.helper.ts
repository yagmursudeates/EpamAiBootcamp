import { prisma } from "../../src/db/client";

/**
 * Truncates all tables in the correct dependency order before each test.
 * Use in `beforeEach` to ensure a clean slate.
 */
export async function cleanDatabase(): Promise<void> {
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Disconnects Prisma after all tests in a suite complete.
 * Use in `afterAll`.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
