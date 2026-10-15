import { duplicateIds } from './catalog';
import type { DiceTable } from './leisure';
import type { ContentPack, PlaceDef } from './types';

/** More dice than this won't fit in a cup and be read. */
const MOST_DICE = 5;

/**
 * Checks bars and hot water: a drink and a soak cost something, a bar's pastimes are told
 * apart, a dice table has dice and real stakes, and the baths drain at night (a soak takes a stretch of the day, and night is
 * for sleeping).
 */
export function validateLeisure(pack: ContentPack): string[] {
  return pack.locations.flatMap((l) => l.places).flatMap(placeProblems);
}

function placeProblems(place: PlaceDef): string[] {
  if (place.kind === 'tavern') {
    return [
      ...(place.cupCost > 0 ? [] : [`bar "${place.id}" gives drinks away`]),
      ...duplicateIds(place.pastimes ?? []).map(
        (id) => `bar "${place.id}" lists pastime "${id}" twice`,
      ),
      ...(place.pastimes ?? []).flatMap((p) =>
        p.game ? diceProblems(`pastime "${p.id}" at "${place.id}"`, p.game) : [],
      ),
    ];
  }
  if (place.kind !== 'onsen') return [];
  return [
    ...(place.soakCost > 0 ? [] : [`onsen "${place.id}" lets you soak for nothing`]),
    ...(place.hours && !place.hours.includes('night')
      ? []
      : [`onsen "${place.id}" must close at night`]),
  ];
}

/** A cup holds a few dice, and the house takes real bets, smallest first. */
function diceProblems(at: string, table: DiceTable): string[] {
  const stakesRise = table.stakes.every(
    (stake, i) => i === 0 || stake > (table.stakes[i - 1] ?? 0),
  );
  return [
    ...(Number.isInteger(table.dice) && table.dice >= 1 && table.dice <= MOST_DICE
      ? []
      : [`${at} has a cup of no sensible number of dice`]),
    ...(table.stakes.length > 0 &&
    table.stakes.every((s) => Number.isInteger(s) && s > 0) &&
    stakesRise
      ? []
      : [`${at} needs whole stakes over nothing, smallest first`]),
  ];
}
