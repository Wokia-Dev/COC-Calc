import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimeSaved,
  simulatePotionImpact,
} from '../src/lib/timeEngine.ts';

test('formatTimeSaved - handles hours and minutes format correctly', () => {
  const HOUR = 3600000;
  const MINUTE = 60000;

  // 9 hours (builder potion on >=10h upgrade)
  assert.equal(formatTimeSaved(9 * HOUR), '−9h 00m');

  // 23 hours (research potion on >=24h upgrade)
  assert.equal(formatTimeSaved(23 * HOUR), '−23h 00m');

  // 4 hours 30 minutes
  assert.equal(formatTimeSaved(4 * HOUR + 30 * MINUTE), '−4h 30m');

  // 18 minutes
  assert.equal(formatTimeSaved(18 * MINUTE), '−0h 18m');

  // 0 or negative
  assert.equal(formatTimeSaved(0), '−0h 00m');
  assert.equal(formatTimeSaved(-5000), '−0h 00m');
});

test('simulatePotionImpact - returns empty items when no active upgrades', () => {
  const now = 1000000;
  const boost = {
    category: 'builders',
    multiplier: 10,
    expiresAt: null,
  };

  // Empty upgrades
  const res1 = simulatePotionImpact([], boost, now);
  assert.equal(res1.activeItems.length, 0);
  assert.equal(res1.totalTimeSavedMs, 0);
  assert.equal(res1.simulatedExpiresAt, now + 3600000);

  // Upgrades that are already finished
  const finishedUpgrades = [
    {
      id: '1',
      category: 'builders',
      name: 'Archers',
      createdAt: now - 100000,
      totalDurationMs: 50000,
      finishesAt: now - 50000,
    },
    {
      id: '2',
      category: 'builders',
      name: 'Canon',
      createdAt: now - 20000,
      totalDurationMs: 20000,
      finishesAt: now, // finishes exactly now
    },
  ];
  const res2 = simulatePotionImpact(finishedUpgrades, boost, now);
  assert.equal(res2.activeItems.length, 0);
  assert.equal(res2.totalTimeSavedMs, 0);
});

test('simulatePotionImpact - builder potion (10x) without active boost', () => {
  const now = 1000000;
  const HOUR = 3600000;
  const boost = {
    category: 'builders',
    multiplier: 10,
    expiresAt: null,
  };

  const upgrades = [
    {
      id: 'u1',
      category: 'builders',
      name: 'Canon Niv 20',
      createdAt: now,
      totalDurationMs: 10 * HOUR,
      finishesAt: now + 10 * HOUR,
    },
    {
      id: 'u2',
      category: 'builders',
      name: 'Tour d\'archers Niv 19',
      createdAt: now,
      totalDurationMs: 20 * HOUR,
      finishesAt: now + 20 * HOUR,
    },
  ];

  const result = simulatePotionImpact(upgrades, boost, now);

  assert.equal(result.simulatedExpiresAt, now + 1 * HOUR);
  assert.equal(result.activeItems.length, 2);

  // u1: 10h upgrade at 10x finishes in exactly 1h! Saves 9h.
  const item1 = result.activeItems.find((i) => i.upgrade.id === 'u1');
  assert.ok(item1);
  assert.equal(item1.currentFinishAt, now + 10 * HOUR);
  assert.equal(item1.projectedFinishAt, now + 1 * HOUR);
  assert.equal(item1.timeSavedMs, 9 * HOUR);
  assert.equal(formatTimeSaved(item1.timeSavedMs), '−9h 00m');

  // u2: 20h upgrade at 10x does 10h in 1h, then 10h at 1x takes 10h => finishes in 11h! Saves 9h.
  const item2 = result.activeItems.find((i) => i.upgrade.id === 'u2');
  assert.ok(item2);
  assert.equal(item2.currentFinishAt, now + 20 * HOUR);
  assert.equal(item2.projectedFinishAt, now + 11 * HOUR);
  assert.equal(item2.timeSavedMs, 9 * HOUR);
  assert.equal(formatTimeSaved(item2.timeSavedMs), '−9h 00m');

  assert.equal(result.totalTimeSavedMs, 18 * HOUR);
});

