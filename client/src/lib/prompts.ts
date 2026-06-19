export function brandResearchPrompt(
  name: string,
  anchorName: string,
  isAnchor: boolean,
  forRefresh = false,
): string {
  const role = isAnchor ? "anchor" : "competitor";
  const mode = forRefresh
    ? "refresh (focus on recent campaigns and brand moves)"
    : "initial (include recent news and positioning context)";

  const lines = [
    "Task: brand research",
    `Brand to research: "${name}"`,
    `Anchor brand for this project: "${anchorName}"`,
    `Brand role: ${role}`,
    `Research mode: ${mode}`,
  ];

  if (!isAnchor) {
    lines.push(`Frame the differentiator field relative to "${anchorName}".`);
  }

  return lines.join("\n");
}

export function opportunitiesPrompt(
  anchorName: string,
  allBrandSummaries: string,
): string {
  return [
    "Task: differentiation opportunities",
    `Anchor brand: "${anchorName}"`,
    "",
    "Competitor set summaries:",
    allBrandSummaries,
  ].join("\n");
}

export function crossThemesPrompt(
  anchorName: string,
  allBrandSummaries: string,
): string {
  return [
    "Task: cross-brand themes",
    `Anchor brand: "${anchorName}"`,
    "",
    "Competitor set summaries:",
    allBrandSummaries,
  ].join("\n");
}

export function brandSummaryLine(brand: {
  name: string;
  isAnchor: boolean;
  tagline: string;
  keyMessage: string;
}): string {
  return `${brand.name}${brand.isAnchor ? " (ANCHOR)" : ""}: ${brand.tagline} — ${brand.keyMessage}`;
}

export function brandSummaryWithThemes(brand: {
  name: string;
  isAnchor: boolean;
  tagline: string;
  keyMessage: string;
  themes: string[];
  tone: string;
}): string {
  return `${brandSummaryLine(brand)} | themes: ${(brand.themes || []).join(", ")} | tone: ${brand.tone}`;
}
