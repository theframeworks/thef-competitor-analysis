import { randomBytes } from 'node:crypto';

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function generateProjectId(anchorName: string, name?: string): string {
  const base = slugify(name || anchorName) || 'bookmark';
  const suffix = randomBytes(4).toString('hex');
  return `${base}-${suffix}`;
}
