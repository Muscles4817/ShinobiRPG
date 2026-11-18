import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { crowdedChance, rushedIn, sealsBroken, signsOf, withCloseQuarters } from './closeQuarters';
import { distanceBetween } from './distance';
import { initialFighters, type PlanFighter, type Round } from './state';

/** Close quarters: rushing in, and hand signs broken up close, on trial (`closeQuarters.ts`). */

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

const blast: CombatTechnique = {
  id: 'blast',
  name: 'Blast',
  discipline: 'ninjutsu',
  rank: 'B',
  effects: [{ verb: 'damage', power: 20 }],
  chakraCost: 20,
};

function fighters(rules: { handSigns?: boolean }, foe: Partial<CombatantSetup['attributes']> = {}) {
  const setup = (
    id: string,
    extra: Partial<CombatantSetup['attributes']> = {},
  ): CombatantSetup => ({
    id,
    name: id,
    attributes: { ...base, ...extra },
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques: [blast],
  });
  const all = initialFighters({
    player: setup('hero', { taijutsu: 30 }),
    allies: [],
    enemies: [setup('foe', foe)],
    canFlee: false,
  });
  return withCloseQuarters(all, { experiments: rules });
}

function at(fs: readonly PlanFighter[], band: 'close' | 'mid'): Round {
  return { number: 1, fighters: [...fs], range: band, lines: [], seen: {}, intents: {} };
}

describe('hand signs up close', () => {
  it('the body arts take none, and a higher rank takes more', () => {
    expect(signsOf({ discipline: 'taijutsu', rank: 'S' })).toBe(0);
    expect(signsOf({ discipline: 'kenjutsu', rank: 'A' })).toBe(0);
    expect(signsOf({ discipline: 'ninjutsu', rank: 'E' })).toBeLessThan(
      signsOf({ discipline: 'ninjutsu', rank: 'A' }),
    );
  });

  it('a quicker crowder breaks them more often', () => {
    const [caster, slow] = fighters({ handSigns: true });
    const [, quick] = fighters({ handSigns: true }, { speed: 40, taijutsu: 40 });
    expect(crowdedChance(caster!, quick!, 2)).toBeGreaterThan(crowdedChance(caster!, slow!, 2));
  });

  it('come apart only up close, only with the rule on, and never with the crowder dazed', () => {
    const tries = (round: Round) =>
      Array.from({ length: 60 }, (_, seed) => {
        const caster = round.fighters.find((f) => f.id === 'foe')!;
        const target = round.fighters.find((f) => f.id === 'hero')!;
        return sealsBroken(round, { actor: caster, target, rng: createRng(seed + 1) }, blast);
      }).filter((r) => r !== null).length;
    const on = fighters({ handSigns: true }, { speed: 10 });
    expect(tries(at(on, 'close'))).toBeGreaterThan(0);
    expect(tries(at(on, 'mid'))).toBe(0);
    expect(tries(at(fighters({}, { speed: 10 }), 'close'))).toBe(0);
    const dazed = on.map((f) => (f.id === 'hero' ? { ...f, stunned: 1 } : f));
    expect(tries(at(dazed, 'close'))).toBe(0);
  });

  it('cost half the chakra and say why', () => {
    const round = at(fighters({ handSigns: true }, { speed: 5, chakraControl: 5 }), 'close');
    const caster = round.fighters.find((f) => f.id === 'foe')!;
    const target = round.fighters.find((f) => f.id === 'hero')!;
    const broken = Array.from({ length: 60 }, (_, seed) =>
      sealsBroken(round, { actor: caster, target, rng: createRng(seed + 1) }, blast),
    ).find((r) => r !== null);
    const after = broken?.fighters.find((f) => f.id === 'foe');
    expect(after?.chakra).toBeLessThan(caster.chakra);
    expect(after?.chakra).toBeGreaterThan(caster.chakra - 20);
    expect(broken?.lines.at(-1)).toContain('⟦c:crowded⟧');
  });
});

describe('rushing in', () => {
  it('only a taijutsu fighter rushes', () => {
    expect(fighters({}).find((f) => f.id === 'hero')?.rushes).toBe(true);
    const caster = fighters({}, { taijutsu: 5, ninjutsu: 30 }).find((f) => f.id === 'foe');
    expect(caster?.rushes).toBeUndefined();
  });

  it('strikes as they land close, not when they were already there', () => {
    const fs = fighters({});
    const hero = fs.find((f) => f.id === 'hero')!;
    const foe = fs.find((f) => f.id === 'foe')!;
    const before = at(fs, 'mid');
    const arrived: Round = { ...before, distances: { 'foe|hero': 'close' } };
    expect(distanceBetween(arrived, 'hero', 'foe')).toBe('close');
    const turn = { actor: hero, target: foe, rng: createRng(3) };
    const told = rushedIn(before, arrived, turn).lines;
    expect(told.length).toBeGreaterThan(0);
    // A fighter with no grammar reads as "they", and the verb after it agrees.
    expect(told[0]).toContain('as they land.');
    expect(rushedIn(arrived, arrived, turn)).toBe(arrived);
  });
});
