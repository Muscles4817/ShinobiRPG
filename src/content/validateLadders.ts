import {
  highestReachable,
  ladderStepProblem,
  LADDERS,
  type LadderId,
  type TechniqueDef,
} from '@/systems/techniques';

import type { ContentPack } from './types';

/**
 * Ladders in a pack (`systems/techniques/ladders.ts`): every step a technique needs open is a
 * real step, and can be climbed to by the pack's openings, each within reach of the last; and
 * anyone whose arsenal holds a technique that needs a step holds the openings that climb there
 * (else they'd carry a technique they could never use).
 */
export function validateLadders(pack: ContentPack): string[] {
  return [
    ...pack.techniques.flatMap((t) => stepProblems(pack.techniques, t, 'the pack')),
    ...pack.people.flatMap((person) => {
      const ids = person.arsenal?.techniqueIds ?? [];
      const kit = pack.techniques.filter((t) => ids.includes(t.id));
      return kit.flatMap((t) => stepProblems(kit, t, `person "${person.id}"`));
    }),
  ];
}

function openingSteps(techniques: readonly TechniqueDef[], ladder: LadderId): number[] {
  return techniques.flatMap((t) =>
    t.effects.flatMap((e) =>
      e.verb === 'empower' && e.opens?.ladder === ladder ? [e.opens.step] : [],
    ),
  );
}

function stepProblems(among: readonly TechniqueDef[], t: TechniqueDef, who: string): string[] {
  const needs = t.needsOpen;
  if (!needs) return [];
  const wrong = ladderStepProblem(needs);
  if (wrong) return who === 'the pack' ? [`technique "${t.id}" needs ${wrong}`] : [];
  const ladders: readonly string[] = LADDERS;
  if (!ladders.includes(needs.ladder)) return [];
  const top = highestReachable(openingSteps(among, needs.ladder));
  return top >= needs.step
    ? []
    : [`${who} can't open the ${needs.ladder} to step ${needs.step} that "${t.id}" needs`];
}
