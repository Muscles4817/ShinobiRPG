import { act, ctx, newGame } from '@/test/gameFixtures';

import { dispatch } from '../dispatch';
import type { GameState } from '../state';
import { dayEndView } from '../views/dayEnd';
import { purseLines } from './purse';

/** The same day, at night. */
function atNight(state: GameState): GameState {
  return { ...state, time: { ...state.time, slot: 3 } };
}

function trainedAndFed(): GameState {
  const trained = act(newGame(), { type: 'train', trainingId: 'rooftop-sprints' });
  return act(trained, { type: 'eat', foodId: 'ember-noodles' });
}

describe('the day’s record', () => {
  it('closes the day at bedtime with what grew and where the ryo went', () => {
    const slept = act(trainedAndFed(), { type: 'sleep' });
    const ended = slept.daybook.ended!;
    expect(ended.slept).toBe(true);
    expect(ended.day).toBe(1);
    expect(Object.keys(ended.stats).length).toBeGreaterThan(0);
    expect(ended.purse?.lines.map((l) => l.label)).toEqual(['Ember Noodles']);
    expect(ended.purse?.lines[0]?.amount).toBeLessThan(0);
    expect(ended.purse?.left).toBe(slept.wallet.ryo);
    expect(slept.daybook.start?.day).toBe(slept.time.day);
  });

  it('closes the day at dawn for a night pushed through, and says so', () => {
    const pushed = act(atNight(newGame()), { type: 'train', trainingId: 'rooftop-sprints' });
    const view = dayEndView(pushed, ctx)!;
    expect(pushed.daybook.ended?.slept).toBe(false);
    expect(view.title).toBe('Dawn, and no sleep');
    expect(view.button).toBe('Carry on');
    expect(view.aheadLabel).toBe('Today');
    expect(view.hurts.map((h) => h.title)).toContain('No sleep');
  });

  it('shows only the sections something happened in', () => {
    // A day slept away: nothing grew, but the sensei's lesson was missed, and he noticed.
    const view = dayEndView(act(newGame(), { type: 'sleep' }), ctx)!;
    expect(view.title).toBe('A quiet day');
    expect([view.moments, view.growth, view.finds, view.hurts]).toEqual([[], [], [], []]);
    expect(view.people.map((p) => p.stamp)).toEqual(['Thinks less of you']);
    expect(view.purse).toBeNull();
    expect(view.ahead.length).toBeGreaterThan(0);
  });

  it('reads growth as a grade and a bar, never a number', () => {
    const view = dayEndView(act(trainedAndFed(), { type: 'sleep' }), ctx)!;
    const row = view.growth[0]!;
    expect(row.tier).toMatch(/^Genin [ED]$/);
    expect(row.to).toBeGreaterThan(row.from);
    expect(row.words).not.toMatch(/\d/);
  });

  it('is put away once read', () => {
    const slept = act(newGame(), { type: 'sleep' });
    expect(dayEndView(act(slept, { type: 'dismissDay' }), ctx)).toBeNull();
    expect(dispatch(newGame(), { type: 'dismissDay' }, ctx).ok).toBe(false);
  });

  it('follows the setting: a morning slip when brief, nothing when off', () => {
    const brief = act(newGame(), { type: 'setDayEnd', mode: 'brief' });
    expect(dayEndView(act(brief, { type: 'sleep' }), ctx)?.mode).toBe('brief');
    const off = act(newGame(), { type: 'setDayEnd', mode: 'off' });
    expect(act(off, { type: 'sleep' }).daybook.ended).toBeNull();
  });

  it('is not kept for days spent on a job: the debrief tells those', () => {
    const veteran = newGame({ standing: { ...newGame().standing, missionsCompleted: 5 } });
    const away = act(veteran, { type: 'startMission', missionId: 'tea-merchant-escort' });
    const onTheRoad = act(away, { type: 'missionContinue' });
    expect(onTheRoad.mission).not.toBeNull();
    expect(onTheRoad.daybook.ended).toBeNull();
  });
});

describe('the purse', () => {
  it('adds up each line by what it was for, and sets down what the record missed', () => {
    const entry = (heading: string, label: string) => ({
      id: 1,
      day: 1,
      slot: 0,
      heading,
      text: '',
      tone: 'info' as const,
      chips: [{ label, tone: 'cost' as const }],
    });
    const lines = purseLines(
      [entry('Rice', '−12 ryo'), entry('Rice', '−12 ryo'), entry('Patrol', '+50 ryo')],
      20,
    );
    expect(lines).toEqual([
      { label: 'Rice', amount: -24 },
      { label: 'Patrol', amount: 50 },
      { label: 'Other', amount: -6 },
    ]);
  });
});
