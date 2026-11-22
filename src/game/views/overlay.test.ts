import { act, ctx, newGame, veteran } from '@/test/gameFixtures';

import type { Report } from '../reports';
import type { GameState } from '../state';
import { sceneOnScreen } from './journeyView';
import { overlayOnScreen } from './overlay';

/** What is laid over play: one card at a time, in one order. */

const HOME: Report = { kind: 'home-again', place: 'Home', days: 2, news: [], text: 'Back.' };

/** What is laid over the state as the game screen asks it. */
const overlayOn = (state: GameState) => overlayOnScreen(state, ctx, sceneOnScreen(state, ctx));

/** A night pushed through, so the day has ended and its sheet waits. */
function dayEnded(): GameState {
  const night = { ...newGame(), time: { day: 1, slot: 3 } };
  return act(night, { type: 'train', trainingId: 'rooftop-sprints' });
}

describe('what is laid over play', () => {
  it('is nothing in plain play', () => {
    expect(overlayOn(newGame())).toBeNull();
  });

  it('lays the day’s sheet over the village, and a report over it', () => {
    const ended = dayEnded();
    expect(overlayOn(ended)?.kind).toBe('day');
    const reported = { ...ended, reports: [HOME] };
    expect(overlayOn(reported)).toEqual({ kind: 'report', report: HOME });
  });

  it('keeps the day’s sheet back while a scene has the screen, but not a report', () => {
    const onJob = act(veteran(dayEnded(), 5), {
      type: 'startMission',
      missionId: 'tea-merchant-escort',
    });
    expect(overlayOn(onJob)).toBeNull();
    expect(overlayOn({ ...onJob, reports: [HOME] })?.kind).toBe('report');
  });

  it('lets a trip’s title card play before any report covers it', () => {
    const game = newGame();
    const jonin = { ...game, standing: { ...game.standing, rank: 'jonin' as const } };
    const plan = act(jonin, { type: 'travel', locationId: 'port-shiomachi' }).mission?.journey;
    expect(plan).toBeDefined();
    const arriving = { ...game, reports: [HOME], journeyEnd: plan! };
    expect(overlayOn(arriving)).toBeNull();
    expect(overlayOn({ ...arriving, journeyEnd: null })?.kind).toBe('report');
  });
});
