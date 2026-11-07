import { useState, useCallback, useRef, useEffect } from 'react';
import { BoostState, CategoryType } from '../types/index.ts';
import { storage } from '../lib/storage.ts';

const POTION_DURATION_MS = 60 * 60 * 1000; // 1 real hour (3,600,000 ms)

export const MULTIPLIERS: Record<CategoryType, number> = {
  builders: 10,
  laboratory: 24,
  petHouse: 24,
};

export function useBoost() {
  const [boosts, setBoosts] = useState<Record<CategoryType, BoostState>>(() => storage.getBoosts());
  const boostsRef = useRef(boosts);
  boostsRef.current = boosts;

  useEffect(() => {
    storage.saveBoosts(boosts);
  }, [boosts]);

  /**
   * Check if a boost is currently active as of `now`.
   */
  const isBoostActive = useCallback((category: CategoryType, now: number = Date.now()): boolean => {
    const boost = boostsRef.current[category];
    return Boolean(boost && boost.expiresAt && boost.expiresAt > now);
  }, []);

  /**
   * Get remaining boost milliseconds.
   */
  const getRemainingBoostMs = useCallback((category: CategoryType, now: number = Date.now()): number => {
    const boost = boostsRef.current[category];
    if (!boost || !boost.expiresAt || boost.expiresAt <= now) return 0;
    return boost.expiresAt - now;
  }, []);

  /**
   * Activate or stack a 1-hour potion for the specified category.
   * Callback receives old and new BoostState so upgrades can be recalculated.
   */
  const activatePotion = useCallback(
    (
      category: CategoryType,
      now: number = Date.now(),
      onBoostChange?: (category: CategoryType, oldBoost: BoostState, newBoost: BoostState) => void
    ) => {
      const currentBoosts = boostsRef.current;
      const oldBoost = currentBoosts[category] || {
        category,
        multiplier: MULTIPLIERS[category],
        expiresAt: null,
      };

      const currentExpiresAt = oldBoost.expiresAt && oldBoost.expiresAt > now ? oldBoost.expiresAt : now;
      const newExpiresAt = currentExpiresAt + POTION_DURATION_MS;

      const newBoost: BoostState = {
        category,
        multiplier: MULTIPLIERS[category],
        expiresAt: newExpiresAt,
      };

      const updated = {
        ...currentBoosts,
        [category]: newBoost,
      };

      boostsRef.current = updated;
      setBoosts(updated);

      if (onBoostChange) {
        onBoostChange(category, oldBoost, newBoost);
      }
    },
    []
  );

  /**
   * Cancel an active potion for the specified category.
   */
  const cancelPotion = useCallback(
    (
      category: CategoryType,
      now: number = Date.now(),
      onBoostChange?: (category: CategoryType, oldBoost: BoostState, newBoost: BoostState) => void
    ) => {
      const currentBoosts = boostsRef.current;
      const oldBoost = currentBoosts[category];
      if (!oldBoost || !oldBoost.expiresAt || oldBoost.expiresAt <= now) {
        return;
      }

      const newBoost: BoostState = {
        category,
        multiplier: MULTIPLIERS[category],
        expiresAt: null,
      };

      const updated = {
        ...currentBoosts,
        [category]: newBoost,
      };

      boostsRef.current = updated;
      setBoosts(updated);

      if (onBoostChange) {
        onBoostChange(category, oldBoost, newBoost);
      }
    },
    []
  );

  return {
    boosts,
    isBoostActive,
    getRemainingBoostMs,
    activatePotion,
    cancelPotion,
  };
}
