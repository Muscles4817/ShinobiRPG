import { tagsOf } from '@/systems/combat';
import type { TechniqueDef, Verb } from '@/systems/techniques';

import type { ContentPack } from './types';

/**
 * Every technique says how it works (`systems/techniques/tags.ts`): it reads to a way of reaching
 * its target, one that hurts or hinders reads to what it does when it lands, and a technique that
 * only follows another names one the pack has.
 */
/** Verbs that hurt or hinder a foe. */
const AT_A_FOE: ReadonlySet<Verb> = new Set([
  'damage',
  'area',
  'break',
  'daze',
  'seal',
  'pin',
  'confuse',
  'knock',
  'drain',
  'afflict',
  'trap',
]);

function atAFoe(t: TechniqueDef): boolean {
  return t.effects.some((e) => AT_A_FOE.has(e.verb));
}

export function validateTags(pack: ContentPack): string[] {
  const ids = new Set(pack.techniques.map((t) => t.id));
  return pack.techniques.flatMap((t) => {
    const tags = tagsOf(t);
    const problems: string[] = [];
    if (tags.delivery.length === 0) problems.push(`technique "${t.id}" has no delivery`);
    if (atAFoe(t) && tags.lands.length === 0) {
      problems.push(`technique "${t.id}" hurts or hinders but lands as nothing`);
    }
    const follows = tags.execution.follows;
    if (follows !== undefined && !ids.has(follows)) {
      problems.push(`technique "${t.id}" follows unknown technique "${follows}"`);
    }
    return problems;
  });
}
