import type { Find } from '@/systems/cooking';
import type { TimeSlot } from '@/systems/time';

import type { GameContext } from '../context';
import { placeInText } from '../placeName';

/**
 * Where the field book's wild pages come from: every fish that takes a line at some spot and
 * every find that grows in some wild place (or around a camp), read from the pack's places, with
 * where and when to look, in words, for the hint on an empty slot.
 */

export interface WildWhere {
  /** "The deep pool at the River Below the Canal". */
  readonly where: string;
  readonly find: Find;
}

/** A weight this low among the others makes a find rare. */
const RARE_WEIGHT = 1;

const SLOT_WORDS: Readonly<Record<TimeSlot, string>> = {
  morning: 'in the morning',
  afternoon: 'in the afternoon',
  evening: 'in the evening',
  night: 'at night',
};

function add(map: Map<string, WildWhere[]>, entry: WildWhere): void {
  map.set(entry.find.ingredientId, [...(map.get(entry.find.ingredientId) ?? []), entry]);
}

/** Every fish on a fishing spot, by ingredient id, in the order the pack names them. */
export function fishWhere(ctx: GameContext): ReadonlyMap<string, readonly WildWhere[]> {
  const map = new Map<string, WildWhere[]>();
  for (const location of ctx.content.locations.all) {
    for (const place of location.places) {
      if (place.kind !== 'wilds') continue;
      for (const spot of place.spots ?? []) {
        const where = `${spot.name} at ${placeInText(place.name)}`;
        spot.catches.forEach((find) => {
          add(map, { where, find });
        });
      }
    }
  }
  return map;
}

/** Every wild find you gather by hand that isn't a fish, by ingredient id. */
export function findsWhere(ctx: GameContext): ReadonlyMap<string, readonly WildWhere[]> {
  const fish = fishWhere(ctx);
  const map = new Map<string, WildWhere[]>();
  const gather = (where: string, finds: readonly Find[]) => {
    finds
      .filter((find) => !fish.has(find.ingredientId))
      .forEach((find) => {
        add(map, { where, find });
      });
  };
  for (const location of ctx.content.locations.all) {
    for (const place of location.places) {
      if (place.kind === 'wilds') gather(place.name, place.finds);
    }
  }
  gather('Around a camp on the road', ctx.content.campFinds);
  return map;
}

function either(words: readonly string[]): string {
  return words.length <= 1
    ? (words[0] ?? '')
    : `${words.slice(0, -1).join(', ')} or ${words.at(-1)}`;
}

/** "at night, in autumn or winter, once your cooking reaches grade C". */
export function whenWords(find: Find): string {
  const parts = [
    ...(find.slots ? [either(find.slots.map((s) => SLOT_WORDS[s]))] : []),
    ...(find.seasons ? [`in ${either(find.seasons.map((s) => s.toLowerCase()))}`] : []),
    ...(find.minGrade ? [`once your cooking reaches grade ${find.minGrade}`] : []),
  ];
  return parts.length > 0 ? parts.join(', ') : 'any time of year';
}

/** A find that is rare everywhere it turns up. */
export function isRare(places: readonly WildWhere[]): boolean {
  return places.length > 0 && places.every((p) => p.find.weight <= RARE_WEIGHT);
}
