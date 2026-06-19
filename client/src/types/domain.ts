export type ActivityLevel = 'very-high' | 'high' | 'medium' | 'low';

export interface Brand {
  id: string;
  name: string;
  isAnchor: boolean;
  tagline: string;
  tier: string;
  keyMessage: string;
  themes: string[];
  formats: string[];
  notable: string;
  tone: string;
  activity: ActivityLevel;
  linkedin: number;
  instagram: number;
  youtube: number;
  differentiator: string;
}

export interface Opportunity {
  title: string;
  body: string;
}

export interface CrossThemeItem {
  label: string;
  brands: string[];
  body: string;
}

export interface CrossThemes {
  messagingAngles: CrossThemeItem[];
  contentThemes: CrossThemeItem[];
  toneClusters: CrossThemeItem[];
}

export interface Project {
  anchorName: string;
  brands: Brand[];
  opportunities: Opportunity[];
  crossThemes: CrossThemes | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandResearchData {
  tagline: string;
  tier: string;
  keyMessage: string;
  themes: string[];
  formats: string[];
  notable: string;
  tone: string;
  activity: ActivityLevel;
  linkedin: number;
  instagram: number;
  youtube: number;
  differentiator: string;
}

export interface BuildLogRow {
  text: string;
  status: 'pending' | 'ok' | 'err';
}
