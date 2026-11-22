import { textOf } from '@/test/fightLines';
import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { withCloseQuarters } from './closeQuarters';
import { holdChance, whoIsThrown } from './standing';
import { initialFighters, type PlanFighter, type Round } from './state';

/** Holding your ground against a blast (`standing.ts`). */

const base: CombatantSetup['attributes'] = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 20,
  perception: 20,
  willpower: 20,
  taijutsu: 20,
  ninjutsu: 20,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const gale = (power: number): CombatTechnique => ({
  id: 'gale',
  name: 'Gale',
  discipline: 'ninjutsu',
  rank: 'B',
  effects: [
    { verb: 'damage', power },
    { verb: 'area', power, size: 'wide' },
  ],
  chakraCost: 20,
});

function pair(caught: Partial<CombatantSetup['attributes']> = {}): readonly PlanFighter[] {
  const setup = (id: string, extra: Partial<CombatantSetup['attributes']> = {}) => ({
    id,
    name: id,
    attributes: { ...base, ...extra },
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques: [gale(20)],
  });
  const all = initialFighters({
    player: setup('hero', caught),
    allies: [],
    enemies: [setup('foe')],
    canFlee: false,
  });
  return withCloseQuarters(all);
}

const hero = (fs: readonly PlanFighter[]) => fs.find((f) => f.id === 'hero')!;
const foe = (fs: readonly PlanFighter[]) => fs.find((f) => f.id === 'foe')!;

describe('holding your ground against a blast', () => {
  it('is likelier the stronger the body, and a far stronger maker still throws it', () => {
    const weak = pair({ strength: 10 });
    const strong = pair({ strength: 40 });
    const t = gale(20);
    expect(holdChance(foe(strong), hero(strong), t)).toBeGreaterThan(
      holdChance(foe(weak), hero(weak), t),
    );
    const brute = pair({ strength: 40 }).map((f) =>
      f.id === 'foe' ? { ...f, attributes: { ...f.attributes, strength: 60, ninjutsu: 60 } } : f,
    );
    expect(holdChance(foe(brute), hero(brute), t)).toBeLessThan(
      holdChance(foe(strong), hero(strong), t),
    );
  });

  it('holds far more surely braced, and more for a bigger body', () => {
    const fs = pair();
    const t = gale(20);
    const plain = holdChance(foe(fs), hero(fs), t);
    const braced: PlanFighter = { ...hero(fs), committed: 'brace' };
    const big: PlanFighter = { ...hero(fs), size: 'large' };
    expect(holdChance(foe(fs), braced, t)).toBeGreaterThan(plain);
    expect(holdChance(foe(fs), big, t)).toBeGreaterThan(plain);
  });

  it('throws a far weaker body almost every time', () => {
    const fs = pair({ strength: 2 });
    const round = {
      number: 1,
      fighters: [...fs],
      range: 'mid',
      story: [],
      seen: {},
      intents: {},
    } satisfies Round;
    let kept = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const turn = { actor: foe(fs), target: hero(fs), rng: createRng(seed) };
      const { thrown } = whoIsThrown(round, turn, { t: gale(20), caught: [hero(fs)] });
      kept += thrown.length === 0 ? 1 : 0;
    }
    expect(kept).toBeLessThanOrEqual(2);
  });

  it('a strong body sometimes keeps its feet, and says so', () => {
    const fs = pair({ strength: 60 });
    const round = {
      number: 1,
      fighters: [...fs],
      range: 'mid',
      story: [],
      seen: {},
      intents: {},
    } satisfies Round;
    let held = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const turn = { actor: foe(fs), target: hero(fs), rng: createRng(seed) };
      const out = whoIsThrown(round, turn, { t: gale(20), caught: [hero(fs)] });
      if (out.thrown.length === 0) {
        held += 1;
        expect(textOf(out.round.story).some((l) => l.includes('feet.'))).toBe(true);
      }
    }
    expect(held).toBeGreaterThan(0);
  });
});
