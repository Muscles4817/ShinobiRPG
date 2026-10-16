import { createRng } from '@/core';

import type { CombatantSetup, CombatSetup, CombatState, CombatTechnique } from '../../contract';
import { createPlanEngine } from './engine';
import { decode } from './state';

/** A fight only watched: no card table, both sides fight and adapt on their own. */

const engine = createPlanEngine();

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

const blast: CombatTechnique = {
  id: 'blast',
  name: 'Blast',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 16 }],
  chakraCost: 6,
};

function fighter(id: string): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 30,
    maxChakra: 30,
    techniques: [blast],
  };
}

const WATCHED: CombatSetup = {
  player: fighter('hero'),
  allies: [],
  enemies: [fighter('rival')],
  canFlee: true,
  watch: true,
  intro: 'hero against rival.',
};

function act(state: CombatState, optionId: string, seed = 3): CombatState {
  const next = engine.act(state, { optionId }, createRng(seed));
  if (!next.ok) throw new Error(next.error);
  return next.value;
}

describe('a fight only watched', () => {
  it('opens on the fight itself, with nothing to plan and no way to flee', () => {
    const view = engine.view(engine.start(WATCHED, createRng(1)));
    expect(view.log[0]).toBe('hero against rival.');
    expect(view.log.at(-1)).toBe('— The fight begins —');
    expect(view.options.map((o) => o.id)).toEqual(['next', 'round', 'finish']);
    expect(view.options.every((o) => o.kind === 'continue')).toBe(true);
    expect(view.watched).toBe(true);
  });

  it('plays round after round without stopping at the card table', () => {
    const after = act(engine.start(WATCHED, createRng(1)), 'round');
    const plan = decode(after);
    expect(plan.result ?? plan.phase).not.toBe('loadout');
    if (!plan.result) {
      expect(plan.bout).toBe(2);
      expect(plan.log.at(-1)).toBe('— The next round begins —');
      expect(engine.view(after).options.map((o) => o.id)).toEqual(['next', 'round', 'finish']);
    }
  });

  it('can be watched to the end', () => {
    const done = act(engine.start(WATCHED, createRng(1)), 'finish');
    expect(engine.outcome(done)?.result).toMatch(/victory|defeat/);
  });

  it('leaves a played fight’s card table as it was', () => {
    const { watch: _watch, ...played } = WATCHED;
    const view = engine.view(engine.start(played, createRng(1)));
    expect(view.options.some((o) => o.kind === 'plan')).toBe(true);
    expect(view.options.some((o) => o.id === 'finish')).toBe(false);
  });
});
