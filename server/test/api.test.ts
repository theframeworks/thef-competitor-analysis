import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import type { Project } from '../src/types/project.js';

interface MockResponse {
  status: number;
  body?: unknown;
  statusText?: string;
}

interface FetchCall {
  url: string;
  init?: RequestInit;
}

function jsonResponse(status: number, body: unknown, statusText = 'OK'): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as Response;
}

function createMockFetch(
  handlers: Array<{
    match: (url: string, init?: RequestInit) => boolean;
    response:
      | MockResponse
      | ((url: string, init?: RequestInit) => MockResponse | Promise<MockResponse>);
  }>,
  originalFetch: typeof fetch = globalThis.fetch,
) {
  const calls: FetchCall[] = [];

  const mockFetch = async (url: string | URL | Request, init?: RequestInit) => {
    const urlStr = url.toString();

    if (urlStr.includes('127.0.0.1') || urlStr.includes('localhost')) {
      return originalFetch(url, init);
    }

    calls.push({ url: urlStr, init });

    for (const handler of handlers) {
      if (handler.match(urlStr, init)) {
        const result =
          typeof handler.response === 'function'
            ? await handler.response(urlStr, init)
            : handler.response;
        return jsonResponse(result.status, result.body, result.statusText);
      }
    }

    throw new Error(`Unmocked fetch: ${urlStr} ${init?.method ?? 'GET'}`);
  };

  return { mockFetch, calls };
}

const sampleCreateBody = {
  name: 'Q1 Competitive Set',
  anchorName: 'Acme Corp',
  brands: [],
  opportunities: [],
  crossThemes: null,
};

const storedProject: Project = {
  id: 'q1-competitive-set-abcd1234',
  name: 'Q1 Competitive Set',
  anchorName: 'Acme Corp',
  brands: [],
  opportunities: [],
  crossThemes: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

async function withServer(
  fn: (baseUrl: string) => Promise<void>,
  env: Record<string, string | undefined> = {},
): Promise<void> {
  const previousEnv = { ...process.env };
  Object.assign(process.env, env);

  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const listener = app.listen(0, () => resolve(listener));
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind test server');
  }

  try {
    await fn(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    process.env = previousEnv;
  }
}

describe('POST /api/messages', () => {
  let fetchMock: ReturnType<typeof mock.method>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    const { mockFetch } = createMockFetch(
      [
        {
          match: (url) => url === 'https://api.anthropic.com/v1/messages',
          response: {
            status: 200,
            body: { id: 'msg_123', type: 'message', role: 'assistant', content: [] },
          },
        },
      ],
      originalFetch,
    );
    fetchMock = mock.method(globalThis, 'fetch', mockFetch);
  });

  afterEach(() => {
    fetchMock.mock.restore();
  });

  it('proxies the request body to Anthropic and returns the upstream response', async () => {
    const requestBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello' }],
    };

    await withServer(
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        assert.equal(response.status, 200);
        const body = (await response.json()) as { id: string };
        assert.equal(body.id, 'msg_123');

        const anthropicCall = fetchMock.mock.calls.find(
          (call) => call.arguments[0] === 'https://api.anthropic.com/v1/messages',
        );
        assert.ok(anthropicCall);

        const init = anthropicCall.arguments[1] as RequestInit;
        const headers = init.headers as Record<string, string>;
        assert.equal(init.method, 'POST');
        assert.equal(headers['x-api-key'], 'test-anthropic-key');
        assert.equal(headers['anthropic-version'], '2023-06-01');
        assert.equal(init.body, JSON.stringify(requestBody));
      },
      { ANTHROPIC_API_KEY: 'test-anthropic-key' },
    );
  });
});

