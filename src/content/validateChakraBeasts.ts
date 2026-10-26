import { CHAKRA_BEAST_ARTS } from './shared/bestiary';
import type { ContentPack } from './types';
import { learnableIds } from './techniqueSources';

/**
 * Chakra beasts (`docs/design/chakra-beasts-plan.md`) and their techniques. A chakra beast has
 * chakra and a technique, or it is a plain animal. Its arts are its own: nobody learns them from
 * a shelf, a teacher or a scroll, and no other foe or person fights with them.
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
  const arts = new Set(CHAKRA_BEAST_ARTS.map((t) => t.id));
  const learnable = learnableIds(pack);
  const holders = [
    ...pack.enemies
      .filter((e) => !e.chakraBeast)
      .map((e) => ({ who: `enemy "${e.id}"`, ids: e.techniqueIds })),
    ...pack.people.map((p) => ({
      who: `person "${p.id}"`,
      ids: p.arsenal?.techniqueIds ?? [],
    })),
  ];
  return [
    ...[...arts].filter((id) => learnable.has(id)).map((id) => `beast art "${id}" can be learned`),
    ...holders.flatMap(({ who, ids }) =>
      ids.filter((id) => arts.has(id)).map((id) => `${who} fights with beast art "${id}"`),
    ),
  ];
}
