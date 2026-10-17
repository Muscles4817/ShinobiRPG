import type { PersonDef } from '@/content';

import type { GameContext } from '../context';
import { characterModifiers } from '../profile';
import type { GameState } from '../state';

/**
 * How much a moment with someone counts today. A shared, convivial meal (`bondGain`) makes
 * good time count for more, and so do your habits with someone whose traits take to them
 * (`QuirkDef`: each one they warm to counts for more, each they don't for less). Neither ever
 * softens a falling-out.
 */

/** What each habit someone warms to (or doesn't) adds to (or takes from) good time with them. */
export const QUIRK_TILT = 0.15;
/** However many habits grate on someone, good time with them still counts for this much. */
const QUIRK_FLOOR = 0.5;

/** How your habits sit with this person: above 1 they warm to you faster, below 1 slower. */
export function quirkTilt(state: GameState, ctx: GameContext, person: PersonDef): number {
  const traits = new Set(person.traitIds);
  const tilt = state.character.quirkIds.reduce((sum, id) => {
    const quirk = ctx.content.quirks.get(id);
    if (!quirk) return sum;
    const warms = quirk.warms.filter((t) => traits.has(t)).length;
    const cools = quirk.cools.filter((t) => traits.has(t)).length;
    return sum + (warms - cools) * QUIRK_TILT;
  }, 1);
  return Math.max(QUIRK_FLOOR, tilt);
}

export function warmed(
  state: GameState,
  ctx: GameContext,
  delta: number,
  person?: PersonDef,
): number {
  if (delta <= 0) return delta;
  const habits = person ? quirkTilt(state, ctx, person) : 1;
  return Math.round(delta * characterModifiers(state.character, ctx).bondGain * habits);
}
