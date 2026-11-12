import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

import { createRng } from '@/core';
import { createPlanEngine } from '@/systems/combat/engines/plan/engine';
import { decode, type PlanState } from '@/systems/combat/engines/plan/state';
import { toSetup, type FighterSpec } from '@/test/bench/fighters';
import { castMember, type CastId } from '@/test/bench/matrixCast';

import type { FightOut } from './loop';

/** Fights for the timing study: bench builds in teams, everything seeded. */

export function teamFight(mine: readonly FighterSpec[], theirs: readonly FighterSpec[]): PlanState {
  const engine = createPlanEngine();
  const [lead, ...allies] = mine;
  const started = engine.start(
    {
      player: toSetup(lead!, 'player'),
      allies: allies.map((a, i) => toSetup(a, `ally-${i}`)),
      enemies: theirs.map((f, i) => toSetup(f, i === 0 ? 'foe' : `foe-${i}`)),
      canFlee: false,
    },
    createRng(1),
  );
  return { ...decode(started), phase: 'fight' };
}

export const cast = (id: CastId, scale: 'genin' | 'chunin' | 'jonin' = 'chunin') =>
  castMember(id, scale);

/** The same build with its intellect set (the rest untouched). */
export function withIntellect(spec: FighterSpec, intellect: number): FighterSpec {
  return { ...spec, stats: { ...spec.stats, intellect } };
}

/** Ids of every fighter on each side of a fight. */
export function idsOf(state: PlanState): { player: string[]; enemy: string[] } {
  const ids = (enemy: boolean) =>
    state.fighters.filter((f) => (f.side === 'enemy') === enemy && !f.shadowOf).map((f) => f.id);
  return { player: ids(false), enemy: ids(true) };
}

export const quantile = (xs: readonly number[], q: number) =>
  xs.length === 0
    ? 0
    : [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(q * xs.length))]!;
export const mean = (xs: readonly number[]) =>
  xs.length === 0 ? 0 : xs.reduce((t, x) => t + x, 0) / xs.length;

/** Wins, dealt and taken from the player's side. */
export function summary(outs: readonly FightOut[]) {
  return {
    fights: outs.length,
    won: outs.filter((o) => o.result === 'victory').length,
    lost: outs.filter((o) => o.result === 'defeat').length,
    dealt: mean(outs.map((o) => o.start.enemy - o.health.enemy)),
    taken: mean(outs.map((o) => o.start.player - o.health.player)),
    exchanges: mean(outs.map((o) => o.exchanges)),
  };
}

/** The set-up combos the study looks for, as (enabler, pay-off) card ids played back to back. */
export const COMBOS: readonly (readonly [string, string])[] = [
  ['flash', 'burst'],
  ['veil', 'blade'],
  ['paper-veil', 'pinched-flame'],
];

/** Combos played back to back (consecutive turns of the fighter), counted by name. */
export function combosIn(played: readonly string[]): Record<string, number> {
  const cards = played.map((p) => p.slice(p.indexOf(':') + 1));
  const out: Record<string, number> = {};
  for (let i = 1; i < cards.length; i++) {
    for (const [a, b] of COMBOS) {
      if (cards[i - 1] === a && cards[i] === b) out[`${a}>${b}`] = (out[`${a}>${b}`] ?? 0) + 1;
    }
  }
  return out;
}

export function addCounts(into: Record<string, number>, from: Readonly<Record<string, number>>) {
  for (const [k, v] of Object.entries(from)) into[k] = (into[k] ?? 0) + v;
}

export function save(name: string, data: unknown): void {
  const out = new URL('./out/', import.meta.url);
  if (!existsSync(out)) mkdirSync(out);
  writeFileSync(new URL(`./out/${name}.json`, import.meta.url), JSON.stringify(data, null, 1));
}
