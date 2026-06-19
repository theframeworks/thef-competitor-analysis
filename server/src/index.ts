import './env.js';
import { createApp } from './app.js';
import { describeDatabase } from './db/config.js';
import { ensureDatabaseUrl } from './db/client.js';

try {
  ensureDatabaseUrl();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const app = createApp();
const port = Number(process.env.PORT) || 8080;
const databaseUrl = process.env.DATABASE_URL!;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Database: ${describeDatabase(databaseUrl)}`);
});
