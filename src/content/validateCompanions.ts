import { COMPANION_TEMPERAMENTS } from '@/systems/companions';

import type { CompanionKindDef } from './companions';
import type { ContentPack } from './types';

/**
 * Companion kinds and who comes by them: a real temperament, a body to fight with, names to
 * give, sane talent; a stray's haunts are places of the start village; a clan's companion is
 * a kind the pack has.
 */

/** A companion starts no better than a fresh genin's best (a pup, an untrained stray). */
const MOST_BASE = 6;

function haunts(pack: ContentPack): ReadonlySet<string> {
  const home = pack.locations.find((l) => l.id === pack.startLocationId);
  return new Set(home?.places.map((p) => p.id) ?? []);
}

function strayProblems(kind: CompanionKindDef, places: ReadonlySet<string>): string[] {
  const stray = kind.stray;
  if (!stray) return [];
  const at = `companion kind "${kind.id}"`;
  return [
    ...(stray.placeIds.length === 0 ? [`${at} has a stray with nowhere to be found`] : []),
    ...stray.placeIds
      .filter((id) => !places.has(id))
      .map((id) => `${at} haunts "${id}", not a place of the start village`),
    ...(stray.chance <= 0 || stray.chance > 1 ? [`${at} has a stray chance outside 0–1`] : []),
  ];
}

function kindProblems(kind: CompanionKindDef, places: ReadonlySet<string>): string[] {
  const at = `companion kind "${kind.id}"`;
  return [
    ...(COMPANION_TEMPERAMENTS.includes(kind.temperament) ? [] : [`${at} has no temperament`]),
    ...(kind.names.length === 0 ? [`${at} has no names to give`] : []),
    ...(kind.healthScale > 0 ? [] : [`${at} has no health`]),
    ...(kind.baseStat > MOST_BASE ? [`${at} starts too strong`] : []),
    ...(Object.values(kind.aptitude).some((a) => a < 0) ? [`${at} has a negative talent`] : []),
    ...strayProblems(kind, places),
  ];
}

export function validateCompanions(pack: ContentPack): string[] {
  const kinds = new Set(pack.companionKinds.map((k) => k.id));
  const places = haunts(pack);
  return [
    ...pack.companionKinds.flatMap((kind) => kindProblems(kind, places)),
    ...pack.clans.flatMap((clan) =>
      clan.companion && !kinds.has(clan.companion.kindId)
        ? [`clan "${clan.id}" grows up with unknown companion "${clan.companion.kindId}"`]
        : [],
    ),
  ];
}
