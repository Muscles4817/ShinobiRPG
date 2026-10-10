import { createRng } from '@/core';

import type {
  CombatantSetup,
  CombatChoice,
  CombatState,
  CombatTechnique,
  CombatTrait,
} from '../../contract';
import { DISPEL_CHAKRA } from '../../rules/conditions';
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

const blast: CombatTechnique = {
  id: 'blast',
  name: 'Blast',
  discipline: 'ninjutsu',
  effect: 'damage',
  chakraCost: 2,
  power: 8,
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

const engine = createDuelEngine();

function duel(player: CombatantSetup, enemy: CombatantSetup): CombatState {
  return engine.start({ allies: [], player, enemies: [enemy], canFlee: false }, createRng(1));
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

function combatant(state: CombatState, id: string) {
  const found = engine.view(state).combatants.find((c) => c.id === id);
  if (!found) throw new Error(`no ${id}`);
  return found;
}

function option(state: CombatState, id: string) {
  return engine.view(state).options.find((o) => o.id === id);
}

const archer = (traits: CombatTrait[] = ['archer']) => fighter('archer', { traits });

describe('duel engine: combat kits', () => {
  it('an archer starts out of reach of blows but not of jutsu', () => {
    const state = duel(fighter('hero', { techniques: [blast] }), archer());
    expect(combatant(state, 'archer').statuses).toContain('Far');
    expect(engine.act(state, { optionId: 'strike', targetId: 'archer' }, createRng(1))).toEqual({
      ok: false,
      error: 'Out of reach. Close in first.',
    });
    expect(engine.act(state, { optionId: 'tech:blast', targetId: 'archer' }, createRng(1)).ok).toBe(
      true,
    );
    expect(option(state, 'close-in')).toMatchObject({ kind: 'move', targeted: true });
  });

  it('an unaimed blow with nobody in reach closes in instead', () => {
    const next = act(duel(fighter('hero'), archer()), { optionId: 'strike' });
    expect(engine.view(next).log.some((l) => /hero (closes in|tries to close in)/.test(l))).toBe(
      true,
    );
    expect(combatant(next, 'archer').health).toBe(50);
  });

  it('an archer at range shoots, and closing in takes away its reach', () => {
    const quick = fighter('hero', { attributes: { ...attributes, speed: 60 } });
    let state = duel(quick, archer());
    for (let i = 0; i < 10 && combatant(state, 'archer').statuses.includes('Far'); i++) {
      state = act(state, { optionId: 'close-in', targetId: 'archer' }, i + 3);
    }
    expect(combatant(state, 'archer').statuses).not.toContain('Far');
    expect(option(state, 'strike')?.disabledReason).toBeUndefined();
  });

  it('an engaged archer backs off instead of attacking', () => {
    const engaged = edit(duel(fighter('hero'), archer()), (f) => ({ ...f, distant: false }));
    const next = act(engaged, { optionId: 'guard' });
    expect(combatant(next, 'hero').health).toBe(50);
    expect(engine.view(next).log.some((l) => /archer (darts back|tries to back off)/.test(l))).toBe(
      true,
    );
  });

  it('a brawler standing back closes in rather than attacking', () => {
    const brawler = fighter('brawler', { traits: ['brawler'] });
    const apart = edit(duel(fighter('hero'), brawler), (f) =>
      f.id === 'brawler' ? { ...f, distant: true } : f,
    );
    const next = act(apart, { optionId: 'guard' });
    expect(combatant(next, 'hero').health).toBe(50);
    expect(engine.view(next).log.some((l) => /brawler (closes in|tries to close in)/.test(l))).toBe(
      true,
    );
  });

  it('armour blunts blows but not jutsu', () => {
    const hero = fighter('hero', { attributes: { ...attributes, speed: 60 }, techniques: [blast] });
    const tough = (traits: CombatTrait[]) =>
      fighter('foe', { traits, health: 500, maxHealth: 500 });
    const damage = (traits: CombatTrait[], optionId: string) =>
      500 - combatant(act(duel(hero, tough(traits)), { optionId }, 9), 'foe').health;
    expect(damage(['armoured'], 'strike')).toBeLessThan(damage([], 'strike'));
    expect(damage(['armoured'], 'tech:blast')).toBe(damage([], 'tech:blast'));
  });

  it('a hidden illusionist cannot be targeted until Search finds it', () => {
    const seer = fighter('hero', { perks: ['insight'] });
    const state = duel(seer, fighter('ghost', { traits: ['illusionist'] }));
    expect(combatant(state, 'ghost')).toMatchObject({ targetable: false });
    expect(combatant(state, 'ghost').statuses).toContain('Hidden');
    expect(option(state, 'strike')?.disabledReason).toBe("You can't see them. Search or Dispel.");
    expect(engine.act(state, { optionId: 'strike', targetId: 'ghost' }, createRng(1)).ok).toBe(
      false,
    );
    const found = act(state, { optionId: 'search' });
    expect(combatant(found, 'ghost').targetable).toBe(true);
    expect(option(found, 'search')).toBeUndefined();
  });

  it('Dispel spends chakra', () => {
    const state = duel(fighter('hero'), fighter('ghost', { traits: ['illusionist'] }));
    const next = act(state, { optionId: 'dispel' });
    // 20 - dispel + 2 regen
    expect(combatant(next, 'hero').chakra).toBe(20 - DISPEL_CHAKRA + 2);
  });

  it('Dispel is refused without the chakra for it', () => {
    const drained = fighter('hero', { chakra: DISPEL_CHAKRA - 1 });
    const state = duel(drained, fighter('ghost', { traits: ['illusionist'] }));
    expect(option(state, 'dispel')?.disabledReason).toBe(`Needs ${DISPEL_CHAKRA} chakra.`);
  });

  it("an illusionist's hits can leave you confused", () => {
    const strong = { ...attributes, genjutsu: 30, strength: 20, taijutsu: 20, speed: 30 };
    const ghost = fighter('ghost', { traits: ['illusionist'], attributes: strong });
    let state = duel(fighter('hero', { health: 500, maxHealth: 500 }), ghost);
    for (let i = 0; i < 10 && !combatant(state, 'hero').statuses.includes('Confused'); i++) {
      state = act(state, { optionId: 'guard' }, i + 5);
    }
    expect(combatant(state, 'hero').statuses).toContain('Confused');
    expect(option(state, 'dispel')).toBeDefined();
  });

  it('a coward flees once badly hurt and counts as beaten', () => {
    const coward = fighter('coward', { traits: ['coward'], health: 36, maxHealth: 100 });
    let state = duel(fighter('hero'), coward);
    for (let i = 0; i < 20 && !engine.outcome(state); i++) {
      state = act(state, { optionId: 'strike' }, i + 1);
    }
    expect(engine.outcome(state)?.result).toBe('victory');
    expect(engine.view(state).log).toContain('coward flees!');
  });

  it('reads a fight saved before combat kits existed', () => {
    const kitFields = ['traits', 'perks', 'hidden', 'confused', 'distant'];
    const old = edit(duel(fighter('hero'), fighter('bandit')), (f) =>
      Object.fromEntries(Object.entries(f).filter(([key]) => !kitFields.includes(key))),
    );
    expect(engine.view(old).combatants.map((c) => c.targetable)).toEqual([true, true]);
    expect(engine.act(old, { optionId: 'strike' }, createRng(2)).ok).toBe(true);
  });
});
