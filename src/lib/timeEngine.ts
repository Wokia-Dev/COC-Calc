import type { Language, TimeDuration, Upgrade, BoostState } from '../types/index.ts';

/**
 * Boost-aware finish time calculation.
 * During boost: 1 real second = N upgrade seconds
 * After boost:  1 real second = 1 upgrade second
 */
export function computeFinishAt(
  now: number,
  remainingUpgradeMs: number,
  boostExpiresAt: number | null,
  multiplier: number
): number {
  if (remainingUpgradeMs <= 0) {
    return now;
  }

  // If no boost or boost is in the past
  if (!boostExpiresAt || boostExpiresAt <= now) {
    return now + remainingUpgradeMs;
  }

  const boostWindowMs = boostExpiresAt - now;
  const upgradeProgressInBoost = boostWindowMs * multiplier;

  if (upgradeProgressInBoost >= remainingUpgradeMs) {
    // Finishes entirely inside the boost window
    const realTimeNeeded = remainingUpgradeMs / multiplier;
    return now + realTimeNeeded;
  } else {
    // Uses up full boost window, remainder at normal 1x speed
    const remainingAfterBoost = remainingUpgradeMs - upgradeProgressInBoost;
    return boostExpiresAt + remainingAfterBoost;
  }
}

/**
 * Invert finish time back to nominal remaining upgrade ms under the current boost state.
 */
export function computeRemainingUpgradeMs(
  now: number,
  finishesAt: number,
  boostExpiresAt: number | null,
  multiplier: number
): number {
  if (finishesAt <= now) {
    return 0;
  }

  // No active boost
  if (!boostExpiresAt || boostExpiresAt <= now) {
    return finishesAt - now;
  }

  // Boost is active
  if (finishesAt <= boostExpiresAt) {
    // All remaining time is boosted
    return (finishesAt - now) * multiplier;
  } else {
    // Boosted until boostExpiresAt, then 1x until finishesAt
    const boostedPart = (boostExpiresAt - now) * multiplier;
    const normalPart = finishesAt - boostExpiresAt;
    return boostedPart + normalPart;
  }
}

/**
 * Recompute finish timestamp for an upgrade when boost state changes (activated, stacked, or cancelled).
 */
export function recalculateFinishAt(
  upgradeFinishesAt: number,
  now: number,
  oldBoostExpiresAt: number | null,
  oldMultiplier: number,
  newBoostExpiresAt: number | null,
  newMultiplier: number
): number {
  if (upgradeFinishesAt <= now) {
    return upgradeFinishesAt;
  }

  const remainingUpgradeMs = computeRemainingUpgradeMs(
    now,
    upgradeFinishesAt,
    oldBoostExpiresAt,
    oldMultiplier
  );

  return computeFinishAt(now, remainingUpgradeMs, newBoostExpiresAt, newMultiplier);
}

/**
 * Convert TimeDuration ({ days, hours, minutes }) to milliseconds.
 */
export function durationToMs(duration: Partial<TimeDuration>): number {
  const days = Math.max(0, Number(duration.days) || 0);
  const hours = Math.max(0, Number(duration.hours) || 0);
  const minutes = Math.max(0, Number(duration.minutes) || 0);
  return ((days * 24 + hours) * 60 + minutes) * 60 * 1000;
}

/**
 * Deconstruct milliseconds into days, hours, minutes, seconds.
 */
export function msToParts(ms: number): { days: number; hours: number; minutes: number; seconds: number } {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  return { days, hours, minutes, seconds };
}

/**
 * Format countdown string (e.g., "2d 14h 32m 05s" or "2j 14h 32m 05s").
 */
export function formatCountdown(ms: number, lang: Language = 'fr'): string {
  if (ms <= 0) {
    return lang === 'fr' ? 'Terminé !' : 'Finished!';
  }

  const { days, hours, minutes, seconds } = msToParts(ms);
  const dUnit = lang === 'fr' ? 'j' : 'd';
  const hUnit = 'h';
  const mUnit = 'm';
  const sUnit = 's';

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (days > 0) {
    return `${days}${dUnit} ${pad(hours)}${hUnit} ${pad(minutes)}${mUnit} ${pad(seconds)}${sUnit}`;
  }
  if (hours > 0) {
    return `${hours}${hUnit} ${pad(minutes)}${mUnit} ${pad(seconds)}${sUnit}`;
  }
  if (minutes > 0) {
    return `${minutes}${mUnit} ${pad(seconds)}${sUnit}`;
  }
  return `${seconds}${sUnit}`;
}

/**
 * Format boost countdown string (e.g., "48m 12s" or "1h 12m 05s").
 */
