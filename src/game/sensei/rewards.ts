import type { GearDef, PersonDef, SenseiReward } from '@/content';
import { pronounForms } from '@/core';
import { addPoints } from '@/systems/bonds';
import { learnRecipes, knowsRecipe } from '@/systems/cooking';
import { addGear, owns } from '@/systems/inventory';
import type { JournalChip } from '@/systems/journal';

import type { GameContext } from '../context';
import { adjust } from '../ops';
import { bondOf } from '../people/cast';
import { pronounsOf } from '../people/pronouns';
import { teachSignature } from '../people/signatures';
import { teachingOf } from '../people/teachers';
import { warmed } from '../people/warmth';
import type { GameState } from '../state';
import { waysOf } from './generate';

/**
 * What your sensei gives for an assignment done, in the order they like to give it: praise
 * (bond; their verdict says it, `coaching.ts`), a step on their next signature, a piece of gear for their art, their favourite
 * recipe, or a meal on them. A reward they can't give (nothing left to teach, you own the
 * gear, you know the dish) falls to the next.
 */

export const PRAISE_BOND = 6;
/** Hunger a meal on your sensei takes away. */
export const SENSEI_MEAL_SATIETY = 50;

export interface Given {
  readonly kind: SenseiReward;
  readonly state: GameState;
  /** What they do, as narration; none for praise, which is the verdict itself. */
  readonly line: string | null;
  /** What was given, by name, for the farewell's words. */
  readonly gift: string;
  readonly chip: JournalChip;
}

/** A piece fit for the sensei's art: a blade, knuckles, or a focus for it; the cheapest. */
function giftGear(state: GameState, ctx: GameContext, sensei: PersonDef): GearDef | null {
  const art = sensei.sensei?.specialty;
  const fits = (g: GearDef): boolean => {
    if (g.kind === 'weapon') {
      return (
        (art === 'kenjutsu' && g.shape === 'blade') ||
        (art === 'taijutsu' && g.shape === 'knuckles')
      );
    }
    return g.kind === 'focus' && 'discipline' in g.boosts && g.boosts.discipline === art;
  };
  const shelf = ctx.content.gear.all.filter(
    (g) => g.unique !== true && (g.rank === 'D' || g.rank === 'C') && fits(g),
  );
  return (
    [...shelf].sort((a, b) => a.cost - b.cost).find((g) => !owns(state.inventory, g.id)) ?? null
  );
}

function praise(state: GameState, ctx: GameContext, sensei: PersonDef): Given {
  const bond = warmed(state, ctx, PRAISE_BOND, sensei);
  const bonds = { ...state.people.bonds, [sensei.id]: addPoints(bondOf(state, sensei.id), bond) };
  return {
    kind: 'praise',
    state: { ...state, people: { ...state.people, bonds } },
    line: null,
    gift: 'their word',
    chip: { label: `+${bond} bond`, tone: 'gain' },
  };
}

function signature(state: GameState, ctx: GameContext, sensei: PersonDef): Given | null {
  const teaching = teachingOf(state, sensei);
  const taught = teaching && teachSignature(state, ctx, teaching);
  if (!taught) return null;
  const label = taught.mastered ? `${taught.name} mastered` : `${taught.name} ${taught.percent}%`;
  return {
    kind: 'signature',
    state: { ...state, techniques: taught.book },
    line: `Afterwards ${sensei.name} shows you a little more of ${taught.name}.`,
    gift: taught.name,
    chip: { label, tone: 'gain' },
  };
}

function gear(state: GameState, ctx: GameContext, sensei: PersonDef): Given | null {
  const piece = giftGear(state, ctx, sensei);
  if (!piece) return null;
  return {
    kind: 'gear',
    state: { ...state, inventory: addGear(state.inventory, piece.id) },
    line: `${sensei.name} hands you ${piece.name}, better than anything you own, and won’t be thanked for it.`,
    gift: piece.name,
    chip: { label: piece.name, tone: 'gain' },
  };
}

function recipe(state: GameState, ctx: GameContext, sensei: PersonDef): Given | null {
  const id = sensei.favouriteRecipeId;
  const dish = id ? ctx.content.recipes.get(id) : undefined;
  if (!dish || knowsRecipe(state.cooking, dish.id)) return null;
  const forms = pronounForms(pronounsOf(sensei));
  return {
    kind: 'recipe',
    state: { ...state, cooking: learnRecipes(state.cooking, [dish.id]) },
    line: `${sensei.name} writes out how ${forms.they} make${forms.s} ${dish.name} and gives it to you to keep.`,
    gift: dish.name,
    chip: { label: `Recipe: ${dish.name}`, tone: 'gain' },
  };
}

function meal(state: GameState, _ctx: GameContext, sensei: PersonDef): Given {
  return {
    kind: 'meal',
    state: adjust(state, { satiety: SENSEI_MEAL_SATIETY }),
    line: `Afterwards ${sensei.name} takes you out to eat, and won’t hear of you paying.`,
    gift: 'a meal',
    chip: { label: `A meal on ${pronounForms(pronounsOf(sensei)).them}`, tone: 'gain' },
  };
}

type Giver = (state: GameState, ctx: GameContext, sensei: PersonDef) => Given | null;

const GIVERS: Readonly<Record<SenseiReward, Giver>> = { praise, signature, gear, recipe, meal };

/** The first reward this sensei can give you now; praise if nothing else is left. */
export function rewardFor(state: GameState, ctx: GameContext, sensei: PersonDef): Given {
  for (const kind of waysOf(sensei)?.rewards ?? []) {
    const given = GIVERS[kind](state, ctx, sensei);
    if (given) return given;
  }
  return praise(state, ctx, sensei);
}
