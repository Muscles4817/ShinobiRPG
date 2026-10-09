import type { ContentPack, PlaceDef } from './types';
import { duplicateIds } from './catalog';

/** Checks locations and places: references resolve and every activity is reachable. */
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
  };
  const reached = {
    training: new Set<string>(),
    food: new Set<string>(),
    mission: new Set<string>(),
  };

  for (const location of pack.locations) {
    duplicateIds(location.places).forEach((id) =>
      problems.push(`duplicate place id "${id}" in "${location.id}"`),
    );
  }
  const placeLinks = pack.locations.flatMap((l) =>
    l.places.flatMap((place) => placeRefs(place).map(([kind, id]) => ({ place, kind, id }))),
  );
  for (const { place, kind, id } of placeLinks) {
    if (!refs[kind].has(id))
      problems.push(`place "${place.id}" references unknown ${kind} "${id}"`);
    if (kind !== 'technique') reached[kind].add(id);
  }
  for (const kind of ['training', 'food', 'mission'] as const) {
    refs[kind].forEach((id) => {
      if (!reached[kind].has(id)) problems.push(`${kind} "${id}" is not offered at any place`);
    });
  }
  return problems;
}

type RefKind = 'training' | 'food' | 'mission' | 'technique';

function placeRefs(place: PlaceDef): [RefKind, string][] {
  switch (place.kind) {
    case 'training':
      return place.trainingIds.map((id) => ['training', id]);
    case 'market':
      return place.stalls.flatMap((s) => s.foodIds.map((id): [RefKind, string] => ['food', id]));
    case 'missions':
      return place.missionIds.map((id) => ['mission', id]);
    case 'academy':
      return place.techniqueIds.map((id) => ['technique', id]);
    case 'home':
    case 'hospital':
      return [];
  }
}