export function formatBoostCountdown(ms: number): string {
  if (ms <= 0) return '0s';
  const { hours, minutes, seconds } = msToParts(ms);
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  return `${minutes}m ${pad(seconds)}s`;
}

/**
 * Calculate progress percentage [0 - 100].
 */
export function computeProgressPercentage(
  now: number,
  finishesAt: number,
  totalDurationMs: number,
  boostExpiresAt: number | null,
  multiplier: number
): number {
  if (totalDurationMs <= 0 || now >= finishesAt) {
    return 100;
  }

  const remainingMs = computeRemainingUpgradeMs(now, finishesAt, boostExpiresAt, multiplier);
  if (remainingMs <= 0) {
    return 100;
  }

  const elapsedMs = Math.max(0, totalDurationMs - remainingMs);
  const percentage = (elapsedMs / totalDurationMs) * 100;
  return Math.min(100, Math.max(0, Number(percentage.toFixed(2))));
}

/**
 * Format exact calendar finish date & time with localized day/month/time.
 */
export function formatExactDate(timestamp: number, lang: Language = 'fr'): string {
  const date = new Date(timestamp);
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';

  // Capitalize first letter of weekday
  const weekday = date.toLocaleDateString(locale, { weekday: 'long' });
  const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const day = date.getDate();
  const month = date.toLocaleDateString(locale, { month: 'short' });
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (lang === 'fr') {
    return `${formattedWeekday} ${day} ${month} à ${hours}h${minutes}`;
  } else {
    return `${formattedWeekday}, ${month} ${day} at ${hours}:${minutes}`;
  }
}

/**
 * Format relative / contextual finish preview (e.g. "Aujourd'hui à 19h42", "Demain à 08h30").
 */
export function formatRelativeFinish(timestamp: number, now: number = Date.now(), lang: Language = 'fr'): string {
  const target = new Date(timestamp);
  const current = new Date(now);

  const isSameDay =
    target.getFullYear() === current.getFullYear() &&
    target.getMonth() === current.getMonth() &&
    target.getDate() === current.getDate();

  const tomorrow = new Date(current);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    target.getFullYear() === tomorrow.getFullYear() &&
    target.getMonth() === tomorrow.getMonth() &&
    target.getDate() === tomorrow.getDate();

  const hours = target.getHours().toString().padStart(2, '0');
  const minutes = target.getMinutes().toString().padStart(2, '0');

  if (isSameDay) {
    return lang === 'fr' ? `Aujourd'hui à ${hours}h${minutes}` : `Today at ${hours}:${minutes}`;
  }
  if (isTomorrow) {
    return lang === 'fr' ? `Demain à ${hours}h${minutes}` : `Tomorrow at ${hours}:${minutes}`;
  }

  return formatExactDate(timestamp, lang);
}

/**
 * Format time saved (e.g. "−9h 00m" or "−23h 00m").
 */
export function formatTimeSaved(savedMs: number): string {
  const safeMs = Math.max(0, Math.round(savedMs));
  const totalMinutes = Math.round(safeMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `−${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

export interface PotionSimulationItem {
  upgrade: Upgrade;
  currentFinishAt: number;
  projectedFinishAt: number;
  timeSavedMs: number;
}

export interface PotionSimulationResult {
  simulatedExpiresAt: number;
  activeItems: PotionSimulationItem[];
  totalTimeSavedMs: number;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Simulates the effect of activating or stacking a 1h potion on ongoing upgrades in a category.
 */
export function simulatePotionImpact(
  upgrades: Upgrade[],
  boost: BoostState,
  now: number = Date.now()
): PotionSimulationResult {
  const isCurrentlyActive = Boolean(boost.expiresAt && boost.expiresAt > now);
  const currentExpiry = isCurrentlyActive && boost.expiresAt ? boost.expiresAt : now;
  const simulatedExpiresAt = currentExpiry + ONE_HOUR_MS;

  const ongoingUpgrades = upgrades.filter(
    (u) => (!u.category || u.category === boost.category) && u.finishesAt > now
  );

  const activeItems: PotionSimulationItem[] = ongoingUpgrades.map((u) => {
    const projectedFinishAt = recalculateFinishAt(
      u.finishesAt,
      now,
      boost.expiresAt,
      boost.multiplier,
      simulatedExpiresAt,
      boost.multiplier
    );
    const timeSavedMs = Math.max(0, u.finishesAt - projectedFinishAt);

    return {
      upgrade: u,
      currentFinishAt: u.finishesAt,
      projectedFinishAt,
      timeSavedMs,
    };
  });

  const totalTimeSavedMs = activeItems.reduce((acc, item) => acc + item.timeSavedMs, 0);

  return {
    simulatedExpiresAt,
    activeItems,
    totalTimeSavedMs,
  };
}
