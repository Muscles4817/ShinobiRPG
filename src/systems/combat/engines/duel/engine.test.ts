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
  kenjutsu: 5,
  fuuinjutsu: 5,
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
      { allies: [], player: fighter('hero'), enemies: [fighter('bandit')], canFlee: true },
      createRng(1),
    );
    expect(engine.outcome(state)).toBeNull();
    expect(engine.view(state).options.map((o) => o.id)).toEqual(['strike', 'guard', 'flee']);
  });

  it('a much stronger player wins by striking', () => {
    const strong = fighter('hero', { attributes: { ...attributes, strength: 40, taijutsu: 40 } });
    const state = engine.start(
      { allies: [], player: strong, enemies: [fighter('bandit')], canFlee: true },
      createRng(1),
    );
    const end = fightUntilOver(engine, state, 'strike');
    expect(engine.outcome(end)?.result).toBe('victory');
  });

  it('a much weaker player loses', () => {
    const weak = fighter('hero', { health: 5 });
    const brute = fighter('brute', { attributes: { ...attributes, strength: 40, taijutsu: 40 } });
    const state = engine.start(
      { allies: [], player: weak, enemies: [brute], canFlee: false },
      createRng(1),
    );
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
        allies: [],
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
      {
        allies: [],
        player: fighter('hero', { techniques: [jab] }),
        enemies: [fighter('b')],
        canFlee: false,
      },
      createRng(1),
    );
    const next = engine.act(state, 'tech:jab', createRng(2));
    if (!next.ok) throw new Error(next.error);
    const hero = engine.view(next.value).combatants.find((c) => c.id === 'hero');
    // 20 - 6 cost + 2 regen
    expect(hero?.chakra).toBe(16);
  });

  it('allies fight on their own and can win the fight for you', () => {
    const ally = fighter('ally', { attributes: { ...attributes, strength: 40, speed: 40 } });
    const state = engine.start(
      { player: fighter('hero'), allies: [ally], enemies: [fighter('bandit')], canFlee: false },
      createRng(3),
    );
    expect(engine.view(state).combatants.map((c) => c.side)).toEqual(['player', 'player', 'enemy']);
    const end = fightUntilOver(engine, state, 'guard');
    expect(engine.outcome(end)?.result).toBe('victory');
    expect(engine.view(end).log.some((l) => l.startsWith('ally '))).toBe(true);
  });

  it('names a group of enemies as a list', () => {
    const state = engine.start(
      {
        allies: [],
        player: fighter('hero'),
        enemies: [fighter('A'), fighter('B'), fighter('C')],
        canFlee: true,
      },
      createRng(1),
    );
    expect(engine.view(state).log[0]).toBe('A, B and C stand against you!');
  });

  it('enemies spread their attacks across your team', () => {
    const tank = fighter('ally', { health: 500, maxHealth: 500 });
    const state = engine.start(
      {
        player: fighter('hero', { health: 500, maxHealth: 500 }),
        allies: [tank],
        enemies: [fighter('bandit', { health: 5000, maxHealth: 5000 })],
        canFlee: false,
      },
      createRng(5),
    );
    let current = state;
    for (let i = 0; i < 12; i++) {
      const next = engine.act(current, 'guard', createRng(i + 20));
      if (!next.ok) throw new Error(next.error);
      current = next.value;
    }
    const ally = engine.view(current).combatants.find((c) => c.id === 'ally')!;
    expect(ally.health).toBeLessThan(500);
  });

  it('reads a fight saved before allies existed', () => {
    const saved = engine.start(
      { allies: [], player: fighter('hero'), enemies: [fighter('bandit')], canFlee: true },
      createRng(1),
    );
    const data = saved.data as { fighters: Record<string, unknown>[] };
    const old = {
      ...saved,
      data: { ...data, fighters: data.fighters.map(({ side: _side, ...f }) => f) },
    };
    expect(engine.view(old).combatants.map((c) => c.side)).toEqual(['player', 'enemy']);
    expect(engine.act(old, 'strike', createRng(2)).ok).toBe(true);
  });

  it('rejects state from another engine', () => {
    expect(() => engine.view({ engineId: 'other', data: {} })).toThrow();
  });

  it('seals stop the target using techniques', () => {
    const seal = {
      id: 'seal',
      name: 'Seal',
      discipline: 'fuuinjutsu' as const,
      effect: 'seal' as const,
      chakraCost: 1,
      power: 14,
    };
    const sealer = fighter('sealer', {
      attributes: { ...attributes, fuuinjutsu: 60, speed: 60 },
      techniques: [seal],
    });
    const victim = fighter('hero', { techniques: [seal] });
    const state = engine.start(
      { allies: [], player: victim, enemies: [sealer], canFlee: false },
      createRng(1),
    );
    let current = state;
    for (let i = 0; i < 10; i++) {
      const sealedNow = engine
        .view(current)
        .combatants.find((c) => c.id === 'hero')!
        .statuses.includes('Sealed');
      if (sealedNow) break;
      const next = engine.act(current, 'guard', createRng(i + 1));
      if (!next.ok) throw new Error(next.error);
      current = next.value;
    }
    const option = engine.view(current).options.find((o) => o.id === 'tech:seal');
    expect(option?.disabledReason).toBe('Your chakra is sealed');
  });
});
