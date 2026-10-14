import { STAT_GRADES, statTier, type StatGrade } from '@/systems/stats';
import type { WalkSurface } from '@/systems/travel';

import type { GameContext } from './context';
import type { GameState } from './state';

/**
 * Whether a character can walk on water or up trees with chakra: the one place the game asks.
 *
 * Stand-in: until milestone 3 makes tree- and water-walking milestones learned by drill, the
 * answer is a chakra control grade. Replace this file's rule with the milestone when it lands;
 * nothing else reads chakra control for walking.
 */

/** Chakra control grade that stands in for tree-walking. */
export const TREE_WALKING_GRADE: StatGrade = 'D';
/** Chakra control grade that stands in for water-walking. */
export const WATER_WALKING_GRADE: StatGrade = 'C';

const WALKING: Readonly<Record<WalkSurface, { readonly name: string; readonly grade: StatGrade }>> =
  {
    trees: { name: 'tree-walking', grade: TREE_WALKING_GRADE },
    water: { name: 'water-walking', grade: WATER_WALKING_GRADE },
  };

/** Can this character walk on `surface`? (`ctx` is for the milestone that replaces the rule.) */
export function canWalk(state: GameState, _ctx: GameContext, surface: WalkSurface): boolean {
  const grade = statTier(state.character.stats.chakraControl).grade;
  return STAT_GRADES.indexOf(grade) >= STAT_GRADES.indexOf(WALKING[surface].grade);
}

/** What walking on `surface` takes, as a phrase after "needs": "water-walking: chakra control at grade C". */
export function walkingTakes(surface: WalkSurface): string {
  const { name, grade } = WALKING[surface];
  return `${name}: chakra control at grade ${grade}`;
}
