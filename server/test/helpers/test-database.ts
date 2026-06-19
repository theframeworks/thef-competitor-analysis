import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { disconnectPrisma } from '../../src/db/client.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function createTestDatabase(): Promise<{
  databaseUrl: string;
  cleanup: () => Promise<void>;
}> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'competitor-intel-test-'));
  const dbPath = path.join(tempDir, 'test.db');
  const databaseUrl = `file:${dbPath}`;

  execSync('npx prisma db push --schema=prisma/schema.sqlite.prisma --skip-generate', {
    cwd: serverRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });

  return {
    databaseUrl,
    cleanup: async () => {
      await disconnectPrisma();
      await fs.rm(tempDir, { recursive: true, force: true });
    },
  };
}

export async function resetProjects(): Promise<void> {
  const { getPrisma } = await import('../../src/db/client.js');
  await getPrisma().project.deleteMany();
}
