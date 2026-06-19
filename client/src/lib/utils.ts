export function parseCompetitorList(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'brand';
}

export function brandId(name: string, index: number, existingIds: string[]): string {
  const base = slugify(name);
  return existingIds.includes(base) ? `${base}-${index}` : base;
}
