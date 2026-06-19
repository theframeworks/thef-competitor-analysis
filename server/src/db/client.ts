import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "./config.js";

let prismaInstance: PrismaClient | undefined;
let connectedUrl: string | undefined;

export function getPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL?.trim() || resolveDatabaseUrl();
  process.env.DATABASE_URL = url;

  if (!prismaInstance || connectedUrl !== url) {
    if (prismaInstance) {
      void prismaInstance.$disconnect();
    }
    prismaInstance = new PrismaClient();
    connectedUrl = url;
  }

  return prismaInstance;
}

export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = undefined;
    connectedUrl = undefined;
  }
}

export function ensureDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim() || resolveDatabaseUrl();
  process.env.DATABASE_URL = url;
  return url;
}
