import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { StorageError } from "../src/db/errors.js";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "../src/db/projects.js";
import { createTestDatabase, resetProjects } from "./helpers/test-database.js";

describe("bookmark storage", () => {
  let databaseUrl: string;
  let cleanup: () => Promise<void>;
  const previousDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(async () => {
    ({ databaseUrl, cleanup } = await createTestDatabase());
    process.env.DATABASE_URL = databaseUrl;
  });

  afterEach(async () => {
    process.env.DATABASE_URL = previousDatabaseUrl;
    await cleanup();
  });

  it("creates, lists, updates, and deletes projects", async () => {
    const input = {
      name: "Local bookmark",
      anchorName: "Acme",
      brands: [],
      opportunities: [],
      crossThemes: null,
    };

    const created = await createProject("acme-local-abcd1234", input);
    assert.equal(created.name, "Local bookmark");

    const listed = await listProjects();
    assert.equal(listed.length, 1);
    assert.equal(listed[0]?.id, "acme-local-abcd1234");

    const loaded = await getProject("acme-local-abcd1234");
    assert.equal(loaded.anchorName, "Acme");

    const updated = await updateProject({
      ...loaded,
      name: "Updated bookmark",
    });
    assert.equal(updated.name, "Updated bookmark");

    await deleteProject("acme-local-abcd1234");
    const afterDelete = await listProjects();
    assert.equal(afterDelete.length, 0);
  });

  it("returns 409 when creating a duplicate id", async () => {
    const input = {
      name: "Duplicate",
      anchorName: "Acme",
      brands: [],
      opportunities: [],
      crossThemes: null,
    };

    await createProject("duplicate-id", input);
    await assert.rejects(
      () => createProject("duplicate-id", input),
      StorageError,
    );
  });

  it("clears data between tests via resetProjects", async () => {
    await createProject("reset-test", {
      name: "Reset",
      anchorName: "Acme",
      brands: [],
      opportunities: [],
      crossThemes: null,
    });
    await resetProjects();
    const listed = await listProjects();
    assert.equal(listed.length, 0);
  });
});
