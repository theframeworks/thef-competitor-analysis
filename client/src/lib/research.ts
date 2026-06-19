import type {
  Brand,
  BrandResearchData,
  CrossThemes,
  Opportunity,
} from "../types/domain";
import { extractJsonArray, extractJsonObject, sendMessage } from "./api";
import {
  brandResearchPrompt,
  brandSummaryLine,
  brandSummaryWithThemes,
  crossThemesPrompt,
  opportunitiesPrompt,
} from "./prompts";

export async function researchBrandData(
  name: string,
  anchorName: string,
  isAnchor: boolean,
  forRefresh = false,
): Promise<BrandResearchData> {
  const prompt = brandResearchPrompt(name, anchorName, isAnchor, forRefresh);
  const text = await sendMessage(prompt, 1200);
  return extractJsonObject<BrandResearchData>(text);
}

export async function researchOpportunities(
  anchorName: string,
  brands: Brand[],
): Promise<Opportunity[]> {
  const summary = brands.map(brandSummaryLine).join("\n");
  const prompt = opportunitiesPrompt(anchorName, summary);
  const text = await sendMessage(prompt, 1500);
  return extractJsonArray<Opportunity[]>(text);
}

export async function researchCrossThemes(
  anchorName: string,
  brands: Brand[],
): Promise<CrossThemes> {
  const summary = brands.map(brandSummaryWithThemes).join("\n");
  const prompt = crossThemesPrompt(anchorName, summary);
  const text = await sendMessage(prompt, 1800);
  return extractJsonObject<CrossThemes>(text);
}

export function fallbackBrandData(): BrandResearchData {
  return {
    tagline: "Research unavailable",
    tier: "Unclassified",
    keyMessage:
      "Could not retrieve data for this brand — try refreshing it individually later.",
    themes: [],
    formats: [],
    notable: "No data retrieved.",
    tone: "measured",
    activity: "medium",
    linkedin: 0,
    instagram: 0,
    youtube: 0,
    differentiator: "Not yet available.",
  };
}
