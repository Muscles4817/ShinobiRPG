import type { CombatOpening, RangeBand } from '@/systems/combat';
import type { Alertness } from '@/systems/missions';

import { enemyCombatantId } from '../combatants';
import type { EncounterHere } from './current';
import type { GroundMeans } from './means';

/**
 * How an encounter's approach shapes the fight that follows (`CombatSetup.opening`). Every
 * opening an approach can give is built here.
 */

function foeIds(here: EncounterHere): string[] {
  return here.foes.map((f, i) => enemyCombatantId(f.id, i));
}

/** Head-on: foes who saw you coming move first; otherwise it's a plain fight. */
export function headOnOpening(alertness: Alertness): CombatOpening | undefined {
  return alertness === 'alert' ? { firstMover: 'enemy' } : undefined;
}

/** An ambush: every foe reels through the first exchange, your side moves first, at your range. */
export function ambushOpening(here: EncounterHere, range: RangeBand): CombatOpening {
  return { range, dazed: foeIds(here), firstMover: 'player' };
}

/** Caught: a failed sneak or a threat that didn't land. They move first. */
export const CAUGHT_OPENING: CombatOpening = { firstMover: 'enemy' };

/**
 * Ground you prepared: you move first at the range you chose, with your field already over it,
 * or the first foe stumbling into your trap.
 */
export function groundOpening(
  here: EncounterHere,
  range: RangeBand,
  means: GroundMeans,
): CombatOpening {
  const base: CombatOpening = { range, firstMover: 'player' };
  switch (means.kind) {
    case 'field':
      return { ...base, field: { id: means.field, side: 'player', potency: means.potency } };
    case 'smoke':
      return { ...base, field: { id: 'smoke', side: 'player', potency: means.potency } };
    case 'trap':
      return { ...base, dazed: foeIds(here).slice(0, 1) };
  }
}
