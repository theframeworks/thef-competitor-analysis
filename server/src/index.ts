import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { getStorageMode } from './storage/mode.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = createApp();
const port = Number(process.env.PORT) || 8080;

app.listen(port, () => {
  const storage = getStorageMode();
  console.log(`Server listening on http://localhost:${port}`);
  console.log(
    storage === 'local'
      ? 'Bookmark storage: local files (data/projects/)'
      : 'Bookmark storage: GitHub Contents API',
  );
});
