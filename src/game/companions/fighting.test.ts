import {
  act,
  ctx,
  fightOut,
  intoFight,
  newGame,
  withAllStats,
  withHound,
} from '@/test/gameFixtures';
import { BOND_STAGES } from '@/systems/bonds';

import { playerCombatant } from '../combatants';
import type { GameState } from '../state';
import { companionAllies } from './combatant';

/** A bonded hound beside a genin who knows the human half of their combination, on a job. */
function partners(): GameState {
  const fresh = withAllStats(
    newGame({ standing: { ...newGame().standing, missionsCompleted: 5 } }),
    10,
  );
  const book = { ...fresh.techniques, known: [...fresh.techniques.known, 'pincer-strike'] };
  return withHound({ ...fresh, techniques: book }, { bond: BOND_STAGES[3].min });
}

describe('a companion in a fight', () => {
  it('comes with its half of the combination, and you with yours', () => {
    const state = partners();
    expect(companionAllies(state, ctx)[0]?.techniques.map((t) => t.id)).toContain('flanking-bite');
    expect(playerCombatant(state, ctx).techniques.map((t) => t.id)).toContain('pincer-strike');
  });

  it('fights a job’s fight through to the end with its techniques', () => {
    let state = act(partners(), { type: 'startMission', missionId: 'tea-merchant-escort' });
    state = act(state, { type: 'missionContinue' });
    state = act(state, { type: 'missionChoose', approachIndex: 0 });
    const fighting = intoFight(state);
    expect(fighting.combat).not.toBeNull();
    expect(fightOut(fighting).combat).toBeNull();
  });
});
