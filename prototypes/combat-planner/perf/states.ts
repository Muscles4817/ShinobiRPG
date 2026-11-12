import { createRng } from '@/core';
import { createPlanEngine } from '@/systems/combat/engines/plan/engine';
import { decode, type PlanState } from '@/systems/combat/engines/plan/state';
import { toSetup, type FighterSpec } from '@/test/bench/fighters';
import { castMember, type CastId } from '@/test/bench/matrixCast';

import { playExchange } from '../forward';
import { blade, burst, duel, fighter, flash, spark, veil } from '../scenarios';

/**
 * The fixed set of decision states every approach is judged on: the prototype's two scenarios
 * (at the start and a few exchanges into a default-plan fight) and states sampled from
 * default-plan fights between real bench builds (`matrixCast.ts`). Everything is seeded, so the
 * set is the same on every run.
 */

export interface DecisionState {
  readonly id: string;
  readonly state: PlanState;
  readonly selfId: string;
}

export const daze = () =>
  duel(fighter('me', [spark, flash, burst], { stats: { taijutsu: 8 } }), fighter('foe', []));
export const hide = () =>
  duel(
    fighter('me', [spark, veil, blade], { stats: { taijutsu: 8, genjutsu: 28 } }),
    fighter('foe', [spark], { stats: { stamina: 28 } }),
  );

/** A one-on-one between two bench specs, the first as the planner. */
export function benchDuel(me: FighterSpec, foe: FighterSpec): PlanState {
  const engine = createPlanEngine();
  const started = engine.start(
    { player: toSetup(me, 'player'), allies: [], enemies: [toSetup(foe, 'foe')], canFlee: false },
    createRng(1),
  );
  return { ...decode(started), phase: 'fight' };
}

/** The pairings sampled from: varied ways of fighting, the first of each pair planning. */
export const PAIRS: readonly (readonly [CastId, CastId])[] = [
  ['rusher', 'powerhouse'],
  ['versatile', 'illusionist'],
  ['stalker', 'mistBlade'],
  ['assassin', 'sensor'],
  ['sealer', 'trapper'],
  ['medic', 'counterer'],
  ['areaCaster', 'cloner'],
  ['gates', 'shrouded'],
  ['illusionist', 'rusher'],
  ['mistBlade', 'versatile'],
  ['trapper', 'stalker'],
  ['counterer', 'powerhouse'],
];

const SAMPLE_SEED = 424_242;

/** The state after `n` exchanges of both sides' default plans (null if the fight ended first). */
export function advance(start: PlanState, n: number, seed: number): PlanState | null {
  let s = start;
  for (let i = 0; i < n; i++) {
    if (s.result) return null;
    s = playExchange(s, seed * 1009 + i);
  }
  return s.result ? null : s;
}

/** The decision states: `at` gives the exchanges into each fight a state is taken. */
export function decisionStates(at: readonly number[] = [0, 2, 5]): DecisionState[] {
  const out: DecisionState[] = [];
  for (const [name, make] of [
    ['daze', daze],
    ['hide', hide],
  ] as const) {
    for (const n of at) {
      const s = advance(make(), n, SAMPLE_SEED);
      if (s) out.push({ id: `${name}@${n}`, state: s, selfId: 'me' });
    }
  }
  for (const [a, b] of PAIRS) {
    const start = benchDuel(castMember(a, 'chunin'), castMember(b, 'chunin'));
    for (const n of at) {
      const s = advance(start, n, SAMPLE_SEED);
      if (s) out.push({ id: `${a}-v-${b}@${n}`, state: s, selfId: 'player' });
    }
  }
  return out;
}
