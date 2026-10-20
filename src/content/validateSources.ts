import { STAT_GRADES, type StatGrade } from '@/systems/stats';

import type { ContentPack, PlaceDef } from './types';

/**
 * Where techniques come from. The academy holds rank E–D, the library C–A (its sealed archive
 * keeps A for jōnin), and neither holds a
 * clan's techniques (clan members teach those, through `teacher.teaches`; `validateTeachers`
 * keeps them in the clan). Every technique must be reachable from at least one source: a shelf,
 * a teacher, a mission's scroll, or a starting kit (or a versus-only duelist's own arsenal).
 */
export function validateSources(pack: ContentPack): string[] {
  return [...shelfProblems(pack), ...scrollRewardProblems(pack), ...unsourcedProblems(pack)];
}

type ShelfKind = Extract<PlaceDef, { techniqueIds: readonly string[] }>['kind'];

const SHELF_RANKS: Readonly<Record<ShelfKind, readonly StatGrade[]>> = {
  academy: ['E', 'D'],
  library: ['C', 'B', 'A'],
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
        : [
            `${place.kind} "${place.id}" holds "${id}" of rank ${t.rank} (${ranks[0]}–${ranks.at(-1)} only)`,
          ];
    }),
  );
}

/** Mission rewards name real techniques (a scroll) and real gear. */
function scrollRewardProblems(pack: ContentPack): string[] {
  const known = new Set(pack.techniques.map((t) => t.id));
  const gear = new Set(pack.gear.map((g) => g.id));
  return pack.missions.flatMap((m) => {
    const { scrollId, gearId } = m.reward;
    return [
      ...(scrollId !== undefined && !known.has(scrollId)
        ? [`mission "${m.id}" rewards a scroll of unknown technique "${scrollId}"`]
        : []),
      ...(gearId !== undefined && !gear.has(gearId)
        ? [`mission "${m.id}" rewards unknown gear "${gearId}"`]
        : []),
    ];
  });
}

function sourcedIds(pack: ContentPack): Set<string> {
  return new Set([
    ...shelves(pack).flatMap((p) => p.techniqueIds),
    ...pack.people.flatMap((p) => p.teacher?.teaches ?? []),
    // A duelist isn't in the world yet, so their own arts are theirs alone until plumbed in.
    ...(pack.duelists ?? []).flatMap((p) => p.arsenal?.techniqueIds ?? []),
    ...pack.missions.flatMap((m) => (m.reward.scrollId ? [m.reward.scrollId] : [])),
    // A dust scroll a job hands over teaches its kind's techniques (`DustDef.techniqueIds`).
    ...pack.missions.flatMap((m) => {
      const kind = pack.dusts.find((d) => d.id === m.reward.dustScroll);
      return kind?.techniqueIds ?? [];
    }),
    ...pack.academyTechniques,
    ...Object.values(pack.disciplineStarters),
    ...pack.clans.flatMap((c) => c.startingTechniqueIds),
    // A companion kind's techniques are its own (`validateCompanions.ts` checks them).
    ...pack.companionKinds.flatMap((k) => (k.techniques ?? []).map((t) => t.techniqueId)),
    // A contract's summoning techniques and what its summons fight with (`validateContracts.ts`).
    ...pack.contracts.flatMap((c) => c.summons.flatMap((s) => [s.techniqueId, ...s.techniqueIds])),
    // A puppet's unsealing and its mechanisms come with the puppet (`validatePuppets.ts`).
    ...(pack.puppets ?? []).flatMap((p) => [p.techniqueId, ...p.techniqueIds]),
  ]);
}

function unsourcedProblems(pack: ContentPack): string[] {
  const sourced = sourcedIds(pack);
  return pack.techniques
    .filter((t) => !sourced.has(t.id))
    .map((t) => `technique "${t.id}" can't be learned anywhere (no shelf, teacher or scroll)`);
}
