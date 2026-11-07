import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeFinishAt,
  computeRemainingUpgradeMs,
  recalculateFinishAt,
  durationToMs,
  msToParts,
  formatCountdown,
  computeProgressPercentage,
  formatRelativeFinish,
  formatExactDate,
} from '../src/lib/timeEngine.ts';

test('computeFinishAt - no active boost', () => {
  const now = 1000000;
  const remaining = 3600000; // 1 hour
  const finish = computeFinishAt(now, remaining, null, 10);
  assert.equal(finish, now + 3600000);
});

test('computeFinishAt - boost active, upgrade finishes entirely inside boost', () => {
  const now = 1000000;
  // 5 hours of work
  const remaining = 5 * 3600000;
  // Boost active for 1 hour at 10x (can complete 10 hours)
  const boostExpiresAt = now + 1 * 3600000;
  const finish = computeFinishAt(now, remaining, boostExpiresAt, 10);

  // 5 hours of work at 10x takes 0.5 real hours (1800000 ms)
  assert.equal(finish, now + 1800000);
});

test('computeFinishAt - boost active, upgrade exceeds boost window', () => {
  const now = 1000000;
  // 15 hours of work
  const remaining = 15 * 3600000;
  // Boost active for 1 hour at 10x (completes 10 hours in 1 hour)
  const boostExpiresAt = now + 1 * 3600000;
  const finish = computeFinishAt(now, remaining, boostExpiresAt, 10);

  // 1h boost completes 10h. 5h remaining at 1x takes 5 real hours.
  // Total real time = 1h + 5h = 6h.
  assert.equal(finish, now + 6 * 3600000);
});

test('computeFinishAt - zero or negative duration', () => {
  const now = 1000000;
  assert.equal(computeFinishAt(now, 0, now + 10000, 10), now);
  assert.equal(computeFinishAt(now, -500, now + 10000, 10), now);
});

test('computeRemainingUpgradeMs - inversion consistency', () => {
  const now = 2000000;
  const boostExpiresAt = now + 3600000; // 1h boost
  const multiplier = 10;

  // Case 1: finishes inside boost
  const initialRemaining1 = 4 * 3600000; // 4 hours work
  const finish1 = computeFinishAt(now, initialRemaining1, boostExpiresAt, multiplier);
  const inverted1 = computeRemainingUpgradeMs(now, finish1, boostExpiresAt, multiplier);
  assert.equal(Math.round(inverted1), initialRemaining1);

  // Case 2: finishes after boost
  const initialRemaining2 = 18 * 3600000; // 18 hours work
  const finish2 = computeFinishAt(now, initialRemaining2, boostExpiresAt, multiplier);
  const inverted2 = computeRemainingUpgradeMs(now, finish2, boostExpiresAt, multiplier);
  assert.equal(Math.round(inverted2), initialRemaining2);
});

test('recalculateFinishAt - boost activation and cancellation', () => {
  const t0 = 1000000;
  const initialDuration = 10 * 3600000; // 10h upgrade at 1x
  let finish = t0 + initialDuration;

  // At t0, activate 1h Builder Potion (10x for 1h)
  const boostExpiresAt = t0 + 3600000;
  finish = recalculateFinishAt(finish, t0, null, 10, boostExpiresAt, 10);
  // 10h at 10x finishes in exactly 1h!
  assert.equal(finish, t0 + 3600000);

  // 30 minutes pass (t1 = t0 + 0.5h)
  const t1 = t0 + 1800000;
  // User cancels boost at t1:
  const newFinish = recalculateFinishAt(finish, t1, boostExpiresAt, 10, null, 10);
  // In the first 30 mins at 10x, 5h was completed. 5h remaining at 1x = 5h.
  // Finish time should be t1 + 5h = t0 + 5.5h!
  assert.equal(newFinish, t1 + 5 * 3600000);
});

test('durationToMs and msToParts', () => {
  const ms = durationToMs({ days: 2, hours: 5, minutes: 30 });
  assert.equal(ms, (2 * 24 * 60 + 5 * 60 + 30) * 60 * 1000);

  const parts = msToParts(ms);
  assert.equal(parts.days, 2);
  assert.equal(parts.hours, 5);
  assert.equal(parts.minutes, 30);
  assert.equal(parts.seconds, 0);
});

