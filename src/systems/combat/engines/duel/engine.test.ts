import { createRng } from '@/core';

import type { CombatantSetup, CombatEngine, CombatState } from '../../contract';
import { createDuelEngine } from './engine';

const attributes = {
  strength: 5,
  speed: 5,
  stamina: 5,
  perception: 5,
  willpower: 5,
  taijutsu: 5,
  ninjutsu: 5,
  genjutsu: 5,
};

function fighter(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 50,
    maxHealth: 50,
    chakra: 20,
    maxChakra: 20,
    techniques: [],
    ...overrides,
  };
}

function fightUntilOver(engine: CombatEngine, state: CombatState, optionId: string): CombatState {
  let current = state;
  const rng = createRng(11);
  for (let i = 0; i < 100 && !engine.outcome(current); i++) {
    const next = engine.act(current, optionId, rng);
    if (!next.ok) throw new Error(next.error);
    current = next.value;
  }
  return current;
}

describe('duel engine', () => {
  const engine = createDuelEngine();

  it('starts a fight with no outcome and offers basic options', () => {
    const state = engine.start(
      { player: fighter('hero'), enemies: [fighter('bandit')], canFlee: true },
      createRng(1),
    );
    expect(engine.outcome(state)).toBeNull();
    expect(engine.view(state).options.map((o) => o.id)).toEqual(['strike', 'guard', 'flee']);
  });

  it('a much stronger player wins by striking', () => {
    const strong = fighter('hero', { attributes: { ...attributes, strength: 40, taijutsu: 40 } });
    const state = engine.start(
      { player: strong, enemies: [fighter('bandit')], canFlee: true },
      createRng(1),
    );
    const end = fightUntilOver(engine, state, 'strike');
    expect(engine.outcome(end)?.result).toBe('victory');
  });

  it('a much weaker player loses', () => {
    const weak = fighter('hero', { health: 5 });
    const brute = fighter('brute', { attributes: { ...attributes, strength: 40, taijutsu: 40 } });
    const state = engine.start({ player: weak, enemies: [brute], canFlee: false }, createRng(1));
    const end = fightUntilOver(engine, state, 'strike');
    expect(engine.outcome(end)).toMatchObject({ result: 'defeat', player: { health: 0 } });
  });

  it('refuses disabled options', () => {
    const pricey = {
      id: 'blast',
      name: 'Blast',
      discipline: 'ninjutsu' as const,
      effect: 'damage' as const,
      chakraCost: 99,
      power: 10,
    };
    const state = engine.start(
      {
        player: fighter('hero', { techniques: [pricey] }),
        enemies: [fighter('b')],
        canFlee: false,
      },
      createRng(1),
    );
    expect(engine.act(state, 'tech:blast', createRng(1))).toEqual({
      ok: false,
      error: 'Not enough chakra',
    });
    expect(engine.act(state, 'flee', createRng(1)).ok).toBe(false);
  });

  it('spends chakra on techniques', () => {
    const jab = {
      id: 'jab',
      name: 'Jab',
      discipline: 'taijutsu' as const,
      effect: 'damage' as const,
      chakraCost: 6,
      power: 5,
    };
    const state = engine.start(
      { player: fighter('hero', { techniques: [jab] }), enemies: [fighter('b')], canFlee: false },
      createRng(1),
    );
    const next = engine.act(state, 'tech:jab', createRng(2));
    if (!next.ok) throw new Error(next.error);
    const hero = engine.view(next.value).combatants.find((c) => c.id === 'hero');
    // 20 - 6 cost + 2 regen
    expect(hero?.chakra).toBe(16);
  });

  it('rejects state from another engine', () => {
    expect(() => engine.view({ engineId: 'other', data: {} })).toThrow();
  });
});
