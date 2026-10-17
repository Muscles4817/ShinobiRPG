/** The special notes' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** The note old files carried when they said nothing special: now an empty file. */
const BLANK_NOTE = 'unremarkable';

/**
 * v46 → v47: a file carries several special notes (`talentIds`) instead of one, and habits
 * people notice (`quirkIds`, none for an older character).
 */
export function v46ToV47(state: RawState): RawState {
  // An older save, read as it was written: a trust boundary.
  const character = state.character as RawState;
  const { talentId, ...rest } = character;
  const kept = typeof talentId === 'string' && talentId !== BLANK_NOTE ? [talentId] : [];
  return {
    ...state,
    character: {
      ...rest,
      talentIds: character.talentIds ?? kept,
      quirkIds: character.quirkIds ?? [],
    },
  };
}
