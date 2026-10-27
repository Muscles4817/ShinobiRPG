import { OWL_SETTLED, OWL_SPARED } from '@/content/packs/original/arcs/oldOwl';
import { signPass } from '@/systems/travel';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { PASS_DAYS } from './leave';
import type { GameState } from './state';
import { roadEventOn } from './story/roadEvents';

/**
 * The old owl of the pass is the arc's to introduce and the arc's to settle: the heart of the
 * mountains brings it only once you have followed it and let it be, and only once.
 */

/** A chūnin in the heart of the high country, on the given days, remembering these marks. */
function eventsInTheHeart(marks: readonly string[]): (string | undefined)[] {
  const game = newGame();
  const chunin: GameState = {
    ...game,
    standing: { ...game.standing, rank: 'chunin' },
    leave: signPass(game.leave, game.time.day, PASS_DAYS),
    village: { ...game.village, marks },
  };
  const going = act(chunin, { type: 'venture', placeId: 'cedar-falls', depth: 'heart' });
  return Array.from({ length: 300 }, (_, i) => {
    const day = { ...going, time: { ...going.time, day: going.time.day + i } };
    return roadEventOn(day, ctx, { region: 'mountain-heart', danger: 'elite' })?.id;
  });
}

describe('the old owl in the wild', () => {
  it('is never met before its story has left it on its pine', () => {
    expect(eventsInTheHeart([])).not.toContain('the-owl-on-the-pine');
  });

  it('is never met again after the fight on the saddle', () => {
    expect(eventsInTheHeart([OWL_SETTLED])).not.toContain('the-owl-on-the-pine');
  });

  it('is met in the heart once you have followed it and let it be, and only once', () => {
    expect(eventsInTheHeart([OWL_SETTLED, OWL_SPARED])).toContain('the-owl-on-the-pine');
    expect(ctx.content.roadEvents.require('the-owl-on-the-pine').once).toBe(true);
  });
});
