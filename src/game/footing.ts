import type { EnemyDef, PersonRank } from '@/content';
import type { CombatPerk } from '@/systems/combat';
import { dangerAtLeast } from '@/systems/missions';

import type { GameContext } from './context';
import type { GameState } from './state';
import { canWalk } from './walking';

/**
 * Walking on water and up trees, as a fight sees it (perks that keep a fighter's footing on a
 * lake, or let them fight from the trees: the combat system's `rules/ground.ts`). You walk on
 * what you've mastered (`walking.ts`); anyone ranked chūnin or above has long since learned
 * both, and so has any foe dangerous enough to be trusted only to them.
 */

const WALKING: readonly CombatPerk[] = ['water-walking', 'tree-walking'];

/** The surfaces you walk on, as perks. */
export function playerWalking(state: GameState, ctx: GameContext): CombatPerk[] {
  return [
    ...(canWalk(state, ctx, 'water') ? ['water-walking' as const] : []),
    ...(canWalk(state, ctx, 'trees') ? ['tree-walking' as const] : []),
  ];
}

/** A person walks on both from chūnin up. */
export function walkingByRank(rank: PersonRank): CombatPerk[] {
  return rank === 'chunin' || rank === 'jonin' || rank === 'kage' ? [...WALKING] : [];
}

/** A foe walks on both when it is deadly or worse. */
export function enemyWalking(def: Pick<EnemyDef, 'danger'>): CombatPerk[] {
  return dangerAtLeast(def.danger, 'deadly') ? [...WALKING] : [];
}