test('simulatePotionImpact - stacking builder potion on already active boost', () => {
  const now = 1000000;
  const HOUR = 3600000;

  // Active boost expiring in 1 hour
  const boost = {
    category: 'builders',
    multiplier: 10,
    expiresAt: now + 1 * HOUR,
  };

  // Upgrade has 30h total nominal time. Under 1h boost, finishes at now + 21h.
  const finishesAt = now + 21 * HOUR;

  const upgrades = [
    {
      id: 'u1',
      category: 'builders',
      name: 'Tesla Niv 13',
      createdAt: now,
      totalDurationMs: 30 * HOUR,
      finishesAt,
    },
  ];

  const result = simulatePotionImpact(upgrades, boost, now);

  // Stacks to 2 hours
  assert.equal(result.simulatedExpiresAt, now + 2 * HOUR);
  assert.equal(result.activeItems.length, 1);

  // With 2h boost: 20h work done in 2h, 10h at 1x => finishes at now + 12h!
  // Saves (now + 21h) - (now + 12h) = 9h!
  const item = result.activeItems[0];
  assert.equal(item.projectedFinishAt, now + 12 * HOUR);
  assert.equal(item.timeSavedMs, 9 * HOUR);
  assert.equal(formatTimeSaved(item.timeSavedMs), '−9h 00m');
});

test('simulatePotionImpact - upgrade finishes inside existing boost saves 0 time when stacking', () => {
  const now = 1000000;
  const HOUR = 3600000;

  // Active boost expiring in 1 hour
  const boost = {
    category: 'builders',
    multiplier: 10,
    expiresAt: now + 1 * HOUR,
  };

  // Upgrade finishes in 15 minutes (already inside the active 1h boost)
  const upgrades = [
    {
      id: 'u1',
      category: 'builders',
      name: 'Piege a ressort',
      createdAt: now,
      totalDurationMs: 150 * 60 * 1000,
      finishesAt: now + 15 * 60 * 1000,
    },
  ];

  const result = simulatePotionImpact(upgrades, boost, now);

  const item = result.activeItems[0];
  assert.equal(item.projectedFinishAt, item.currentFinishAt);
  assert.equal(item.timeSavedMs, 0);
  assert.equal(formatTimeSaved(item.timeSavedMs), '−0h 00m');
});

test('simulatePotionImpact - research potion 24x saves 23h on 48h upgrade', () => {
  const now = 1000000;
  const HOUR = 3600000;

  const boost = {
    category: 'laboratory',
    multiplier: 24,
    expiresAt: null,
  };

  const upgrades = [
    {
      id: 'u_lab',
      category: 'laboratory',
      name: 'Ballon Niv 10',
      createdAt: now,
      totalDurationMs: 48 * HOUR,
      finishesAt: now + 48 * HOUR,
    },
  ];

  const result = simulatePotionImpact(upgrades, boost, now);

  const item = result.activeItems[0];
  assert.equal(item.currentFinishAt, now + 48 * HOUR);
  // 1h boost does 24h work => 24h work at 1x => finish at now + 25h
  assert.equal(item.projectedFinishAt, now + 25 * HOUR);
  assert.equal(item.timeSavedMs, 23 * HOUR);
  assert.equal(formatTimeSaved(item.timeSavedMs), '−23h 00m');
});

test('simulatePotionImpact - only simulates upgrades matching the boost category', () => {
  const now = 1000000;
  const HOUR = 3600000;

  const boost = {
    category: 'builders',
    multiplier: 10,
    expiresAt: null,
  };

  const mixedUpgrades = [
    {
      id: 'u_b',
      category: 'builders',
      name: 'Mortier Niv 15',
      createdAt: now,
      totalDurationMs: 10 * HOUR,
      finishesAt: now + 10 * HOUR,
    },
    {
      id: 'u_lab',
      category: 'laboratory',
      name: 'Dragon Niv 8',
      createdAt: now,
      totalDurationMs: 24 * HOUR,
      finishesAt: now + 24 * HOUR,
    },
    {
      id: 'u_pet',
      category: 'petHouse',
      name: 'Electrochouette Niv 5',
      createdAt: now,
      totalDurationMs: 24 * HOUR,
      finishesAt: now + 24 * HOUR,
    },
  ];

  const result = simulatePotionImpact(mixedUpgrades, boost, now);

  // Only the builder upgrade should be returned and simulated
  assert.equal(result.activeItems.length, 1);
  assert.equal(result.activeItems[0].upgrade.id, 'u_b');
  assert.equal(result.activeItems[0].timeSavedMs, 9 * HOUR);
});
