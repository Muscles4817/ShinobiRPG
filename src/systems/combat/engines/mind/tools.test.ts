import { createRng } from '@/core';

import type {
  CombatantSetup,
  CombatItem,
  CombatItemEffect,
  CombatSetup,
  CombatState,
} from '../../contract';
import { createMindEngine } from './engine';
import { UNSEEN } from './moves';
import { decode, encode, type MindState } from './state';

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
    health: 50,
    maxHealth: 50,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

const tool = (effect: CombatItemEffect, count = 2): CombatItem => ({
  id: `${effect}-tool`,
  name: `${effect} tool`,
  effect,
  count,
});

const engine = createMindEngine();

function start(items: CombatItem[], enemies = [fighter('bandit')], player = {}): CombatState {
  const setup: CombatSetup = {
    player: fighter('hero', { items, ...player }),
    allies: [],
    enemies,
    canFlee: true,
  };
  return engine.start(setup, createRng(1));
}

function act(state: CombatState, optionId: string, seed = 3, targetId?: string): CombatState {
  const next = engine.act(state, { optionId, ...(targetId ? { targetId } : {}) }, createRng(seed));
  if (!next.ok) throw new Error(next.error);
  return next.value;
}

const hero = (state: CombatState) => decode(state).fighters[0]!;
const foe = (state: CombatState, id: string) => decode(state).fighters.find((f) => f.id === id)!;
const optionFor = (state: CombatState, id: string) =>
  engine.view(state).options.find((o) => o.id === `item:${id}`);

/** Every enemy commits to a strike this exchange (at close range, so it reaches). */
function allStrike(state: CombatState): CombatState {
  const mind = decode(state);
  const plans = Object.fromEntries(
    Object.entries(mind.plans).map(([id, plan]) => [id, { ...plan, move: { kind: 'strike' } }]),
  );
  return encode({ ...mind, range: 'close', plans } as MindState);
}

describe('mind game tools', () => {
  it('offers each carried tool, saying what it does and why not', () => {
    const state = start([tool('heal', 2), tool('flash', 1), tool('smoke', 0)]);
    expect(optionFor(state, 'heal-tool')).toMatchObject({
      kind: 'item',
      label: 'heal tool',
      detail: '×2 · Restore health',
      disabledReason: 'You are unhurt.',
    });
    expect(optionFor(state, 'flash-tool')?.disabledReason).toBe('No one is hiding.');
    expect(optionFor(state, 'smoke-tool')).toBeUndefined();
    expect(engine.view(state).options.at(-1)?.id).toBe('flee');
  });

  it('a salve or pill restores and is spent', () => {
    const state = start([tool('heal'), tool('chakra')], [fighter('bandit')], {
      health: 10,
      chakra: 0,
    });
    const healed = act(state, 'item:heal-tool');
    expect(hero(healed).health).toBeGreaterThan(10);
    expect(hero(healed).items.find((i) => i.id === 'heal-tool')?.count).toBe(1);
    const filled = act(healed, 'item:chakra-tool');
    expect(hero(filled).chakra).toBeGreaterThan(hero(healed).chakra + 2);
    expect(optionFor(filled, 'chakra-tool')?.detail).toBe('×1 · Restore chakra');
  });

  it('smoke hides you from their attacks until you attack', () => {
    const smoked = act(allStrike(start([tool('smoke')])), 'item:smoke-tool');
    expect(hero(smoked).health).toBe(50);
    expect(hero(smoked).hidden).toBe(true);
    expect(decode(smoked).log).toContain('bandit loses sight of you.');
    expect(engine.view(smoked).combatants[0]?.statuses).toContain('Hidden');
    expect(optionFor(smoked, 'smoke-tool')?.disabledReason).toBe('You are already hidden.');
    const struck = act(allStrike(smoked), 'strike', 4, 'bandit');
    expect(hero(struck).hidden).toBe(false);
  });

  it('a hidden player guarding stays hidden', () => {
    const smoked = act(start([tool('smoke')]), 'item:smoke-tool');
    expect(hero(act(smoked, 'guard')).hidden).toBe(true);
  });

  it('while you hide, they go after a teammate instead', () => {
    const setup: CombatSetup = {
      player: fighter('hero', { items: [tool('smoke')] }),
      allies: [fighter('mate')],
      enemies: [fighter('bandit')],
      canFlee: true,
    };
    const smoked = act(allStrike(engine.start(setup, createRng(1))), 'item:smoke-tool');
    expect(hero(smoked).health).toBe(50);
    expect(decode(smoked).log.some((l) => l.includes('bandit strikes mate'))).toBe(true);
  });

  it('a flash reveals a hidden illusionist', () => {
    const state = start([tool('flash')], [fighter('shade', { traits: ['illusionist'] })]);
    expect(optionFor(state, 'flash-tool')?.disabledReason).toBeUndefined();
    expect(foe(act(state, 'item:flash-tool'), 'shade').hidden).toBe(false);
  });

  it('a blast is aimed, refuses a hidden target and ignores armour', () => {
    const shade = fighter('shade', { traits: ['illusionist'] });
    const hidden = start([tool('blast')], [shade]);
    expect(optionFor(hidden, 'blast-tool')).toMatchObject({
      targeted: true,
      disabledReason: UNSEEN,
    });
    const mixed = start([tool('blast')], [fighter('bandit'), shade]);
    const refused = engine.act(
      mixed,
      { optionId: 'item:blast-tool', targetId: 'shade' },
      createRng(1),
    );
    expect(refused).toEqual({ ok: false, error: UNSEEN });

    const blasted = (target: CombatantSetup) => {
      const state = decode(start([tool('blast')], [target]));
      const guarding = Object.fromEntries(
        Object.entries(state.plans).map(([id, p]) => [id, { ...p, move: { kind: 'guard' } }]),
      );
      const next = act(
        encode({ ...state, plans: guarding } as MindState),
        'item:blast-tool',
        5,
        target.id,
      );
      return 50 - foe(next, target.id).health;
    };
    expect(blasted(fighter('plain'))).toBeGreaterThan(0);
    expect(blasted(fighter('plain', { traits: ['armoured'] }))).toBe(blasted(fighter('plain')));
  });

  it('a blast that downs a foe wins the fight, and the outcome reports tools left', () => {
    const state = start([tool('blast', 3), tool('heal', 1)], [fighter('bandit', { health: 1 })]);
    const won = act(state, 'item:blast-tool', 3, 'bandit');
    expect(engine.outcome(won)).toMatchObject({
      result: 'victory',
      items: { 'blast-tool': 2, 'heal-tool': 1 },
    });
  });
});
