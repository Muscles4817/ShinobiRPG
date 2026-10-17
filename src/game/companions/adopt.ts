import type { CompanionKindDef } from '@/content';
import { PLAYER_OWNER } from '@/systems/companions';

import type { GameState } from '../state';
import { newCompanion } from './make';

/**
 * A companion of a kind joins you today (a wild one tamed, a kennel's pup, an animal a job
 * rescued), starting at a bond its way of coming gives. Whatever you were winning over is let
 * go: you have one now.
 */
export function withNewCompanion(
  state: GameState,
  kind: CompanionKindDef,
  bond: number,
): GameState {
  const start = {
    id: `${kind.id}-${state.time.day}`,
    seed: state.board.seed,
    day: state.time.day,
    bond,
  };
  const owned = { ...state.companions.owned, [PLAYER_OWNER]: newCompanion(kind, start) };
  return { ...state, companions: { ...state.companions, owned, befriending: null } };
}
