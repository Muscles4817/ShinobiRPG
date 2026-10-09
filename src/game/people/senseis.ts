import type { PersonDef } from '@/content';
import { GRADE_INFO } from '@/systems/profile';
import { STAT_INFO } from '@/systems/stats';

import type { GameContext } from '../context';

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
  const grade = GRADE_INFO[character.grades[profile.specialty]].statBonus;
  const shared = profile.favouredTraits.filter((t) => character.traitIds.includes(t)).length;
  const nature = profile.nature === character.nature ? NATURE_MATCH : 0;
  return grade * GRADE_WEIGHT + shared * SHARED_TRAIT_WEIGHT + nature;
}

/** The senseis to offer, best fit first. Ties keep the pack's order. */
export function offerSenseis(character: Character, people: readonly PersonDef[]): string[] {
  const ranked = people
    .filter((p) => p.sensei !== undefined)
    .map((p) => ({ p, fit: senseiFit(character, p) }))
    .sort((a, b) => b.fit - a.fit)
    .map(({ p }) => p);
  const offers: PersonDef[] = [];
  for (const sensei of ranked) {
    if (offers.length >= SENSEI_OFFERS) break;
    if (!offers.some((o) => o.sensei?.specialty === sensei.sensei?.specialty)) offers.push(sensei);
  }
  return offers.map((p) => p.id);
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
    profile.nature === character.nature && `Shares your ${profile.nature} nature`,
  ];
  const found = reasons.filter((r): r is string => typeof r === 'string');
  return found.length > 0 ? found : ['Saw something in you nobody else did'];
}
