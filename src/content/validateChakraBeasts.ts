import { beastArtIds, learnableIds } from './techniqueSources';
import type { ContentPack } from './types';

/**
 * Chakra beasts (`docs/design/chakra-beasts-plan.md`) and their arts. A chakra beast has chakra
 * and a technique, or it is a plain animal. Its arts are its own: nobody learns them from a
 * shelf, a teacher or a scroll, no other foe or person fights with them, and each is some
 * chakra beast's.
 */
export function validateChakraBeasts(pack: ContentPack): string[] {
  return [...beastProblems(pack), ...artProblems(pack)];
}

function beastProblems(pack: ContentPack): string[] {
  return pack.enemies
    .filter((e) => e.chakraBeast)
    .flatMap((e) =>
      e.maxChakra > 0 && e.techniqueIds.length > 0
        ? []
        : [`chakra beast "${e.id}" has no chakra or no technique, so it is a plain animal`],
    );
}

function artProblems(pack: ContentPack): string[] {
  const arts = beastArtIds(pack);
  const learnable = learnableIds(pack);
  const held = new Set(pack.enemies.filter((e) => e.chakraBeast).flatMap((e) => e.techniqueIds));
  const others = [
    ...pack.enemies
      .filter((e) => !e.chakraBeast)
      .map((e) => ({ who: `enemy "${e.id}"`, ids: e.techniqueIds })),
    ...pack.people.map((p) => ({ who: `person "${p.id}"`, ids: p.arsenal?.techniqueIds ?? [] })),
  ];
  return [
    ...[...arts].filter((id) => learnable.has(id)).map((id) => `beast art "${id}" can be learned`),
    ...[...arts].filter((id) => !held.has(id)).map((id) => `no chakra beast holds "${id}"`),
    ...others.flatMap(({ who, ids }) =>
      ids.filter((id) => arts.has(id)).map((id) => `${who} fights with beast art "${id}"`),
    ),
  ];
}
