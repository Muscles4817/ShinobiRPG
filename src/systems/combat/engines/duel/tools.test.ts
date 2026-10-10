import { createRng } from '@/core';

import type {
  CombatantSetup,
  CombatChoice,
  CombatItem,
  CombatItemEffect,
  CombatState,
  CombatTrait,
} from '../../contract';
import { createDuelEngine } from './engine';

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

const tool = (effect: CombatItemEffect, count = 2): CombatItem => ({
  id: effect,
  name: `${effect} tool`,
  effect,
  count,
});

function fighter(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 50,
    maxHealth: 50,
    chakra: 20,
    maxChakra: 40,
    techniques: [],
    ...overrides,
  };
}

/** A quick hero (acts first every round) carrying the given tools. */
const hero = (items: CombatItem[], overrides: Partial<CombatantSetup> = {}): CombatantSetup =>
  fighter('hero', { attributes: { ...attributes, speed: 60 }, items, ...overrides });

const foe = (id: string, traits: CombatTrait[] = [], health = 50): CombatantSetup =>
  fighter(id, { traits, health, maxHealth: Math.max(health, 50) });

const engine = createDuelEngine();

function duel(player: CombatantSetup, ...enemies: CombatantSetup[]): CombatState {
  return engine.start({ allies: [], player, enemies, canFlee: false }, createRng(1));
}

function act(state: CombatState, choice: CombatChoice, seed = 2): CombatState {
  const next = engine.act(state, choice, createRng(seed));
  if (!next.ok) throw new Error(next.error);
  return next.value;
}

/** Edits the saved fighters directly, to set up a position mid-fight. */
function edit(state: CombatState, change: (f: Record<string, unknown>) => object): CombatState {
  const data = state.data as { fighters: Record<string, unknown>[] };
  return { ...state, data: { ...data, fighters: data.fighters.map((f) => change(f)) } };
}

/** Enemies dazed for the next few rounds, so only the player's tools change anything. */
const dazeEnemies = (state: CombatState): CombatState =>
  edit(state, (f) => (f.isPlayer ? f : { ...f, stunned: 5 }));

function combatant(state: CombatState, id: string) {
  const found = engine.view(state).combatants.find((c) => c.id === id);
  if (!found) throw new Error(`no ${id}`);
  return found;
}

const option = (state: CombatState, id: string) =>
  engine.view(state).options.find((o) => o.id === id);

