import { createRng } from '@/core';
import { DISCIPLINES } from '@/systems/techniques';
import { ctx, draft } from '@/test/gameFixtures';

import { derivedAptitude, identityTilt, rollCharacterAptitude } from './aptitude';
import { createNewGame } from './creation';

const SEEDS = 600;
const clans = ctx.content.clans;
const clanless = clans.require('none');
const kurogane = clans.require('kurogane');
const sensor = ctx.content.talents.require('sensor');
const prodigy = ctx.content.talents.require('prodigy');

function rolls(clanId: string, talentId = 'sensor') {
  const clan = clans.require(clanId);
  const talent = ctx.content.talents.require(talentId);
  return Array.from({ length: SEEDS }, (_, seed) =>
    rollCharacterAptitude(createRng(seed), clan, [talent]),
  );
}

describe('aptitude at creation', () => {
  it('gives clan shinobi a high floor and a narrow spread in their arts', () => {
    const values = rolls('kurogane').flatMap((a) => kurogane.arts.map((art) => a[art]));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(1.1);
    expect(Math.max(...values) - Math.min(...values)).toBeLessThan(0.5);
  });

  it('gives the clanless a wide spread: prodigies, holes and now and then a void art', () => {
    const all = rolls('none');
    const values = all.flatMap((a) => Object.values(a));
    expect(values.some((v) => v >= 1.5)).toBe(true);
    expect(values.some((v) => v > 0 && v < 0.55)).toBe(true);
    const voids = all.filter((a) => DISCIPLINES.some((d) => a[d] === 0)).length / SEEDS;
    expect(voids).toBeGreaterThan(0.05);
    expect(voids).toBeLessThan(0.2);
    const clanValues = rolls('kurogane').flatMap((a) => Object.values(a));
    const spread = (vs: number[]) => Math.max(...vs) - Math.min(...vs);
    expect(spread(values)).toBeGreaterThan(spread(clanValues));
  });

  it('never leaves clan shinobi without an art', () => {
    for (const a of rolls('kurogane')) {
      expect(Math.min(...DISCIPLINES.map((d) => a[d]))).toBeGreaterThan(0);
    }
  });

  it('raises the floor in the stats your talent raises', () => {
    for (const a of rolls('none', 'sensor')) expect(a.perception).toBeGreaterThanOrEqual(1);
    expect(sensor.statBonuses.perception).toBeGreaterThan(0);
  });

  it('tilts by the clan’s and talent’s growth', () => {
    const mean = (talentId: string) =>
      rolls('none', talentId).reduce((sum, a) => sum + a.genjutsu, 0) / SEEDS;
    expect(mean('prodigy')).toBeGreaterThan(mean('sensor') * 1.1);
    expect(identityTilt([clanless.modifiers, prodigy.modifiers]).genjutsu).toBeCloseTo(1.05 * 1.15);
  });

  it('is rolled once, at creation, the same for the same seed', () => {
    const a = createNewGame({ draft: draft(), seed: 7 }, ctx).character;
    const b = createNewGame({ draft: draft(), seed: 7 }, ctx).character;
    expect(a.aptitude).toEqual(b.aptitude);
    // Only the gift on the file is known; everything else waits to be found out.
    const known = Object.entries(a.aptitudeKnown).filter(([, read]) => read !== 'unknown');
    expect(known).toEqual([['taijutsu', 'sense']]);
  });
});

describe('aptitude for older characters', () => {
  it('is exactly the growth their clan and talent gave them', () => {
    const hardWorker = ctx.content.talents.require('hard-worker');
    const derived = derivedAptitude([kurogane.modifiers, hardWorker.modifiers]);
    expect(derived.taijutsu).toBeCloseTo(1.4);
    expect(derived.speed).toBe(1);
    expect(derivedAptitude([clanless.modifiers, prodigy.modifiers]).ninjutsu).toBeCloseTo(
      1.05 * 1.15,
    );
  });
});
