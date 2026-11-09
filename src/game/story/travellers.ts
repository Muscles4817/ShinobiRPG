import type { TravellerMeeting } from '@/systems/missions';

import { knowsOf, neighbours } from '../atlas';
import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * Where you stand with someone of the road (`docs/design/journeys-plan.md` 3.6): their meetings
 * come in order, each one met once, and a meeting that needs something they remember of an
 * earlier one is passed over when they don't. Once every meeting is behind you, they are met
 * no more.
 */

export interface NextMeeting {
  readonly index: number;
  readonly meeting: TravellerMeeting;
}

export function nextMeeting(
  state: GameState,
  ctx: GameContext,
  travellerId: string,
): NextMeeting | null {
  const def = ctx.content.travellers.get(travellerId);
  if (!def) return null;
  const known = state.atlas.travellers[travellerId];
  const marks = known?.marks ?? [];
  for (let index = known?.met ?? 0; index < def.meetings.length; index++) {
    const meeting = def.meetings[index];
    if (meeting && (!meeting.needs || marks.includes(meeting.needs))) return { index, meeting };
  }
  return null;
}

/**
 * The nearest place on the roads you haven't heard of, as a traveller would tell you of it:
 * the roads walked out from where you stand, one road at a time, never through a place still
 * shut to everyone.
 */
export function nearestUnheardOf(state: GameState, ctx: GameContext): string | null {
  const open = (id: string) => ctx.content.locations.get(id)?.lockedReason === undefined;
  const seen = new Set([state.locationId]);
  let ring = [state.locationId];
  while (ring.length > 0) {
    const next = ring
      .flatMap((id) => neighbours(ctx, id))
      .filter((id) => !seen.has(id) && open(id));
    const unheard = next.find((id) => !knowsOf(state, ctx, id));
    if (unheard) return unheard;
    next.forEach((id) => seen.add(id));
    ring = [...new Set(next)];
  }
  return null;
}
