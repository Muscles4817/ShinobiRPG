import { writeFileSync } from 'node:fs';

import { against, foe, freshCharacter } from '../../src/test/bench/content';
import { startWalk, walkRound } from './walk';

/** Writes the walkthrough fight, a file a round, to `WALK_OUT`. */
const OUT = process.env.WALK_OUT ?? '.';
const SEED = Number(process.env.WALK_SEED ?? 1);

it('walk', () => {
  const state = freshCharacter('taijutsu');
  const setup = against(state, foe('academy-dropout'));
  const names = { player: 'You', [setup.enemies[0]!.id]: 'Dropout' };
  const w = startWalk(setup, SEED);
  writeFileSync(
    `${OUT}/setup.json`,
    JSON.stringify({ player: setup.player, foe: setup.enemies[0] }, null, 1),
  );
  for (let round = 1; round <= 8 && !w.engine.outcome(w.state); round++) {
    writeFileSync(`${OUT}/round-${round}.md`, walkRound(w, names).join('\n'));
  }
});
