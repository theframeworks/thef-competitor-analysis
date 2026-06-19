import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectsRouter } from './routes/projects.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/projects', projectsRouter);

app.post('/api/messages', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server not configured: missing API key.' });
    return;
  }

  let payload: unknown;
  try {
    payload = req.body;
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid body');
    }
  } catch {
    res.status(400).json({ error: 'Invalid JSON body.' });
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    res.status(response.status).type('application/json').send(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(502).json({ error: `Anthropic proxy failed: ${message}` });
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
