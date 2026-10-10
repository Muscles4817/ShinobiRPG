import { createRng } from '@/core';

import type { CombatantSetup, CombatSetup, CombatState, CombatTechnique } from '../../contract';
import { DISPEL_CHAKRA } from '../../rules/conditions';
import { chooseMove } from './ai';
import { allyMoves } from './allies';
import { createMindEngine } from './engine';
import { UNSEEN } from './moves';
import { MISFIRE_LINE, rehide, sense } from './senses';
import { applyLanding } from './strike';
import { decode, encode, initialFighters, type MindFighter, type Move } from './state';

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

const fireball: CombatTechnique = {
  id: 'fireball',
  name: 'Fireball',
  discipline: 'ninjutsu',
  element: 'fire',
  effect: 'damage',
  chakraCost: 6,
  power: 14,
};

function setup(enemies: CombatantSetup[], player = fighter('hero')): CombatSetup {
  return { player, allies: [], enemies, canFlee: true };
}

function bodies(enemy: CombatantSetup, player = fighter('hero')): [MindFighter, MindFighter] {
  const [hero, foe] = initialFighters(setup([enemy], player));
  return [hero!, foe!];
}

const engine = createMindEngine();

function act(state: CombatState, optionId: string, seed: number, targetId?: string) {
  return engine.act(state, { optionId, ...(targetId ? { targetId } : {}) }, createRng(seed));
}

describe('mind game kits: reach', () => {
  it('an archer up close never attacks; it backs off', () => {
    const [, archer] = bodies(fighter('archer', { traits: ['archer'], techniques: [fireball] }));
    for (let seed = 0; seed < 30; seed++) {
      expect(chooseMove(archer, 'close', createRng(seed)).kind).toBe('step-back');
    }
  });

  it('an archer at range never steps into close quarters', () => {
    const [, archer] = bodies(fighter('archer', { traits: ['archer'] }));
    for (let seed = 0; seed < 30; seed++) {
      expect(chooseMove(archer, 'mid', createRng(seed)).kind).not.toBe('step-in');
    }
  });

  it('a brawler away from you always closes in', () => {
    const [, brawler] = bodies(fighter('brawler', { traits: ['brawler'] }));
    for (let seed = 0; seed < 30; seed++) {
      expect(chooseMove(brawler, 'mid', createRng(seed)).kind).toBe('step-in');
      expect(chooseMove(brawler, 'far', createRng(seed)).kind).toBe('step-in');
    }
  });

  it('allies follow their kit too', () => {
    const fighters = initialFighters({
      ...setup([fighter('bandit')]),
      allies: [fighter('bow', { traits: ['archer'] }), fighter('fist', { traits: ['brawler'] })],
    });
    expect(allyMoves(fighters, 'close', createRng(1)).bow?.kind).toBe('step-back');
    expect(allyMoves(fighters, 'mid', createRng(1)).fist?.kind).toBe('step-in');
  });
});

describe('mind game kits: damage', () => {
  function damageTo(defender: CombatantSetup, move: Move): number {
    const [hero, foe] = bodies(defender);
    const landing = { kind: 'hit', scale: 1, interrupts: false } as const;
    const hit = applyLanding(
      [hero, foe],
      { moverId: hero.id, targetId: foe.id, move, landing },
      createRng(4),
    );
    return foe.health - hit.fighters[1]!.health;
  }

  it('armour turns blows but not jutsu', () => {
    const strike: Move = { kind: 'strike' };
    const jutsu: Move = { kind: 'jutsu', technique: fireball };
    const armoured = fighter('guard', { traits: ['armoured'] });
    expect(damageTo(armoured, strike)).toBeLessThan(damageTo(fighter('plain'), strike));
    expect(damageTo(armoured, jutsu)).toBe(damageTo(fighter('plain'), jutsu));
  });

  it('a coward flees once badly hurt, and counts as beaten', () => {
    const [hero, coward] = bodies(fighter('runner', { traits: ['coward'], health: 18 }));
    const landing = { kind: 'hit', scale: 1, interrupts: false } as const;
    const hit = applyLanding(
      [hero, coward],
      { moverId: hero.id, targetId: coward.id, move: { kind: 'strike' }, landing },
      createRng(2),
    );
    expect(hit.fighters[1]!.health).toBe(0);
    expect(hit.lines).toContain('runner flees!');
  });
});

