import { createRng } from '@/core';
import { findCard, fitsBand } from '@/systems/combat/engines/plan/cards';
import { rollIntents } from '@/systems/combat/engines/plan/intent';
import { resolveExchange } from '@/systems/combat/engines/plan/round';
import { endOfRound } from '@/systems/combat/engines/plan/roundEnd';
import {
  plainSlots,
  type CardId,
  type Loadout,
  type PlanFighter,
  type PlanState,
} from '@/systems/combat/engines/plan/state';
import { RANGE_BANDS } from '@/systems/combat/rules/range';

/**
 * The real-engine forward model of `../perf/sim.ts`, made side-generic so any fighter can plan:
 *  - a fighter of the player's side is steered by its loadout (one card, where it fits), as the
 *    prototype does;
 *  - a foe is steered by its announced intent (`intents`), which is what a foe's plan *is* in
 *    today's engine: the card it telegraphs. Where the card no longer fits, the foe improvises
 *    by instinct, as the engine does with any stale intent.
 * Prefix states are kept per seed (exact, `perf/exact.test.ts`), and every exchange is played on
 * a state whose story log is emptied (silent, `perf/silent/`).
 */

export type Side = 'player' | 'enemy';

/** A fall or a win, weighed against health (as `beam.ts`). */
const ENDED = 150;

export const sideOf = (f: PlanFighter): Side => (f.side === 'enemy' ? 'enemy' : 'player');

export function healthOf(state: PlanState, side: Side): number {
  return state.fighters
    .filter((f) => sideOf(f) === side && !f.shadowOf)
    .reduce((sum, f) => sum + Math.max(0, f.health), 0);
}

/** The objective (`beam.value`) from one side's point of view. */
export function valueFor(start: PlanState, end: PlanState, side: Side, ownHurt: number): number {
  const them: Side = side === 'player' ? 'enemy' : 'player';
  const dealt = healthOf(start, them) - healthOf(end, them);
  const taken = healthOf(start, side) - healthOf(end, side);
  const won = side === 'player' ? 'victory' : 'defeat';
  const lost = side === 'player' ? 'defeat' : 'victory';
  const ended = end.result === won ? ENDED : end.result === lost ? -ENDED : 0;
  return dealt - ownHurt * taken + ended;
}

function forcedLoadout(fighter: PlanFighter, id: CardId): Loadout {
  const card = findCard(fighter, id);
  const slots = (band: (typeof RANGE_BANDS)[number]) =>
    card && fitsBand(card, band) ? plainSlots([id]) : [];
  return { close: slots('close'), mid: slots('mid'), far: slots('far') };
}

/**
 * The fight with `selfId` playing `card` next exchange; with `card` null, on its own default
 * (its loadout `own` for the player's side, the engine's intent for a foe).
 */
export function steer(
  state: PlanState,
  selfId: string,
  card: CardId | null,
  own: Loadout,
): PlanState {
  const self = state.fighters.find((f) => f.id === selfId);
  if (!self) return state;
  if (sideOf(self) === 'enemy') {
    if (card === null) return state;
    return { ...state, intents: { ...state.intents, [selfId]: card } };
  }
  const loadout = card === null ? own : forcedLoadout(self, card);
  if (loadout === self.loadout) return state;
  return {
    ...state,
    fighters: state.fighters.map((f) => (f.id === selfId ? { ...f, loadout } : f)),
  };
}

/** One exchange of the real engine, silent (log emptied first). */
export function exchange(state: PlanState, seed: number): PlanState {
  const rng = createRng(seed);
  const next = endOfRound(resolveExchange({ ...state, log: [] }, rng));
  return next.result ? next : { ...next, intents: rollIntents(next, rng) };
}

export interface ModelOptions {
  readonly seedBase: number;
  readonly ownHurt: number;
}

const exchangeSeed = (seed: number, step: number) => seed * 7919 + step;

/** A planner's forward model from one decision state (the state as the planner believes it). */
export class Model {
  exchanges = 0;
  readonly side: Side;
  readonly own: Loadout;
  private readonly prefixes = new Map<string, PlanState[]>();

  constructor(
    /** The fight as believed (beliefs and telegraph handling already applied). */
    readonly start: PlanState,
    readonly selfId: string,
    readonly opts: ModelOptions,
  ) {
    const self = start.fighters.find((f) => f.id === selfId)!;
    this.side = sideOf(self);
    this.own = self.loadout;
  }

  private play(state: PlanState, card: CardId | null, seedIndex: number, step: number) {
    if (state.result) return state;
    this.exchanges++;
    return exchange(
      steer(state, this.selfId, card, this.own),
      exchangeSeed(this.opts.seedBase + seedIndex, step),
    );
  }

  /** The state after a sequence of cards (null = own default that exchange), on one seed. */
  prefix(sequence: readonly (CardId | null)[], seedIndex: number): PlanState {
    if (sequence.length === 0) return this.start;
    const key = sequence.map((c) => c ?? '·').join('|');
    let states = this.prefixes.get(key);
    if (!states) this.prefixes.set(key, (states = []));
    const kept = states[seedIndex];
    if (kept) return kept;
    const parent = this.prefix(sequence.slice(0, -1), seedIndex);
    const s = this.play(parent, sequence[sequence.length - 1]!, seedIndex, sequence.length - 1);
    states[seedIndex] = s;
    return s;
  }

  /** A sequence, then the default to `horizon` exchanges, scored on one seed. */
  leafValue(sequence: readonly CardId[], horizon: number, seedIndex: number): number {
    // Pad with defaults so the default tails are shared between sequences with the same prefix.
    const padded: (CardId | null)[] = [...sequence];
    while (padded.length < horizon) padded.push(null);
    const end = this.prefix(padded.slice(0, horizon), seedIndex);
    return valueFor(this.start, end, this.side, this.opts.ownHurt);
  }

  score(sequence: readonly CardId[], horizon: number, rollouts: number): number {
    let total = 0;
    for (let i = 0; i < rollouts; i++) total += this.leafValue(sequence, horizon, i);
    return total / Math.max(1, rollouts);
  }

  /** Mean health of each side after the sequence's first step, for a surprise check. */
  expectedAfterFirst(first: CardId, rollouts: number): { own: number; them: number } {
    let own = 0;
    let them = 0;
    const other: Side = this.side === 'player' ? 'enemy' : 'player';
    for (let i = 0; i < rollouts; i++) {
      const s = this.prefix([first], i);
      own += healthOf(s, this.side);
      them += healthOf(s, other);
    }
    return { own: own / rollouts, them: them / rollouts };
  }
}
