import { NO_EDITS } from '../edits/state';

/** The content editor's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v58 → v59: a save keeps the editor's changes it began with; every older game began with none. */
export function v58ToV59(state: RawState): RawState {
  return { edits: NO_EDITS, ...state };
}
