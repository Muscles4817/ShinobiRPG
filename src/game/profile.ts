import { round1 } from '@/core';
import { combine, studyMultiplier, type ModifierSpec, type Modifiers } from '@/systems/modifiers';
import { STAT_IDS, type StatScale } from '@/systems/stats';
import { gradeModifiers } from '@/systems/profile';
import { ELEMENTS, studyPoints, type Element, type TechniqueDef } from '@/systems/techniques';

import type { GameContext } from './context';
import { hungerEffect } from './hunger';
import type { Character } from './state';

/**
 * Turns a character's identity into growth modifiers. Every source (clan, talent, traits,
 * academy grades, chakra nature, today's meal, hunger) contributes a ModifierSpec; the result
 * is their product.
 */

/** Techniques of your own nature are learned this much faster; others a little slower. */
const NATURE_AFFINITY = 1.5;
const OTHER_NATURES = 0.85;
/** Extra bonus when your nature matches your clan's. */
const CLAN_NATURE_BONUS = 1.2;

export function natureModifiers(nature: Element, clanNature: Element | undefined): ModifierSpec {
  const studyElement = Object.fromEntries(
    ELEMENTS.map((e) => [e, e === nature ? NATURE_AFFINITY : OTHER_NATURES]),
  ) as Record<Element, number>;
  if (clanNature === nature) studyElement[nature] *= CLAN_NATURE_BONUS;
  return { studyElement };
}

export function characterModifiers(character: Character, ctx: GameContext): Modifiers {
  const { content } = ctx;
  const clan = content.clans.get(character.clanId);
  const talent = character.talentId ? content.talents.get(character.talentId) : undefined;
  const traits = character.traitIds.flatMap((id) => content.traits.get(id) ?? []);
  return combine([
    clan?.modifiers ?? {},
    talent?.modifiers ?? {},
    ...traits.map((t) => t.modifiers),
    gradeModifiers(character.grades),
    natureModifiers(character.nature, clan?.nature),
    (character.meal ? content.recipes.get(character.meal)?.buff : undefined) ?? {},
    hungerEffect(character.vitals).spec,
  ]);
}

/** Per-stat training multipliers for this character right now (hunger included). */
export function trainingScale(character: Character, ctx: GameContext): StatScale {
  const { growth } = characterModifiers(character, ctx);
  return Object.fromEntries(STAT_IDS.map((id) => [id, growth[id]]));
}

/** Study points one session earns towards a technique, after clan, talent and nature. */
export function studyPointsFor(character: Character, def: TechniqueDef, ctx: GameContext): number {
  const mods = characterModifiers(character, ctx);
  return round1(
    studyPoints(character.stats, def) * studyMultiplier(mods, def.discipline, def.element),
  );
}