describe('duel engine: fight tools', () => {
  it('offers each carried tool, saying why a wasted one is shut', () => {
    const state = duel(hero([tool('heal', 1), tool('blast'), tool('flash', 0)]), foe('bandit'));
    expect(option(state, 'item:heal')).toMatchObject({
      kind: 'item',
      label: 'heal tool',
      detail: '×1 · Restore health',
      disabledReason: 'You are unhurt.',
    });
    expect(option(state, 'item:blast')).toMatchObject({
      detail: '×2 · Seal blast · through armour',
      targeted: true,
    });
    expect(option(state, 'item:blast')?.disabledReason).toBeUndefined();
    expect(option(state, 'item:flash')).toBeUndefined();
  });

  it('a blast with no foe in sight is shut; a flash then is not', () => {
    const state = duel(hero([tool('blast'), tool('flash')]), foe('ghost', ['illusionist']));
    expect(option(state, 'item:blast')?.disabledReason).toBe(
      "You can't see them. Search or Dispel.",
    );
    expect(option(state, 'item:flash')?.disabledReason).toBeUndefined();
  });

  it('a salve and a pill restore, and are spent', () => {
    const hurt = hero([tool('heal'), tool('chakra', 1)], { health: 10, chakra: 0 });
    let state = dazeEnemies(duel(hurt, foe('bandit')));
    state = act(state, { optionId: 'item:heal' });
    expect(combatant(state, 'hero').health).toBe(40);
    expect(option(state, 'item:heal')?.detail).toBe('×1 · Restore health');
    state = act(state, { optionId: 'item:chakra' });
    // A pill, plus two rounds of regeneration.
    expect(combatant(state, 'hero').chakra).toBe(25 + 2 + 2);
    expect(option(state, 'item:chakra')).toBeUndefined();
  });

  it('smoke hides you from enemies until your next attack', () => {
    const strong = fighter('bandit', { attributes: { ...attributes, strength: 30, taijutsu: 30 } });
    let state = act(duel(hero([tool('smoke')]), strong), { optionId: 'item:smoke' });
    expect(combatant(state, 'hero').statuses).toContain('Hidden');
    expect(engine.view(state).log).toContain('bandit loses sight of you.');
    expect(combatant(state, 'hero').health).toBe(50);
    expect(option(state, 'item:smoke')?.disabledReason).toBe('You are already hidden.');
    state = act(state, { optionId: 'strike' }, 3);
    expect(combatant(state, 'hero').statuses).not.toContain('Hidden');
  });

  it('smoke sends enemies after your teammates instead', () => {
    const state = engine.start(
      {
        allies: [fighter('mate')],
        player: hero([tool('smoke')]),
        enemies: [foe('bandit')],
        canFlee: false,
      },
      createRng(1),
    );
    const next = act(state, { optionId: 'item:smoke' });
    expect(combatant(next, 'hero').health).toBe(50);
    expect(engine.view(next).log).not.toContain('bandit loses sight of you.');
  });

  it('using a tool clears confusion and never misfires', () => {
    const dazed = edit(duel(hero([tool('clarity', 5)]), foe('bandit')), (f) =>
      f.isPlayer ? { ...f, confused: 2 } : { ...f, stunned: 5 },
    );
    for (let seed = 1; seed <= 10; seed++) {
      const next = act(dazed, { optionId: 'item:clarity' }, seed);
      expect(engine.view(next).log).toContain('hero grips a charm. The fog lifts.');
      expect(combatant(next, 'hero').statuses).not.toContain('Confused');
    }
  });

  it('a flash lights up a hidden illusionist', () => {
    const state = duel(hero([tool('flash')]), foe('ghost', ['illusionist']));
    const next = act(state, { optionId: 'item:flash' });
    expect(combatant(next, 'ghost').targetable).toBe(true);
  });

  it('a blast is aimed, refused at a hidden or fallen foe, and ignores armour', () => {
    const state = duel(hero([tool('blast')]), foe('ghost', ['illusionist']), foe('bandit'));
    expect(engine.act(state, { optionId: 'item:blast', targetId: 'ghost' }, createRng(1))).toEqual({
      ok: false,
      error: "You can't see them. Search or Dispel.",
    });
    const downed = edit(state, (f) => (f.id === 'bandit' ? { ...f, health: 0 } : f));
    expect(
      engine.act(downed, { optionId: 'item:blast', targetId: 'bandit' }, createRng(1)).ok,
    ).toBe(false);
    const damage = (traits: CombatTrait[]): number => {
      const start = dazeEnemies(duel(hero([tool('blast')]), foe('foe', traits, 500)));
      return 500 - combatant(act(start, { optionId: 'item:blast', targetId: 'foe' }), 'foe').health;
    };
    expect(damage([])).toBeGreaterThan(0);
    expect(damage(['armoured'])).toBe(damage([]));
  });

  it('a blast can win the fight or send a coward running', () => {
    const won = act(duel(hero([tool('blast'), tool('smoke')]), foe('bandit', [], 3)), {
      optionId: 'item:blast',
      targetId: 'bandit',
    });
    expect(engine.outcome(won)).toMatchObject({
      result: 'victory',
      items: { blast: 1, smoke: 2 },
    });
    const coward = fighter('coward', { traits: ['coward'], health: 40, maxHealth: 100 });
    const fled = act(duel(hero([tool('blast')]), coward), { optionId: 'item:blast' });
    expect(engine.view(fled).log).toContain('coward flees!');
    expect(engine.outcome(fled)?.result).toBe('victory');
  });
});
