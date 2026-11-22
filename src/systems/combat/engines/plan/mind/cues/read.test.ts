import type { CombatantSetup, CombatTechnique } from '../../../../contract';
import { initialFighters, type PlanState } from '../../state';
import { cueReadLine } from './read';

/** Your read of what a foe is readying, from its cues (`read.ts`). */

const base: CombatantSetup['attributes'] = {
  strength: 15,
  speed: 15,
  stamina: 15,
  chakraControl: 15,
  intellect: 15,
  perception: 15,
  willpower: 15,
  taijutsu: 15,
  ninjutsu: 15,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const fireball: CombatTechnique = {
  id: 'fireball',
  name: 'Great Fireball',
  discipline: 'ninjutsu',
  rank: 'C',
  element: 'fire',
  reach: ['mid', 'far'],
  effects: [{ verb: 'damage', power: 20 }],
  chakraCost: 20,
};

interface Sides {
  readonly you?: Partial<CombatantSetup['attributes']>;
  readonly foe?: Partial<CombatantSetup['attributes']>;
  readonly youKnow?: boolean;
  readonly intent?: string;
}

function table({
  you = {},
  foe = {},
  youKnow = false,
  intent = 'jutsu:fireball',
}: Sides): PlanState {
  const setup = (id: string, extra: Partial<CombatantSetup>): CombatantSetup => ({
    id,
    name: id,
    attributes: base,
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques: [],
    ...extra,
  });
  const fighters = initialFighters({
    player: setup('you', {
      called: 'you',
      grammar: 'you',
      attributes: { ...base, ...you },
      techniques: youKnow ? [fireball] : [],
    }),
    allies: [],
    enemies: [setup('Gōran', { attributes: { ...base, ...foe }, techniques: [fireball] })],
    canFlee: false,
  });
  return {
    phase: 'loadout',
    round: 1,
    bout: 1,
    exchange: 0,
    fighters,
    range: 'mid',
    seen: {},
    intents: { Gōran: intent },
    story: [],
    result: null,
    canFlee: false,
  };
}

const read = (s: Sides) => {
  const state = table(s);
  return cueReadLine(
    state,
    state.fighters.find((f) => f.id === 'Gōran')!,
  );
};

describe('reading a foe from its cues', () => {
  it('a keen eye that knows the technique names it', () => {
    expect(read({ you: { perception: 45 }, foe: { perception: 5 }, youKnow: true })).toMatch(
      /Great Fireball/,
    );
  });

  it('a keen eye meeting a technique for the first time describes what it clearly saw', () => {
    const line = read({ you: { perception: 45, ninjutsu: 2 }, foe: { perception: 5 } }) ?? '';
    expect(line).toMatch(/unfamiliar fire technique/);
    expect(line).not.toMatch(/Great Fireball/);
  });

  it('a dull eye on a watchful foe is unsure, and never names it wrongly', () => {
    const line = read({ you: { perception: 2 }, foe: { perception: 45 } }) ?? '';
    expect(line).not.toMatch(/Great Fireball/);
    expect(line).toMatch(/maybe|fairly sure/);
  });

  it('reads a plain step as a step, and says no numbers', () => {
    const line = read({ you: { perception: 45 }, foe: { perception: 5 }, intent: 'step-in' }) ?? '';
    expect(line).toMatch(/closing in/i);
    expect(line).not.toMatch(/\d/);
  });

  it('reads nothing of a foe in hiding', () => {
    const state = table({});
    const hidden = { ...state.fighters.find((f) => f.id === 'Gōran')!, hidden: true };
    expect(cueReadLine(state, hidden)).toBeUndefined();
  });
});
