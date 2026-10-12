import { createRng, type Rng } from '@/core';
import {
  createPlanEngine,
  type CombatEngine,
  type CombatResult,
  type CombatState,
} from '@/systems/combat';

import { toSetup, type FighterSpec } from './fighters';

/**
 * Runs bench fights headless through the Plan & Watch engine, only via the `CombatEngine`
 * contract: start, then act until there is an outcome. The fighter plays their plan as it
 * stands (their remembered loadout, or the engine's default), begins every round as soon as
 * the card table comes up, and watches each exchange in turn so they can be counted.
 */

/**
 * A fight still going after this many exchanges (25 rounds) is called a stalemate: two
 * fighters who can't reach each other, or can't hurt each other. Worth knowing, not a crash.
 */
export const STALEMATE_EXCHANGES = 100;
export const DEFAULT_SEEDS = 40;

export interface FightRecord {
  readonly result: CombatResult | 'stalemate';
  /** Exchanges watched until the fight ended. */
  readonly exchanges: number;
  /** The player's health left, as a fraction of their maximum. */
  readonly healthLeft: number;
}

export interface BenchReport {
  readonly fights: number;
  readonly winRate: number;
  /** Fights nobody had won after `STALEMATE_EXCHANGES`. */
  readonly stalemateRate: number;
  /** Stalemates count as `STALEMATE_EXCHANGES`. */
  readonly avgExchanges: number;
  /** The player's average health left, as a fraction of their maximum. */
  readonly avgHealthLeft: number;
  /** Every fight, for finer questions (see `endedWithin`, `wonWithin`). */
  readonly records: readonly FightRecord[];
}

function step(engine: CombatEngine, state: CombatState, optionId: string, rng: Rng) {
  const next = engine.act(state, { optionId }, rng);
  if (!next.ok) throw new Error(`Bench option ${optionId} refused: ${next.error}`);
  return next.value;
}

/** A fight between groups: the player and their allies against one or more foes. */
export interface Skirmish {
  readonly player: FighterSpec;
  readonly allies: readonly FighterSpec[];
  readonly foes: readonly FighterSpec[];
}

/** One seeded fight of `player` against `opponent`. */
export function fightOnce(player: FighterSpec, opponent: FighterSpec, seed: number): FightRecord {
  return skirmishOnce({ player, allies: [], foes: [opponent] }, seed);
}

/** One seeded fight between groups. */
export function skirmishOnce({ player, allies, foes }: Skirmish, seed: number): FightRecord {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  let state = engine.start(
    {
      player: toSetup(player, 'player'),
      allies: allies.map((a, i) => toSetup(a, `ally-${i}`)),
      enemies: foes.map((f, i) => toSetup(f, i === 0 ? 'foe' : `foe-${i}`)),
      canFlee: false,
      ...(player.plan ? { plan: player.plan } : {}),
    },
    rng,
  );
  let exchanges = 0;
  while (!engine.outcome(state)) {
    if (exchanges >= STALEMATE_EXCHANGES) return stalemate(player, state, engine);
    const atTable = engine.view(state).options.some((o) => o.id === 'begin');
    if (atTable) state = step(engine, state, 'begin', rng);
    else {
      state = step(engine, state, 'next', rng);
      exchanges += 1;
    }
  }
  const outcome = engine.outcome(state)!;
  return { result: outcome.result, exchanges, healthLeft: healthFraction(player, outcome.player) };
}

function healthFraction(player: FighterSpec, now: { readonly health: number }): number {
  return now.health / toSetup(player, 'player').maxHealth;
}

function stalemate(player: FighterSpec, state: CombatState, engine: CombatEngine): FightRecord {
  const self = engine.view(state).combatants.find((c) => c.id === 'player');
  const health = self?.health ?? 0;
  return {
    result: 'stalemate',
    exchanges: STALEMATE_EXCHANGES,
    healthLeft: healthFraction(player, { health }),
  };
}

function mean(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** `seeds` fights of `player` against `opponent`, summarised. */
export function bench(player: FighterSpec, opponent: FighterSpec, seeds = DEFAULT_SEEDS) {
  return benchSkirmish({ player, allies: [], foes: [opponent] }, seeds);
}

/** `seeds` fights between groups, summarised. */
export function benchSkirmish(skirmish: Skirmish, seeds = DEFAULT_SEEDS): BenchReport {
  const records = Array.from({ length: seeds }, (_, i) => skirmishOnce(skirmish, i + 1));
  const report: BenchReport = {
    fights: records.length,
    winRate: records.filter((r) => r.result === 'victory').length / records.length,
    stalemateRate: records.filter((r) => r.result === 'stalemate').length / records.length,
    avgExchanges: mean(records.map((r) => r.exchanges)),
    avgHealthLeft: mean(records.map((r) => r.healthLeft)),
    records,
  };
  return report;
}

/** Fraction of fights that ended within `exchanges` exchanges. */
export function endedWithin(report: BenchReport, exchanges: number): number {
  return report.records.filter((r) => r.exchanges <= exchanges).length / report.fights;
}

/** Fraction of fights the player won within `exchanges` exchanges. */
export function wonWithin(report: BenchReport, exchanges: number): number {
  const won = report.records.filter((r) => r.result === 'victory' && r.exchanges <= exchanges);
  return won.length / report.fights;
}

/** One line for logs: "Rusher (genin) v Brute (genin): 72% won, 9.3 exchanges, 41% health". */
export function summarise(player: FighterSpec, opponent: FighterSpec, report: BenchReport): string {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return (
    `${player.name} v ${opponent.name}: ${pct(report.winRate)} won, ` +
    `${pct(report.stalemateRate)} stalemate, ` +
    `${report.avgExchanges.toFixed(1)} exchanges, ${pct(report.avgHealthLeft)} health left`
  );
}
