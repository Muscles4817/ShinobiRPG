import { CONTENT_PACKS } from '@/content';
import { act, newGame, veteran, withAllStats } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { dispatch } from './dispatch';
import { PASS_NEEDED } from './leave';
import type { GameState } from './state';
import { arcsView } from './views/arcs';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const ctx = createGameContext(original);

/** Plays a job to its end: the first option of any decision, the first approach of a check. */
function play(start: GameState, missionId: string): GameState {
  let state = act(start, { type: 'startMission', missionId }, ctx);
  for (let step = 0; state.mission && step < 20; step++) {
    const onward = [
      { type: 'missionContinue' },
      { type: 'missionDecide', optionIndex: 0 },
      { type: 'missionChoose', approachIndex: 0 },
    ] as const;
    const next = onward.find((a) => dispatch(state, a, ctx).ok)!;
    state = act(state, next, ctx);
  }
  return state;
}

/** A capable genin with a record, no pass, and every report read. */
function ready(): GameState {
  return { ...withAllStats(veteran(newGame({}, ctx), 3), 20), reports: [] };
}

describe('a long story lived in another town', () => {
  it('takes you down the road to its base, where its jobs are posted', () => {
    const lettered = play(ready(), 'arc-salt-letter');
    const there = play(lettered, 'arc-salt-coast-road');
    expect(there.locationId).toBe('port-shiomachi');
    expect(arcsView(there, ctx).find((a) => a.id === 'salt-in-the-lanterns')?.base).toBe(
      'Based in Port Shiomachi',
    );
    // The act's jobs are taken at the harbour office, not the village hall.
    const home = { ...there, locationId: 'torogakure' };
    expect(dispatch(home, { type: 'startMission', missionId: 'arc-salt-wreck' }, ctx)).toEqual({
      ok: false,
      error: 'That job isn’t posted here.',
    });
  });

  it('counts going back to the base as orders, not leave', () => {
    const there = play(play(ready(), 'arc-salt-letter'), 'arc-salt-coast-road');
    const home = { ...there, locationId: 'torogakure' };
    expect(dispatch(home, { type: 'travel', locationId: 'port-shiomachi' }, ctx).ok).toBe(true);
    // Before the story reaches the port, a genin still needs a pass.
    expect(dispatch(ready(), { type: 'travel', locationId: 'port-shiomachi' }, ctx)).toEqual({
      ok: false,
      error: PASS_NEEDED,
    });
  });

  it('ends at home, with the light given back', () => {
    const there = play(play(ready(), 'arc-salt-letter'), 'arc-salt-coast-road');
    const searched = play(play(there, 'arc-salt-wreck'), 'arc-salt-umi');
    const done = play(searched, 'arc-salt-light');
    expect(done.locationId).toBe('torogakure');
    expect(done.village.marks).toContain('salt-shrine-lit');
    expect(arcsView(done, ctx).some((a) => a.id === 'salt-in-the-lanterns')).toBe(false);
  });
});
