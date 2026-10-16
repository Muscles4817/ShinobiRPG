import type { PersonDef } from '@/content';
import { GRADE_INFO } from '@/systems/profile';
import { STAT_INFO } from '@/systems/stats';

import type { GameContext } from '../context';

import { knownNature } from '../nature';
import type { Character } from '../state';

/**
 * Which jōnin ask for your team. Each sensei is scored on how well you fit their teaching:
 * your grade in their specialty, shared traits, and a matching chakra nature. The best fit
 * is offered alongside the best fit with a different specialty, so the choice is real.
 */

const GRADE_WEIGHT = 2;
const SHARED_TRAIT_WEIGHT = 2;
const NATURE_MATCH = 1;
export const SENSEI_OFFERS = 2;

export function senseiFit(character: Character, sensei: PersonDef): number {
  const profile = sensei.sensei;
  if (!profile) return Number.NEGATIVE_INFINITY;
  const grade = GRADE_INFO[character.grades[profile.specialty]].regard;
  const shared = profile.favouredTraits.filter((t) => character.traitIds.includes(t)).length;
  const nature = profile.nature === knownNature(character) ? NATURE_MATCH : 0;
  return grade * GRADE_WEIGHT + shared * SHARED_TRAIT_WEIGHT + nature;
}

/**
 * The senseis to offer, best fit first. Ties keep the pack's order. The second is the best fit
 * in another art from the other side of the roster: someone new (a generated sensei, `pooled`)
 * beside one of the pack's own, or the other way round, so every save may meet someone new.
 */
export function offerSenseis(character: Character, people: readonly PersonDef[]): string[] {
  const ranked = people
    .filter((p) => p.sensei !== undefined && p.sensei.offered !== false)
    .map((p) => ({ p, fit: senseiFit(character, p) }))
    .sort((a, b) => b.fit - a.fit)
    .map(({ p }) => p);
  const [best] = ranked;
  if (!best) return [];
  const otherArt = ranked.filter((s) => s.sensei?.specialty !== best.sensei?.specialty);
  const isNew = (p: PersonDef) => p.sensei?.pooled !== undefined;
  const second = otherArt.find((s) => isNew(s) !== isNew(best)) ?? otherArt[0];
  return [best, ...(second ? [second] : [])].slice(0, SENSEI_OFFERS).map((p) => p.id);
}

/** Why a sensei asked for you, in words, best reason first. */
export function fitReasons(character: Character, sensei: PersonDef, ctx: GameContext): string[] {
  const profile = sensei.sensei;
  if (!profile) return [];
  const grade = character.grades[profile.specialty];
  const shared = profile.favouredTraits
    .filter((t) => character.traitIds.includes(t))
    .map((t) => ctx.content.traits.get(t)?.name ?? t);
  const reasons = [
    (grade === 'A' || grade === 'B') && `Your ${grade} in ${STAT_INFO[profile.specialty].label}`,
    shared.length > 0 && `Likes that you are ${shared.join(' and ').toLowerCase()}`,
    profile.nature === knownNature(character) && `Shares your ${profile.nature} nature`,
  ];
  const found = reasons.filter((r): r is string => typeof r === 'string');
  return found.length > 0 ? found : ['Saw something in you nobody else did'];
}