test('formatCountdown - FR and EN', () => {
  const oneDayTwoHours = (26 * 60 * 60 + 45 * 60 + 12) * 1000;
  assert.equal(formatCountdown(oneDayTwoHours, 'fr'), '1j 02h 45m 12s');
  assert.equal(formatCountdown(oneDayTwoHours, 'en'), '1d 02h 45m 12s');

  assert.equal(formatCountdown(0, 'fr'), 'Terminé !');
  assert.equal(formatCountdown(0, 'en'), 'Finished!');
  assert.equal(formatCountdown(-100, 'fr'), 'Terminé !');
});

test('computeProgressPercentage', () => {
  const now = 1000000;
  const totalDuration = 10000;
  const finishAt = now + 5000; // 50% left
  const pct = computeProgressPercentage(now, finishAt, totalDuration, null, 1);
  assert.equal(pct, 50);

  // When now >= finishAt
  assert.equal(computeProgressPercentage(now + 6000, finishAt, totalDuration, null, 1), 100);
});

test('multi-stacking potions - 10x builder potions stacked 3 times', () => {
  const t0 = 1000000;
  const hour = 3600000;
  const duration30h = 30 * hour;
  let finish = t0 + duration30h;

  // 1st potion: 1h at 10x (does 10h work, 20h remaining at 1x) => finish at t0 + 21h
  finish = recalculateFinishAt(finish, t0, null, 10, t0 + 1 * hour, 10);
  assert.equal(finish, t0 + 21 * hour);

  // 2nd potion stacked: 2h at 10x (does 20h work, 10h remaining at 1x) => finish at t0 + 12h
  finish = recalculateFinishAt(finish, t0, t0 + 1 * hour, 10, t0 + 2 * hour, 10);
  assert.equal(finish, t0 + 12 * hour);

  // 3rd potion stacked: 3h at 10x (does 30h work, completes entirely in 3h) => finish at t0 + 3h
  finish = recalculateFinishAt(finish, t0, t0 + 2 * hour, 10, t0 + 3 * hour, 10);
  assert.equal(finish, t0 + 3 * hour);

  // 4th potion stacked: 4h at 10x (upgrade was already finished at 3h) => stays at t0 + 3h!
  finish = recalculateFinishAt(finish, t0, t0 + 3 * hour, 10, t0 + 4 * hour, 10);
  assert.equal(finish, t0 + 3 * hour);
});

test('research & pet potion 24x multiplier mechanics', () => {
  const t0 = 1000000;
  const hour = 3600000;
  // 48 hours upgrade
  const initialDuration = 48 * hour;
  const finishNoBoost = t0 + initialDuration;

  // 1h Research Potion (24x for 1 hour):
  // 1h boost does 24h of work. 24h work remains at 1x.
  // Real duration = 1h + 24h = 25 hours (saves exactly 23 hours!).
  const finishBoost = computeFinishAt(t0, initialDuration, t0 + 1 * hour, 24);
  assert.equal(finishBoost, t0 + 25 * hour);
  assert.equal(finishNoBoost - finishBoost, 23 * hour);
});

test('formatRelativeFinish - today, tomorrow, and future dates', () => {
  const now = new Date(2026, 10, 15, 12, 0, 0).getTime(); // Sun Nov 15 2026 12:00:00

  // Same day at 18:30
  const sameDay = new Date(2026, 10, 15, 18, 30, 0).getTime();
  assert.equal(formatRelativeFinish(sameDay, now, 'fr'), 'Aujourd\'hui à 18h30');
  assert.equal(formatRelativeFinish(sameDay, now, 'en'), 'Today at 18:30');

  // Tomorrow at 09:15
  const tomorrow = new Date(2026, 10, 16, 9, 15, 0).getTime();
  assert.equal(formatRelativeFinish(tomorrow, now, 'fr'), 'Demain à 09h15');
  assert.equal(formatRelativeFinish(tomorrow, now, 'en'), 'Tomorrow at 09:15');

  // 3 days later
  const futureDay = new Date(2026, 10, 18, 14, 0, 0).getTime();
  const frFormatted = formatRelativeFinish(futureDay, now, 'fr');
  const enFormatted = formatRelativeFinish(futureDay, now, 'en');
  assert.match(frFormatted, /14h00/);
  assert.match(enFormatted, /14:00/);
});
