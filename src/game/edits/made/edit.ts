import type { GameContext } from '../../context';
import type { ContentEdits, FighterEdit } from '../state';
import { draftOf, draftProblems, madeTechnique, type TechniqueDraft } from './draft';
import { madeIdFor } from './ids';

/**
 * Keeping and dropping techniques made in the editor. A kept technique joins the pack's at once
 * (`withEdits`), so the fighter editor offers it and versus fights with it, and one marked taught
 * is shelved in the home village; dropping one takes it from every fighter who was given it and
 * off the shelf, so no one is left holding a technique that is gone.
 */

/** The edits with the techniques taught set, the list left out when it is empty. */
function withTaughtIds(edits: ContentEdits, taught: readonly string[]): ContentEdits {
  const { taught: _was, ...rest } = edits;
  return taught.length > 0 ? { ...rest, taught } : rest;
}

export interface KeptTechnique {
  readonly edits: ContentEdits;
  readonly id: string;
}

/**
 * The edits with a draft kept: as a new technique (no id yet) or in place of the one it was
 * made from. Null when the draft isn't ready (`draftProblems`).
 */
export function keepTechnique(
  ctx: GameContext,
  draft: TechniqueDraft,
  id: string | null,
): KeptTechnique | null {
  if (draftProblems(draft).length > 0) return null;
  const made = ctx.edits.techniques ?? {};
  const keptId =
    id ?? madeIdFor(draft.name, (t) => t in made || ctx.content.techniques.get(t) !== undefined);
  const techniques = { ...made, [keptId]: madeTechnique(draft, keptId) };
  const others = (ctx.edits.taught ?? []).filter((t) => t !== keptId);
  const taught = draft.taught ? [...others, keptId] : others;
  return { edits: withTaughtIds({ ...ctx.edits, techniques }, taught), id: keptId };
}

/** A kept technique back in its form, whether it is taught included; null for one not kept. */
export function madeDraft(edits: ContentEdits, id: string): TechniqueDraft | null {
  const def = edits.techniques?.[id];
  return def ? { ...draftOf(def), taught: edits.taught?.includes(id) === true } : null;
}

/** A fighter's edit without a technique; their list left empty goes back to the pack's. */
function without(edit: FighterEdit, id: string): FighterEdit | null {
  if (!edit.techniqueIds?.includes(id)) return edit;
  const techniqueIds = edit.techniqueIds.filter((t) => t !== id);
  const { techniqueIds: _was, ...rest } = edit;
  const next = techniqueIds.length > 0 ? { ...rest, techniqueIds } : rest;
  return Object.keys(next).length > 0 ? next : null;
}

/** The edits with a made technique gone, and gone from every fighter who had it. */
export function dropTechnique(edits: ContentEdits, id: string): ContentEdits {
  const { [id]: _gone, ...techniques } = edits.techniques ?? {};
  const fighters = Object.entries(edits.fighters).flatMap(([key, edit]) => {
    const kept = without(edit, id);
    return kept ? [[key, kept] as const] : [];
  });
  const taught = (edits.taught ?? []).filter((t) => t !== id);
  return withTaughtIds({ fighters: Object.fromEntries(fighters), techniques }, taught);
}

/** The edits with every fighter back as the pack writes them; made techniques are kept. */
export function resetFighters(edits: ContentEdits): ContentEdits {
  return { ...edits, fighters: {} };
}
