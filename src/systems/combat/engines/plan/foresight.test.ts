import { createRng } from '@/core';

import type { CombatantSetup, CombatPerk } from '../../contract';
import { react } from './react';
import { initialFighters, type Round } from './state';

/** Foresight reads a blow before it comes: slipped and seen through more often. */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 10,
  intellect: 20,
  perception: 20,
  willpower: 10,
  taijutsu: 20,
  ninjutsu: 20,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

function setup(id: string, perks: CombatPerk[] = []): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    perks,
  };
}

function dodger(perks: CombatPerk[]): Round {
  const fighters = initialFighters({
    player: setup('eyes', perks),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  }).map((f) =>
    f.id === 'eyes' ? { ...f, reactions: { close: 'dodge', mid: 'dodge', far: 'dodge' } } : f,
  );
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

function slips(perks: CombatPerk[]): number {
  let slipped = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const r = dodger(perks);
    const [eyes, foe] = r.fighters;
    const blow = {
      raw: 20,
      what: 'strike',
      dodgeable: true,
      physical: true,
      kind: 'blow' as const,
    };
    const after = react(r, { attacker: foe!, target: eyes!, blow, rng: createRng(seed) });
    if (after.fighters.find((f) => f.id === 'eyes')!.health === 100) slipped++;
  }
  return slipped;
}

describe('foresight', () => {
  it('slips blows more often than the same fighter without it', () => {
    expect(slips(['insight', 'foresight'])).toBeGreaterThan(slips(['insight']) * 1.2);
  });
});