describe('project routes', () => {
  let fetchMock: ReturnType<typeof mock.method>;
  let calls: FetchCall[];
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    const fetchSetup = createMockFetch(
      [
      {
        match: (url, init) =>
          url.endsWith('/contents/data/projects') && (!init?.method || init.method === 'GET'),
        response: {
          status: 200,
          body: [
            {
              name: `${storedProject.id}.json`,
              path: `data/projects/${storedProject.id}.json`,
              sha: 'list-sha',
              size: 100,
              type: 'file',
            },
          ],
        },
      },
      {
        match: (url, init) =>
          url.endsWith(`/contents/data/projects/${storedProject.id}.json`) &&
          (!init?.method || init.method === 'GET'),
        response: {
          status: 200,
          body: {
            name: `${storedProject.id}.json`,
            path: `data/projects/${storedProject.id}.json`,
            sha: 'file-sha-1',
            content: Buffer.from(JSON.stringify(storedProject, null, 2)).toString('base64'),
            encoding: 'base64',
            type: 'file',
          },
        },
      },
      {
        match: (url, init) =>
          url.includes('/contents/data/projects/') &&
          url.endsWith('.json') &&
          init?.method === 'PUT' &&
          !url.endsWith(`/contents/data/projects/${storedProject.id}.json`),
        response: {
          status: 201,
          body: { content: { path: 'data/projects/new-bookmark.json' } },
        },
      },
      {
        match: (url, init) =>
          url.endsWith(`/contents/data/projects/${storedProject.id}.json`) &&
          init?.method === 'PUT',
        response: (_url, init) => {
          const body = JSON.parse(String(init?.body)) as { sha?: string; message?: string };
          const putCallsForProject = calls.filter(
            (call) =>
              call.init?.method === 'PUT' &&
              call.url.endsWith(`/contents/data/projects/${storedProject.id}.json`),
          );

          if (putCallsForProject.length === 1) {
            return { status: 409, body: { message: 'Conflict' }, statusText: 'Conflict' };
          }
          return {
            status: 200,
            body: { content: { path: `data/projects/${storedProject.id}.json` } },
          };
        },
      },
      {
        match: (url, init) =>
          url.endsWith(`/contents/data/projects/${storedProject.id}.json`) &&
          init?.method === 'DELETE',
        response: { status: 200, body: {} },
      },
      {
        match: (url, init) =>
          url.endsWith('/contents/data/projects/existing.json') && init?.method === 'PUT',
        response: { status: 422, body: { message: 'sha was not supplied' }, statusText: 'Unprocessable Entity' },
      },
    ],
      originalFetch,
    );

    calls = fetchSetup.calls;
    fetchMock = mock.method(globalThis, 'fetch', fetchSetup.mockFetch);
  });

  afterEach(() => {
    fetchMock.mock.restore();
  });

  const githubEnv = {
    GITHUB_TOKEN: 'test-github-token',
    GITHUB_REPO: 'owner/repo',
    GITHUB_DATA_PATH: 'data/projects',
  };

  it('lists project summaries', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/projects`);
      assert.equal(response.status, 200);

      const projects = (await response.json()) as Array<{ id: string; name: string }>;
      assert.equal(projects.length, 1);
      assert.equal(projects[0]?.id, storedProject.id);
      assert.equal(projects[0]?.name, storedProject.name);
    }, githubEnv);
  });

  it('gets a single project by id', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/projects/${storedProject.id}`);
      assert.equal(response.status, 200);

      const project = (await response.json()) as Project;
      assert.equal(project.id, storedProject.id);
      assert.equal(project.anchorName, 'Acme Corp');
    }, githubEnv);
  });

  it('creates a project with a [skip ci] commit message', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleCreateBody),
      });

      assert.equal(response.status, 201);
      const project = (await response.json()) as Project;
      assert.match(project.id, /^q1-competitive-set-[a-f0-9]{8}$/);

      const putCall = calls.find(
        (call) => call.init?.method === 'PUT' && call.url.includes('/contents/data/projects/'),
      );
      assert.ok(putCall);

      const putBody = JSON.parse(String(putCall.init?.body)) as { message: string };
      assert.equal(putBody.message, `Save bookmark: ${sampleCreateBody.name} [skip ci]`);
    }, githubEnv);
  });

  it('updates a project and retries after a 409 conflict', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/projects/${storedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...storedProject,
          name: 'Updated Bookmark',
        }),
      });

      assert.equal(response.status, 200);
      const project = (await response.json()) as Project;
      assert.equal(project.name, 'Updated Bookmark');

      const putCalls = calls.filter(
        (call) =>
          call.init?.method === 'PUT' &&
          call.url.endsWith(`/contents/data/projects/${storedProject.id}.json`),
      );
      assert.equal(putCalls.length, 2);

      const firstPut = JSON.parse(String(putCalls[0]?.init?.body)) as {
        message: string;
        sha: string;
      };
      const secondPut = JSON.parse(String(putCalls[1]?.init?.body)) as {
        message: string;
        sha: string;
      };

      assert.equal(firstPut.sha, 'file-sha-1');
      assert.equal(secondPut.sha, 'file-sha-1');
      assert.equal(firstPut.message, 'Refresh bookmark: Updated Bookmark [skip ci]');
      assert.equal(secondPut.message, 'Refresh bookmark: Updated Bookmark [skip ci]');
    }, githubEnv);
  });

  it('returns 409 when creating a project that already exists', async () => {
    fetchMock.mock.restore();

    const fetchSetup = createMockFetch(
      [
        {
          match: (url, init) =>
            url.includes('/contents/data/projects/') && init?.method === 'PUT',
          response: {
            status: 422,
            body: { message: 'sha was not supplied' },
            statusText: 'Unprocessable Entity',
          },
        },
      ],
      originalFetch,
    );

    fetchMock = mock.method(globalThis, 'fetch', fetchSetup.mockFetch);

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleCreateBody),
      });

      assert.equal(response.status, 409);
      const body = (await response.json()) as { error: string };
      assert.match(body.error, /already exists/);

      const putCall = fetchSetup.calls.find((call) => call.init?.method === 'PUT');
      assert.ok(putCall);
      const putBody = JSON.parse(String(putCall.init?.body)) as { message: string };
      assert.equal(putBody.message, `Save bookmark: ${sampleCreateBody.name} [skip ci]`);
    }, githubEnv);
  });
});
