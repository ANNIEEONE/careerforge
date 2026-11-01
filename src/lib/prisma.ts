import { PrismaClient } from "@prisma/client";

// Set writable SQLite path in serverless environments
const isServerless = Boolean(
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
);

if (isServerless && (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("dev.db"))) {
  process.env.DATABASE_URL = "file:/tmp/dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
