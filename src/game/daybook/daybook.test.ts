import { signPass } from '@/systems/travel';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { PASS_DAYS } from '../leave';

import { dispatch } from '../dispatch';
import type { GameState } from '../state';
import { dayEndView } from '../views/dayEnd';
import { ryoChip } from '../ops';
import { marketView } from '../views/market';
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
    expect(view.title).toMatch(/^You never made it to bed, and you worked on your .+\.$/);
    expect(view.button).toBe('Carry on');
    expect(view.aheadLabel).toBe('Today');
    expect(view.hurts.map((h) => h.title)).toContain('No sleep');
  });

  it('shows only the sections something happened in', () => {
    // A day slept away: nothing grew, but the sensei's lesson was missed, and he noticed.
    const view = dayEndView(act(newGame(), { type: 'sleep' }), ctx)!;
    expect(view.title).toBe('Gōran thinks less of you.');
    expect([view.moments, view.growth, view.finds, view.hurts]).toEqual([[], [], [], []]);
    expect(view.people.map((p) => p.stamp)).toEqual(['Thinks less of you']);
    expect(view.purse).toBeNull();
    expect(view.ahead.length).toBeGreaterThan(0);
  });

  it('reads growth as a grade and a bar, never a number', () => {
    const view = dayEndView(act(trainedAndFed(), { type: 'sleep' }), ctx)!;
    const row = view.growth[0]!;
    expect(row.tier).toMatch(/^(Ordinary|Athletic|Genin|Good genin) [ED]$/);
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

  it('is not kept for a hurried trip walked in one go: the days were on the road', () => {
    const genin = newGame();
    const start = { ...genin, leave: signPass(genin.leave, genin.time.day, PASS_DAYS) };
    const going = act(start, { type: 'travel', locationId: 'port-shiomachi', quick: true });
    // Arriving in the same action as setting out is the case: a road event that stops the
    // trip leaves it away, which was never kept.
    expect(going.mission).toBeNull();
    expect(going.locationId).toBe('port-shiomachi');
    expect(going.time.day).toBeGreaterThan(start.time.day);
    expect(going.daybook.ended).toBeNull();
    expect(going.daybook.start?.day).toBe(going.time.day);
  });
});

describe('the purse', () => {
  it('adds up each line by what it was for, and sets down what the record missed', () => {
    const entry = (heading: string, amount: number) => ({
      id: 1,
      day: 1,
      slot: 0,
      heading,
      text: '',
      tone: 'info' as const,
      chips: [{ label: `${amount} ryo`, tone: 'cost' as const, ryo: amount }],
    });
    const lines = purseLines([entry('Rice', -12), entry('Rice', -12), entry('Patrol', 50)], 20);
    expect(lines).toEqual([
      { label: 'Rice', amount: -24 },
      { label: 'Patrol', amount: 50 },
      { label: 'Odds and ends', amount: -6 },
    ]);
  });

  it('reads the amount a chip carries, never its words', () => {
    const passage = {
      id: 1,
      day: 1,
      slot: 0,
      heading: 'Setting out',
      text: '',
      tone: 'info' as const,
      chips: [ryoChip(-30, 'passage'), { label: 'Rent: 40 ryo / week', tone: 'cost' as const }],
    };
    expect(passage.chips[0]?.label).toBe('−30 ryo passage');
    expect(purseLines([passage], -30)).toEqual([{ label: 'Setting out', amount: -30 }]);
  });

  it('accounts for groceries: one line for the stall, however much is bought', () => {
    const start = newGame({ wallet: { ryo: 500 } });
    const stall = marketView(start, ctx)!.stalls.find(
      (s) => s.ingredients.length > 1 && !s.closed,
    )!;
    const [first, second] = stall.ingredients;
    let state = act(start, first!.action);
    state = act(state, second!.action);
    state = act(state, first!.action);
    const slept = act(atNight(state), { type: 'sleep' });
    const purse = slept.daybook.ended?.purse;
    expect(purse?.lines).toEqual([{ label: stall.name, amount: slept.wallet.ryo - 500 }]);
  });
});
