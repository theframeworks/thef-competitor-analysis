import { TONE_LIST } from '../constants/tone';

export function brandResearchPrompt(
  name: string,
  anchorName: string,
  isAnchor: boolean,
  forRefresh = false,
): string {
  const tierHint = forRefresh
    ? 'a short category label, max 28 chars'
    : "a short category label for what kind of company this is, e.g. 'Large IT Services', 'AI Pure-Play', 'Boutique Agency', max 28 chars";

  const notableHint = forRefresh
    ? '2-3 sentences on notable recent campaigns or brand moves, max 300 chars'
    : '2-3 sentences on notable recent campaigns, brand moves, or news, max 300 chars';

  return `You are a competitive brand intelligence analyst. Research the current social media presence, brand positioning, and public activity for "${name}", a company being analyzed ${isAnchor ? 'as the anchor brand' : `as a competitor to "${anchorName}"`}.

Return ONLY a valid JSON object, no markdown, no explanation, no code fences:
{
  "tagline": "their brand tagline or positioning phrase, max 60 chars",
  "tier": "${tierHint}",
  "keyMessage": "single sentence core brand message, max 150 chars",
  "themes": ["theme1", "theme2", "theme3", "theme4"],
  "formats": ["content format 1", "content format 2", "content format 3", "content format 4"],
  "notable": "${notableHint}",
  "tone": "one word from: ${TONE_LIST.join(', ')}",
  "activity": "one of: very-high, high, medium, low",
  "linkedin": <approximate LinkedIn followers in thousands, integer>,
  "instagram": <approximate Instagram followers in thousands, integer>,
  "youtube": <approximate YouTube subscribers in thousands, integer>,
  "differentiator": "1-2 sentences on what makes this brand distinct${isAnchor ? '' : ` versus ${anchorName}`}, max 220 chars"
}`;
}

export function opportunitiesPrompt(anchorName: string, allBrandSummaries: string): string {
  return `You are a brand strategy consultant. The anchor brand is "${anchorName}". Here is a summary of it and its competitors:

${allBrandSummaries}

Identify exactly 6 genuine differentiation opportunities for "${anchorName}" based on gaps you observe across the competitor set. Return ONLY a valid JSON array, no markdown, no explanation:
[
  { "title": "short opportunity title, max 6 words", "body": "1-2 sentence explanation of the gap and why it matters, max 220 chars" }
]
Return exactly 6 items.`;
}

export function crossThemesPrompt(anchorName: string, allBrandSummaries: string): string {
  return `You are a brand strategy consultant. The anchor brand is "${anchorName}". Here is a summary of it and its competitors:

${allBrandSummaries}

Analyze the FULL set (including the anchor brand) for recurring patterns. Return ONLY a valid JSON object, no markdown, no explanation:
{
  "messagingAngles": [
    { "label": "short name for a common messaging angle, max 6 words", "brands": ["Brand A", "Brand B"], "body": "1-2 sentences describing this shared angle and how brands frame it, max 200 chars" }
  ],
  "contentThemes": [
    { "label": "short name for a recurring content theme, max 6 words", "brands": ["Brand A", "Brand B"], "body": "1-2 sentences describing the theme, max 200 chars" }
  ],
  "toneClusters": [
    { "label": "short name for a tone-of-voice cluster, max 5 words", "brands": ["Brand A", "Brand B"], "body": "1 sentence describing this tonal cluster, max 160 chars" }
  ]
}
Include 3-5 items in each array, only where a pattern genuinely spans 2 or more brands. List actual brand names from the set above in the "brands" field for each item.`;
}

export function brandSummaryLine(brand: {
  name: string;
  isAnchor: boolean;
  tagline: string;
  keyMessage: string;
}): string {
  return `${brand.name}${brand.isAnchor ? ' (ANCHOR)' : ''}: ${brand.tagline} — ${brand.keyMessage}`;
}

export function brandSummaryWithThemes(brand: {
  name: string;
  isAnchor: boolean;
  tagline: string;
  keyMessage: string;
  themes: string[];
  tone: string;
}): string {
  return `${brandSummaryLine(brand)} | themes: ${(brand.themes || []).join(', ')} | tone: ${brand.tone}`;
}
