import type { ActivityLevel } from '../types/domain';

export const TONE_COLORS: Record<string, string> = {
  human: '#3ddc97',
  expert: '#5b9dff',
  confident: '#f0a640',
  intelligent: '#a78bfa',
  corporate: '#9aa3b8',
  analytical: '#5b9dff',
  purposeful: '#3ddc97',
  'execution-focused': '#ff8a5b',
  visionary: '#a78bfa',
  'research-credible': '#a78bfa',
  aspirational: '#f0a640',
  warm: '#3ddc97',
  energetic: '#ff8a5b',
  precise: '#5b9dff',
  operational: '#9aa3b8',
  measured: '#9aa3b8',
  'design-forward': '#f472b6',
  'engineering-proud': '#ff8a5b',
  'freshly-bold': '#a78bfa',
  ideological: '#ff5f5f',
  bold: '#ff8a5b',
  playful: '#f472b6',
  minimalist: '#9aa3b8',
  technical: '#5b9dff',
  premium: '#f0a640',
  disruptive: '#ff5f5f',
};

export const TONE_LIST = Object.keys(TONE_COLORS);

export const ACTIVITY_ORDER: Record<ActivityLevel, number> = {
  'very-high': 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const ACTIVITY_DOT_COLORS: Record<ActivityLevel, string> = {
  'very-high': '#3ddc97',
  high: '#7fc97f',
  medium: '#E8B05C',
  low: '#5C6573',
};

export const TIER_PALETTE = [
  '#4FD1B3',
  '#9D8DF1',
  '#7AAEFF',
  '#E89A7C',
  '#E8B05C',
  '#E2675F',
  '#3ddc97',
];
