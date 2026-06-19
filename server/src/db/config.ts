/** Default SQLite database for local development (path relative to server/prisma/). */
export const DEFAULT_SQLITE_URL = "file:../../data/dev.db";

export function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }

  return DEFAULT_SQLITE_URL;
}

export function describeDatabase(url: string = resolveDatabaseUrl()): string {
  if (url.startsWith("file:")) {
    return `SQLite (${url.slice("file:".length)})`;
  }

  return "PostgreSQL";
}

export function isSqliteUrl(url: string = resolveDatabaseUrl()): boolean {
  return url.startsWith("file:");
}
