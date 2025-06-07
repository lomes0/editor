import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// Remove export * from "@prisma/client" to avoid CJS/ESM interop warning
// If you need specific types, import them explicitly where needed
