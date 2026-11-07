import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node environment
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => (mockStorage.has(key) ? mockStorage.get(key) : null),
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};

import { storage, DEFAULT_BOOSTS } from '../src/lib/storage.ts';

test('storage.getUpgrades returns empty array by default', () => {
  storage.clearAll();
  assert.deepEqual(storage.getUpgrades(), []);
});

test('storage save and retrieve upgrades', () => {
  storage.clearAll();
  const testUpgrade = {
    id: 'u1',
    category: 'builders',
    name: 'Canon 21',
    createdAt: 1000,
    totalDurationMs: 5000,
    finishesAt: 6000,
  };
  storage.saveUpgrades([testUpgrade]);
  const retrieved = storage.getUpgrades();
  assert.equal(retrieved.length, 1);
  assert.equal(retrieved[0].name, 'Canon 21');
});

test('storage handles corrupted upgrades JSON safely', () => {
  localStorage.setItem('clash_timer_upgrades_v1', '{corrupted json[');
  const retrieved = storage.getUpgrades();
  assert.deepEqual(retrieved, []);
});

test('storage boosts default fallback and persistence', () => {
  storage.clearAll();
  const defaults = storage.getBoosts();
  assert.equal(defaults.builders.multiplier, 10);
  assert.equal(defaults.laboratory.multiplier, 24);
  assert.equal(defaults.petHouse.multiplier, 24);
  assert.equal(defaults.builders.expiresAt, null);

  defaults.builders.expiresAt = 999999;
  storage.saveBoosts(defaults);
  const updated = storage.getBoosts();
  assert.equal(updated.builders.expiresAt, 999999);
});

test('storage language default is French and persists choice', () => {
  storage.clearAll();
  assert.equal(storage.getLanguage(), 'fr');
  storage.saveLanguage('en');
  assert.equal(storage.getLanguage(), 'en');
});
