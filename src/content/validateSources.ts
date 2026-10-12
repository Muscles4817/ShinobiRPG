import { STAT_GRADES, type StatGrade } from '@/systems/stats';

import { CLAN_TEACHER_RANKS } from './people';
import type { ContentPack, PlaceDef } from './types';

/**
 * Where techniques come from. The academy holds rank E–D, the library C–B, and neither holds a
 * clan's techniques (clan people teach those). Every technique must be reachable from at least
 * one source: a shelf, a clan member, a teacher, a mission's scroll, or a starting kit.
 */
export function validateSources(pack: ContentPack): string[] {
  return [...shelfProblems(pack), ...scrollRewardProblems(pack), ...unsourcedProblems(pack)];
}

type ShelfKind = Extract<PlaceDef, { techniqueIds: readonly string[] }>['kind'];

const SHELF_RANKS: Readonly<Record<ShelfKind, readonly StatGrade[]>> = {
  academy: ['E', 'D'],
  library: ['C', 'B'],
};

function shelves(pack: ContentPack) {
  return pack.locations.flatMap((l) =>
    l.places.flatMap((p) => (p.kind === 'academy' || p.kind === 'library' ? [p] : [])),
  );
}

function shelfProblems(pack: ContentPack): string[] {
  const grades: readonly string[] = STAT_GRADES;
  return shelves(pack).flatMap((place) =>
    place.techniqueIds.flatMap((id) => {
      const t = pack.techniques.find((d) => d.id === id);
      if (!t) return [];
      if (t.clan !== undefined) return [`${place.kind} "${place.id}" lists clan technique "${id}"`];
      const ranks: readonly string[] = SHELF_RANKS[place.kind];
      return ranks.includes(t.rank) || !grades.includes(t.rank)
        ? []
        : [`${place.kind} "${place.id}" holds "${id}" of rank ${t.rank} (${ranks.join('–')} only)`];
    }),
  );
}

function scrollRewardProblems(pack: ContentPack): string[] {
  const known = new Set(pack.techniques.map((t) => t.id));
  return pack.missions.flatMap((m) => {
    const id = m.reward.scrollId;
    return id !== undefined && !known.has(id)
      ? [`mission "${m.id}" rewards a scroll of unknown technique "${id}"`]
      : [];
  });
}

function clanTaught(pack: ContentPack): Set<string> {
  const clans = new Set(
    pack.people.flatMap((p) =>
      p.clanId && CLAN_TEACHER_RANKS.includes(p.rank) ? [p.clanId] : [],
    ),
  );
  return new Set(pack.techniques.flatMap((t) => (t.clan && clans.has(t.clan) ? [t.id] : [])));
}

function sourcedIds(pack: ContentPack): Set<string> {
  return new Set([
    ...shelves(pack).flatMap((p) => p.techniqueIds),
    ...clanTaught(pack),
    ...pack.people.flatMap((p) => p.sensei?.teaches ?? []),
    ...pack.missions.flatMap((m) => (m.reward.scrollId ? [m.reward.scrollId] : [])),
    ...pack.academyTechniques,
    ...Object.values(pack.disciplineStarters),
    ...pack.clans.flatMap((c) => c.startingTechniqueIds),
  ]);
}

function unsourcedProblems(pack: ContentPack): string[] {
  const sourced = sourcedIds(pack);
  return pack.techniques
    .filter((t) => !sourced.has(t.id))
    .map((t) => `technique "${t.id}" can't be learned anywhere (no shelf, teacher or scroll)`);
}
