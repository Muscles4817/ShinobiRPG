import { createRng } from '@/core';

import type { CombatantSetup, CombatEngine, CombatState, CombatTechnique } from '../../contract';
import { honestyChance, planFor } from './ai';
import { createMindEngine } from './engine';
import { clash } from './exchange';
import { decode, initialFighters, type Move } from './state';

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

const move = (kind: Move['kind']): Move => ({ kind });
const jutsu: Move = { kind: 'jutsu', technique: fireball };

/** Plays the first usable option from `preferences` every round until the fight ends. */
function fightUntilOver(engine: CombatEngine, state: CombatState, preferences: string | string[]) {
  const wanted = typeof preferences === 'string' ? [preferences] : preferences;
  let current = state;
  for (let i = 0; i < 80 && !engine.outcome(current); i++) {
    const usable = engine.view(current).options.filter((o) => !o.disabledReason);
    const optionId = wanted.find((id) => usable.some((o) => o.id === id)) ?? usable[0]!.id;
    const next = engine.act(current, { optionId }, createRng(i + 7));
    if (!next.ok) throw new Error(next.error);
    current = next.value;
  }
  return current;
}

describe('mind game exchanges', () => {
  it('guards stop strikes; counters punish them up close', () => {
    expect(clash(move('strike'), move('guard'), 'close')).toEqual({ kind: 'blocked' });
    expect(clash(move('strike'), move('counter'), 'close')).toEqual({ kind: 'countered' });
    expect(clash(move('counter'), move('strike'), 'close')).toMatchObject({
      kind: 'hit',
      scale: 1.5,
    });
  });

  it('feints break guards and bait counters, but lose to strikes', () => {
    expect(clash(move('feint'), move('guard'), 'close').kind).toBe('opens');
    expect(clash(move('feint'), move('counter'), 'close').kind).toBe('opens');
    expect(clash(move('feint'), move('strike'), 'close').kind).toBe('none');
    expect(clash(move('strike'), move('feint'), 'close').kind).toBe('hit');
  });

  it('strikes cut off jutsu; guards halve them; counters only stop them up close', () => {
    expect(clash(move('strike'), jutsu, 'close')).toMatchObject({ kind: 'hit', interrupts: true });
    expect(clash(jutsu, move('strike'), 'mid')).toMatchObject({ kind: 'hit', scale: 1 });
    expect(clash(jutsu, move('guard'), 'mid')).toMatchObject({ kind: 'hit', scale: 0.5 });
    expect(clash(jutsu, move('counter'), 'mid').kind).toBe('hit');
  });

  it('moves out of reach whiff', () => {
    expect(clash(move('strike'), move('idle'), 'mid').kind).toBe('whiff');
    expect(clash(move('throw'), move('idle'), 'far').kind).toBe('hit');
  });
});

describe('mind game engine', () => {
  const engine = createMindEngine();

  it('starts at mid range with a tell for every enemy', () => {
    const state = engine.start(
      { player: fighter('hero'), allies: [], enemies: [fighter('bandit')], canFlee: true },
      createRng(1),
    );
    const view = engine.view(state);
    expect(view.range).toBe('mid');
    expect(view.combatants.find((c) => c.id === 'bandit')?.intent).toBeTruthy();
    expect(view.options.find((o) => o.id === 'strike')?.disabledReason).toBe(
      'Out of reach at mid range',
    );
  });

  it('stepping in closes the distance', () => {
    const state = engine.start(
      { player: fighter('hero'), allies: [], enemies: [fighter('bandit')], canFlee: true },
      createRng(2),
    );
    let current = state;
    for (let i = 0; i < 6 && engine.view(current).range !== 'close'; i++) {
      const next = engine.act(current, { optionId: 'step-in' }, createRng(i));
      if (!next.ok) throw new Error(next.error);
      current = next.value;
    }
    expect(engine.view(current).range).toBe('close');
  });

  it('a much stronger fighter wins, and the loser is down', () => {
    const strong = fighter('hero', { attributes: { ...attributes, strength: 40 } });
    const state = engine.start(
      { player: strong, allies: [], enemies: [fighter('bandit')], canFlee: false },
      createRng(3),
    );
    const end = fightUntilOver(engine, state, ['strike', 'throw']);
    expect(engine.outcome(end)?.result).toBe('victory');
    expect(engine.view(end).combatants.find((c) => c.id === 'bandit')?.statuses).toEqual(['Down']);
  });

  it('insight always reads true; perception reads truer', () => {
    const fighters = initialFighters({
      player: fighter('hero', { perks: ['insight'] }),
      allies: [],
      enemies: [fighter('bandit')],
      canFlee: true,
    });
    const [reader, enemy] = fighters;
    for (let seed = 0; seed < 20; seed++) {
      const plan = planFor(enemy!, reader!, 'close', createRng(seed));
      expect(plan).toMatchObject({ honest: true, certain: true });
    }
    const sharp = { ...reader!, attributes: { ...attributes, perception: 12 } };
    expect(honestyChance(sharp, enemy!)).toBeGreaterThan(honestyChance(reader!, enemy!));
  });

  it('allies fight beside you', () => {
    const ally = fighter('ally', { attributes: { ...attributes, strength: 40 } });
    const state = engine.start(
      { player: fighter('hero'), allies: [ally], enemies: [fighter('bandit')], canFlee: false },
      createRng(4),
    );
    const end = fightUntilOver(engine, state, 'guard');
    expect(engine.outcome(end)?.result).toBe('victory');
  });

  it('spends chakra on jutsu and rejects them out of reach', () => {
    const caster = fighter('hero', { techniques: [fireball] });
    const state = engine.start(
      { player: caster, allies: [], enemies: [fighter('bandit')], canFlee: false },
      createRng(5),
    );
    const next = engine.act(state, { optionId: 'tech:fireball' }, createRng(6));
    if (!next.ok) throw new Error(next.error);
    expect(decode(next.value).fighters[0]!.chakra).toBeLessThan(30 + 2);
    expect(engine.act(state, { optionId: 'counter' }, createRng(1)).ok).toBe(false);
  });

  it('rejects state from another engine', () => {
    expect(() => engine.view({ engineId: 'other', data: {} })).toThrow();
  });
});
