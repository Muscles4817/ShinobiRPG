import { combine, type ModifierSpec, type Modifiers } from '@/systems/modifiers';
import { STAT_IDS, type Growth, type StatScale } from '@/systems/stats';
import { gradeModifiers } from '@/systems/profile';
import { ELEMENTS, type Element } from '@/systems/techniques';

import { withoutGrowth } from './aptitude';
import type { GameContext } from './context';
import { hungerEffect } from './hunger';
import { injurySpecs } from './injuries';
import type { Character } from './state';

/**
 * Turns a character's identity into growth modifiers. Every source (clan, talent, traits,
 * academy grades, chakra nature, today's meal, hunger, injuries) contributes a ModifierSpec;
 * the result is their product. Clan and talent growth is not among them: it shaped the
 * character's aptitude when they were made, and aptitude multiplies every growth source.
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
    withoutGrowth(clan?.modifiers ?? {}),
    withoutGrowth(talent?.modifiers ?? {}),
    ...traits.map((t) => t.modifiers),
    gradeModifiers(character.grades),
    natureModifiers(character.nature, clan?.nature),
    (character.meal ? content.recipes.get(character.meal)?.buff : undefined) ?? {},
    hungerEffect(character.vitals).spec,
    ...injurySpecs(character, ctx),
  ]);
}

/** Per-stat growth multipliers for this character right now: aptitude, identity, condition. */
export function trainingScale(character: Character, ctx: GameContext, teacher = 1): StatScale {
  const { growth } = characterModifiers(character, ctx);
  return Object.fromEntries(
    STAT_IDS.map((id) => [id, character.aptitude[id] * growth[id] * teacher]),
  );
}

/** Everything that shapes this character's growth right now; `teacher` multiplies it. */
export function growthFor(character: Character, ctx: GameContext, teacher = 1): Growth {
  return {
    scale: trainingScale(character, ctx, teacher),
    floors: characterModifiers(character, ctx).soloFloors,
  };
}
