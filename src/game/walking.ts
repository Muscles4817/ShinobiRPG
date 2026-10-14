import type { ExerciseDef } from '@/content';
import type { WalkSurface } from '@/systems/travel';

import type { GameContext } from './context';
import { hasMastered } from './exercises';
import type { GameState } from './state';

/**
 * Whether a character can walk on water or up trees with chakra: the one place the game asks.
 * It is the control exercise for that surface, mastered (`exercises.ts`); a pack without one
 * has no way across.
 */

const SURFACE_WORDS: Readonly<Record<WalkSurface, string>> = {
  trees: 'walking up trees',
  water: 'walking on water',
};

function exerciseFor(ctx: GameContext, surface: WalkSurface): ExerciseDef | undefined {
  return ctx.content.exercises.all.find((e) => e.walk === surface);
}

/** Can this character walk on `surface`? */
export function canWalk(state: GameState, ctx: GameContext, surface: WalkSurface): boolean {
  const exercise = exerciseFor(ctx, surface);
  return exercise !== undefined && hasMastered(state, exercise);
}

/** What walking on `surface` takes, as a phrase after "needs": "water-walking". */
export function walkingTakes(ctx: GameContext, surface: WalkSurface): string {
  return exerciseFor(ctx, surface)?.name.toLowerCase() ?? SURFACE_WORDS[surface];
}
