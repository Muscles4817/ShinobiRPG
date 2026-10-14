import type { ContentPack, PlaceDef, Stall } from './types';
import { duplicateIds } from './catalog';

/**
 * Checks locations and places (and festival stalls): references resolve and every activity is
 * reachable.
 */
export function validateWorld(pack: ContentPack): string[] {
  const problems: string[] = [];
  const start = pack.locations.find((l) => l.id === pack.startLocationId);
  if (!start) return [`start location "${pack.startLocationId}" does not exist`];
  if (!start.places.some((p) => p.kind === 'home')) problems.push('start location has no home');

  const refs = {
    training: new Set(pack.training.map((t) => t.id)),
    food: new Set(pack.foods.map((f) => f.id)),
    mission: new Set(pack.missions.map((m) => m.id)),
    technique: new Set(pack.techniques.map((t) => t.id)),
    gear: new Set(pack.gear.map((g) => g.id)),
    tool: new Set(pack.tools.map((t) => t.id)),
    ingredient: new Set(pack.ingredients.map((i) => i.id)),
    cookbook: new Set(pack.cookbooks.map((c) => c.id)),
  };
  const reached = {
    training: new Set<string>(),
    food: new Set<string>(),
    mission: new Set<string>(),
    gear: new Set<string>(),
    tool: new Set<string>(),
    ingredient: new Set<string>(),
    cookbook: new Set<string>(),
  };

  for (const location of pack.locations) {
    duplicateIds(location.places).forEach((id) =>
      problems.push(`duplicate place id "${id}" in "${location.id}"`),
    );
  }
  const placeLinks = pack.locations.flatMap((l) =>
    l.places.flatMap((place) => placeRefs(place).map(([kind, id]) => ({ place, kind, id }))),
  );
  const festivalLinks = pack.village.festivals.flatMap((f) =>
    (f.stalls ?? []).flatMap((s) =>
      stallRefs(s).map(([kind, id]) => ({ place: { id: `festival ${f.id}` }, kind, id })),
    ),
  );
  const dropLinks = pack.enemies.flatMap((e) =>
    (e.drops ?? []).map((id) => ({
      place: { id: `enemy ${e.id}` },
      kind: 'ingredient' as const,
      id,
    })),
  );
  for (const { place, kind, id } of [...placeLinks, ...festivalLinks, ...dropLinks]) {
    if (!refs[kind].has(id))
      problems.push(`place "${place.id}" references unknown ${kind} "${id}"`);
    if (kind !== 'technique') reached[kind].add(id);
  }
  // Unique gear is never sold (`validateGear.ts`): it is earned, found or inherited.
  const unique = new Set(pack.gear.filter((g) => g.unique === true).map((g) => g.id));
  // Exam-only missions are run by an exam's stage, never offered (`validateExams.ts`).
  const examOnly = new Set(pack.missions.filter((m) => m.examOnly === true).map((m) => m.id));
  const offered = [
    'training',
    'food',
    'mission',
    'gear',
    'tool',
    'ingredient',
    'cookbook',
  ] as const;
  for (const kind of offered) {
    refs[kind].forEach((id) => {
      if (kind === 'gear' && unique.has(id)) return;
      if (kind === 'mission' && examOnly.has(id)) return;
      if (!reached[kind].has(id)) problems.push(`${kind} "${id}" is not offered at any place`);
    });
  }
  return [...problems, ...visitProblems(pack)];
}

/** A travelling stall's visits must come round: every day or more, on a day of the cycle. */
function visitProblems(pack: ContentPack): string[] {
  return pack.locations
    .flatMap((l) => l.places)
    .flatMap((p) => (p.kind === 'market' ? p.stalls : []))
    .filter(({ visits: v }) => v && !(v.every >= 1 && v.on >= 0 && v.on < v.every))
    .map((s) => `stall "${s.name}" visits on a day its cycle never reaches`);
}

type RefKind =
  'training' | 'food' | 'mission' | 'technique' | 'gear' | 'tool' | 'ingredient' | 'cookbook';

function stallRefs(stall: Stall): [RefKind, string][] {
  return [
    ...stall.foodIds.map((id): [RefKind, string] => ['food', id]),
    ...(stall.ingredientIds ?? []).map((id): [RefKind, string] => ['ingredient', id]),
    ...(stall.cookbookIds ?? []).map((id): [RefKind, string] => ['cookbook', id]),
  ];
}

function placeRefs(place: PlaceDef): [RefKind, string][] {
  switch (place.kind) {
    case 'training':
      return place.trainingIds.map((id) => ['training', id]);
    case 'market':
      return place.stalls.flatMap(stallRefs);
    case 'gear':
      return [
        ...place.gearIds.map((id): [RefKind, string] => ['gear', id]),
        ...(place.toolIds ?? []).map((id): [RefKind, string] => ['tool', id]),
      ];
    case 'tavern':
      return place.foodIds.map((id) => ['food', id]);
    case 'missions':
      return place.missionIds.map((id) => ['mission', id]);
    case 'academy':
    case 'library':
      return place.techniqueIds.map((id) => ['technique', id]);
    case 'wilds':
      return [...place.finds, ...(place.spots ?? []).flatMap((s) => s.catches)].map((f) => [
        'ingredient',
        f.ingredientId,
      ]);
    case 'home':
    case 'hospital':
    case 'inn':
    case 'house':
      return [];
  }
}
