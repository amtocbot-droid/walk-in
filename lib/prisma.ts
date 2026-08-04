import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let prismaClient: PrismaClient | null = null;

function createPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg") as typeof import("@prisma/adapter-pg");
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch (err) {
    console.error("[prisma] failed to create client:", err);
    return null;
  }
}

export function getPrisma(): PrismaClient | null {
  if (prismaClient) return prismaClient;
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  prismaClient = createPrismaClient();
  if (process.env.NODE_ENV !== "production" && prismaClient) {
    globalForPrisma.prisma = prismaClient;
  }
  return prismaClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    if (!client) {
      throw new Error("Prisma is not configured. Set DATABASE_URL.");
    }
    return client[prop as keyof PrismaClient];
  },
});
