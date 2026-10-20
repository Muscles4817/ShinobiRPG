import { hashUnit } from '@/core';
import { crossed, type Hive } from '@/systems/hives';
import { write, type JournalChip, type NewEntry } from '@/systems/journal';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { strainSheet, yourHive } from './hive';

/**
 * A brood hatching (`docs/design/retinue-plan.md`, step 4c), as a day passes: on the day it is
 * ready the cross is decided by luck drawn from the seed and that day, never the Rng, and the
 * hive takes what came of it. It writes to the journal itself, since the day's turn calls it.
 */

function withHive(state: GameState, hive: Hive): GameState {
  return { ...state, hive };
}

function written(state: GameState, entry: NewEntry): GameState {
  return { ...state, journal: write(state.journal, state.time, entry) };
}

function newChip(label: string, tone: JournalChip['tone']): JournalChip {
  return { label, tone };
}

/** The brood hatches on the day it is ready: a new strain, a throwback, or nothing. */
export function broodHatched(state: GameState, ctx: GameContext): GameState {
  const yours = yourHive(state, ctx);
  const brood = yours?.hive.breeding;
  if (!yours || !brood || state.time.day < brood.readyDay) return state;
  const jar = strainSheet(yours.hive, brood.jarStrainId, ctx);
  const { breeding: _done, ...hive } = yours.hive;
  if (!jar) return withHive(state, hive);
  let k = 0;
  const draw = () => hashUnit(state.board.seed, 'brood', brood.readyDay, (k += 1));
  const bred = hive.bred ?? [];
  const id = `bred-${bred.length + 1}`;
  const named = { id, name: `${yours.strain.name} × ${jar.name}` };
  const result = crossed(yours.strain, jar, named, draw);
  return hatched(withHive(state, hive), result);
}

function hatched(state: GameState, result: ReturnType<typeof crossed>): GameState {
  const hive = state.hive;
  if (!hive) return state;
  if (result.kind === 'failed') {
    return written(state, {
      text: 'The brood dies in the comb. Nothing came of the cross.',
      tone: 'warning',
    });
  }
  if (result.kind === 'throwback') {
    return written(withHive(state, { ...hive, strainId: result.strain.id }), {
      text: `The brood hatches, and they are ${result.strain.name.toLowerCase()} through and through: nothing of the cross took.`,
      tone: 'info',
    });
  }
  const bred = [...(hive.bred ?? []), result.strain];
  return written(withHive(state, { ...hive, strainId: result.strain.id, bred }), {
    heading: 'A new strain',
    text: result.mutated
      ? 'The brood hatches, and something in them is stronger than either line. Give them a name.'
      : 'The brood hatches: a strain of your own. Give them a name.',
    tone: 'success',
    chips: [newChip('New strain', 'gain')],
  });
}
