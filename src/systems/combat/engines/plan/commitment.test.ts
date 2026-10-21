import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { COMMIT_BREATH, EVADE_MAX } from '../../rules/commitment';
import { avoidOdds, techniqueIncoming } from './avoid';
import { playable } from './cards';
import { commit, released } from './commitment';
import { react, type Blow } from './react';
import { shelterInstinct } from './shelter';
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
  chakraCost: 4,
  effects: [{ verb: 'damage', power: 10 }],
};

function setup(id: string): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
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
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

function committed(round: Round, kind: 'evade' | 'brace'): Round {
  const foe = round.fighters[1]!;
  return commit(round, { actor: foe, target: round.fighters[0], rng: createRng(1) }, kind);
}

function slipOdds(round: Round): number {
  const [hero, foe] = round.fighters;
  const incoming = techniqueIncoming(hero!, foe!, bolt, round.range);
  return incoming ? avoidOdds(round, incoming) : 0;
}

/** What a physical blow of this much takes from the foe, on average over seeds that land it. */
function blowTaken(round: Round): number {
  const blow: Blow = { raw: 30, what: 'kick', dodgeable: false, physical: true, kind: 'blow' };
  const [hero, foe] = round.fighters as [PlanFighter, PlanFighter];
  const after = react(round, { attacker: hero, target: foe, blow, rng: createRng(3) });
  return foe.health - (after.fighters[1]?.health ?? 0);
}

describe('committed defence', () => {
  it('Evade makes everything far harder to land, up to more than anyone else may slip', () => {
    const open = slipOdds(roundOf());
    const evading = slipOdds(committed(roundOf(), 'evade'));
    expect(evading).toBeGreaterThan(open * 1.8);
    expect(evading).toBeLessThanOrEqual(EVADE_MAX);
  });

  it('Brace takes much of a physical blow, and spends breath', () => {
    const open = blowTaken(roundOf());
    const braced = committed(roundOf(), 'brace');
    expect(blowTaken(braced)).toBeLessThan(open * 0.7);
    const foe = braced.fighters[1]!;
    expect(foe.breath).toBeLessThan(10 + 2 * attributes.stamina);
    expect(foe.committed).toBe('brace');
  });

  it('holds until the fighter’s next turn begins', () => {
    const round = released(committed(roundOf(), 'evade'), 'foe');
    expect(round.fighters[1]!.committed).toBeNull();
    expect(slipOdds(round)).toBeCloseTo(slipOdds(roundOf()));
  });

  it('needs the breath for it', () => {
    const round = roundOf();
    const winded = patch(round.fighters, 'foe', { breath: COMMIT_BREATH.evade - 1 })[1]!;
    expect(playable(winded, { kind: 'evade' })).toBe(false);
    expect(playable(winded, { kind: 'brace' })).toBe(true);
  });

  it('an outmatched mind that reads the fight takes cover some turns; a dull one never', () => {
    const round = roundOf();
    const strong = {
      ...round.fighters[0]!,
      attributes: { ...attributes, speed: 30, taijutsu: 30, strength: 30 },
    };
    const sharp = { ...round.fighters[1]!, attributes: { ...attributes, intellect: 30 } };
    const dull = { ...round.fighters[1]!, attributes: { ...attributes, intellect: 2 } };
    const rng = createRng(5);
    const covers = (f: PlanFighter) =>
      Array.from({ length: 200 }, () => shelterInstinct(f, strong, rng)).filter(Boolean).length;
    expect(covers(sharp)).toBeGreaterThan(30);
    expect(covers(dull)).toBe(0);
    expect(shelterInstinct(sharp, round.fighters[0], rng)).toBeUndefined();
  });
});
