import { Prisma } from '@prisma/client';
import { getPrisma } from '../db/client.js';
import { StorageError } from '../storage/errors.js';
import type {
  Brand,
  CreateProjectInput,
  CrossThemes,
  Opportunity,
  Project,
  ProjectSummary,
} from '../types/project.js';

type ProjectRow = {
  id: string;
  name: string;
  anchorName: string;
  brands: unknown;
  opportunities: unknown;
  crossThemes: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    anchorName: row.anchorName,
    brands: row.brands as Brand[],
    opportunities: row.opportunities as Opportunity[],
    crossThemes: (row.crossThemes as CrossThemes | null) ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toSummary(
  row: Pick<ProjectRow, 'id' | 'name' | 'anchorName' | 'createdAt' | 'updatedAt'>,
): ProjectSummary {
  return {
    id: row.id,
    name: row.name,
    anchorName: row.anchorName,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function createInputToData(
  id: string,
  input: CreateProjectInput,
): Prisma.ProjectCreateInput {
  return {
    id,
    name: input.name,
    anchorName: input.anchorName,
    brands: input.brands as unknown as Prisma.InputJsonValue,
    opportunities: input.opportunities as unknown as Prisma.InputJsonValue,
    crossThemes:
      input.crossThemes === null
        ? Prisma.JsonNull
        : (input.crossThemes as unknown as Prisma.InputJsonValue),
  };
}

function handlePrismaError(err: unknown, id?: string): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      throw new StorageError(`Project "${id ?? 'unknown'}" already exists.`, 409);
    }
    if (err.code === 'P2025') {
      throw new StorageError(`Project "${id ?? 'unknown'}" not found.`, 404);
    }
  }

  throw err;
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const rows = await getPrisma().project.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      anchorName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return rows.map(toSummary);
}

export async function getProject(id: string): Promise<Project> {
  try {
    const row = await getPrisma().project.findUniqueOrThrow({ where: { id } });
    return toProject(row);
  } catch (err) {
    handlePrismaError(err, id);
  }
}

export async function createProject(
  id: string,
  input: CreateProjectInput,
): Promise<Project> {
  try {
    const row = await getPrisma().project.create({
      data: createInputToData(id, input),
    });
    return toProject(row);
  } catch (err) {
    handlePrismaError(err, id);
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await getPrisma().project.delete({ where: { id } });
  } catch (err) {
    handlePrismaError(err, id);
  }
}

export async function updateProject(project: Project): Promise<Project> {
  try {
    const row = await getPrisma().project.update({
      where: { id: project.id },
      data: {
        name: project.name,
        anchorName: project.anchorName,
        brands: project.brands as unknown as Prisma.InputJsonValue,
        opportunities: project.opportunities as unknown as Prisma.InputJsonValue,
        crossThemes:
          project.crossThemes === null
            ? Prisma.JsonNull
            : (project.crossThemes as unknown as Prisma.InputJsonValue),
      },
    });
    return toProject(row);
  } catch (err) {
    handlePrismaError(err, project.id);
  }
}
