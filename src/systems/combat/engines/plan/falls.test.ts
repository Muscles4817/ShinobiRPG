import { createRng } from '@/core';

import type { CombatantSetup, CombatSetup } from '../../contract';
import { splitNarration } from '../../rules/narration';
import { createPlanEngine } from './engine';

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

function fighter(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

const strong = { ...attributes, strength: 30, taijutsu: 30, speed: 20 };
const thug = (id: string) =>
  fighter(id, { name: 'Bandit Thug', called: 'the bandit thug', grammar: 'he', health: 30 });

/** A fight watched to its end, the player far stronger than two thugs. */
function wonFight() {
  const engine = createPlanEngine();
  const setup: CombatSetup = {
    player: fighter('player', { called: 'you', grammar: 'you', attributes: strong }),
    allies: [],
    enemies: [thug('a'), thug('b')],
    canFlee: false,
    watch: true,
  };
  let state = engine.start(setup, createRng(4));
  const rng = createRng(5);
  for (let i = 0; i < 10 && !engine.outcome(state); i++) {
    const next = engine.act(state, { optionId: 'round' }, rng);
    if (!next.ok) throw new Error(next.error);
    state = next.value;
  }
  return { engine, state };
}

describe('how a fight ends, in the story', () => {
  it('tells each foe going down, and closes the fight', () => {
    const { engine, state } = wonFight();
    const { log } = engine.view(state);
    const falls = log.filter((l) => l.includes('⟦v:fall-person.'));
    expect(falls.map((l) => splitNarration(l).text.split(' ', 2).join(' '))).toEqual([
      'The first',
      'The second',
    ]);
    expect(log.at(-1)).toMatch(/⟦v:won\./);
  });

  it('sums the fight up for its card, in words', () => {
    const { engine, state } = wonFight();
    const summary = engine.outcome(state)?.summary ?? '';
    expect(summary).toMatch(/^You won in /);
    expect(summary).toMatch(/the last of them to go down/);
    expect(summary).not.toMatch(/\d/);
  });
});
