import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeFinishAt,
  computeRemainingUpgradeMs,
  computeProgressPercentage,
} from '../src/lib/timeEngine.ts';

test('upgrade editing duration preserves elapsed progress in totalDurationMs', () => {
  const t0 = 1000000;
  const hour = 3600000;
  const initialDuration = 10 * hour; // 10h initial duration
  const finishesAt = t0 + initialDuration;

  // 5 hours elapse
  const now = t0 + 5 * hour;
  const oldRemainingMs = computeRemainingUpgradeMs(now, finishesAt, null, 1);
  assert.equal(oldRemainingMs, 5 * hour);

  const elapsedMs = Math.max(0, initialDuration - oldRemainingMs);
  assert.equal(elapsedMs, 5 * hour);

  // User edits remaining duration to 3 hours
  const newRemainingDurationMs = 3 * hour;
  const newTotalDurationMs = Math.max(newRemainingDurationMs, elapsedMs + newRemainingDurationMs);
  const newFinishesAt = computeFinishAt(now, newRemainingDurationMs, null, 1);

  assert.equal(newTotalDurationMs, 8 * hour); // 5h elapsed + 3h remaining = 8h total
  assert.equal(newFinishesAt, now + 3 * hour);

  // Check progress percentage on edited upgrade
  const pct = computeProgressPercentage(now, newFinishesAt, newTotalDurationMs, null, 1);
  // 5h elapsed / 8h total = 62.5%
  assert.equal(pct, 62.5);
});

test('upgrade renaming with untouched duration preserves finishesAt exactly', () => {
  const t0 = 1000000;
  const hour = 3600000;
  const initialDuration = 10 * hour;
  const finishesAt = t0 + initialDuration;

  // 9 hours elapse (1 hour remaining)
  const now = t0 + 9 * hour;
  const initialRemainingMs = computeRemainingUpgradeMs(now, finishesAt, null, 1);
  assert.equal(initialRemainingMs, 1 * hour);

  // User opens edit modal: prefilled duration is 1 hour
  const currentDurationMs = 1 * hour;
  const durationChanged = Math.abs(currentDurationMs - initialRemainingMs) >= 60000;
  assert.equal(durationChanged, false); // Not changed!

  // finishesAt is NOT touched
  const unchangedFinishAt = finishesAt;
  assert.equal(unchangedFinishAt, t0 + 10 * hour);
  assert.equal(unchangedFinishAt - now, 1 * hour);
});

test('rapid potion stacking keeps monotonic expiration timestamps', () => {
  let expiresAt = null;
  const now = 5000000;
  const oneHour = 3600000;

  // Rapidly click 5 times
  for (let i = 1; i <= 5; i++) {
    const currentExpiresAt = expiresAt && expiresAt > now ? expiresAt : now;
    expiresAt = currentExpiresAt + oneHour;
    assert.equal(expiresAt, now + i * oneHour);
  }

  assert.equal(expiresAt, now + 5 * oneHour);
});
