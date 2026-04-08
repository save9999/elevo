// src/lib/gamification.ts

export const XP_PER_LEVEL = 500;

export const STAR_THRESHOLDS = {
  3: 90,
  2: 70,
  1: 0,
} as const;

export function getStarsForScore(score: number): number {
  if (score >= STAR_THRESHOLDS[3]) return 3;
  if (score >= STAR_THRESHOLDS[2]) return 2;
  return 1;
}

export const STREAK_TIERS = [
  { days: 3, label: "Bronze", color: "#CD7F32", emoji: "🔥" },
  { days: 7, label: "Argent", color: "#C0C0C0", emoji: "🔥", crystalReward: 5 },
  { days: 14, label: "Or", color: "#FFD700", emoji: "🔥" },
  { days: 30, label: "Arc-en-ciel", color: "rainbow", emoji: "🌈", skinReward: "rainbow_flame" },
] as const;

export function getStreakTier(streak: number) {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streak >= STREAK_TIERS[i].days) return STREAK_TIERS[i];
  }
  return null;
}

export const EXERCISE_REWARDS = {
  stars: { 1: 5, 2: 10, 3: 20 },
  xp: { base: 30, perfect: 50 },
} as const;

export const BOSS_REWARDS = {
  crystals: 3,
  xp: 100,
  stars: 30,
} as const;

export const CURRENCIES = {
  stars: { emoji: "⭐", label: "Étoiles" },
  crystals: { emoji: "💎", label: "Cristaux" },
} as const;

export const ITEM_RARITIES = {
  common: { label: "Commun", color: "#9CA3AF" },
  rare: { label: "Rare", color: "#3B82F6" },
  epic: { label: "Épique", color: "#8B5CF6" },
  legendary: { label: "Légendaire", color: "#F59E0B" },
} as const;

export const BADGE_CATEGORIES = {
  mastery: { label: "Maîtrise", emoji: "🏆" },
  exploration: { label: "Exploration", emoji: "🗺️" },
  social: { label: "Social", emoji: "🤝" },
  secret: { label: "Secret", emoji: "🔮" },
  seasonal: { label: "Saisonnier", emoji: "🎃" },
} as const;
