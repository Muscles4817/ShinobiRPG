import type { Discipline } from '@/systems/techniques';

import type { CombatTechnique, RangeBand } from '../../contract';
import { effectsOf } from './use';

/**
 * Move and substitute: footwork no one contests, and a defence that leaves a decoy where the
 * blow lands. A move takes its user straight to a distance: the one it names, else wherever
 * they fight best. A substitution swaps its user out of a hit that would land, physical or
 * ninjutsu, for its chakra (how often is the engine's call: once a round in Plan & Watch); an
 * illusion strikes the mind, so it can't.
 */

/** Where a technique's move takes its user, or null when it has none. */
export function moveGoal(technique: CombatTechnique, home: RangeBand): RangeBand | null {
  const [move] = effectsOf(technique, 'move');
  return move ? (move.to ?? home) : null;
}

/** Whether a substitution can swap out of an attack (a technique's art, or none for a blow). */
export function substitutable(discipline: Discipline | undefined): boolean {
  return discipline !== 'genjutsu';
}
