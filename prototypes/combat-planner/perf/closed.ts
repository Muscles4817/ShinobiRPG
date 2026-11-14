import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

import type { PlanState } from '@/systems/combat/engines/plan/state';

import { forcedFor, playExchange } from '../forward';
import type { Approach } from './approaches';
import type { Planner } from './planners';
import { daze, hide } from './states';

/**
 * Closed-loop fights, as `fight.ts` plays them (re-plan before every exchange, play only the
 * first card, the exchange resolved on the fight's own seeds), with any perf approach in charge.
 */

const FIGHT_SEED = 1_000_003;
export const FIGHTS = 30;
export const CAP = 8;

interface Fought {
  readonly won: boolean;
  readonly dealt: number;
  readonly taken: number;
  readonly ms: number;
  readonly decisions: number;
  readonly opening: string;
}

const health = (s: PlanState, enemy: boolean) =>
  s.fighters
    .filter((f) => (f.side === 'enemy') === enemy)
    .reduce((t, f) => t + Math.max(0, f.health), 0);

export function fight(start: PlanState, selfId: string, seed: number, planner?: Planner): Fought {
  let state = start;
  let ms = 0;
  const chose: string[] = [];
  for (let n = 0; n < CAP && !state.result; n++) {
    let next = state;
    if (planner) {
      const d = planner(state, selfId);
      ms += d.ms;
      chose.push(d.first.replace('jutsu:', ''));
      next = forcedFor(state, selfId, d.first);
    }
    state = playExchange(next, FIGHT_SEED * seed + n);
    if (planner) state = forcedFor(state, selfId, null, start);
  }
  return {
    won: state.result === 'victory',
    dealt: health(start, true) - health(state, true),
    taken: health(start, false) - health(state, false),
    ms,
    decisions: chose.length,
    opening: chose.slice(0, 2).join(' > '),
  };
}

export interface ClosedRow {
  readonly approach: string;
  readonly scenario: string;
  readonly won: number;
  readonly fights: number;
  readonly dealt: number;
  readonly taken: number;
  readonly msPerDecision: number;
  readonly openings: string;
  readonly stats?: string;
}

export function closedLoop(approach: Approach | null): ClosedRow[] {
  const made = approach?.make();
  return [
    ['daze-finish', daze],
    ['hide-lethal', hide],
  ].map(([scenario, make]) => {
    const results = Array.from({ length: FIGHTS }, (_, i) =>
      fight((make as () => PlanState)(), 'me', i + 1, made?.planner),
    );
    const mean = (k: 'dealt' | 'taken') => results.reduce((t, r) => t + r[k], 0) / results.length;
    const decisions = results.reduce((t, r) => t + r.decisions, 0);
    const openings = new Map<string, number>();
    for (const r of results)
      if (r.opening) openings.set(r.opening, (openings.get(r.opening) ?? 0) + 1);
    return {
      approach: approach?.name ?? 'default plan',
      scenario: scenario as string,
      won: results.filter((r) => r.won).length,
      fights: results.length,
      dealt: mean('dealt'),
      taken: mean('taken'),
      msPerDecision: results.reduce((t, r) => t + r.ms, 0) / Math.max(1, decisions),
      openings: [...openings]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k, v]) => `${k} ×${v}`)
        .join(', '),
      ...(made?.stats ? { stats: made.stats() } : {}),
    };
  });
}

export function saveClosed(tag: string, rows: readonly ClosedRow[]): void {
  const out = new URL('./out/', import.meta.url);
  if (!existsSync(out)) mkdirSync(out);
  writeFileSync(
    new URL(`./out/closed-${tag}.json`, import.meta.url),
    JSON.stringify(rows, null, 1),
  );
}
