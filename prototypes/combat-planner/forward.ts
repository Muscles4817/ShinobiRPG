import { createRng } from '@/core';
import {
  cardId,
  fitsBand,
  findCard,
  isReaction,
  kitCards,
} from '@/systems/combat/engines/plan/cards';
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
 * The prototype's forward model: the real Plan & Watch exchange (`resolveExchange`, then the
 * round's end and the foes' next intents), played on a copy of the fight as the planner believes
 * it to be. It is a model, not a peek:
 *  - it draws its own seeds, never the fight's Rng;
 *  - the foes in it are the planner's *belief* of them (`Belief`: attributes it thinks they
 *    have), so a wrong belief gives a wrong prediction;
 *  - the foes decide by the engine's own AI, which here stands in for "how I expect them to
 *    react". In the full design that is the prediction from beliefs (Part 5).
 *
 * The planner controls one fighter by forcing a single card for one exchange: every distance
 * the card fits holds just that card; where it doesn't fit, the fighter improvises, as the
 * engine already does for an empty plan.
 */

/** What the planner believes about a foe that differs from the truth (by fighter id). */
export type Belief = Readonly<Record<string, Partial<PlanFighter['attributes']>>>;

/** Every card a fighter could play at any distance, by id: basics, steps, jutsu, tools (no ready defences). */
export function actionsOf(fighter: PlanFighter): CardId[] {
  const ids = RANGE_BANDS.flatMap((band) =>
    kitCards(fighter, band)
      .filter((c) => !isReaction(c))
      .map(cardId),
  );
  return [...new Set(ids)];
}

function forced(fighter: PlanFighter, id: CardId): Loadout {
  const card = findCard(fighter, id);
  const slots = (band: (typeof RANGE_BANDS)[number]) =>
    card && fitsBand(card, band) ? plainSlots([id]) : [];
  return { close: slots('close'), mid: slots('mid'), far: slots('far') };
}

function withLoadout(state: PlanState, selfId: string, loadout: Loadout): PlanState {
  return {
    ...state,
    fighters: state.fighters.map((f) => (f.id === selfId ? { ...f, loadout } : f)),
  };
}

/** The fight as the planner believes it: foes' attributes replaced by what it thinks they are. */
export function believed(state: PlanState, belief: Belief): PlanState {
  return {
    ...state,
    fighters: state.fighters.map((f) => {
      const thought = belief[f.id];
      return thought ? { ...f, attributes: { ...f.attributes, ...thought } } : f;
    }),
  };
}

/**
 * The fight with this fighter playing one card next exchange (`id`), or, with `id` null, back on
 * the plan it started with (`from`).
 */
export function forcedFor(
  state: PlanState,
  selfId: string,
  id: CardId | null,
  from?: PlanState,
): PlanState {
  const self = state.fighters.find((f) => f.id === selfId)!;
  const own = (from ?? state).fighters.find((f) => f.id === selfId)!.loadout;
  return withLoadout(state, selfId, id === null ? own : forced(self, id));
}

/** One exchange of the real engine. */
export function playExchange(state: PlanState, seed: number): PlanState {
  const rng = createRng(seed);
  const next = endOfRound(resolveExchange(state, rng));
  return next.result ? next : { ...next, intents: rollIntents(next, rng) };
}

export interface Rollout {
  /** The cards to force, one an exchange. */
  readonly sequence: readonly CardId[];
  /** Exchanges to play after it on the fighter's own default plan, to the horizon. */
  readonly thenDefault: number;
}

/** Plays a sequence (then the default plan) from a state with one seed stream. */
export function rollout(start: PlanState, selfId: string, plan: Rollout, seed: number): PlanState {
  const own = start.fighters.find((f) => f.id === selfId)!.loadout;
  let state = start;
  let step = 0;
  for (const id of plan.sequence) {
    if (state.result) return state;
    state = playExchange(
      withLoadout(
        state,
        selfId,
        forced(
          state.fighters.find((f) => f.id === selfId)!,
          id,
        ),
      ),
      seed * 7919 + step++,
    );
  }
  for (let i = 0; i < plan.thenDefault && !state.result; i++) {
    state = playExchange(withLoadout(state, selfId, own), seed * 7919 + step++);
  }
  return withLoadout(state, selfId, own);
}
