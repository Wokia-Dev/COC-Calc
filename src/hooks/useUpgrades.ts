import { useState, useCallback, useEffect } from 'react';
import { Upgrade, CategoryType, BoostState } from '../types/index.ts';
import { storage } from '../lib/storage.ts';
import { computeFinishAt, recalculateFinishAt, computeRemainingUpgradeMs } from '../lib/timeEngine.ts';

export function useUpgrades() {
  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => storage.getUpgrades());

  // Automatically persist upgrades when state updates
  useEffect(() => {
    storage.saveUpgrades(upgrades);
  }, [upgrades]);

  const getUpgradesByCategory = useCallback(
    (category: CategoryType): Upgrade[] => {
      return upgrades.filter((u) => u.category === category);
    },
    [upgrades]
  );

  /**
   * Add a new upgrade item.
   */
  const addUpgrade = useCallback(
    (
      category: CategoryType,
      name: string,
      durationMs: number,
      boostState: BoostState,
      now: number = Date.now()
    ): Upgrade => {
      const finishesAt = computeFinishAt(
        now,
        durationMs,
        boostState.expiresAt,
        boostState.multiplier
      );

      const newUpgrade: Upgrade = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `upgrade_${now}_${Math.random().toString(36).slice(2, 7)}`,
        category,
        name: name.trim(),
        createdAt: now,
        totalDurationMs: durationMs,
        finishesAt,
      };

      setUpgrades((prev) => [newUpgrade, ...prev]);

      return newUpgrade;
    },
    []
  );

  /**
   * Update the name of an existing upgrade.
   */
  const updateUpgradeName = useCallback((id: string, newName: string) => {
    setUpgrades((prev) =>
      prev.map((u) => (u.id === id ? { ...u, name: newName.trim() } : u))
    );
  }, []);

  /**
   * Update the duration / finishesAt of an existing upgrade, preserving elapsed progress.
   */
  const updateUpgradeDuration = useCallback(
    (id: string, newRemainingDurationMs: number, boostState: BoostState, now: number = Date.now()) => {
      setUpgrades((prev) =>
        prev.map((u) => {
          if (u.id !== id) return u;
          const oldRemainingMs = computeRemainingUpgradeMs(
            now,
            u.finishesAt,
            boostState.expiresAt,
            boostState.multiplier
          );
          const elapsedMs = Math.max(0, u.totalDurationMs - oldRemainingMs);
          const newTotalDurationMs = Math.max(newRemainingDurationMs, elapsedMs + newRemainingDurationMs);
          const newFinishesAt = computeFinishAt(
            now,
            newRemainingDurationMs,
            boostState.expiresAt,
            boostState.multiplier
          );
          return {
            ...u,
            totalDurationMs: newTotalDurationMs,
            finishesAt: newFinishesAt,
          };
        })
      );
    },
    []
  );

  /**
   * Complete an upgrade immediately.
   */
  const completeUpgradeNow = useCallback((id: string, now: number = Date.now()) => {
    setUpgrades((prev) =>
      prev.map((u) => (u.id === id ? { ...u, finishesAt: now } : u))
    );
  }, []);

  /**
   * Delete an upgrade.
   */
  const deleteUpgrade = useCallback((id: string) => {
    setUpgrades((prev) => prev.filter((u) => u.id !== id));
  }, []);

  /**
   * Recalculate finishesAt for all upgrades in a category when boost state changes.
   */
  const handleBoostChange = useCallback(
    (category: CategoryType, oldBoost: BoostState, newBoost: BoostState, now: number = Date.now()) => {
      setUpgrades((prev) =>
        prev.map((u) => {
          if (u.category !== category) return u;
          const updatedFinishAt = recalculateFinishAt(
            u.finishesAt,
            now,
            oldBoost.expiresAt,
            oldBoost.multiplier,
            newBoost.expiresAt,
            newBoost.multiplier
          );
          return {
            ...u,
            finishesAt: updatedFinishAt,
          };
        })
      );
    },
    []
  );

  return {
    upgrades,
    getUpgradesByCategory,
    addUpgrade,
    updateUpgradeName,
    updateUpgradeDuration,
    completeUpgradeNow,
    deleteUpgrade,
    handleBoostChange,
  };
}
