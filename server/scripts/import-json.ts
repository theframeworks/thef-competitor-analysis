/**
 * One-time import of bookmark JSON files into the database.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... npm run db:import-json --workspace=server
 *   DATABASE_URL=file:../../data/dev.db npm run db:import-json --workspace=server
 *
 * Defaults to data/projects/ at the repo root.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "../src/env.js";
import { disconnectPrisma, getPrisma } from "../src/db/client.js";
import type { Project } from "../src/types/project.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  const sourceDir =
    process.argv[2]?.trim() || path.resolve(__dirname, "../../data/projects");

  let entries: string[];
  try {
    entries = await fs.readdir(sourceDir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(`No directory at ${sourceDir}; nothing to import.`);
      return;
    }
    throw err;
  }

  const jsonFiles = entries.filter((name) => name.endsWith(".json"));
  if (jsonFiles.length === 0) {
    console.log(`No JSON files in ${sourceDir}.`);
    return;
  }

  const prisma = getPrisma();
  let imported = 0;
  let skipped = 0;

  for (const filename of jsonFiles) {
    const raw = await fs.readFile(path.join(sourceDir, filename), "utf8");
    const project = JSON.parse(raw) as Project;

    const existing = await prisma.project.findUnique({
      where: { id: project.id },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.project.create({
      data: {
        id: project.id,
        name: project.name,
        anchorName: project.anchorName,
        brands: project.brands,
        opportunities: project.opportunities,
        crossThemes: project.crossThemes,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
      },
    });
    imported += 1;
  }

  console.log(
    `Import complete: ${imported} created, ${skipped} skipped (already exist).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
  });
