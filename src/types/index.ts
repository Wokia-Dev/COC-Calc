export type CategoryType = 'builders' | 'laboratory' | 'petHouse';

export type TabType = CategoryType | 'overview';

export type Language = 'fr' | 'en';

export interface BoostState {
  category: CategoryType;
  multiplier: number;         // 10 for builders, 24 for lab/pets
  expiresAt: number | null;   // Unix ms timestamp, null = no active boost
}

export interface Upgrade {
  id: string;
  category: CategoryType;
  name: string;
  createdAt: number;          // Unix ms — when user clicked "Start"
  totalDurationMs: number;    // Raw duration in ms (no boost applied)
  finishesAt: number;         // Pre-computed finish timestamp (recalculated on boost change)
}

export interface TimeDuration {
  days: number;
  hours: number;
  minutes: number;
}

export interface CategoryConfig {
  id: CategoryType;
  nameKey: string;
  potionNameKey: string;
  potionDurationMs: number; // 1 hour in ms (3,600,000)
  multiplier: number;       // 10 for builders, 24 for lab/pets
  accentColor: string;      // tailwind color or hex
  badgeColor: string;
  icon: string;
}
