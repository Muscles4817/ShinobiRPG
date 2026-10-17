import type { ClanDef, CompoundFields, OutsiderStance, PersonDef, PlaceDef } from '@/content';
import { stageForPair, stageOf } from '@/systems/bonds';

import type { GameContext } from './context';
import { currentLocation } from './ops';
import { bondOf, everyone, whereNow } from './people/cast';
import type { GameState } from './state';
import { isNight } from './village';

/**
 * The gates of the clans' compounds (`docs/design/compounds-plan.md`). A clan's own are always
 * let in. An outsider needs to be close enough to someone of the clan: how close by day is the
 * clan's stance on outsiders; at night every gate is shut to all but the bonded. Whoever is
 * inside a compound you may not enter can't be reached until they come out.
 */

/** The bond stage with someone of the clan that opens the gate by day, by the clan's stance. */
const DAY_STAGE: Readonly<Record<OutsiderStance, number>> = {
  welcoming: 0,
  reserved: 1,
  guarded: 3,
};
/** At night, every clan wants you bonded to one of its own. */
const NIGHT_STAGE = 4;

/** How each stance turns you away by day, `{clan}` for the clan's name. */
const TURNED_AWAY: Readonly<Record<OutsiderStance, string>> = {
  welcoming: 'The {clan} gate is open to anyone by day.',
  reserved: 'The {clan} don’t open the gate to strangers. Get to know one of them first.',
  guarded: 'The {clan} let in only those who are {pair} with one of their own.',
};

export type Compound = PlaceDef & CompoundFields;

/** The closest you are to anyone of a clan, as a bond stage. */
function closestTo(state: GameState, ctx: GameContext, clanId: string): number {
  return everyone(state, ctx)
    .filter((p) => p.clanId === clanId)
    .reduce((best, p) => Math.max(best, stageOf(bondOf(state, p.id).points)), 0);
}

function stanceOf(clan: ClanDef): OutsiderStance {
  return clan.outsiders ?? 'reserved';
}

/** Why you can't go into a compound right now, or null when you may. */
export function compoundAccess(
  state: GameState,
  ctx: GameContext,
  compound: Compound,
): string | null {
  if (state.character.clanId === compound.clanId) return null;
  const clan = ctx.content.clans.require(compound.clanId);
  const stance = stanceOf(clan);
  const night = isNight(state);
  const needed = night ? NIGHT_STAGE : DAY_STAGE[stance];
  if (closestTo(state, ctx, clan.id) >= needed) return null;
  if (night) {
    return `The ${clan.name} gate is shut for the night. After dark it opens only to those ${stageForPair(NIGHT_STAGE)} with one of the clan.`;
  }
  return TURNED_AWAY[stance].replace('{clan}', clan.name).replace('{pair}', stageForPair(needed));
}

/** The compound a place id names in your current location, if it is one. */
export function compoundHere(state: GameState, ctx: GameContext, placeId: string): Compound | null {
  const place = currentLocation(state, ctx).places.find((p) => p.id === placeId);
  return place?.kind === 'compound' ? place : null;
}

/** Why you can't reach someone right now because they are behind a gate, or null. */
export function behindGate(state: GameState, ctx: GameContext, person: PersonDef): string | null {
  const placeId = whereNow(state, ctx, person);
  const compound = placeId ? compoundHere(state, ctx, placeId) : null;
  if (!compound) return null;
  const shut = compoundAccess(state, ctx, compound);
  return shut && `${person.name} is home in the compound. ${shut}`;
}
