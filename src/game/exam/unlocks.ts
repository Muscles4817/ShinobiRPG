import type { PromotedRank } from '@/content';
import { rankForMission } from '@/systems/missions';

import type { GameContext } from '../context';
import { gearRankBlocker } from '../gear';
import { currentLocation } from '../ops';
import { everyone } from '../people/cast';
import { readPrice } from '../people/price';
import { teachingOf } from '../people/teachers';
import { libraryAccess } from '../shelves';
import type { GameState } from '../state';

/**
 * What a promotion opens, worked out from the data by comparing what you may do at your rank
 * now with what you may do at the new one: the library's stacks, jobs on the board (taken
 * alone), gear the shops will sell you, and the shinobi who will now train you.
 */

export interface Unlock {
  readonly heading: string;
  readonly items: readonly string[];
}

function atRank(state: GameState, rank: PromotedRank): GameState {
  return { ...state, standing: { ...state.standing, rank } };
}

function libraries(state: GameState, ctx: GameContext, raised: GameState): Unlock[] {
  if (libraryAccess(raised) !== null || libraryAccess(state) === null) return [];
  const items = currentLocation(state, ctx)
    .places.filter((p) => p.kind === 'library')
    .map((p) => `${p.name}: the restricted stacks`);
  return items.length > 0 ? [{ heading: 'The library', items }] : [];
}

function jobs(state: GameState, ctx: GameContext, rank: PromotedRank): Unlock[] {
  const offered = new Set(
    currentLocation(state, ctx).places.flatMap((p) => (p.kind === 'missions' ? p.missionIds : [])),
  );
  const items = ctx.content.missions.all
    .filter((m) => offered.has(m.id) && !m.examOnly && rankForMission(m) === rank)
    .map((m) => `${m.rank}-rank: ${m.title}, alone`);
  return items.length > 0 ? [{ heading: 'Jobs on the board', items }] : [];
}

function gear(state: GameState, ctx: GameContext, raised: GameState): Unlock[] {
  const sold = new Set(
    currentLocation(state, ctx).places.flatMap((p) => (p.kind === 'gear' ? p.gearIds : [])),
  );
  const items = ctx.content.gear.all
    .filter((g) => sold.has(g.id) && gearRankBlocker(state, g) && !gearRankBlocker(raised, g))
    .map((g) => `${g.rank}-rank ${g.name}`);
  return items.length > 0 ? [{ heading: 'Gear the shops will sell you', items }] : [];
}

/** Whether someone would train you, on their terms, as your standing is in `at`. */
function trainsYou(at: GameState, ctx: GameContext, personId: string): boolean {
  const person = everyone(at, ctx).find((p) => p.id === personId);
  const teaching = person && teachingOf(at, person);
  if (!person || !teaching?.price) return false;
  return readPrice(at, ctx, person, teaching.price).every((part) => part.met);
}

function teachers(state: GameState, ctx: GameContext, raised: GameState): Unlock[] {
  const items = everyone(state, ctx)
    .filter((p) => !trainsYou(state, ctx, p.id) && trainsYou(raised, ctx, p.id))
    .map((p) => `${p.name}, ${p.title.toLowerCase()}`);
  return items.length > 0 ? [{ heading: 'Who will train you now', items }] : [];
}

/** What being raised to `rank` opens for you, as a list of headings and items. */
export function unlocksFor(state: GameState, ctx: GameContext, rank: PromotedRank): Unlock[] {
  const raised = atRank(state, rank);
  return [
    ...libraries(state, ctx, raised),
    ...jobs(state, ctx, rank),
    ...gear(state, ctx, raised),
    ...teachers(state, ctx, raised),
  ];
}
