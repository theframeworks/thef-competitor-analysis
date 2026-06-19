import assert from "node:assert/strict";
import type { Server } from "node:http";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import { createApp } from "../src/app.js";
import { createProject } from "../src/db/projects.js";
import type { Project } from "../src/types/project.js";
import { createTestDatabase } from "./helpers/test-database.js";

interface MockResponse {
  status: number;
  body?: unknown;
  statusText?: string;
}

function jsonResponse(
  status: number,
  body: unknown,
  statusText = "OK",
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  } as Response;
}

function createMockFetch(
  handlers: Array<{
    match: (url: string, init?: RequestInit) => boolean;
    response: MockResponse;
  }>,
  originalFetch: typeof fetch = globalThis.fetch,
) {
  const mockFetch = async (url: string | URL | Request, init?: RequestInit) => {
    const urlStr = url.toString();

    if (urlStr.includes("127.0.0.1") || urlStr.includes("localhost")) {
      return originalFetch(url, init);
    }

    for (const handler of handlers) {
      if (handler.match(urlStr, init)) {
        return jsonResponse(
          handler.response.status,
          handler.response.body,
          handler.response.statusText,
        );
      }
    }

    throw new Error(`Unmocked fetch: ${urlStr} ${init?.method ?? "GET"}`);
  };

  return mockFetch;
}

const sampleCreateBody = {
  name: "Q1 Competitive Set",
  anchorName: "Acme Corp",
  brands: [],
  opportunities: [],
  crossThemes: null,
};

const storedProject: Project = {
  id: "q1-competitive-set-abcd1234",
  name: "Q1 Competitive Set",
  anchorName: "Acme Corp",
  brands: [],
  opportunities: [],
  crossThemes: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
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
  if (!address || typeof address === "string") {
    throw new Error("Failed to bind test server");
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

describe("POST /api/messages", () => {
  let fetchMock: ReturnType<typeof mock.method>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    const mockFetch = createMockFetch(
      [
        {
          match: (url) => url === "https://api.anthropic.com/v1/messages",
          response: {
            status: 200,
            body: {
              id: "msg_123",
              type: "message",
              role: "assistant",
              content: [],
            },
          },
        },
      ],
      originalFetch,
    );
    fetchMock = mock.method(globalThis, "fetch", mockFetch);
  });

  afterEach(() => {
    fetchMock.mock.restore();
  });

  it("proxies the request body to Anthropic and returns the upstream response", async () => {
    const requestBody = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: "Hello" }],
    };

    await withServer(
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        assert.equal(response.status, 200);
        const body = (await response.json()) as { id: string };
        assert.equal(body.id, "msg_123");

        const anthropicCall = fetchMock.mock.calls.find(
          (call) =>
            call.arguments[0] === "https://api.anthropic.com/v1/messages",
        );
        assert.ok(anthropicCall);

        const init = anthropicCall.arguments[1] as RequestInit;
        const headers = init.headers as Record<string, string>;
        assert.equal(init.method, "POST");
        assert.equal(headers["x-api-key"], "test-anthropic-key");
        assert.equal(headers["anthropic-version"], "2023-06-01");
        assert.equal(init.body, JSON.stringify(requestBody));
      },
      { ANTHROPIC_API_KEY: "test-anthropic-key" },
    );
  });
});

describe("project routes", () => {
  let databaseUrl: string;
  let cleanup: () => Promise<void>;
  const previousDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(async () => {
    ({ databaseUrl, cleanup } = await createTestDatabase());
    process.env.DATABASE_URL = databaseUrl;
    await createProject(storedProject.id, {
      name: storedProject.name,
      anchorName: storedProject.anchorName,
      brands: storedProject.brands,
      opportunities: storedProject.opportunities,
      crossThemes: storedProject.crossThemes,
    });
  });

  afterEach(async () => {
    process.env.DATABASE_URL = previousDatabaseUrl;
    await cleanup();
  });

  it("lists project summaries", async () => {
    await withServer(
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/projects`);
        assert.equal(response.status, 200);

        const projects = (await response.json()) as Array<{
          id: string;
          name: string;
        }>;
        assert.equal(projects.length, 1);
        assert.equal(projects[0]?.id, storedProject.id);
        assert.equal(projects[0]?.name, storedProject.name);
      },
      { DATABASE_URL: databaseUrl },
    );
  });

  it("gets a single project by id", async () => {
    await withServer(
      async (baseUrl) => {
        const response = await fetch(
          `${baseUrl}/api/projects/${storedProject.id}`,
        );
        assert.equal(response.status, 200);

        const project = (await response.json()) as Project;
        assert.equal(project.id, storedProject.id);
        assert.equal(project.anchorName, "Acme Corp");
      },
      { DATABASE_URL: databaseUrl },
    );
  });

  it("creates a project", async () => {
    await withServer(
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sampleCreateBody),
        });

        assert.equal(response.status, 201);
        const project = (await response.json()) as Project;
        assert.match(project.id, /^q1-competitive-set-[a-f0-9]{8}$/);

        const listResponse = await fetch(`${baseUrl}/api/projects`);
        const projects = (await listResponse.json()) as Project[];
        assert.equal(projects.length, 2);
      },
      { DATABASE_URL: databaseUrl },
    );
  });

  it("updates a project", async () => {
    await withServer(
      async (baseUrl) => {
        const response = await fetch(
          `${baseUrl}/api/projects/${storedProject.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...storedProject,
              name: "Updated Bookmark",
            }),
          },
        );

        assert.equal(response.status, 200);
        const project = (await response.json()) as Project;
        assert.equal(project.name, "Updated Bookmark");
      },
      { DATABASE_URL: databaseUrl },
    );
  });
});
