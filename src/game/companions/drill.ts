import type { CompanionKindDef } from '@/content';
import type { Companion } from '@/systems/companions';
import { applyTraining, type StatId, type Stats } from '@/systems/stats';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { companionGrowth } from './routine';

/**
 * A companion drilled in one skill by a handler (`docs/design/retinue-plan.md`). A handler's rule
 * is its own, not the teacher rule between people: how well they handle it, never their own
 * grade in the skill. Any session keeps at least a D-grade pace through B (`OWNER_HANDLING`), and
 * its work is multiplied by the handler's quality: yours (better for each piece of handling lore
 * read), a kennel master's or a clan handler's.
 */

/** A session's work in the chosen skill, before talent, handling and limits. */
const SESSION_GAIN = 1.5;
/** How well an owner handles it: the least a session is worth, whatever the skill's grade. */
const OWNER_HANDLING = 0.4;
const HANDLED_THROUGH = 'B';

/** How much better than a plain owner you handle, for the lore you have read. */
export function ownerHandling(state: GameState, ctx: GameContext): number {
  return state.companions.lore.reduce(
    (quality, id) => quality * (ctx.content.companionLore.get(id)?.handling ?? 1),
    1,
  );
}

/** Its stats after a session in a skill at this quality of handling (1 a plain owner). */
export function drilledStats(
  companion: Companion,
  kind: CompanionKindDef,
  seed: number,
  drill: { readonly stat: StatId; readonly quality: number },
): Stats {
  const handled = [{ throughGrade: HANDLED_THROUGH, floor: OWNER_HANDLING }] as const;
  const growth = { ...companionGrowth(companion, kind, seed), floors: { [drill.stat]: handled } };
  return applyTraining(companion.stats, { [drill.stat]: SESSION_GAIN * drill.quality }, growth);
}
