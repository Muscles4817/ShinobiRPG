import { clamp } from '@/core';
import type { StatId } from '@/systems/stats';

import type { GameContext } from '../context';
import { originalFighter } from './originals';
import type { ContentEdits, FighterEdit } from './state';

/**
 * Changing a fighter: each change is kept only where it differs from the pack, so setting a
 * stat back to the pack's value, or the techniques back to the pack's list, clears that edit,
 * and a fighter with nothing left changed drops out of the edits.
 */

/** The range the editor allows a stat (S begins at 40). */
export const EDIT_STAT_MIN = 0;
export const EDIT_STAT_MAX = 60;

function withFighter(edits: ContentEdits, key: string, edit: FighterEdit): ContentEdits {
  const { [key]: _old, ...rest } = edits.fighters;
  const empty = !edit.stats && !edit.techniqueIds;
  return { fighters: empty ? rest : { ...rest, [key]: edit } };
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/** The edits with one of a fighter's stats set; unchanged for someone the pack doesn't have. */
export function editStat(ctx: GameContext, key: string, stat: StatId, value: number): ContentEdits {
  const edits = ctx.edits;
  const original = originalFighter(ctx, key);
  if (!original) return edits;
  const old = edits.fighters[key] ?? {};
  const set = clamp(value, EDIT_STAT_MIN, EDIT_STAT_MAX);
  const { [stat]: _was, ...others } = old.stats ?? {};
  const stats = set === original.stats[stat] ? others : { ...others, [stat]: set };
  const { stats: _stats, ...rest } = old;
  return withFighter(edits, key, Object.keys(stats).length > 0 ? { ...rest, stats } : rest);
}

/**
 * The edits with what a fighter fights with replaced; an empty list is refused (with nothing
 * at all they couldn't fight), as is someone the pack doesn't have.
 */
export function editTechniques(
  ctx: GameContext,
  key: string,
  techniqueIds: readonly string[],
): ContentEdits {
  const edits = ctx.edits;
  const original = originalFighter(ctx, key);
  if (!original || techniqueIds.length === 0) return edits;
  const { techniqueIds: _was, ...rest } = edits.fighters[key] ?? {};
  const same = sameList(techniqueIds, original.techniqueIds);
  return withFighter(edits, key, same ? rest : { ...rest, techniqueIds });
}

/** The edits with a fighter back as the pack wrote them. */
export function resetFighter(edits: ContentEdits, key: string): ContentEdits {
  return withFighter(edits, key, {});
}
