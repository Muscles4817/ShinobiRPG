import type { LocationDef } from '@/content';

import type { GameContext } from '../context';

/**
 * The places page of the field book (`docs/design/journeys-plan.md` 3.4): every place of the pack
 * a road can take you to. A place still coming soon is no slot, since nobody can stand in it yet.
 */
export function placesOnTheBook(ctx: GameContext): LocationDef[] {
  return ctx.content.locations.all.filter((l) => l.lockedReason === undefined);
}
