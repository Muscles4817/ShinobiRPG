import type { GameState } from '@/game';
import { arcPlayer } from '@/test/arcPlay';
import { ctx, newGame, postEverything, veteran } from '@/test/gameFixtures';

import { jobThrough } from './playing';
import { recorder } from './recorder';

/**
 * Jobs as the player reads them, from notice to debrief: a patrol, a chore with a fight, an
 * escort on the road (the template most jobs are filled from) and the first job of an arc.
 */

const rested = (s: GameState, fresh: GameState): GameState => ({
  ...s,
  character: { ...s.character, vitals: fresh.character.vitals },
  exams: { ...s.exams, ceremony: null },
});

it('reads a run of jobs', async () => {
  const r = recorder(ctx);
  let s = veteran(newGame(), 3);
  for (const id of ['lantern-patrol', 'storehouse-ghost', 'brides-chest']) {
    r.say(`\n########## ${id} ##########`);
    s = rested(jobThrough(r, ctx, postEverything(s), id), newGame());
  }
  const seasoned = arcPlayer(ctx).ready();
  r.say('\n########## arc-ford-pilot-home ##########');
  jobThrough(r, ctx, seasoned, 'arc-ford-pilot-home');
  await expect(r.text()).toMatchFileSnapshot('./goldens/missions.txt');
});
