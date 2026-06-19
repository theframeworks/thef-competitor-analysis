import "./env.js";
import { createApp } from "./app.js";
import { ensureDatabaseUrl } from "./db/client.js";
import { describeDatabase } from "./db/config.js";

let databaseUrl: string;
try {
  databaseUrl = ensureDatabaseUrl();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const app = createApp();
const port = Number(process.env.PORT) || 8080;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Database: ${describeDatabase(databaseUrl)}`);
});
