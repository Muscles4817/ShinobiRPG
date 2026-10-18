import { BODY_STATS, COMPANION_TEMPERAMENTS, PLAY_KINDS } from '@/systems/companions';

import type { CompanionKindDef } from './companions';
import type { ContentPack } from './types';

/**
 * Companion kinds and who comes by them: a real temperament, a body to fight with, names to
 * give, sane talent; a stray's haunts are places of the start village; a clan's companion is
 * a kind the pack has.
 */

/** A companion starts no better than a fresh genin's best (a pup, an untrained stray). */
const MOST_BASE = 6;
/** The strongest any companion body may grow (a kage's grade): nothing natural goes past it. */
const MOST_ADULT = 40;
/** The deepest bond stage. */
const MOST_STAGE = 4;

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

/** A wild one lives in some wild place of the pack, and only a wild kind lives wild. */
function wildProblems(kind: CompanionKindDef, biomes: ReadonlySet<string>): string[] {
  const wild = kind.wild;
  const at = `companion kind "${kind.id}"`;
  return [
    ...(kind.stray && kind.temperament !== 'stray'
      ? [`${at} is a stray but not stray-tempered`]
      : []),
    ...(wild && kind.temperament !== 'wild' ? [`${at} lives wild but is not wild-tempered`] : []),
    ...(wild && !biomes.has(wild.biome) ? [`${at} lives in ${wild.biome}, and no place is`] : []),
    ...(wild && (wild.chance <= 0 || wild.chance > 1)
      ? [`${at} has a wild chance outside 0–1`]
      : []),
  ];
}

/** A kennel breeds a bred kind of the pack, for a price, and gives one at a real bond stage. */
function pupProblems(pack: ContentPack): string[] {
  return pack.locations
    .flatMap((l) => l.places)
    .flatMap((place) => {
      if (place.kind !== 'vet' || !place.pups) return [];
      const { kindId, price, giftStage } = place.pups;
      const kind = pack.companionKinds.find((k) => k.id === kindId);
      const at = `vet "${place.id}"`;
      return [
        ...(kind ? [] : [`${at} breeds unknown kind "${kindId}"`]),
        ...(kind && kind.temperament !== 'bred'
          ? [`${at} breeds "${kindId}", not a bred kind`]
          : []),
        ...(price > 0 ? [] : [`${at} gives pups away to anyone`]),
        ...(giftStage >= 1 && giftStage <= MOST_STAGE ? [] : [`${at} gifts at no real stage`]),
      ];
    });
}

/** An animal a job rescues is a kind of the pack, and waits at a vet the pack has. */
function rewardProblems(pack: ContentPack, kinds: ReadonlySet<string>): string[] {
  const hasVet = pack.locations.some((l) => l.places.some((p) => p.kind === 'vet'));
  return pack.missions.flatMap((m) => {
    const kindId = m.reward.companionKindId;
    if (!kindId) return [];
    return [
      ...(kinds.has(kindId) ? [] : [`mission "${m.id}" gives unknown kind "${kindId}"`]),
      ...(hasVet ? [] : [`mission "${m.id}" rescues an animal with no vet to keep it`]),
    ];
  });
}

/** A grown body in every body stat, a real time to grow into it, and skills that leave it alone. */
function bodyProblems(kind: CompanionKindDef): string[] {
  const at = `companion kind "${kind.id}"`;
  const { adult, maturesInDays } = kind.body;
  return [
    ...BODY_STATS.filter((stat) => !(adult[stat] > 0 && adult[stat] <= MOST_ADULT)).map(
      (stat) => `${at} has no sane grown ${stat}`,
    ),
    ...(maturesInDays > 0 ? [] : [`${at} never grows up`]),
    ...BODY_STATS.filter((stat) => kind.statBonuses[stat] !== undefined).map(
      (stat) => `${at} sets ${stat} by bonus; its body decides it`,
    ),
  ];
}

function dietProblems(kind: CompanionKindDef, ingredients: ReadonlySet<string>): string[] {
  const at = `companion kind "${kind.id}"`;
  const plays = [...kind.plays.likes, ...kind.plays.dislikes];
  return [
    ...(kind.diet.length === 0 ? [`${at} eats nothing`] : []),
    ...kind.diet.filter((id) => !ingredients.has(id)).map((id) => `${at} eats unknown "${id}"`),
    ...plays.filter((p) => !PLAY_KINDS.includes(p)).map((p) => `${at} plays unknown "${p}"`),
    ...kind.plays.likes
      .filter((p) => kind.plays.dislikes.includes(p))
      .map((p) => `${at} both likes and dislikes "${p}"`),
  ];
}

/** Every clinic has a vet of the pack, and a clan it treats free is real. */
function vetProblems(pack: ContentPack): string[] {
  return pack.locations
    .flatMap((l) => l.places)
    .flatMap((place) => {
      if (place.kind !== 'vet') return [];
      const at = `vet "${place.id}"`;
      const free = place.freeForClanId;
      return [
        ...(pack.people.some((p) => p.id === place.keeperId)
          ? []
          : [`${at} has unknown vet "${place.keeperId}"`]),
        ...(free && !pack.clans.some((c) => c.id === free)
          ? [`${at} is free to unknown clan "${free}"`]
          : []),
      ];
    });
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
    ...bodyProblems(kind),
  ];
}

export function validateCompanions(pack: ContentPack): string[] {
  const kinds = new Set(pack.companionKinds.map((k) => k.id));
  const places = haunts(pack);
  const ingredients = new Set(pack.ingredients.map((i) => i.id));
  const biomes = new Set(
    pack.locations.flatMap((l) => l.places).flatMap((p) => (p.kind === 'wilds' ? [p.biome] : [])),
  );
  return [
    ...pack.companionKinds.flatMap((kind) => wildProblems(kind, biomes)),
    ...pupProblems(pack),
    ...rewardProblems(pack, kinds),
    ...pack.companionKinds.flatMap((kind) => kindProblems(kind, places)),
    ...pack.companionKinds.flatMap((kind) => dietProblems(kind, ingredients)),
    ...vetProblems(pack),
    ...pack.clans.flatMap((clan) =>
      clan.companion && !kinds.has(clan.companion.kindId)
        ? [`clan "${clan.id}" grows up with unknown companion "${clan.companion.kindId}"`]
        : [],
    ),
  ];
}
