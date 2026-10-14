import type { IconId, RecipeDef } from '@/content';
import { cookingGrade, gradeProgress, masteryOf, timesCooked } from '@/systems/cooking';
import { describeSpec, type EffectLine } from '@/systems/modifiers';
import type { StatGrade } from '@/systems/stats';
import { stageForPair } from '@/systems/bonds';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { provisionLine } from './provisions';
import { METHOD_WORDS } from './stove';

/**
 * Your cookbook: your cooking grade, the dishes you know (how well, and what each does), and the
 * rest as sealed entries that say where they can be learned.
 */

const MASTERY_WORDS = { new: 'New', practised: 'Practised', mastered: 'Mastered' } as const;

export interface CookbookEntry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: IconId;
  readonly rank: StatGrade;
  /** How it's cooked, e.g. "Simmered". */
  readonly method: string;
  /** What eating it does: as you eat, then for the rest of the day. */
  readonly effects: readonly EffectLine[];
  /** "New", "Practised" or "Mastered". */
  readonly mastery: string;
  readonly timesCooked: number;
}

export interface SealedRecipe {
  readonly id: string;
  readonly name: string;
  readonly rank: StatGrade;
  /** Where it can be learned, e.g. "Taught by Tsune once you are friends". */
  readonly hints: readonly string[];
}

export interface CookbookView {
  readonly grade: StatGrade;
  /** Through the current grade, 0–1. */
  readonly progress: number;
  readonly known: readonly CookbookEntry[];
  readonly sealed: readonly SealedRecipe[];
  readonly total: number;
}

/** Everything a dish does, worded for chips: health and chakra as you eat it, then its buff. */
export function mealEffects(recipe: RecipeDef): EffectLine[] {
  return [
    ...(recipe.health ? [{ label: `Health +${recipe.health}`, tone: 'gain' as const }] : []),
    ...(recipe.chakra ? [{ label: `Chakra +${recipe.chakra}`, tone: 'gain' as const }] : []),
    ...describeSpec(recipe.buff),
    ...provisionLine(recipe.provision),
  ];
}

/** Every grocer in the pack that stocks this cookbook, by stall name. */
function bookSellers(ctx: GameContext, cookbookId: string): string[] {
  return ctx.content.locations.all.flatMap((l) =>
    l.places.flatMap((p) =>
      p.kind === 'market'
        ? p.stalls.filter((s) => s.cookbookIds?.includes(cookbookId)).map((s) => s.name)
        : [],
    ),
  );
}

/** Where a recipe can be learned: books on sale, people who teach it, jobs that reward it. */
function hintsFor(ctx: GameContext, recipeId: string): string[] {
  const { content } = ctx;
  const books = content.cookbooks.all
    .filter((b) => b.recipeIds.includes(recipeId))
    .map((b) => {
      const [seller] = bookSellers(ctx, b.id);
      return seller ? `In ${b.name}, sold at ${seller}` : `In ${b.name}`;
    });
  const people = content.people.all.flatMap((p) =>
    (p.recipes ?? [])
      .filter((l) => l.recipeId === recipeId)
      .map((l) => `${p.name} teaches it once you are ${stageForPair(l.minStage)}`),
  );
  const jobs = content.missions.all
    .filter((m) => m.reward.recipeId === recipeId)
    .map((m) => `A client’s thanks for “${m.title}”`);
  return [...books, ...people, ...jobs];
}

export function cookbookView(state: GameState, ctx: GameContext): CookbookView {
  const { cooking } = state;
  const all = ctx.content.recipes.all;
  const isKnown = (r: RecipeDef) => cooking.known[r.id] !== undefined;
  return {
    grade: cookingGrade(cooking.xp),
    progress: gradeProgress(cooking.xp),
    known: all.filter(isKnown).map((r) => {
      const times = timesCooked(cooking, r.id);
      return {
        id: r.id,
        name: r.name,
        description: r.description,
        icon: r.icon,
        rank: r.rank,
        method: METHOD_WORDS[r.method],
        effects: mealEffects(r),
        mastery: MASTERY_WORDS[masteryOf(times)],
        timesCooked: times,
      };
    }),
    sealed: all
      .filter((r) => !isKnown(r))
      .map((r) => ({ id: r.id, name: r.name, rank: r.rank, hints: hintsFor(ctx, r.id) })),
    total: all.length,
  };
}
