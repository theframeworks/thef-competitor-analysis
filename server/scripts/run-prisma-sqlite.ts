import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "../src/env.js";
import { resolveDatabaseUrl } from "../src/db/config.js";

const serverRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const databaseUrl = resolveDatabaseUrl();

const result = spawnSync("prisma", process.argv.slice(2), {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: databaseUrl },
  cwd: serverRoot,
});

process.exit(result.status ?? 1);
