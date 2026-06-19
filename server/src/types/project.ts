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
  activity: string;
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
  id: string;
  name: string;
  anchorName: string;
  brands: Brand[];
  opportunities: Opportunity[];
  crossThemes: CrossThemes | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectSummary = Pick<
  Project,
  "id" | "name" | "anchorName" | "createdAt" | "updatedAt"
>;

export type CreateProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateProjectInput = Omit<Project, "createdAt"> & {
  createdAt?: string;
};
