import { createRng } from '@/core';

import type { RangeBand } from '../../../../contract';
import { findCard, fitsBand } from '../../cards';
import { rollIntents } from '../../intent';
import { resolveExchange } from '../../round';
import { endOfRound } from '../../roundEnd';
import {
  plainSlots,
  type CardId,
  type Loadout,
  type PlanFighter,
  type PlanState,
} from '../../state';

/**
 * The planner's forward model (`docs/design/combat-ai-plan.md` Part 7): the real Plan & Watch
 * exchange, played on a copy of the fight as the mind believes it, with seeds of its own (never
 * the fight's Rng), silently (no story is kept, and no decision log), so a score is what the
 * engine would really do. A fighter is steered one card at a time: a foe by the card it
 * announces, one of the player's side by a plan of that one card; left unsteered, each plays as
 * it would (the default plan playing on past the searched cards). Simulated states after each
 * prefix are kept per seed, so candidates sharing a first card play it once.
 */

const SEED_STRIDE = 7919;

function forcedLoadout(fighter: PlanFighter, id: CardId): Loadout {
  const card = findCard(fighter, id);
  const slots = (band: RangeBand) => (card && fitsBand(card, band) ? plainSlots([id]) : []);
  return { close: slots('close'), mid: slots('mid'), far: slots('far') };
}

function steered(state: PlanState, selfId: string, card: CardId | null): PlanState {
  if (card === null) return state;
  const self = state.fighters.find((f) => f.id === selfId);
  if (!self) return state;
  if (self.side === 'enemy') return { ...state, intents: { ...state.intents, [selfId]: card } };
  const loadout = forcedLoadout(self, card);
  return {
    ...state,
    fighters: state.fighters.map((f) => (f.id === selfId ? { ...f, loadout } : f)),
  };
}

/** A copy of the fight to simulate on: no story, no log of decisions. */
export function silent(state: PlanState): PlanState {
  const { decisions: _log, logDropped: _dropped, ...rest } = state;
  return { ...rest, log: [] };
}

/** One real exchange on a silent copy, then the round's end and the foes' next intents. */
function exchange(state: PlanState, seed: number): PlanState {
  const rng = createRng(seed);
  const next = endOfRound(resolveExchange(state, rng));
  return next.result ? next : { ...next, intents: rollIntents(next, rng) };
}

/** A forward model from one decision, counting what it plays. */
export interface Forward {
  /** The state after a sequence of steered cards then unsteered play, to `horizon`, on one seed. */
  readonly leaf: (sequence: readonly CardId[], horizon: number, seed: number) => PlanState;
  readonly played: () => number;
}

export function forwardFrom(start: PlanState, selfId: string, seedBase: number): Forward {
  const kept = new Map<string, PlanState>();
  let played = 0;
  const own = start.fighters.find((f) => f.id === selfId)?.loadout;
  const play = (state: PlanState, card: CardId | null, seed: number, step: number) => {
    if (state.result) return state;
    played += 1;
    const unforced =
      card === null && own
        ? {
            ...state,
            fighters: state.fighters.map((f) => (f.id === selfId ? { ...f, loadout: own } : f)),
          }
        : state;
    return exchange(steered(unforced, selfId, card), (seedBase + seed) * SEED_STRIDE + step);
  };
  const prefix = (sequence: readonly CardId[], seed: number): PlanState => {
    if (sequence.length === 0) return start;
    const key = `${seed}|${sequence.join('|')}`;
    const found = kept.get(key);
    if (found) return found;
    const s = play(
      prefix(sequence.slice(0, -1), seed),
      sequence[sequence.length - 1] ?? null,
      seed,
      sequence.length - 1,
    );
    kept.set(key, s);
    return s;
  };
  const leaf = (sequence: readonly CardId[], horizon: number, seed: number) => {
    let s = prefix(sequence, seed);
    for (let k = sequence.length; k < horizon && !s.result; k++) s = play(s, null, seed, k);
    return s;
  };
  return { leaf, played: () => played };
}
