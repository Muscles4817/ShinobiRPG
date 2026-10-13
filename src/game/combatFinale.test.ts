import { act, ctx, fightOut, newGame, withAllStats } from '@/test/gameFixtures';

import { dispatch } from './dispatch';
import { fightReplay } from './views/fightReplay';
import { activeScene } from './views/peopleScenes';
import { finishedFightScene } from './views/scene';

describe('a finished fight, kept for the watch screen', () => {
  it('stays on screen with its last exchange until you leave, then its result shows', () => {
    const sparring = act(withAllStats(newGame(), 7), { type: 'spar', personId: 'kaen' });
    const over = fightOut(sparring);
    expect(over.combat).toBeNull();
    expect(activeScene(over)).toBe('combat');
    const view = finishedFightScene(over)!;
    expect(view.options).toEqual([]);
    const beats = fightReplay(view, 0);
    const now = Object.fromEntries(view.combatants.map((c) => [c.id, c.health]));
    expect(beats.at(-1)!.health).toEqual(now);
    expect(over.reports.length).toBeGreaterThan(0);
    const left = act(over, { type: 'leaveFight' });
    expect(left.combatFinale).toBeNull();
    expect(activeScene(left)).toBeNull();
    expect(left.reports).toEqual(over.reports);
  });

  it('never blocks play, and there is nothing to leave without one', () => {
    const over = fightOut(act(withAllStats(newGame(), 7), { type: 'spar', personId: 'kaen' }));
    expect(dispatch(over, { type: 'dismissReport' }, ctx).ok).toBe(true);
    expect(dispatch(newGame(), { type: 'leaveFight' }, ctx)).toEqual({
      ok: false,
      error: 'There is no finished fight to leave.',
    });
  });
});
