import { act, ctx, freshGame, newGame, pressOn, veteran } from '@/test/gameFixtures';

import { hubView } from './hub';
import { activeScene } from './peopleScenes';
import { sceneBeside } from './sceneBeside';

describe('what a story scene is about', () => {
  it('is nothing outside scenes, and nothing for the scenes with panes of their own', () => {
    expect(sceneBeside(newGame())).toBeNull();
    const onJob = act(veteran(newGame(), 5), {
      type: 'startMission',
      missionId: 'tea-merchant-escort',
    });
    expect(activeScene(onJob)).toBe('mission');
    expect(sceneBeside(onJob)).toBeNull();
  });

  it('is the job when foes are met on it', () => {
    let s = act(veteran(newGame(), 5), { type: 'startMission', missionId: 'tea-merchant-escort' });
    for (let i = 0; i < 20 && !s.mission?.encounter; i++) s = pressOn(s);
    expect(activeScene(s)).toBe('encounter');
    expect(sceneBeside(s)).toEqual({ kind: 'job' });
  });

  it('is the person you are talking to', () => {
    const game = newGame();
    const [someone] = hubView(game, ctx).around;
    const talking = act(game, { type: 'talk', personId: someone!.id });
    expect(sceneBeside(talking)).toEqual({ kind: 'person', personId: someone!.id });
  });

  it('is your rival when they come to find you', () => {
    const assigned = act(freshGame(), { type: 'assignTeam' });
    const senseiId = assigned.people.team?.senseiOptions[0] ?? '';
    let s = act(act(assigned, { type: 'chooseSensei', senseiId }), { type: 'testChakraPaper' });
    while (s.mentor.opening) s = act(s, { type: 'senseiTest', optionIndex: 0 });
    expect(activeScene(s)).toBe('rival');
    expect(sceneBeside(s)).toEqual({ kind: 'person', personId: s.rival!.personId });
  });

  it('is you in the scenes about you', () => {
    const first = freshGame();
    expect(activeScene(first)).toBe('team');
    expect(sceneBeside(first)).toEqual({ kind: 'you' });
  });
});
