import { createRng } from '@/core';

import type {
  CombatantSetup,
  CombatEngine,
  CombatSetup,
  CombatState,
  CombatTechnique,
} from '../../contract';
import { createPlanEngine } from './engine';
import { decode, encode } from './state';

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
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...overrides,
  };
}

const blaze: CombatTechnique = {
  id: 'blaze',
  name: 'Blaze',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 30 }],
  chakraCost: 10,
  oncePerFight: true,
  afterCost: { kind: 'hospital', days: 2 },
};

function setup(overrides: Partial<CombatSetup> = {}): CombatSetup {
  return {
    player: fighter('hero'),
    allies: [],
    enemies: [fighter('bandit')],
    canFlee: true,
    ...overrides,
  };
}

function act(engine: CombatEngine, state: CombatState, optionId: string, seed = 2): CombatState {
  const next = engine.act(state, { optionId }, createRng(seed));
  if (!next.ok) throw new Error(next.error);
  return next.value;
}

function bandit(engine: CombatEngine, state: CombatState) {
  return engine.view(state).combatants.find((c) => c.id === 'bandit');
}

describe('plan & watch openings', () => {
  const engine = createPlanEngine();

  it('starts head-on at mid range without an opening', () => {
    const state = engine.start(setup(), createRng(1));
    expect(engine.view(state).range).toBe('mid');
    expect(bandit(engine, state)?.statuses).toEqual([]);
  });

  it('starts at the opening range, with its hidden and dazed fighters', () => {
    const opening = { range: 'close', hidden: ['hero'], dazed: ['bandit'] } as const;
    const state = engine.start(setup({ opening }), createRng(1));
    const view = engine.view(state);
    expect(view.range).toBe('close');
    expect(view.combatants.find((c) => c.id === 'hero')?.statuses).toContain('Hidden');
    expect(bandit(engine, state)?.statuses).toContain('Dazed');
    expect(view.log).toContain('bandit is caught off balance!');
  });

  it('a foe dazed by the opening loses the first exchange, then recovers', () => {
    const state = engine.start(setup({ opening: { dazed: ['bandit'] } }), createRng(1));
    const first = act(engine, act(engine, state, 'begin'), 'next');
    expect(engine.view(first).log).toContain('bandit is dazed and loses the exchange.');
    expect(bandit(engine, first)?.statuses).not.toContain('Dazed');
  });

  it('the side that moved first acts first in exchange 1, however slow', () => {
    const slow = { ...attributes, speed: 1 };
    const fast = { ...attributes, speed: 30 };
    const fight = setup({
      player: fighter('hero', { attributes: fast }),
      enemies: [fighter('bandit', { attributes: slow })],
      opening: { firstMover: 'enemy' },
    });
    for (const seed of [1, 2, 3, 4]) {
      const state = engine.start(fight, createRng(seed));
      const log = engine.view(act(engine, act(engine, state, 'begin'), 'next', seed)).log;
      const exchange = log.slice(log.indexOf('— Exchange 1 —') + 1);
      expect(exchange[0]).toMatch(/^bandit/);
    }
  });
});

describe('plan & watch trump cards', () => {
  const engine = createPlanEngine();
  const tough = fighter('bandit', { health: 1000, maxHealth: 1000 });

  it('plays a trump once per fight and reports what it costs', () => {
    const hero = fighter('hero', { techniques: [blaze], health: 1000, maxHealth: 1000 });
    // Slotted first at every distance, so only once-per-fight keeps it from playing again.
    const first = ['jutsu:blaze', 'strike', 'throw'];
    const slots = { close: first, mid: first, far: first };
    const fight = setup({ player: hero, enemies: [tough], plan: slots });
    let state = act(engine, engine.start(fight, createRng(3)), 'begin');
    for (let round = 0; round < 3; round++)
      state = act(engine, act(engine, state, 'round'), 'begin');
    const uses = engine.view(state).log.filter((line) => line === 'hero uses Blaze!');
    expect(uses).toHaveLength(1);
    const plan = decode(state);
    const beaten = plan.fighters.map((f) => (f.side === 'enemy' ? { ...f, health: 0 } : f));
    const outcome = engine.outcome(encode({ ...plan, fighters: beaten }));
    expect(outcome?.costs).toEqual([
      { techniqueId: 'blaze', techniqueName: 'Blaze', cost: { kind: 'hospital', days: 2 } },
    ]);
  });

  it('owes nothing for a trump never used', () => {
    const state = engine.start(
      setup({ player: fighter('hero', { techniques: [blaze] }) }),
      createRng(3),
    );
    const plan = decode(state);
    const beaten = plan.fighters.map((f) => (f.side === 'enemy' ? { ...f, health: 0 } : f));
    expect(engine.outcome(encode({ ...plan, fighters: beaten }))?.costs).toEqual([]);
  });
});
