import type { CompanionKindDef } from '@/content';
import { PLAYER_OWNER, type Companion } from '@/systems/companions';

import type { GameState } from '../state';
import { newCompanion, type Arrival } from './make';

/**
 * A companion of a kind joining you today (a wild one tamed, a kennel's pup, an animal a job
 * rescued), at a bond and an age its way of coming gives. Whatever you were winning over of the
 * same sort is let go: you have one now.
 */

export interface Joining {
  readonly bond: number;
  readonly arrival: Arrival;
}

/** Names already in use: your companion's, one waiting at the vet's, one gone back to the streets. */
function namesTaken(state: GameState): readonly string[] {
  const { owned, waiting, strayed } = state.companions;
  return [...Object.values(owned), waiting, strayed].flatMap((c) => (c ? [c.name] : []));
}

/** A new animal of a kind, met today, never named like one you already know. */
export function metToday(state: GameState, kind: CompanionKindDef, joining: Joining): Companion {
  const start = {
    id: `${kind.id}-${state.time.day}`,
    seed: state.board.seed,
    day: state.time.day,
    ...joining,
  };
  const met = newCompanion(kind, start);
  const taken = namesTaken(state);
  if (!taken.includes(met.name)) return met;
  const free = kind.names.find((n) => !taken.includes(n));
  return free ? { ...met, name: free } : met;
}

export function withNewCompanion(
  state: GameState,
  kind: CompanionKindDef,
  joining: Joining,
): GameState {
  const owned = { ...state.companions.owned, [PLAYER_OWNER]: metToday(state, kind, joining) };
  const companions = { ...state.companions, owned, befriending: null, tracking: null };
  return { ...state, companions };
}
