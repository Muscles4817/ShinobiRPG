import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { createPlanEngine } from './engine';
import { defaultLoadout } from './defaults';
import { makesOf, needsOf } from './enablers';
import { decode, initialFighters, type PlanFighter } from './state';

/**
 * A default plan slots what a card needs beside it (`enablers.ts`): a finisher that waits for an
 * open foe comes with the daze or pin that opens one, whatever the foe fights with. Before, the
 * daze was slotted only to spoil a foe readying a jutsu, so against a foe of blows alone the
 * finisher never played.
 */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 20,
  perception: 20,
  willpower: 20,
  taijutsu: 8,
  ninjutsu: 20,
  genjutsu: 20,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const technique = (
  id: string,
  effects: CombatTechnique['effects'],
  more: Partial<CombatTechnique> = {},
): CombatTechnique => ({
  id,
  name: id,
  discipline: 'ninjutsu',
  reach: ['close', 'mid'],
  effects,
  chakraCost: 8,
  ...more,
});

const spark = technique('spark', [{ verb: 'damage', power: 16 }], { chakraCost: 4 });
const flash = technique('flash', [{ verb: 'daze', power: 16 }], { discipline: 'genjutsu' });
const snare = technique('snare', [{ verb: 'pin', power: 12 }]);
const burst = technique('burst', [{ verb: 'damage', power: 36 }], { needsTarget: 'open' });
const blade = technique('blade', [{ verb: 'damage', power: 26 }], { lethal: true });

function setup(id: string, techniques: readonly CombatTechnique[]): CombatantSetup {
  const pool = { health: 100, maxHealth: 100, chakra: 80, maxChakra: 80 };
  return { id, name: id, attributes, ...pool, techniques };
}

function fighters(mine: readonly CombatTechnique[], theirs: readonly CombatTechnique[] = []) {
  return initialFighters({
    player: setup('me', mine),
    allies: [],
    enemies: [setup('foe', theirs)],
    canFlee: false,
  });
}

const closeCards = (f: PlanFighter, among: readonly PlanFighter[]) =>
  defaultLoadout(f, among).close.map((s) => s.card);

describe('what techniques need and make, read from what they are', () => {
  it('a finisher needs an open foe; a daze or a pin makes one; a killing blow needs nothing', () => {
    const jutsu = (t: CombatTechnique) => ({ kind: 'jutsu', technique: t }) as const;
    expect(needsOf(jutsu(burst))).toEqual(['foe-open']);
    expect(makesOf(jutsu(flash))).toEqual(['foe-open']);
    expect(makesOf(jutsu(snare))).toEqual(['foe-open']);
    expect(needsOf(jutsu(blade))).toEqual([]);
    expect(needsOf(jutsu(spark))).toEqual([]);
  });

  it('a finisher that also dazes does not count as its own opener', () => {
    const both = technique('both', [{ verb: 'daze', power: 10 }], { needsTarget: 'open' });
    expect(makesOf({ kind: 'jutsu', technique: both })).toEqual([]);
  });
});

describe('the default plan slots an opener behind a finisher', () => {
  it('against a foe of blows alone: the daze right behind the finisher', () => {
    const all = fighters([spark, flash, burst]);
    const cards = closeCards(all[0]!, all);
    const at = cards.indexOf('jutsu:burst');
    expect(at).toBeGreaterThanOrEqual(0);
    expect(cards[at + 1]).toBe('jutsu:flash');
  });

  it('the strongest opener the kit has, once, and nothing when it has none', () => {
    const all = fighters([spark, flash, snare, burst]);
    const cards = closeCards(all[0]!, all);
    expect(cards.filter((c) => c === 'jutsu:flash' || c === 'jutsu:snare')).toHaveLength(1);
    const none = fighters([spark, burst]);
    expect(closeCards(none[0]!, none)).toEqual(
      defaultLoadout(none[0]!, none).close.map((s) => s.card),
    );
    expect(closeCards(none[0]!, none)).not.toContain('jutsu:flash');
  });

  it('a kit with no finisher keeps its plan as it was', () => {
    const all = fighters([spark, flash], [spark]);
    expect(closeCards(all[0]!, all)).not.toContain('jutsu:burst');
    expect(new Set(closeCards(all[0]!, all)).size).toBe(closeCards(all[0]!, all).length);
  });
});

describe('in a fight', () => {
  it('the finisher now lands against a foe of blows alone', () => {
    const engine = createPlanEngine();
    let fightsWithBurst = 0;
    const FIGHTS = 30;
    for (let seed = 1; seed <= FIGHTS; seed++) {
      const rng = createRng(seed);
      let state = engine.start(
        {
          player: setup('me', [spark, flash, burst]),
          allies: [],
          enemies: [setup('foe', [])],
          canFlee: false,
          watch: true,
        },
        rng,
      );
      for (let n = 0; n < 12 && !engine.outcome(state); n++) {
        const next = engine.act(state, { optionId: 'next' }, rng);
        if (!next.ok) break;
        state = next.value;
      }
      const me = decode(state).fighters.find((f) => f.isPlayer);
      if (me?.used?.includes('burst')) fightsWithBurst++;
    }
    expect(fightsWithBurst).toBeGreaterThan(FIGHTS / 2);
  });
});
