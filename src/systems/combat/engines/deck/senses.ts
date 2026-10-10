import type { Rng } from '@/core';

import type { CombatOption } from '../../contract';
import { alive } from '../../rules/body';
import { DISPEL_CHAKRA, dispelChance, searchChance } from '../../rules/conditions';
import { LOG_LIMIT, patch, playerOf, type DeckFighter, type DeckState } from './state';

/**
 * Seeing through illusions: Search looks for each hidden foe, Dispel breaks every illusion at
 * once (and your own confusion) for chakra. Like footwork, each costs one action and never
 * misfires.
 */

export const SENSE_POINTS = 1;

function hiddenFoes(fighters: readonly DeckFighter[]): DeckFighter[] {
  return fighters.filter((f) => f.side === 'enemy' && alive(f) && f.hidden);
}

/** Search while someone is hidden; Dispel then too, or while you are confused. */
export function senseOptions(state: DeckState): CombatOption[] {
  const player = playerOf(state);
  const anyHidden = hiddenFoes(state.fighters).length > 0;
  const tired = state.points < SENSE_POINTS ? 'Not enough actions' : null;
  const option = (id: string, label: string, detail: string, blocker: string | null) => ({
    id,
    label,
    detail,
    kind: 'move' as const,
    cost: SENSE_POINTS,
    ...(blocker ? { disabledReason: blocker } : {}),
  });
  const short = player.chakra < DISPEL_CHAKRA ? `Needs ${DISPEL_CHAKRA} chakra` : null;
  return [
    ...(anyHidden ? [option('search', 'Search', 'Find hidden foes', tired)] : []),
    ...(anyHidden || player.confused > 0
      ? [option('dispel', 'Dispel', `Break illusions · ${DISPEL_CHAKRA} chakra`, tired ?? short)]
      : []),
  ];
}

function spend(state: DeckState, fighters: DeckFighter[], lines: readonly string[]): DeckState {
  return {
    ...state,
    fighters,
    points: state.points - SENSE_POINTS,
    log: [...state.log, ...lines].slice(-LOG_LIMIT),
  };
}

/** Rolls to find each hidden foe in turn. */
export function search(state: DeckState, rng: Rng): DeckState {
  const player = playerOf(state);
  const found = hiddenFoes(state.fighters).filter((f) => rng.chance(searchChance(player, f)));
  const fighters = found.reduce(
    (acc, f) => patch(acc, f.id, { hidden: false }),
    [...state.fighters],
  );
  const lines =
    found.length > 0
      ? found.map((f) => `You spot ${f.name}!`)
      : ['You search, but the illusion holds.'];
  return spend(state, fighters, lines);
}

/** Spends chakra, clears your confusion, and may reveal every hidden foe at once. */
export function dispel(state: DeckState, rng: Rng): DeckState {
  const player = playerOf(state);
  const paid = patch(state.fighters, player.id, {
    chakra: player.chakra - DISPEL_CHAKRA,
    confused: 0,
  });
  const clear = player.confused > 0 ? ['Your head clears.'] : [];
  const hidden = hiddenFoes(state.fighters);
  const strongest = hidden.reduce<DeckFighter | undefined>(
    (best, f) => (!best || f.attributes.genjutsu > best.attributes.genjutsu ? f : best),
    undefined,
  );
  if (!strongest) return spend(state, paid, ['You form the release seal.', ...clear]);
  if (!rng.chance(dispelChance(player, strongest))) {
    return spend(state, paid, [...clear, 'You try to dispel it, but the illusion holds.']);
  }
  const fighters = hidden.reduce((acc, f) => patch(acc, f.id, { hidden: false }), paid);
  return spend(state, fighters, [...clear, 'The illusion shatters!']);
}
