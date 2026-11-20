import type { GameContext } from '../../context';
import type { ContentEdits, FighterEdit } from '../state';
import { draftProblems, madeTechnique, type TechniqueDraft } from './draft';
import { madeIdFor } from './ids';

/**
 * Keeping and dropping techniques made in the editor. A kept technique joins the pack's at once
 * (`withEdits`), so the fighter editor offers it and versus fights with it; dropping one takes
 * it from every fighter who was given it, so no one is left holding a technique that is gone.
 */

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
  return { edits: { ...ctx.edits, techniques }, id: keptId };
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
  return { fighters: Object.fromEntries(fighters), techniques };
}

/** The edits with every fighter back as the pack writes them; made techniques are kept. */
export function resetFighters(edits: ContentEdits): ContentEdits {
  return { ...edits, fighters: {} };
}
