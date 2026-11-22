/** The fight story's step of the save migrations (see `migrations.ts`). */

import { storyOfLines } from '@/systems/combat';

type RawState = Record<string, unknown>;

function lines(value: unknown): string[] {
  // A finale's log was a list of lines; anything else is read as none.
  return Array.isArray(value) ? value.filter((l): l is string => typeof l === 'string') : [];
}

/**
 * v75 → v76: a fight is told as events (`storyContract.ts`), so the finished fight kept for the
 * watch screen holds its story as events too. A finale saved before holds lines that carried
 * their facts inside the words; they are read into the events they told.
 */
export function v75ToV76(state: RawState): RawState {
  const finale = state.combatFinale;
  if (typeof finale !== 'object' || finale === null) return state;
  const { log, logOffset, ...rest } = finale as RawState;
  return {
    ...state,
    combatFinale: {
      ...rest,
      story: storyOfLines(lines(log)),
      storyOffset: typeof logOffset === 'number' ? logOffset : 0,
    },
  };
}
