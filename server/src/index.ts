import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { describeStorageMode, getStorageMode } from './storage/mode.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = createApp();
const port = Number(process.env.PORT) || 8080;
const storageMode = getStorageMode();

if (storageMode === 'postgres' && !process.env.DATABASE_URL?.trim()) {
  console.error('DATABASE_URL is required when bookmark storage is postgres.');
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Bookmark storage: ${describeStorageMode(storageMode)}`);
});
