import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { rollIntents } from './intent';
import { planAdherence } from './judgement';
import { initialFighters, plainSlots, type Loadout, type PlanFighter } from './state';

/**
 * A foe that rolls off its plan follows its instinct, and instinct sees the whole field: an open
 * foe for a finisher, a killer to answer, a set-up to start. It once saw no one at all.
 */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 4,
  perception: 10,
  willpower: 10,
  taijutsu: 20,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

const finisher: CombatTechnique = {
  id: 'finisher',
  name: 'Finisher',
  discipline: 'taijutsu',
  reach: ['close'],
  needsTarget: 'open',
  effects: [{ verb: 'damage', power: 30 }],
  chakraCost: 8,
};

const NO_CARDS: Loadout = { close: [], mid: [], far: [] };

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...overrides,
  };
}

/** A dull foe holding a finisher and a plain strike, facing a hero dazed and open. */
function table() {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('brute', { techniques: [finisher] })],
    canFlee: true,
  }).map((f): PlanFighter => {
    if (f.id === 'hero') return { ...f, stunned: 1 };
    return { ...f, loadout: { ...NO_CARDS, close: plainSlots(['strike', 'jutsu:finisher']) } };
  });
  return { fighters, range: 'close' as const, exchange: 1, round: 1 };
}

describe('instinct-rolled intents', () => {
  it('see the field: an open foe draws the finisher off-plan too', () => {
    const t = table();
    const brute = t.fighters.find((f) => f.id === 'brute')!;
    // Off plan only: the plan's own play is a strike, so every finisher here is instinct's.
    expect(planAdherence(brute)).toBeLessThan(1);
    let finishers = 0;
    for (let seed = 1; seed <= 200; seed++) {
      if (rollIntents(t, createRng(seed)).brute === 'jutsu:finisher') finishers++;
    }
    expect(finishers).toBeGreaterThan(0);
  });
});
