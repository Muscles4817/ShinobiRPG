import type { TalentDef } from '@/content';
import { notesProblem, STANDING_INFO, type ClassStanding } from '@/systems/profile';
import type { StatId } from '@/systems/stats';

import type { GameContext } from './context';

/**
 * The special notes on a file, read together: the ones a list of ids names, what they fix of the
 * hidden talent between them, and whether the file can carry them (`systems/profile/notes.ts`).
 * There is no other limit on stacking: the standing's room is the difficulty.
 */

export function notesOf(ids: readonly string[], ctx: GameContext): TalentDef[] {
  return ids.flatMap((id) => ctx.content.talents.get(id) ?? []);
}

/** What the notes fix of the hidden talent, later notes over earlier. */
export function notesAptitude(notes: readonly TalentDef[]): Partial<Record<StatId, number>> {
  return notes.reduce<Partial<Record<StatId, number>>>((all, n) => ({ ...all, ...n.aptitude }), {});
}

interface NotesOnFile {
  readonly talentIds: readonly string[];
  readonly standing: ClassStanding;
}

/** Everything wrong with the notes on a file: unknown, doubled, contradictory or too many. */
export function notesProblems(file: NotesOnFile, ctx: GameContext): string[] {
  const notes = notesOf(file.talentIds, ctx);
  const ids = new Set(file.talentIds);
  return [
    notes.length !== file.talentIds.length && 'That note isn’t on the list.',
    ids.size !== file.talentIds.length && 'A note can only go on the file once.',
    notes.some((n) => n.opposite !== undefined && ids.has(n.opposite)) &&
      'Two of those notes contradict each other.',
    notesProblem(
      notes.map((n) => n.weight),
      STANDING_INFO[file.standing].notes,
    ),
  ].filter((p): p is string => typeof p === 'string');
}
