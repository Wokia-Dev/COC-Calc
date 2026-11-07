import test from 'node:test';
import assert from 'node:assert/strict';

test('overview stats - correctly computes counts, next finishing upgrade, and active boosts', () => {
  const now = 1000000;
  const HOUR = 3600000;

  const boosts = {
    builders: { category: 'builders', multiplier: 10, expiresAt: now + HOUR },
    laboratory: { category: 'laboratory', multiplier: 24, expiresAt: null },
    petHouse: { category: 'petHouse', multiplier: 24, expiresAt: now - 100 }, // expired
  };

  const activeCategories = ['builders', 'laboratory', 'petHouse'];
  const activeBoostsCount = activeCategories.filter(
    (cat) => boosts[cat]?.expiresAt && boosts[cat].expiresAt > now
  ).length;

  assert.equal(activeBoostsCount, 1);

  const upgrades = [
    {
      id: '1',
      category: 'laboratory',
      name: 'Pekka Niv 9',
      createdAt: now - HOUR,
      totalDurationMs: 10 * HOUR,
      finishesAt: now + 5 * HOUR,
    },
    {
      id: '2',
      category: 'builders',
      name: 'Canon Niv 21',
      createdAt: now - HOUR,
      totalDurationMs: 4 * HOUR,
      finishesAt: now + 1 * HOUR, // Earliest active
    },
    {
      id: '3',
      category: 'petHouse',
      name: 'Lassi Niv 10',
      createdAt: now - 10 * HOUR,
      totalDurationMs: 5 * HOUR,
      finishesAt: now - 5 * HOUR, // Finished
    },
    {
      id: '4',
      category: 'builders',
      name: 'Tour d archer',
      createdAt: now - 8 * HOUR,
      totalDurationMs: 6 * HOUR,
      finishesAt: now - 2 * HOUR, // Finished
    },
  ];

  const allActiveUpgrades = upgrades.filter((u) => u.finishesAt > now);
  const allFinishedUpgrades = upgrades.filter((u) => u.finishesAt <= now);

  assert.equal(allActiveUpgrades.length, 2);
  assert.equal(allFinishedUpgrades.length, 2);

  const nextFinishingUpgrade =
    allActiveUpgrades.length > 0
      ? allActiveUpgrades.reduce((earliest, u) =>
          u.finishesAt < earliest.finishesAt ? u : earliest
        )
      : null;

  assert.ok(nextFinishingUpgrade);
  assert.equal(nextFinishingUpgrade.id, '2');
  assert.equal(nextFinishingUpgrade.name, 'Canon Niv 21');

  // Sorted list: active first (ascending finishesAt), finished at bottom
  const sortedActive = [...allActiveUpgrades].sort((a, b) => a.finishesAt - b.finishesAt);
  const sortedFinished = [...allFinishedUpgrades].sort((a, b) => a.finishesAt - b.finishesAt);
  const allSorted = [...sortedActive, ...sortedFinished];

  assert.equal(allSorted[0].id, '2'); // finishesAt = now + 1h
  assert.equal(allSorted[1].id, '1'); // finishesAt = now + 5h
  assert.equal(allSorted[2].id, '3'); // finishesAt = now - 5h (finished)
  assert.equal(allSorted[3].id, '4'); // finishesAt = now - 2h (finished)
});

test('overview stats - handles empty upgrades gracefully', () => {
  const now = 1000000;
  const upgrades = [];

  const allActiveUpgrades = upgrades.filter((u) => u.finishesAt > now);
  const nextFinishingUpgrade =
    allActiveUpgrades.length > 0
      ? allActiveUpgrades.reduce((earliest, u) =>
          u.finishesAt < earliest.finishesAt ? u : earliest
        )
      : null;

  assert.equal(nextFinishingUpgrade, null);
});
