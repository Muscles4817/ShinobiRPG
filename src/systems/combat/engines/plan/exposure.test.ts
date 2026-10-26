import { createRng, type Rng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { REHIDE_EVERY } from '../../rules/conditions';
import { resolveExchange } from './round';
import { dispel, search, startOfTurn } from './senses';
import { initialFighters, type PlanFighter, type PlanState, type Round } from './state';

/** Hiding holds best at first: every glimpse since a hider last hid brings the seekers nearer. */

const attributes = {
  strength: 5,
  speed: 5,
  stamina: 5,
  chakraControl: 5,
  intellect: 5,
  perception: 5,
  willpower: 5,
  taijutsu: 5,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Bolt',
  discipline: 'genjutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 4,
};

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...over,
  };
}

/** A hero against an illusionist, who starts hidden. */
function fighters(): PlanFighter[] {
  return initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('foe', { traits: ['illusionist'], techniques: [bolt] })],
    canFlee: true,
  });
}

function roundOf(all: PlanFighter[], number = 1): Round {
  return { number, fighters: all, range: 'mid', lines: [], seen: {}, intents: {} };
}

/** Nothing comes up: no search finds, no trace, no dodge. */
const never: Rng = { ...createRng(1), chance: () => false };
const who = (r: Pick<Round, 'fighters'>, id: string) => r.fighters.find((f) => f.id === id)!;

describe('closing in on a hider', () => {
  it('a Search that misses narrows them down for the next look', () => {
    const round = roundOf(fighters());
    const once = search(round, { actor: who(round, 'hero'), rng: never });
    const twice = search(once, { actor: who(once, 'hero'), rng: never });
    expect(who(once, 'foe').exposure).toBe(1);
    expect(who(twice, 'foe').exposure).toBe(2);
  });

  it('so does a Dispel that fails', () => {
    const round = roundOf(fighters());
    const after = dispel(round, { actor: who(round, 'hero'), rng: never });
    expect(who(after, 'foe').exposure).toBe(1);
  });

  it('an attack from hiding leaves a trail', () => {
    const state: PlanState = {
      phase: 'fight',
      round: 1,
      bout: 1,
      exchange: 0,
      fighters: fighters(),
      range: 'mid',
      seen: {},
      intents: {},
      log: [],
      result: null,
      canFlee: true,
    };
    const after = resolveExchange(state, never);
    // Two glimpses: the hero, seeing no one, searched and missed; the foe struck from hiding.
    expect(who(after, 'foe').hidden).toBe(true);
    expect(who(after, 'foe').exposure).toBe(2);
  });

  it('slipping back into hiding starts the search over', () => {
    const found = fighters().map((f) =>
      f.id === 'foe' ? { ...f, hidden: false, exposure: 3 } : f,
    );
    const round = roundOf(found, REHIDE_EVERY);
    const after = startOfTurn(round, who(round, 'foe'), never);
    expect(who(after, 'foe').hidden).toBe(true);
    expect(who(after, 'foe').exposure).toBe(0);
  });
});
