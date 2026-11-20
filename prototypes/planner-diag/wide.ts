import { createRng } from '@/core';
import type { EnemyDef } from '@/content';
import { enemyParty } from '@/game/combatants';
import { createPlanEngine, type CombatantSetup, type CombatState } from '@/systems/combat';
import { decode } from '@/systems/combat/engines/plan/state';
import { ctx } from '@/test/gameFixtures';

import { ARCHETYPE_IDS, archetype } from '../../src/test/bench/archetypes';
import { toSetup, type Scale } from '../../src/test/bench/fighters';
import { castMember, type CastId } from '../../src/test/bench/matrixCast';
import { STALEMATE_EXCHANGES } from '../../src/test/bench/runner';

/**
 * Thinking foes beyond one against one at chūnin: any sides, any grade, bestiary foes. Every
 * fight is watched, so both sides fight by their own judgement; only the foes think ahead.
 */

export interface Outcome {
  readonly foeWon: boolean;
  /** The foes' health share left, less the player's side's. */
  readonly margin: number;
  readonly ms: number;
}

const share = (fs: readonly { health: number; maxHealth: number }[]) =>
  fs.reduce((s, f) => s + Math.max(0, f.health) / f.maxHealth, 0) / Math.max(1, fs.length);

export function fightSides(
  sides: { readonly side: readonly CombatantSetup[]; readonly foes: readonly CombatantSetup[] },
  { seed, planner }: { seed: number; planner: boolean },
): Outcome {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  const began = performance.now();
  const [player, ...allies] = sides.side;
  let state: CombatState = engine.start(
    {
      player: player!,
      allies,
      enemies: [...sides.foes],
      canFlee: false,
      watch: true,
      ...(planner ? {} : { instinct: true }),
    },
    rng,
  );
  for (let n = 0; n < STALEMATE_EXCHANGES && !engine.outcome(state); n++) {
    const next = engine.act(state, { optionId: 'next' }, rng);
    if (!next.ok) throw new Error(next.error);
    state = next.value;
  }
  const end = decode(state).fighters.filter(
    (f) => f.summoner === undefined && f.shadowOf === undefined,
  );
  return {
    foeWon: engine.outcome(state)?.result === 'defeat',
    margin:
      share(end.filter((f) => f.side === 'enemy')) - share(end.filter((f) => f.side !== 'enemy')),
    ms: performance.now() - began,
  };
}

export const castSide = (ids: readonly CastId[], scale: Scale, prefix: string) =>
  ids.map((id, i) =>
    toSetup(castMember(id, scale), i === 0 && prefix === 'p' ? 'player' : `${prefix}-${i}`),
  );

export function bestiarySides(def: EnemyDef, scale: Scale) {
  return ARCHETYPE_IDS.map((id) => ({
    side: [toSetup(archetype(id, scale), 'player')],
    foes: enemyParty(def, 0, ctx),
  }));
}

/** A fixed sample of teams of `size` from the cast, drawn by a seed (the same every run). */
export function teams(
  cast: readonly CastId[],
  size: number,
  count: number,
  seed: number,
): CastId[][] {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => Array.from({ length: size }, () => rng.pick(cast)));
}

export interface Tally {
  today: { won: number; margin: number; ms: number };
  thinking: { won: number; margin: number; ms: number };
  n: number;
}

export function compare(
  fights: readonly { side: readonly CombatantSetup[]; foes: readonly CombatantSetup[] }[],
  seeds: readonly number[],
): Tally {
  const t: Tally = {
    today: { won: 0, margin: 0, ms: 0 },
    thinking: { won: 0, margin: 0, ms: 0 },
    n: 0,
  };
  for (const f of fights) {
    for (const seed of seeds) {
      for (const [key, planner] of [
        ['today', false],
        ['thinking', true],
      ] as const) {
        const o = fightSides(f, { seed, planner });
        t[key].won += o.foeWon ? 1 : 0;
        t[key].margin += o.margin;
        t[key].ms += o.ms;
      }
      t.n += 1;
    }
  }
  return t;
}

export function row(label: string, t: Tally): string {
  const pct = (x: number) => `${((100 * x) / t.n).toFixed(1)}%`;
  const avg = (x: number) => (x / t.n).toFixed(3);
  const se = (100 * Math.sqrt(0.5 / t.n)).toFixed(1);
  return `| ${label} | ${t.n} | ${pct(t.today.won)} | ${pct(t.thinking.won)} | ±${se} | ${avg(t.today.margin)} | ${avg(t.thinking.margin)} | ${(t.today.ms / t.n).toFixed(0)} / ${(t.thinking.ms / t.n).toFixed(0)} ms |`;
}

export const HEADER = [
  '| Fights | n | Foe wins, today | Foe wins, thinking | ±1 SE of the difference | Margin, today | Margin, thinking | Time a fight |',
  '| --- | --- | --- | --- | --- | --- | --- | --- |',
];