describe('mind game kits: illusions', () => {
  const illusionist = fighter('shade', { traits: ['illusionist'] });

  it('a hidden foe shows no tell and cannot be targeted', () => {
    const state = engine.start(setup([illusionist]), createRng(1));
    const view = engine.view(state);
    const shade = view.combatants.find((c) => c.id === 'shade');
    expect(shade).toMatchObject({ targetable: false, intent: '???' });
    expect(shade?.statuses).toContain('Hidden');
    expect(view.options.find((o) => o.id === 'throw')?.disabledReason).toBe(UNSEEN);
    expect(view.options.map((o) => o.id)).toEqual(expect.arrayContaining(['search', 'dispel']));
    expect(act(state, 'throw', 1, 'shade').ok).toBe(false);
  });

  it('refuses a hidden target even when another foe is in sight', () => {
    const state = engine.start(setup([fighter('bandit'), illusionist]), createRng(1));
    expect(act(state, 'throw', 1, 'shade')).toEqual({ ok: false, error: UNSEEN });
    expect(act(state, 'throw', 1, 'bandit').ok).toBe(true);
  });

  it('insight reads a hidden foe and always finds it with Search', () => {
    const seer = fighter('hero', { perks: ['insight'] });
    const state = engine.start(setup([illusionist], seer), createRng(2));
    expect(engine.view(state).combatants.find((c) => c.id === 'shade')?.intent).not.toBe('???');
    const searched = act(state, 'search', 3);
    if (!searched.ok) throw new Error(searched.error);
    expect(decode(searched.value).fighters.find((f) => f.id === 'shade')?.hidden).toBe(false);
    expect(engine.view(searched.value).options.some((o) => o.id === 'search')).toBe(false);
  });

  it('Dispel spends chakra and is refused when chakra is short', () => {
    const state = engine.start(setup([illusionist]), createRng(4));
    const dispelled = act(state, 'dispel', 5);
    if (!dispelled.ok) throw new Error(dispelled.error);
    const hero = decode(dispelled.value).fighters[0]!;
    expect(hero.chakra).toBe(30 - DISPEL_CHAKRA + 2);
    const drained = engine.start(
      setup([illusionist], fighter('hero', { chakra: 2 })),
      createRng(4),
    );
    expect(
      engine.view(drained).options.find((o) => o.id === 'dispel')?.disabledReason,
    ).toBeTruthy();
    expect(act(drained, 'dispel', 5).ok).toBe(false);
  });

  it('a confused player sometimes misfires an attack, never a guard', () => {
    const [hero, foe] = bodies(
      fighter('bandit'),
      fighter('hero', { attributes: { ...attributes, willpower: 0 } }),
    );
    const dazed = [{ ...hero, confused: 2 }, foe];
    const lines = (move: Move) =>
      Array.from({ length: 30 }, (_, seed) => sense(dazed, move, createRng(seed)).lines).flat();
    expect(lines({ kind: 'strike' })).toContain(MISFIRE_LINE);
    expect(lines({ kind: 'guard' })).not.toContain(MISFIRE_LINE);
  });

  it('a found illusionist slips back into hiding', () => {
    const [hero, shade] = bodies(illusionist);
    const found = [hero, { ...shade, hidden: false }];
    expect(rehide(found, 2).fighters[1]!.hidden).toBe(false);
    const again = rehide(found, 3);
    expect(again.fighters[1]!.hidden).toBe(true);
    expect(again.lines).toEqual(['shade melts back into the illusion.']);
  });
});

describe('mind game kits: old saves', () => {
  it('a fight saved before kits still views and plays', () => {
    const fresh = decode(engine.start(setup([fighter('bandit')]), createRng(6)));
    // Deliberately the pre-kit shape, which the current types no longer describe.
    const old = encode({
      ...fresh,
      fighters: fresh.fighters.map(({ traits: _t, hidden: _h, confused: _c, ...rest }) => rest),
    } as unknown as typeof fresh);
    expect(engine.view(old).combatants.every((c) => c.targetable)).toBe(true);
    const next = act(old, 'guard', 7);
    if (!next.ok) throw new Error(next.error);
    expect(decode(next.value).fighters.every((f) => Array.isArray(f.traits))).toBe(true);
  });
});
