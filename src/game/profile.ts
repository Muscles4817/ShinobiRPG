import { buffAt } from '@/systems/cooking';
import { combine, type ModifierSpec, type Modifiers } from '@/systems/modifiers';
import {
  effectiveLimits,
  limitsFor,
  STAT_IDS,
  type Growth,
  type Limits,
  type StatScale,
} from '@/systems/stats';
import { STANDING_INFO } from '@/systems/profile';
import { ELEMENTS, type Element } from '@/systems/techniques';

import { withoutGrowth } from './aptitude';
import { breakthroughSpec } from './breakthroughs';
import type { GameContext } from './context';
import { hungerEffect } from './hunger';
import { injurySpecs } from './injuries';
import { assignmentSpec } from './sensei/state';
import { soakSpec } from './onsen';
import { notesOf } from './notes';
import { snackBuff } from './snacks';
import type { Character } from './state';

/**
 * Turns a character's identity into growth modifiers. Every source (clan, talent, traits,
 * frame, upbringing, standing, chakra nature, today's meal, a soak, your sensei's assignment, hunger,
 * injuries) contributes a
 * ModifierSpec; the result is their product. Clan and talent growth is not among them: it
 * shaped the character's aptitude when they were made, and aptitude multiplies every growth
 * source. Aptitude also sets each stat's natural limit, which the frame (and later,
 * breakthroughs) move.
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

/** Today's meal's buff, at the quality it was cooked. */
function mealBuff(character: Character, ctx: GameContext): ModifierSpec {
  const recipe = character.meal ? ctx.content.recipes.get(character.meal) : undefined;
  return recipe ? buffAt(recipe.buff, character.mealQuality ?? 'good') : {};
}

export function characterModifiers(character: Character, ctx: GameContext): Modifiers {
  const { content } = ctx;
  const clan = content.clans.get(character.clanId);
  const notes = notesOf(character.talentIds, ctx);
  const traits = character.traitIds.flatMap((id) => content.traits.get(id) ?? []);
  return combine([
    content.builds.get(character.buildId)?.modifiers ?? {},
    content.upbringings.get(character.upbringingId)?.modifiers ?? {},
    breakthroughSpec(character),
    withoutGrowth(clan?.modifiers ?? {}),
    ...notes.map((n) => withoutGrowth(n.modifiers)),
    ...traits.map((t) => t.modifiers),
    STANDING_INFO[character.classStanding].modifiers,
    character.natureKnown ? natureModifiers(character.nature, clan?.nature) : {},
    mealBuff(character, ctx),
    assignmentSpec(character.assignment, character.stats),
    snackBuff(character, ctx),
    soakSpec(character),
    hungerEffect(character.vitals).spec,
    ...injurySpecs(character, ctx),
  ]);
}

/** The energy a piece of hard work (a drill, study, a spar, a lesson) costs you today. */
export function hardWorkEnergy(character: Character, ctx: GameContext, base: number): number {
  return Math.round(base * characterModifiers(character, ctx).energyCost);
}

/** Per-stat growth multipliers for this character right now: aptitude, identity, condition. */
export function trainingScale(character: Character, ctx: GameContext, teacher = 1): StatScale {
  const { growth } = characterModifiers(character, ctx);
  return Object.fromEntries(
    STAT_IDS.map((id) => [id, character.aptitude[id] * growth[id] * teacher]),
  );
}

/** How far each stat can go today: talent, frame and breakthroughs, less any bulk on speed. */
export function naturalLimits(character: Character, ctx: GameContext): Limits {
  const mods = characterModifiers(character, ctx);
  const build = ctx.content.builds.get(character.buildId);
  const limits = limitsFor(character.aptitude, mods.limitBonus);
  return effectiveLimits(limits, character.stats, build?.comfortStrength);
}

/** Everything that shapes this character's growth right now; `teacher` multiplies it. */
export function growthFor(character: Character, ctx: GameContext, teacher = 1): Growth {
  const mods = characterModifiers(character, ctx);
  const build = ctx.content.builds.get(character.buildId);
  return {
    scale: trainingScale(character, ctx, teacher),
    floors: mods.soloFloors,
    limits: limitsFor(character.aptitude, mods.limitBonus),
    ...(build ? { comfortStrength: build.comfortStrength } : {}),
  };
}
