import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { chakraGathered } from '../../rules/gather';
import { avoidOdds, techniqueIncoming } from './avoid';
import { released } from './commitment';
import { gather } from './gather';
import { readyDefences } from './readiness';
import { gatherInstinct } from './resting';
import { initialFighters, patch, type PlanFighter, type Round } from './state';

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Bolt',
  discipline: 'ninjutsu',
  chakraCost: 20,
  effects: [{ verb: 'damage', power: 30 }],
};

function setup(id: string): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques: [bolt],
  };
}

function roundOf(): Round {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  const dry = patch(fighters, 'foe', { chakra: 5, breath: 4 });
  const ready = patch(dry, 'foe', { reactions: { close: 'dodge', mid: 'dodge', far: 'dodge' } });
  return { number: 1, fighters: ready, range: 'far', lines: [], seen: {}, intents: {} };
}

function gathered(round: Round): Round {
  const foe = round.fighters[1]!;
  return gather(round, { actor: foe, target: round.fighters[0], rng: createRng(1) });
}

function slipOdds(round: Round): number {
  const [hero, foe] = round.fighters;
  const incoming = techniqueIncoming(hero!, foe!, bolt, round.range);
  return incoming ? avoidOdds(round, incoming) : 0;
}

describe('gathering', () => {
  it('draws back far more chakra than an exchange gives, and breath', () => {
    const before = roundOf().fighters[1]!;
    const after = gathered(roundOf()).fighters[1]!;
    expect(after.chakra - before.chakra).toBe(chakraGathered(80));
    expect(after.breath).toBeGreaterThan(before.breath ?? 0);
  });

  it('leaves the gatherer open until their next turn: slipping less, no Dodge', () => {
    const round = gathered(roundOf());
    const foe = round.fighters[1]!;
    expect(slipOdds(round)).toBeLessThan(slipOdds(roundOf()) * 0.6);
    expect(readyDefences(foe, round)).toEqual([]);
    const next = released(round, 'foe');
    expect(next.fighters[1]!.gathering).toBe(false);
    expect(slipOdds(next)).toBeCloseTo(slipOdds(roundOf()));
  });

  it('is what a foe run dry of chakra reaches for, and never one who can still pay', () => {
    const round = roundOf();
    const [hero, dry] = round.fighters as [PlanFighter, PlanFighter];
    const full = { ...dry, chakra: 80 };
    const rng = createRng(3);
    const tries = (f: PlanFighter) =>
      Array.from({ length: 100 }, () => gatherInstinct(f, { band: 'far', foe: hero }, rng)).filter(
        Boolean,
      ).length;
    expect(tries(dry)).toBeGreaterThan(20);
    expect(tries(full)).toBe(0);
  });
});
