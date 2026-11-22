import { act, ctx, newGame, veteran } from '@/test/gameFixtures';

import type { Report } from '../reports';
import type { GameState } from '../state';
import { overlayOnScreen } from './overlay';

/** What is laid over play: one card at a time, in one order. */

const HOME: Report = { kind: 'home-again', place: 'Home', days: 2, news: [], text: 'Back.' };

/** A night pushed through, so the day has ended and its sheet waits. */
function dayEnded(): GameState {
  const night = { ...newGame(), time: { day: 1, slot: 3 } };
  return act(night, { type: 'train', trainingId: 'rooftop-sprints' });
}

describe('what is laid over play', () => {
  it('is nothing in plain play', () => {
    expect(overlayOnScreen(newGame(), ctx)).toBeNull();
  });

  it('lays the day’s sheet over the village, and a report over it', () => {
    const ended = dayEnded();
    expect(overlayOnScreen(ended, ctx)?.kind).toBe('day');
    const reported = { ...ended, reports: [HOME] };
    expect(overlayOnScreen(reported, ctx)).toEqual({ kind: 'report', report: HOME });
  });

  it('keeps the day’s sheet back while a scene has the screen, but not a report', () => {
    const onJob = act(veteran(dayEnded(), 5), {
      type: 'startMission',
      missionId: 'tea-merchant-escort',
    });
    expect(overlayOnScreen(onJob, ctx)).toBeNull();
    expect(overlayOnScreen({ ...onJob, reports: [HOME] }, ctx)?.kind).toBe('report');
  });

  it('lets a trip’s title card play before any report covers it', () => {
    const game = newGame();
    const jonin = { ...game, standing: { ...game.standing, rank: 'jonin' as const } };
    const plan = act(jonin, { type: 'travel', locationId: 'port-shiomachi' }).mission?.journey;
    expect(plan).toBeDefined();
    const arriving = { ...game, reports: [HOME], journeyEnd: plan! };
    expect(overlayOnScreen(arriving, ctx)).toBeNull();
    expect(overlayOnScreen({ ...arriving, journeyEnd: null }, ctx)?.kind).toBe('report');
  });
});
