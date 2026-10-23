import type { GreetingCause, GreetingTemper, PersonDef, TownGreeting } from '@/content';

import type { GameContext } from './context';
import type { GameState } from './state';

/**
 * How a town greets you (`LocationDef.greetings`): what it holds against you that is true of
 * you now (the village you come from, a summoning contract you hold, an awakened bloodline), and
 * what that costs you.
 * Its shops, inn, bar, baths and hospital charge you more while you are there (`townPrice`), and
 * its people warm to you more slowly wherever you meet them (`townWarmth`). Two grudges stack.
 * A grudge may shut the gates until the village remembers something (`gateRefusal`): you can't
 * travel there, though a job may still take you, which is how the gates come to open.
 */

/** What a town charges you over its usual prices, by its temper. */
const MARKUP: Readonly<Record<GreetingTemper, number>> = { wary: 1.25, cold: 1.5 };
/** How much good time with its people counts, by its temper. */
const WARMTH: Readonly<Record<GreetingTemper, number>> = { wary: 0.75, cold: 0.5 };

function holds(cause: GreetingCause, state: GameState, ctx: GameContext): boolean {
  switch (cause.kind) {
    // Everyone in a save comes from its start village.
    case 'from':
      return cause.locationId === ctx.content.startLocationId;
    case 'contract':
      return state.contract !== null;
    // A dormant bloodline shows nothing yet; an awakened one can't be hidden for long.
    case 'bloodline': {
      const bloodline = ctx.content.clans.get(state.character.clanId)?.kekkeiGenkai;
      return bloodline !== undefined && !bloodline.dormant;
    }
  }
}

/** What a town holds against you now. */
export function greetingsOf(
  state: GameState,
  ctx: GameContext,
  locationId: string,
): readonly TownGreeting[] {
  const greetings = ctx.content.locations.get(locationId)?.greetings ?? [];
  return greetings.filter((g) => holds(g.cause, state, ctx));
}

function product(
  greetings: readonly TownGreeting[],
  table: Record<GreetingTemper, number>,
): number {
  return greetings.reduce((all, g) => all * table[g.temper], 1);
}

/** How much more than its usual prices the town you are in charges you. */
export function townMarkup(state: GameState, ctx: GameContext): number {
  return markupAt(state, ctx, state.locationId);
}

/** How much more than its usual prices a town charges you, wherever you are now. */
export function markupAt(state: GameState, ctx: GameContext, locationId: string): number {
  return product(greetingsOf(state, ctx, locationId), MARKUP);
}

/** What a town sells for, its grudges included, from before you're in it (a room on the way). */
export function priceAt(
  cost: number,
  state: GameState,
  ctx: GameContext,
  locationId: string,
): number {
  return cost <= 0 ? cost : Math.max(1, Math.round(cost * markupAt(state, ctx, locationId)));
}

/** What something the town sells costs you, its grudges included. A free thing stays free. */
export function townPrice(cost: number, state: GameState, ctx: GameContext): number {
  return cost <= 0 ? cost : Math.max(1, Math.round(cost * townMarkup(state, ctx)));
}

/** How much good time with this person counts, by what their home town holds against you. */
export function townWarmth(state: GameState, ctx: GameContext, person: PersonDef): number {
  const home = person.homeLocationId ?? ctx.content.startLocationId;
  return product(greetingsOf(state, ctx, home), WARMTH);
}

/** Why the town turns you away at the gate, or null when it lets you in. */
export function gateRefusal(state: GameState, ctx: GameContext, locationId: string): string | null {
  const shut = greetingsOf(state, ctx, locationId).find(
    (g) => g.shut && !state.village.marks.includes(g.shut.until),
  );
  return shut?.shut?.refusal ?? null;
}

/** What the village screen says of a grudge, with what it costs you as chips. */
export interface GreetingNote {
  readonly line: string;
  readonly chips: readonly string[];
}

/** The grudges of the town you are in, for the village screen. */
export function greetingNotes(state: GameState, ctx: GameContext): readonly GreetingNote[] {
  return greetingsOf(state, ctx, state.locationId).map((g) => ({
    line: g.line,
    chips: [
      `Prices +${Math.round((MARKUP[g.temper] - 1) * 100)}%`,
      `Warms to you ${g.temper === 'cold' ? 'slowly' : 'a little slowly'}`,
    ],
  }));
}
