import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { empowerSelf } from './empower';
import { createPlanEngine } from './engine';
import { decode, encode, initialFighters, type Round } from './state';
import { newKiller } from './survival';

/**
 * The Gates against judgement (`docs/design/defence-plan.md` Part 5): with the seventh gate open,
 * Guy cuts down an equal jōnin who trades with him, while one who reads the fight plays for
 * time (a swap kept ready, a Brace that holds) and sees the gate burn him out.
 */

const SEEDS = 20;
/**
 * One who plays for time outlasts the gate at least this often. It was half, until hand signs
 * could be broken up close: the bolts thrown between Braces now mostly come apart in a gated
 * foe's face (5 in 20 outlast it, and no trader does).
 */
const STALLER_SURVIVES = 0.25;
/** One who trades outlasts it at most this often. */
const TRADER_SURVIVES = 0.2;

const attributes = {
  strength: 30,
  speed: 30,
  stamina: 30,
  chakraControl: 30,
  intellect: 30,
  perception: 30,
  willpower: 30,
  taijutsu: 30,
  ninjutsu: 30,
  genjutsu: 15,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const gate = (id: string, step: number): CombatTechnique => ({
  id,
  name: id,
  discipline: 'taijutsu',
  effects: [
    { verb: 'empower', power: 10, boosts: ['strength', 'speed'], opens: { ladder: 'gates', step } },
  ],
  chakraCost: 8,
});
const GATES = [gate('life', 3), gate('view', 6), gate('wonder', 7)];
const kick: CombatTechnique = {
  id: 'kick',
  name: 'Leaf Hurricane',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 18 }],
  chakraCost: 0,
};
const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Fire Bolt',
  discipline: 'ninjutsu',
  reach: ['close', 'mid', 'far'],
  effects: [{ verb: 'damage', power: 16 }],
  chakraCost: 12,
};
const swap: CombatTechnique = {
  id: 'swap',
  name: 'Substitution',
  discipline: 'ninjutsu',
  effects: [{ verb: 'substitute', power: 12 }],
  chakraCost: 6,
};

function fighter(id: string, intellect: number, techniques: CombatTechnique[]): CombatantSetup {
  return {
    id,
    name: id,
    attributes: { ...attributes, intellect },
    health: 100,
    maxHealth: 100,
    chakra: 120,
    maxChakra: 120,
    techniques,
  };
}

/** Whether the jōnin is still standing when the fight ends. */
function outlasts(intellect: number, seed: number, thinking = false): boolean {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  const start = engine.start(
    {
      player: fighter('jonin', intellect, [bolt, swap]),
      allies: [],
      enemies: [fighter('guy', 15, [...GATES, kick])],
      canFlee: false,
      // Today's minds, unless the fight thinks as the game's do.
      ...(thinking ? {} : { instinct: true as const }),
      watch: true,
    },
    rng,
  );
  const plan = decode(start);
  const table: Round = {
    number: plan.round,
    fighters: [...plan.fighters],
    range: 'close',
    lines: [],
    seen: {},
    intents: {},
  };
  const opened = GATES.reduce((at, t) => {
    const guy = at.fighters.find((f) => f.id === 'guy')!;
    return empowerSelf(at, guy, { technique: t, effect: t.effects[0] as never });
  }, table);
  let state = encode({ ...plan, range: 'close', fighters: opened.fighters });
  for (let i = 0; i < 40 && !engine.outcome(state); i++) {
    const next = engine.act(state, { optionId: 'next' }, rng);
    if (!next.ok) throw new Error(next.error);
    state = next.value;
  }
  return engine.outcome(state)?.result === 'victory';
}

function survivalRate(intellect: number, { seeds = SEEDS, thinking = false } = {}): number {
  let kept = 0;
  for (let seed = 1; seed <= seeds; seed++) {
    if (outlasts(intellect, seed * 7919, thinking)) kept += 1;
  }
  return kept / seeds;
}

/** Thinking costs more a fight: fewer seeds, more time. */
const THINKING_SEEDS = 8;
const THINKING_TIMEOUT = 120_000;

describe('the seventh gate against judgement', () => {
  it('cuts down a jōnin who trades; one who reads the fight outlasts it', () => {
    expect(survivalRate(3)).toBeLessThanOrEqual(TRADER_SURVIVES);
    expect(survivalRate(30)).toBeGreaterThanOrEqual(STALLER_SURVIVES);
  });

  // Thinking every exchange, a sharp mind plays for time all through the gate (it once fell back
  // on instinct after its first planned move), even with the gate opened after it settled on a
  // move: a killer since then lets it think again (`newKiller` in `survival.ts`).
  // Thinking is run locally (`npm run test:thinking`), never in the pipeline.
  it.runIf(import.meta.env.VITE_BENCH_THINKING === 'true')(
    'a thinking jōnin who reads the fight outlasts it too',
    () => {
      const thinking = { seeds: THINKING_SEEDS, thinking: true };
      expect(survivalRate(30, thinking)).toBeGreaterThanOrEqual(STALLER_SURVIVES);
    },
    THINKING_TIMEOUT,
  );
});

describe('a killer since a fighter settled on its move', () => {
  /** Guy with the seventh gate open, and a jōnin of the given wits facing him up close. */
  function facing(intellect: number, faced: readonly string[]) {
    const fighters = initialFighters({
      player: fighter('jonin', intellect, [bolt, swap]),
      allies: [],
      enemies: [fighter('guy', 15, [...GATES, kick])],
      canFlee: false,
      watch: true,
    });
    const table: Round = { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
    const opened = GATES.reduce((at, t) => {
      const guy = at.fighters.find((f) => f.id === 'guy')!;
      return empowerSelf(at, guy, { technique: t, effect: t.effects[0] as never });
    }, table);
    const jonin = opened.fighters.find((f) => f.id === 'jonin')!;
    return { round: opened, self: { ...jonin, facedKillers: faced } };
  }

  it('lets a mind that reads the fight think again, once', () => {
    const before = facing(30, []);
    expect(newKiller(before.self, before.round)).toBe(true);
    const seen = facing(30, ['guy']);
    expect(newKiller(seen.self, seen.round)).toBe(false);
  });

  it('leaves a dull mind to what it settled on', () => {
    const dull = facing(3, []);
    expect(newKiller(dull.self, dull.round)).toBe(false);
  });
});
