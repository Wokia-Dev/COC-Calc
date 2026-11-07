import type { Upgrade, BoostState, CategoryType, Language } from '../types/index.ts';

const UPGRADES_STORAGE_KEY = 'clash_timer_upgrades_v1';
const BOOSTS_STORAGE_KEY = 'clash_timer_boosts_v1';
const LANGUAGE_STORAGE_KEY = 'clash_timer_language_v1';

export const DEFAULT_BOOSTS: Record<CategoryType, BoostState> = {
  builders: { category: 'builders', multiplier: 10, expiresAt: null },
  laboratory: { category: 'laboratory', multiplier: 24, expiresAt: null },
  petHouse: { category: 'petHouse', multiplier: 24, expiresAt: null },
};

/**
 * Safely parse JSON from localStorage with a fallback value.
 */
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    console.warn(`[ClashTimer] Failed to read ${key} from localStorage:`, error);
    return fallback;
  }
}

/**
 * Safely serialize and store value to localStorage.
 */
function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[ClashTimer] Failed to save ${key} to localStorage:`, error);
  }
}

export const storage = {
  getUpgrades(): Upgrade[] {
    const list = safeGet<Upgrade[]>(UPGRADES_STORAGE_KEY, []);
    if (!Array.isArray(list)) return [];
    // Ensure all items have valid required fields
    return list.filter(item => item && typeof item.id === 'string' && typeof item.finishesAt === 'number');
  },

  saveUpgrades(upgrades: Upgrade[]): void {
    safeSet(UPGRADES_STORAGE_KEY, upgrades);
  },

  getBoosts(): Record<CategoryType, BoostState> {
    const saved = safeGet<Partial<Record<CategoryType, BoostState>>>(BOOSTS_STORAGE_KEY, {});
    return {
      builders: { ...DEFAULT_BOOSTS.builders, ...(saved?.builders || {}) },
      laboratory: { ...DEFAULT_BOOSTS.laboratory, ...(saved?.laboratory || {}) },
      petHouse: { ...DEFAULT_BOOSTS.petHouse, ...(saved?.petHouse || {}) },
    };
  },

  saveBoosts(boosts: Record<CategoryType, BoostState>): void {
    safeSet(BOOSTS_STORAGE_KEY, boosts);
  },

  getLanguage(): Language {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'en' || saved === 'fr') return saved;
      // French is the default language
      return 'fr';
    } catch {
      return 'fr';
    }
  },

  saveLanguage(lang: Language): void {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error('[ClashTimer] Failed to save language:', error);
    }
  },

  clearAll(): void {
    try {
      localStorage.removeItem(UPGRADES_STORAGE_KEY);
      localStorage.removeItem(BOOSTS_STORAGE_KEY);
      localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
  }
};
